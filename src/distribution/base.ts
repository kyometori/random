import { RandomGenerator } from "../generator/base";

export interface IDistrbutionMachine<T> {
    getValue(): T;
}

export abstract class BaseDistributionMachine<T> implements IDistrbutionMachine<T> {
    protected randomGenerator: RandomGenerator<T>
    public abstract getValue(): T;
    constructor(g: RandomGenerator<T>) {
        this.randomGenerator = g;
    }
    public *getIterator(): IterableIterator<T> {
        while(true) {
            yield this.getValue();
        }
    }
}