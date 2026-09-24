import { RandomGenerator } from './base';
import { _32Bits } from '../constant';

export class MT19937 extends RandomGenerator<number> {
    protected nowValue: number = 0;
    private randomNumbers = new Array(624);
    private index = 0;
    constructor(seed: number) {
        super(seed);
        this.init();
    }

    private init(): void {
        this.randomNumbers[0] = this.seed;
        for (let i = 1; i < 624; ++i) {
            this.randomNumbers[i] = 
                (1812433253 * 
                    (this.randomNumbers[i-1] ^ 
                        (this.randomNumbers[i-1] >>> 30)
                    ) + i
                ) & _32Bits;
        }
    }

    private generateNumbers(): void {
        for (let i = 0; i < 624; ++i) {
            let y = (this.randomNumbers[i] & 0x80000000) +
                (this.randomNumbers[(i+1)%624] & 0x7fffffff);

            this.randomNumbers[i] = this.randomNumbers[(i+397)%624] ^ (y >>> 1);
            if (y&1) this.randomNumbers[i] ^= 2567483615;
        }
    }

    protected override algorithm(): void {
        if (this.index === 0) this.generateNumbers();

        let y = this.randomNumbers[this.index];
        y ^= (y >>> 11);
        y ^= (y << 7) & 2636928640;
        y ^= (y << 15) & 4022730752;
        y ^= (y >>> 18);

        this.index = (this.index + 1) % 624;
        this.nowValue = y;
    }
}
