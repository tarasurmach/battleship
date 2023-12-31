import {IPosition} from "../models/Ship.js";

import {Cell} from "../models/Cell.js";
import {HumanBoard} from "../models/Board/HumanBoard.ts";


export interface PositionStrategy{
    searchPositionToAttack():IPosition;
    availableTargets():boolean;
    registerHit(pos:IPosition):void;
    registerMiss(pos:IPosition):void;
}

export class PositionSearching implements PositionStrategy {
    protected pos:IPosition;
    private playerBoard:HumanBoard;
    private targets:string[] = [];
    private hits:string[] =[]
    public constructor(player:HumanBoard) {
        this.player = player;
    }
    public searchPositionToAttack(){
        if(!this.availableTargets()){
            this.position = this.randomPosition()
            return this.position
        }
        this.position = this.getTarget() ?? this.randomPosition();
        console.log(this.hits)
        return this.position;
    }
    public registerHit(pos:IPosition) {
        if(this.areHits()) {
            const {row, cell} = this.getNextHit()
            const sameRow = pos.row === row;
            const surroundings = this.player.getSurroundingCells({row, cell}) as Cell[];
            if(sameRow) {
                this.removeAdjacentRows(surroundings, pos)
                const hitsLength = Math.abs(pos.cell - (+(this.hits.shift() as string).charAt(1))); //mutating!! charAt -> .shift()
                if(hitsLength <= 5) {
                    this.targets.unshift(this.posToString({row:pos.row, cell:pos.cell+1 }))
                    this.targets.unshift(this.posToString({row:pos.row, cell:pos.cell -1}))
                }
            }
            const sameCol = pos.cell === cell;
            if(sameCol) {
                this.removeAdjacentCols(surroundings, pos);
                const hitsLength = Math.abs(pos.row - (+(this.hits.shift() as string).charAt(0))); //mutating!!
                if(hitsLength <= 5) {
                    this.targets.unshift(this.posToString({row:pos.row+1, cell:pos.cell}));
                    this.targets.unshift(this.posToString({row:pos.row-1, cell:pos.cell}));
                }
            }
        }
        this.hits.unshift(this.posToString(pos))
        this.updateTargets(pos)
    }
    public removeAdjacentRows(surroundings:Cell[], pos:IPosition) {
        const targetsToRemove = surroundings.reduce((prev:string[], curr) => {
            if(curr && curr.pos.row===pos.row) {
                prev.push(this.posToString(curr.pos));
            }
            return prev;
        }, [])
        console.log(targetsToRemove)
        this.removeTargets(targetsToRemove)
    }
    public removeAdjacentCols(surroundings:Cell[], pos:IPosition) {
        const targetsToRemove = surroundings.reduce((prev:string[], curr) => {
            if(curr && curr.pos.cell===pos.cell) {
                prev.push(this.posToString(curr.pos));
            }
            return prev;
        }, [])
        console.log(targetsToRemove)
        this.removeTargets(targetsToRemove)
    }
    getTarget() {
        let target:string;
        do {
            target = this.targets.shift() as string;
            if(!target) return;
        }while (!this.player.isValidForHit(this.stringToPos(target)));
        return this.stringToPos(target)
    }
    getNextHit() {
        const str = this.hits[0];
        return {row:+str.charAt(0), cell:+str.charAt(1)}
    }
    public registerMiss(pos:IPosition) {
        console.log("registering miss")
        const hitStr = this.posToString(pos);
        if(this.isTargeted(hitStr)) {
            this.removeTargets([hitStr])
        }
    }
    updateTargets(pos:IPosition) {
        const surroundingCells = this.playerBoard.getSurroundingCells(pos);
        const hitStr = this.posToString(pos)
        if(this.isTargeted(hitStr)) {
            this.removeTargets([hitStr])
        }else {
            this.addTarget(hitStr)
        }
        for (const cell of surroundingCells) {
            if(!cell) continue;
            const str = this.posToString(cell.pos) // Updated
            if(!this.isTargeted(str)) {
                this.targets.push(str)
            }
        }
    }
    areHits():boolean {
        return this.hits.length > 0;
    }
    isTargeted(pos:string) {
        return this.targets.some(target=> target === pos);
    }
    addTarget(str:string) {
        this.targets.push(str)
    }
    removeTargets(targets:string[]) {
        this.targets.filter(target=> targets.indexOf(target) < 0)
    }
    availableTargets() {
        return this.targets.length > 0;
    }
    randomPosition() {
        let randomPos:IPosition;
        do {
            randomPos = this.player.generateRandomPosition();
        }while (!this.player.isValidForHit(randomPos))
        return randomPos;
    }
    private stringToPos(str:string):IPosition {
        return {row:+str[0], cell:+str[1]}
    }
    private posToString({row, cell}:IPosition) {
        return `${row}${cell}`
    }
    set position(newPos:IPosition) {
        this.pos = newPos;
    }
    get position(){
        return this.pos;
    }
    set player(newGrid:HumanBoard){
        this.playerBoard = newGrid
    }
    get player() {
        return this.playerBoard;
    }
}


