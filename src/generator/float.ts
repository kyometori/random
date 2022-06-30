import { RandomGenerator } from './base';
import { MT19937 } from './mt19937';

export class RandomFloat extends RandomGenerator<number> {
    protected nowValue: number;
    private internalGenerator: RandomGenerator<number>;

    constructor(seed: number) {
        super(seed);
        this.internalGenerator = new MT19937(seed);
    }

    protected algorithm(): void {
        const N = 23;

        let result = 0;
        for (let i = 2; i < N; ++i) {
            result += this.internalGenerator.randomNumber.next().value / i;
        }

        this.nowValue = Math.abs(result % 1);
    }

}