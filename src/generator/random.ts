import { MAX_INT, LCG_MAGIC_A, LCG_MAGIC_B } from '../constant';
import { RandomGenerator } from './base';

export class LCG extends RandomGenerator<number> {
    protected nowValue: number;
    private magicNumber: [number, number];
    constructor(seed: number) {
        super(seed);
        this.nowValue = seed;
        this.magicNumber = [
            LCG_MAGIC_A[seed % LCG_MAGIC_A.length],
            LCG_MAGIC_B[seed % LCG_MAGIC_B.length],
        ]
    }
    protected override algorithm(): void {
        this.nowValue = (this.magicNumber[0] * this.nowValue + this.magicNumber[1]) % (MAX_INT + 1);
    }
}