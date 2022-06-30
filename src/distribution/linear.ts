import { BaseDistributionMachine } from "./base";
import { RandomGenerator } from "../generator/base";

export class LinearDistribution extends BaseDistributionMachine<number> {
    private min: number = 0;
    private max: number = 0;

    constructor(g: RandomGenerator<number>);
    constructor(g: RandomGenerator<number>, min: number, max: number);
    
    constructor(g: RandomGenerator<number>, min?: number, max?: number) {
        super(g);
        if (!min || !max) return;
        
        this.min = min;
        this.max = max;
    }

    public setMax(n: number): LinearDistribution {
        this.max = n;
        return this;
    }

    public setMin(n: number): LinearDistribution {
        this.min = n;
        return this;
    }

    public getValue(): number {
        return Math.abs(this.randomGenerator.randomNumber.next().value) % (this.max - this.min + 1) + this.min;
    }
}