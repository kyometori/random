import { MinstdRand, MinstdRand0 } from '../src/generators';
import { defineLinearCongruentialEngine } from '../src/engines/linearCongruentialEngine';
import { UInt32Type, uint32 } from '../src/typings';
import type { RandomEngine, UInt32 } from '../src/typings';
import type { RandomNumberEngine, UniformRandomBitGenerator, UniformRandomBitGeneratorStatusOf } from '../src/concepts';
import { assertRandomNumberEngine, assertUniformRandomBitGenerator, toRandomNumberEngine, toUniformRandomBitGenerator } from '../src/concepts'
import type { Equal, Expect } from './assert';

type MinstdRand0Engine = InstanceType<typeof MinstdRand0>;

type MinstdRand0Minimum = Expect<
  Equal<ReturnType<typeof MinstdRand0.min>, UInt32<1n>>
>;

type MinstdRand0Maximum = Expect<
  Equal<ReturnType<typeof MinstdRand0.max>, UInt32<2147483646n>>
>;

type MinstdRandMinimum = Expect<
  Equal<ReturnType<typeof MinstdRand.min>, UInt32<1n>>
>;

type MinstdRandEngine = InstanceType<typeof MinstdRand>;

type MinstdRandMaximum = Expect<
  Equal<ReturnType<typeof MinstdRand.max>, UInt32<2147483646n>>
>;

type MinstdRand0Status = Expect<
  Equal<UniformRandomBitGeneratorStatusOf<MinstdRand0Engine>, true>
>;

type MinstdRandStatus = Expect<
  Equal<UniformRandomBitGeneratorStatusOf<MinstdRandEngine>, true>
>;

/**
 * A valid LCG specialization does not necessarily satisfy
 * `UniformRandomBitGenerator`.
 *
 * With multiplier = 0, increment = 0 and modulus = 1:
 *
 * - min() = 1
 * - max() = 0
 */
const InvalidUniformRandomBitGenerator = defineLinearCongruentialEngine(UInt32Type, {
  multiplier: uint32(0n),
  increment: uint32(0n),
  modulus: uint32(1n),
});

type InvalidEngine = InstanceType<typeof InvalidUniformRandomBitGenerator>;

declare const valid: InstanceType<typeof MinstdRand>;
declare const unknownEngine: RandomEngine<UInt32>;
declare const invalid: InvalidEngine;

() => assertUniformRandomBitGenerator(valid);
() => toUniformRandomBitGenerator(valid);
() => assertRandomNumberEngine(valid);
() => toRandomNumberEngine(valid);

() => assertUniformRandomBitGenerator(unknownEngine);
() => toUniformRandomBitGenerator(unknownEngine);
() => assertRandomNumberEngine(unknownEngine);
() => toRandomNumberEngine(unknownEngine);

// @ts-expect-error
() => assertUniformRandomBitGenerator(invalid);
// @ts-expect-error
() => toUniformRandomBitGenerator(invalid);
// @ts-expect-error
() => assertRandomNumberEngine(invalid);
// @ts-expect-error
() => toRandomNumberEngine(invalid);

// @ts-expect-error
assertUniformRandomBitGenerator(invalid)

function expectURBG<E extends RandomEngine>(e: UniformRandomBitGenerator<E>) {}
function expectRNE<E extends RandomEngine>(b: RandomNumberEngine<E>) {}


expectURBG(valid)
expectURBG(unknownEngine)
// @ts-expect-error
expectURBG(invalid)

expectRNE(valid)
// @ts-expect-error
expectRNE(unknownEngine)
// @ts-expect-error
expectRNE(invalid)

type InvalidMinimum = Expect<
  Equal<ReturnType<typeof InvalidUniformRandomBitGenerator.min>, UInt32<1n>>
>;

type InvalidMaximum = Expect<
  Equal<ReturnType<typeof InvalidUniformRandomBitGenerator.max>, UInt32<0n>>
>;

type InvalidStatus = Expect<
  Equal<UniformRandomBitGeneratorStatusOf<InvalidEngine>, false>
>;
