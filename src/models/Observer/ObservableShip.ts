import {IPosition} from "../Ship.js";

export type Observer = (...args:any[])=>void;
export interface IObservable {
    notify(...args:any[]):void;
    addObserver(cb:Observer):()=>void;
}

function curry<FN extends (...args:any[])=>any>(fn:FN):FN {
    const newF = (...args:any[]) => {
        if(args.length < fn.length) {
            return newF.bind(null, ...args)
        }
        return fn.apply(this, args)
    }
   return newF as FN
}



