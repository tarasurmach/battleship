import {PositionSearching, PositionStrategy} from "../../Strategy/PositionStrategy.ts";
import {Human, HumanPlayer} from "../Player/HumanPlayer.ts";
import {IGameManager} from "../GameManager.ts";
import {Direction, IPosition, Ship} from "../Ship.ts";
import {Cell} from "../Cell.ts";
import {BaseBoard, EventWithCurrentTarget} from "./Board.ts";

export class HumanBoard extends BaseBoard {
    private computerStrategy:PositionStrategy;
    private player:Human;
    constructor(rootEl:HTMLDivElement,  game:IGameManager) {
        super(game, rootEl);
        this.initialize();
    }
    reattachListeners(flag:boolean) {
        this.grid.forEach(row=>{
            row.forEach(cellObj=>{
                const cellEl = this.queryCellElement(cellObj.pos);
                this.detachHoverListener(cellEl);
                if(flag) {
                    this.attachHoverListener(cellEl)
                }
            })
        })
    }
    handleClick = ({target}:MouseEvent&{target:HTMLDivElement}) => {
        if(this.player.allShipsPlaced()) return;
        const {dataset:{row, cell}} = target;
        const isCell = (target as HTMLDivElement).classList.contains("cell");
        if(!isCell) return;
        if(!row || !cell) return;
        this.placeShip({row:+row, cell:+cell}, this.player.currentProperties().direction)
    }
    handleMouseEnter = (e:EventWithCurrentTarget<HTMLSpanElement>) => {
        const {currentTarget:target} = e;
        if(!target.classList.contains("cell")) return;
        const {row, cell} = target.dataset;
        const {length, direction} = this.player.currentProperties();
        if(!row || !cell) return;
        const pos = {row:+row, cell:+cell}
        const ship = {pos, direction, length};
        if(this.isValidPlacement(ship)) {
            this.updateAdjacentCells(ship, "sunk", "", "updateClassName" )
        }else {
            this.updateAdjacentCells(ship, "hit", "empty" , "updateClassName" )
        }
    }

    handleMouseLeave = (e:EventWithCurrentTarget<HTMLSpanElement>) => {
        const {currentTarget:target} = e;
        if(!target.classList.contains("cell")) return;
        const {row, cell} = target.dataset;
        if(!row || !cell) return;
        const {direction, length} = this.player.currentProperties();
        const pos = {row:+row, cell:+cell}
        const ship = {pos, direction, length}
        this.updateAdjacentCells(ship, "", "", "updateClassName" )
    }
    updateClassName(pos:IPosition, className:string) {
        const cellObj = this.getCellObj(pos);
        if(!cellObj) return;
        const cellEl = this.queryCellElement(pos);
        if(!className) {
            cellEl.className = cellObj.className;
        }else {
            cellEl.classList.toggle(className)
        }
    }
    placeShip = (pos:IPosition, direction:Direction) => {
        const {length,  type} = this.player.currentProperties();
        const horizontal = direction === "horizontal";
        if (!this.isValidPlacement({length, pos, direction})) {
            console.log('Invalid coordinates to place a ship');
            return;
        }
        if(horizontal) {
            this.placeHorizontally({length, pos, type}, "human");
        }else {
            this.placeVertically({length, pos, type}, "human");
        }
        const newShip = new Ship(pos.row, pos.cell, type, direction);
        newShip.addObserver(this.updateAdjacentCells.bind(this));
        this.player.addShip(newShip);
        if (this.player.allShipsPlaced()) {
            this.updateAdjacentCells(newShip, "", "", "updateClassName")
            this.gameManager.startGame();
            return;
        }
        //this.rootEl.nextSibling?.replaceWith(this.player.renderShipList(this.reattachListeners.bind(this)));

    }
    protected renderCell({cell, row}: IPosition): HTMLSpanElement {
        const cellEl = super.renderCell({cell, row});
        this.attachHoverListener(cellEl);
        return cellEl
    }

    getSurroundingCells({row, cell}:IPosition) {
        return [
            this.getCellObj({row, cell:cell-1}),
            this.getCellObj({row, cell:cell+1}),
            this.getCellObj({row:row+1, cell}),
            this.getCellObj({row:row-1, cell})
        ];
    }
    receiveAttack = async () => {
        if(this.gameManager.winner) return;
        //await this.delay()
        const pos = this.computerStrategy.searchPositionToAttack();
        if(!this.isValidForHit(pos)) {
            alert("This position is not available for the attack");
            return;
        }
        const cellObj = this.getCellObj(pos) as Cell;
        const isEmpty = [cellObj.isOccupied, cellObj.isHit, cellObj.isMissed].every(prop=> !prop);
        if(cellObj.isOccupied) {
            this.updateCellState(cellObj.pos, "hit")
            this.player.receiveHit(cellObj.shipType);
            if(this.player.allShipsSunk()) {
                this.gameManager.winner = "cpu";
                return;
            }
            this.computerStrategy.registerHit(cellObj.pos);
        }else if(isEmpty){
            this.updateCellState(cellObj.pos, "missed");
            this.computerStrategy.registerMiss(cellObj.pos)
        }
        this.gameManager.updateTurn(true);
    }
    private initialize() {
        this.generateBoard();
        this.boardEl = this.renderBoard();
        this.player = new HumanPlayer(this.boardEl);
        this.player.addObserver(this.reattachListeners.bind(this));
        //this.player.renderOptions()
        //this.boardEl.appendChild(this.player.renderBtn());
        //this.boardEl.appendChild(this.player.renderShipList(this.reattachListeners.bind(this)))
        this.rootEl.appendChild(this.boardEl);

        this.computerStrategy = new PositionSearching(this);
        this.boardEl.addEventListener("click", this.handleClick);
    }
    public startGame() {
        if(!this.player.allShipsPlaced()) {
            //alert("Cannot start the game until all ships are placed!");
            return;
        }
        this.boardEl.removeEventListener("click", this.handleClick);
        this.reattachListeners(false);
    }
}