import { BaseDistributionMachine } from './base';
import { LinearDistribution } from './linear';
import { RandomGenerator } from '../generator/base';

export class BernoulliDistribution extends BaseDistributionMachine<number, boolean> {
    private probability: number = 0.5;
    private linearDist: LinearDistribution;
    private range = 1e7;

    constructor(g: RandomGenerator<number>);
    constructor(g: RandomGenerator<number>, p: number);

    constructor(g: RandomGenerator<number>, p?: number) {
        super(g);
        this.linearDist = new LinearDistribution(this.randomGenerator, 1, this.range);
        if (p) this.setProbability(p);
    }

    public setProbability(p: number) {
        if (p > 1 || p < 0) throw new RangeError('Probability must be greater than 0 and less than 1');
        this.probability = p;
    }

    public getValue(): boolean {
        const v = this.linearDist.getValue();
        return v <= this.range * this.probability;
    }
}