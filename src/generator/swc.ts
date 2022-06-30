import { RandomGenerator } from './base';
import { SWC_LAGS, _2to32 } from '../constant';
import { MT19937 } from './mt19937';


export class SubtractWithCarry extends RandomGenerator<number> {
    protected nowValue: number;
    private lags: [number, number];
    private sequence: number[];
    private carry: number = 0;

    constructor(seed: number) {
        super(seed);
        this.lags = SWC_LAGS[seed % SWC_LAGS.length];
        this.init();
    }

    private init(): void {
        const initValueGen = new MT19937(this.seed);
        const diff = this.lags[1] - this.lags[0] + 1;
        this.sequence = new Array(diff);

        for (let i = 0; i < diff; ++i) {
            this.sequence[i] = initValueGen.randomNumber.next().value;
        }

        if (this.sequence[this.sequence.length - 1] < 0) this.carry = 1;
    }

    protected algorithm(): void {
        const v = (this.sequence[0] - this.sequence[this.sequence.length - 1] - this.carry) % _2to32;
        this.carry = v < 0 ? 1 : 0;

        this.sequence.shift()
        this.sequence.push(v);

        this.nowValue = v;
    }
}