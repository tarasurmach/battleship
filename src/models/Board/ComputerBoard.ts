import {BasePlayer, Player} from "../Player/BasePlayer.ts";
import {IGameManager} from "../GameManager.ts";
import {Direction, IPosition, Ship} from "../Ship.ts";
import {Cell} from "../Cell.ts";
import {BaseBoard, EventWithCurrentTarget, EventWithTarget} from "./Board.ts";

export class ComputerBoard extends BaseBoard {
    private player:Player;
    constructor(rootEl:HTMLDivElement,  game:IGameManager) {
        super(game, rootEl);
        this.generateBoard();
        this.player = new BasePlayer()
        this.boardEl = this.renderBoard();
        this.rootEl.append(this.boardEl);
        this.placeShips();
        this.startGame();
    }
    protected renderCell({cell, row}: IPosition): HTMLSpanElement {
        const cellEl = super.renderCell({cell, row});
        this.attachHoverListener(cellEl);
        return cellEl;
    }

    placeShip(pos:IPosition, direction:Direction) {
        const {length, type} = this.player.currentProperties();
        const horizontal = direction === "horizontal";
        if(!this.isValidPlacement({length, pos, direction})) {
            console.log('Invalid coordinates to place a ship');
            return;
        }
        if(horizontal) {
            this.placeHorizontally({length, pos, type}, "cpu")
        }else {
            this.placeVertically({length, pos, type}, "cpu")
        }
        const newShip = new Ship(pos.row, pos.cell, type, direction);
        newShip.addObserver(this.updateAdjacentCells.bind(this))
        this.player.addShip(newShip);

    }
    receiveAttack = async ({target}:EventWithTarget<HTMLDivElement>) => {
        if(!this.gameManager.humanTurn) return;
        if(!(target as HTMLDivElement).classList.contains("cell")) return;
        const {dataset:{row, cell}} = target;
        if(!cell || !row) return;
        const pos = {row:+row, cell:+cell};
        if(!this.isValidForHit(pos)) {
            console.log("This position is not available for the click attack");
            return;
        }
        const cellObj = this.getCellObj(pos) as Cell;
        const isEmpty = [cellObj.isOccupied, cellObj.isHit, cellObj.isMissed].every(prop=> !prop);
        if(cellObj.isOccupied) {
            this.updateCellState(cellObj.pos, "hit");
            this.player.receiveHit(cellObj.shipType);
            if(this.player.allShipsSunk()) {
                this.gameManager.winner = "human";
                return
            }

        }else if(isEmpty){
            this.updateCellState(cellObj.pos, "missed")
        }
        this.gameManager.updateTurn(false)
    }
    startGame() {
        this.boardEl.addEventListener("click", this.receiveAttack);
    }
    handleMouseEnter = (e:EventWithCurrentTarget<HTMLSpanElement>) => {
        const {currentTarget:target} = e;
        if(!this.gameManager.humanTurn || target.classList.contains("hit") || target.classList.contains("missed")) return;
        target.classList.add("x");
        target.classList.add("hover");
    }
    handleMouseLeave = (e:EventWithCurrentTarget<HTMLSpanElement>) => {
        const {currentTarget:target} = e;
        if(!this.gameManager.humanTurn) return;
        target.classList.remove("x");
        target.classList.remove("hover");
    }
}
