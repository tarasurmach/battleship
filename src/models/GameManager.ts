import { IBoard} from "./Board/Board.ts";
import {HumanBoard} from "./Board/HumanBoard.ts";
import {ComputerBoard} from "./Board/ComputerBoard.ts";

export interface IGameManager {
    updateTurn(newTurn:boolean):void;
    startGame():void;
    renderHumanBoard():void;
    humanTurn:boolean,
    winner:"cpu"|"human"|null,
}
export class GameManager implements IGameManager{
    private humanBoard:IBoard;
    private isHumanTurn:boolean;
    private gameWinner:"human"|"cpu"|null = null;
    constructor(private mainDiv:HTMLDivElement) {
        this.renderHumanBoard();
    }
    public startGame() {
        this.isHumanTurn = true
        this.winner = null;
        this.mainDiv.appendChild(this.updateTurnUI(true))
        new ComputerBoard(this.mainDiv, this);
        this.humanBoard.startGame();

    }
    async updateTurn(newTurn:boolean) {
        this.isHumanTurn = newTurn;
        this.updateTurnUI(newTurn)
        if(!newTurn) {
            await this.humanBoard.receiveAttack();
        }

    }
    renderHumanBoard() {
        this.humanBoard = new HumanBoard(this.mainDiv,  this);
        this.mainDiv.replaceChildren(this.humanBoard.boardEl);
    }
    set winner(newWinner:"cpu"|"human"|null) {
        this.isHumanTurn = true
        if(newWinner) {
            this.gameWinner = newWinner;
            this.finishGame();
        }else {
            this.gameWinner = null
        }
    }
    get winner() {
        return this.gameWinner;
    }

    get humanTurn() {
        return this.isHumanTurn
    }

    updateTurnUI(newTurn:boolean) {
        let turnEl = this.mainDiv.querySelector<HTMLParagraphElement>("#turn");
        if(!turnEl) {
            turnEl = document.createElement("p");
            turnEl.id = "turn"
        }
        turnEl.textContent = !newTurn ? "It's computer's turn to make a hit" : "It's your turn to make a hit";
        return turnEl
    }

    finishGame() {
        const gameOverWindow = document.createElement("div");
        gameOverWindow.className = "game-over";
        const pElement = document.createElement("p");
        pElement.className = "message";
        pElement.textContent = "Game over!\n";
        pElement.textContent += this.winner === "cpu" ? "Bad luck. You lost:(" : "Congrats! You won";
        const button = document.createElement("button");
        button.className = "restart";
        button.addEventListener("click", this.renderHumanBoard.bind(this));
        button.textContent = "Play again";
        gameOverWindow.append(pElement, button);
        this.mainDiv.replaceChildren(gameOverWindow);
    }

}