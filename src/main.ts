import './style.css'
import {GameManager} from "./models/GameManager.js";


document.addEventListener("DOMContentLoaded", ()=>{
    const mainDiv = document.getElementById("app") as HTMLDivElement;
    new GameManager(mainDiv);
})


