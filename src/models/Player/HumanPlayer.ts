import {IObservable, Observer} from "../Observer/ObservableShip.ts";
import {shipMap, ShipType} from "../Ship.ts";
import {BasePlayer, Player} from "./BasePlayer.ts";
import {HumanBoard} from "../Board/HumanBoard.ts";
import {autoBind} from "../../utils/decorator.ts";
type CB = (flag:boolean)=>void;
export interface Human extends Player {
    allShipsPlaced():boolean;
    renderShipList(cb:CB):HTMLUListElement;
    renderBtn():HTMLButtonElement;
    addObserver(observer:Observer):()=>void;
    renderOptions():void;
}
export class HumanPlayer extends BasePlayer implements Human, IObservable {
    private observers:Map<keyof HumanBoard, Observer> = new Map();
    private options:HTMLDivElement;
    constructor(rootEl:HTMLDivElement, ...listeners:Observer[]) {
        super();
        console.log(this.addObserver)
        listeners.forEach(this.addObserver)
        this.renderOptions();
        rootEl.appendChild(this.options);
        this.addObserver(this.rerenderList.bind(this))
    }
    renderOptions() {
        const options = document.createElement("div");
        options.className = "options";

        options.append(this.renderBtn(), this.renderBtn2(), this.renderShipList());
        this.options = options
    }
    renderShip(shipType:ShipType) {
        const listEl = document.createElement("li");
        console.log(shipType + " " + this.currentShipType)
        listEl.textContent = shipType;

        if(this.ships[shipType]) {
            listEl.classList.add("hidden");
            return listEl;
        }
        if(shipType === this.currentShipType) {
            listEl.className = "current";
        }

        return listEl

    }
    renderShipList() {
        let shipList = document.createElement("ul");
        shipList.className = "ship-list";
        for (const shipListKey in this.ships) {
            shipList.appendChild(this.renderShip(shipListKey as ShipType));
        }
        shipList.addEventListener("click", this.handleClick);
        return shipList;
    }
    rerenderList() {
        this.options.lastElementChild?.replaceWith(this.renderShipList())
    }
    handleClick = ({target}:MouseEvent) => {
        if((target as HTMLElement).tagName !== "LI" || (target as HTMLElement).classList.contains("hidden")) return;
        const {textContent} = target as HTMLLIElement;
        if(!textContent) return;
        this.updateCurrentShip(textContent as ShipType);

    }
    allShipsSunk(): boolean {
        if(!this.allShipsPlaced()) return false;
        return Object.values(this.ships).every(ship => ship?.isSunk)
    }

    allShipsPlaced() {
        for (let key in this.ships) {
            if(!this.ships[key as ShipType]) return false;
        }
        this.options.remove();
        return true;
    }
    renderBtn() {
        const btn = document.createElement("button");
        btn.textContent = "Change direction to ";
        btn.textContent += this.direction === "horizontal" ? "vertical" : "horizontal";
        btn.addEventListener("click", this.toggleDirection);
        return btn;
    }
    toggleDirection = ({target}:MouseEvent) => {
        const oldDirection = this.direction;
        this.direction = oldDirection === "horizontal" ? "vertical" : "horizontal";
        (target as HTMLButtonElement).textContent = "Change direction to " + oldDirection;
    }
    renderBtn2() {
        console.log(this.observers)
        const btn = document.createElement<"button">("button");
        btn.textContent = "Place ships randomly";
        btn.addEventListener("click", this.observers.get("placeShips") as keyof Observer)
        return btn;
    }
    updateCurrentShip(newShipType?: ShipType) {
        if(newShipType !== undefined) {
            this.currentShipType = newShipType;
            this.length = shipMap[this.currentShipType];
            this.notify();
            return;
        }
        for(let key in this.ships) {
            if(this.ships[key as ShipType]===null) {
                this.currentShipType = key as ShipType;
                this.length = shipMap[this.currentShipType];
                this.notify();
                break;
            }
        }

    }


    notify() {
        this.observers.forEach((observer, key )=> {
            console.log(observer)
            if(key === "placeShips") return
            if(key.includes("reattachListeners")) {
                console.log("reattach")
                observer(true)
            }else {
                observer()
            }
        })
    }
    @autoBind
    addObserver(observer: Observer): () => void {
        const name = (observer.name.split(" ")[1] ?? observer.name ) as keyof HumanBoard;
        console.log(this)
        if(!this.observers.has(name)) {
            console.log(name)
            this.observers.set(name, observer);
        }
        console.log(this.observers)
        return () => {
            if(this.observers.has(name)) {
                this.observers.delete(name)
            }
        }
    }
}
