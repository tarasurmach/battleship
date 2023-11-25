import './style.css'
import {GameManager} from "./models/GameManager.js";
/*
Todo: Finish hunt/target algorithm;
Todo: Try to finally tackle ship placement animation
Todo: Implement ship choosing on click*/

document.addEventListener("DOMContentLoaded", ()=>{
    const mainDiv = document.getElementById("app") as HTMLDivElement;
    new GameManager(mainDiv);
})
//Todo: If ship has been hit many times, remove targets from above and below

