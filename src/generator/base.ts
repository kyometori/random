export interface IRandomGenerator<T> {
    randomNumber:  IterableIterator<T>
}

export abstract class RandomGenerator<T> implements IRandomGenerator<T> {
    protected seed: T;
    protected abstract nowValue: T;
    public randomNumber: IterableIterator<T>;
    constructor(seed: T) { 
        this.seed = seed; 
        this.randomNumber = this.randomValueGenerator();
    }
    protected abstract algorithm(): void;
    public *randomValueGenerator(): IterableIterator<T> {
        while(true) {
            this.algorithm();
            yield this.nowValue;
        }
    };
}