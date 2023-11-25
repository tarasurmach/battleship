import {ShipType} from "./Ship.js";
interface CellState {
    handleClick():void;
    readonly className:string;
}
export class Cell {

    public isHit:boolean = false;
    public isOccupied = false;
    public isMissed = false;
    public shipType:ShipType;
    private state:CellState;
    constructor(private row:number, private cell:number) {
        this.changeState(new EmptyState(this))
    }
    changeState(newState:CellState):void {
        this.state = newState;

    }

    deployShip(ship:ShipType, playerType:"cpu"|"human"="cpu"):void {
        const newState = playerType === "cpu" ? new OccupiedByCPU(this) : new OccupiedState(this)
        this.changeState(newState)
        this.shipType = ship;
    }
    get className() {
        return `cell ${this.state.className}`;
    }
    get pos() {
        return {row:this.row, cell: this.cell}
    }
}

export class EmptyState implements CellState{
    constructor(private cellCtx: Cell) {

    }
    handleClick() {
        this.cellCtx.changeState(new MissedState(this.cellCtx))
    }
    get className() {
        return "cell"
    }
}
export class MissedState implements CellState {
    constructor(private cellCtx:Cell) {
        this.cellCtx.isHit = true;
        this.cellCtx.isMissed = true;

    }
    handleClick() {
        console.log("Cell has already been hit")

    }

    get className() {
        return "missed"
    }
}
export class OccupiedState implements  CellState{
    constructor(private cellCtx:Cell) {
        this.cellCtx.isOccupied = true;

    }
    handleClick() {
        this.cellCtx.changeState(new HitState(this.cellCtx))
    }
    get className() {
        return "occupied"
    }
}
export class OccupiedByCPU extends OccupiedState {
    constructor(cellCtx:Cell) {
        super(cellCtx);
    }
    get className() {
        return "cell"
    }
}
export class HitState implements CellState {
    constructor(private cellCtx:Cell) {
        this.cellCtx.isHit = true;
        this.cellCtx.isMissed = false;
    }
    handleClick() {
        console.log(`This position has already been hit`);
        return
    }
    get className() {
        return "hit"
    }

}

export class SunkState implements CellState {
    constructor(private cellCtx:Cell) {

    }
    handleClick() {
        console.log(`This ship has already sunk`);

    }
    get className() {
        return "sunk"
    }
}
export const stateClassMap = {
    "cell": EmptyState,
    "missed": MissedState,
    "occupied": OccupiedState,
    "hit": HitState,
    "sunk": SunkState,
};