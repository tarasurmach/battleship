import {Direction, Ship, shipMap, ShipType} from "../Ship.ts";

export interface Player {
    addShip(ship:Ship):void;
    receiveHit(type:ShipType):void;
    allShipsSunk():boolean;
    currentProperties():{length:number, direction:Direction, type:ShipType}
}

export class BasePlayer implements Player{
    public currentShipType:ShipType = "Carrier";
    public direction:Direction = "horizontal";
    private shipLength:number = shipMap[this.currentShipType];

    public ships:Record<ShipType, Ship|null> = {
        "Carrier":null,
        "Battleship":null,
        "Cruiser":null,
        "Submarine":null,
        "Destroyer":null
    }
    addShip(newShip:Ship) {
        this.ships[newShip.type] = newShip;
        this.updateCurrentShip();
    }
    receiveHit(type:ShipType) {
        const ship = this.ships[type];
        if(!ship) return;
        ship.acceptHit();
    }
    allShipsSunk():boolean {
        return Object.values(this.ships).every(ship => ship?.isSunk)
    }
    updateCurrentShip() {
        for(let key in this.ships) {
            if(this.ships[key as ShipType]===null) {
                this.currentShipType = key as ShipType;
                this.length = shipMap[this.currentShipType]
                break;
            }else {
                this.currentShipType = null as ShipType;
            }
        }

    }
    set length(newLength) {
        this.shipLength = newLength
    }
    get length() {
        return this.shipLength;
    }
    currentProperties() {
        return {
            length:this.length,
            direction:this.direction,
            type:this.currentShipType
        }
    }

}

