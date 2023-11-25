

export type Observer = (...args:any[])=>void;
export interface IObservable {
    notify(...args:any[]):void;
    addObserver(cb:Observer):()=>void;
}





