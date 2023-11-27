import {Cell, stateClassMap} from "../Cell.ts";
import {Direction, IPosition, Ship, shipMap} from "../Ship.ts";
import {IGameManager} from "../GameManager.ts";
import {autoBind} from "../../utils/decorator.ts";
export type EventWithTarget<T extends HTMLElement> = MouseEvent & {target:T};
export type EventWithCurrentTarget<T extends HTMLElement> = MouseEvent & {currentTarget:T};

const ROWS = 10;
const COLS = 10;
export type Grid = Cell[][]
export interface IBoard {
    generateBoard():Cell[][];
    renderBoard():HTMLDivElement;
    receiveAttack(arg?:any):Promise<void>;
    placeShip(pos:IPosition, direction:Direction):void;
    placeShips():void;
    startGame():void;
    updateAdjacentCells({pos:{row, cell}, length, direction}:Pick<Ship, "pos"|"length"|"direction">, currentCellClass:StateClassName|"", adjacentCellClass:StateClassName|"", callBack:"updateClassName"|"updateCellState"):void;
    boardEl:HTMLDivElement
}

export type StateClassName = keyof typeof stateClassMap;
export abstract class BaseBoard implements IBoard {
    protected grid: Grid;
    public boardEl: HTMLDivElement;
    protected gameManager: IGameManager;

    protected constructor( game:IGameManager, protected rootEl:HTMLDivElement) {
        this.gameManager = game;

    }
    generateBoard() {
        const board:Cell[][] = [];
        for(let i = 0; i < ROWS; i++) {
            const row:Cell[] = [];
            for(let k =0; k < COLS; k++ ) {
                const cell =new Cell(i, k);
                row.push(cell);
            }
            board.push(row)
        }
        this.board = board;
        return board;
    }
    renderBoard() {
        const container = document.createElement("div");
        container.className = "container";

        const boardEl = document.createElement("div");
        boardEl.className = "board";

        this.grid.forEach((row, i)=>{
            boardEl.append(this.renderRow(row, i))
        });

        container.appendChild(boardEl);
        return container;
    }
    renderRow(row:Cell[], index:number) {
        const div = document.createElement("div");
        div.className = "row";
        row.forEach((cell, i) => {
            const cellEL = this.renderCell({row:index, cell:i});
            cellEL.className = cell.className
            div.append(cellEL)
        })
        return div;
    }
    protected renderCell({cell, row}:IPosition):HTMLSpanElement {
        const cellEl = document.createElement("span") as HTMLSpanElement;
        cellEl.dataset.row = row.toString();
        cellEl.dataset.cell = cell.toString();
        return cellEl
    }
    isValidPlacement({pos, direction, length}:Pick<Ship, "pos"|"direction"|"length">) {
        const {row, cell} = pos;
        const horizontal = direction === "horizontal";
        if(horizontal) {
            if(length + cell > ROWS ) return false
            for(let i = 0; i < length; i++) {
                const cellObj =this.getCellObj({row, cell:cell+i});
                if(!cellObj || cellObj.isOccupied) return false;
                if(i===0) {
                    const prevCell = this.getCellObj({row, cell:cell-1});
                    if(prevCell && prevCell.isOccupied) return false;
                    const prevTopCell = this.getCellObj({row:row-1, cell:cell-1});
                    if(prevTopCell && prevTopCell.isOccupied) return false;
                    const prevBottomCell = this.getCellObj({row:row+1, cell:cell-1});
                    if(prevBottomCell && prevBottomCell.isOccupied) return false;
                }
                if(i === length - 1) {
                    const nextCell = this.getCellObj({row, cell:cell+i+1});
                    if(nextCell && nextCell.isOccupied) return false
                    const nextTopCell = this.getCellObj({row:row-1, cell:cell+i+1});
                    if(nextTopCell && nextTopCell.isOccupied) return false;
                    const nextBottomCell = this.getCellObj({row:row+1, cell:cell + i +1});
                    if(nextBottomCell && nextBottomCell.isOccupied) return false;
                }
                const cellAbove = this.getCellObj({row:row-1, cell:cell+i});
                if(cellAbove && cellAbove.isOccupied) return false;
                const cellBelow = this.getCellObj({row:row+1, cell:cell+i})
                if(cellBelow && cellBelow.isOccupied) return false;

            }
        }else {
            if(length + row  > COLS) {
                console.log("asasasasa");
                return false;
            }
            for(let i = 0; i < length; i++) {
                const rightCell = this.getCellObj({row:row+i, cell:cell+1});
                if(rightCell && rightCell.isOccupied) return false;
                const leftCell = this.getCellObj({row:row+i, cell:cell-1});
                if(leftCell && leftCell.isOccupied) return false;
                const cellObj = this.getCellObj({row:row+i, cell});
                if(!cellObj || cellObj.isOccupied) return false;
                if(i === 0) {
                    const prevCell = this.getCellObj({row:row-1, cell});
                    if(prevCell && prevCell.isOccupied) return false;
                    const prevLeftCell = this.getCellObj({row:row-1, cell:cell-1});
                    if(prevLeftCell && prevLeftCell.isOccupied) return false;
                    const prevRightCell = this.getCellObj({row:row-1, cell:cell+1});
                    if(prevRightCell && prevRightCell.isOccupied) return false;
                }
                if(i === length - 1) {
                    console.log(i)
                    const nextCell = this.getCellObj({row:row+i+1,cell});
                    if(nextCell && nextCell.isOccupied) return false;
                    const nextLeftCell = this.getCellObj({row:row + i + 1, cell:cell-1});
                    if(nextLeftCell && nextLeftCell.isOccupied) return false;
                    const nextRightCell = this.getCellObj({row:row + i + 1, cell:cell+1});
                    if(nextRightCell && nextRightCell.isOccupied) return false;
                }
            }
        }
        return true
    }
    placeHorizontally(ship:Pick<Ship, "pos"|"length"|"type">, playerType:"cpu"|"human") {
        const {pos:{row, cell}, length, type} = ship;
        for(let i=0; i < length; i++) {
            const cellObj = this.grid[row][cell+i];
            cellObj.deployShip(type, playerType);
            const cellEl = this.queryCellElement({row, cell:cell+i});
            cellEl.className = cellObj.className;
        }
    }
    placeVertically(ship:Pick<Ship, "pos"|"length"|"type">, playerType:"cpu"|"human") {
        const {pos:{row, cell}, length, type} = ship;
        for(let i =0; i <length; i++) {
            const cellObj = this.grid[row+i][cell];
            cellObj.deployShip(type, playerType);
            const cellEl = this.queryCellElement({row:row+i, cell});
            cellEl.className = cellObj.className
        }
    }
    getCellObj({row, cell}:IPosition) {
        const rowArr = this.grid[row]
        if(!rowArr) return;
        return rowArr[cell]
    }
    queryCellElement({row, cell}:IPosition):HTMLDivElement {
        return this.boardEl.querySelector(`[data-row="${row}"][data-cell="${cell}"]`) as HTMLDivElement;

    }
    delay():Promise<void> {
        return new Promise(res=>{
            setTimeout(res, 1000 * Math.floor(Math.random()*2 + 1))
        })
    }
    set board(newBoard:Grid){
        this.grid = newBoard
    }
    get board() {
        return this.grid
    }
    isValidForHit(pos:IPosition):boolean {
        const cellObj = this.getCellObj(pos);
        if(!cellObj) return false;
        return (!cellObj.isMissed && !cellObj.isHit);
    }
    placeShips() {
        for (let shipKey in shipMap) {
            const length = shipMap[shipKey];
            const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
            let pos:IPosition;
            do {
                pos = this.generateRandomPosition();
            }while (!this.isValidPlacement({pos, direction, length}));
            this.placeShip(pos, direction);

        }
    }

    generateRandomPosition() {
        const randomRow = this.grid[Math.floor(Math.random()*this.grid.length)];
        return randomRow[Math.floor(Math.random()*randomRow.length)].pos;
    }
    updateCellState(dataset:IPosition, type:keyof typeof stateClassMap|"") {
        const cell = this.getCellObj(dataset);
        if (!cell) return;
        const cellEl = this.queryCellElement(dataset);
        const State = stateClassMap[type]
        cell.changeState(new State(cell));
        cellEl.className = cell.className;
    }
    protected attachHoverListener(cellEl:HTMLSpanElement) {
        cellEl.addEventListener("mouseenter", this.handleMouseEnter);
        cellEl.addEventListener("mouseleave", this.handleMouseLeave);
    }
    protected detachHoverListener(cellEl:HTMLSpanElement) {

        cellEl.removeEventListener("mouseenter", this.handleMouseEnter);
        cellEl.removeEventListener("mouseleave", this.handleMouseLeave);
    }
    @autoBind
    updateAdjacentCells({pos:{row, cell}, length, direction}:Pick<Ship, "pos"|"length"|"direction">, currentCellClass:StateClassName|"", adjacentCellClass:StateClassName|"", callBack:"updateClassName"|"updateCellState"){
        const horizontal = direction === "horizontal";
        const method = this[callBack].bind(this);

        for (let i = 0; i < length; i++) {
            if(horizontal) {
                method({row, cell:cell+i}, currentCellClass);
                method({row:row-1, cell:cell+i}, adjacentCellClass)
                method({row:row+1, cell:cell+i}, adjacentCellClass)
                if(i===0) {
                    method({row, cell:cell-1}, adjacentCellClass);
                    method({row:row-1, cell:cell-1}, adjacentCellClass);
                    method({row:row+1, cell:cell-1}, adjacentCellClass);
                }
                if(i+1===length) {

                    method({row, cell:cell+i+1}, adjacentCellClass);
                    method({row:row-1, cell:cell+i+1}, adjacentCellClass);
                    method({row:row+1, cell:cell + i +1}, adjacentCellClass);
                }
            }else {
                method({row:row+i, cell}, currentCellClass);
                method({row:row+i, cell:cell+1}, adjacentCellClass)
                method({row:row+i, cell:cell-1}, adjacentCellClass)
                if(i===0) {
                    method({row:row-1, cell}, adjacentCellClass);
                    method({row:row-1, cell:cell-1}, adjacentCellClass);
                    method({row:row-1, cell:cell+1}, adjacentCellClass);
                }
                if(i === length - 1) {
                    method({row:row+i+1,cell}, adjacentCellClass);
                    method({row:row + i + 1, cell:cell-1}, adjacentCellClass);
                    method({row:row + i + 1, cell:cell+1}, adjacentCellClass);
                }
            }
        }
    }
    abstract startGame();
    abstract receiveAttack(arg: any);
    abstract placeShip(pos:IPosition, direction:Direction);
    abstract handleMouseEnter:(event:EventWithCurrentTarget<HTMLSpanElement>)=>void
    abstract handleMouseLeave:(event:EventWithCurrentTarget<HTMLSpanElement>)=>void
}


