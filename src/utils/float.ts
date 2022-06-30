import type { RandomGenerator } from '../generator/base';
import { MT19937 } from '../generator/mt19937';

export class RandomFloat {
    private internalGenerator: RandomGenerator<number>;

    constructor(seed: number) {
        this.internalGenerator = new MT19937(seed);
    }

    public getValue(): number {
        const N = 30;

        let result = 0;
        for (let i = 2; i < N; ++i) {
            result += this.internalGenerator.randomNumber.next().value / i;
        }

        return Math.abs(result % 1);
    }

}