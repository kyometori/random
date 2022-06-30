import { RandomGenerator } from "../generator/base";

export interface IDistrbutionMachine<T> {
    getValue(): T;
}

export abstract class BaseDistributionMachine<RGType, DistType = RGType> implements IDistrbutionMachine<DistType> {
    protected randomGenerator: RandomGenerator<RGType>
    public abstract getValue(): DistType;
    constructor(g: RandomGenerator<RGType>) {
        this.randomGenerator = g;
    }
    public *getIterator(): IterableIterator<DistType> {
        while(true) {
            yield this.getValue();
        }
    }
}