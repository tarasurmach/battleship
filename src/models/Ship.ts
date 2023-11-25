import {IBoard, StateClassName} from "./Board/Board.ts";
import {IObservable, Observer} from "./Observer/ObservableShip.js";


export interface IPosition {
    row:number;
    cell:number
}
export type ShipType = "Carrier" | "Battleship" | "Cruiser" | "Submarine" | "Destroyer";
export type Direction = "vertical" | "horizontal"
export const shipMap:Record<ShipType, number> = {
    "Carrier":5,
    "Battleship":4,
    "Cruiser":3,
    "Submarine":3,
    "Destroyer":2
}


export class Ship implements IObservable{
    public type:ShipType;
    public length:number;
    public direction: "vertical" | "horizontal";
    private position: IPosition;
    public hits =0;
    public isSunk = false;
    private observers:Map<string, Observer> = new Map();
    constructor(row:number, cell:number, type:ShipType, direction:Direction, /*private grid:Grid*/) {
        this.pos = {row, cell} ;
        this.type = type;
        this.length = shipMap[type];
        this.direction = direction;
    }
    addObserver(cb: Observer): () => void {
        const originalName = cb.name.split(" ");
        console.log(originalName)
        const name = originalName[1] ?? originalName[0];
        if(!this.observers.has(name)) {
            this.observers.set(name, cb)
        }
        return () => {
            this.observers.delete(name)
        }
    }
    notify(name:keyof IBoard, msg: Ship, ) {
        const observer = this.observers.get(name) as Observer;
        observer(msg, "sunk", "missed", "updateCellState");


    }
    set pos(newPos:IPosition) {
        this.position = newPos;
    }
    get pos() {
        return this.position;
    }
    acceptHit() {
        if (this.isSunk) return
        this.hits++;
        if (this.hits === this.length) {
            this.isSunk = true;
            this.notify("updateAdjacentCells", this)
        }
        return this.isSunk;
    }
}