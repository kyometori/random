import { Mt19937, Mt19937_64 } from '../src/generators';
import { defineMersenneTwisterEngine } from '../src/engines/mersenneTwisterEngine';
import { UInt32Type, UInt64Type, uint32, uint64 } from '../src/typings';
import type { UInt32, UInt64 } from '../src/typings';
import type { UniformRandomBitGeneratorStatusOf } from '../src/concepts';
import type { Equal, Expect } from './assert';

type Mt19937Engine = InstanceType<typeof Mt19937>;

type Mt19937UniformRandomBitGenerator = Expect<
  Equal<UniformRandomBitGeneratorStatusOf<Mt19937Engine>, true>
>;

type Mt19937Minimum = Expect<
  Equal<ReturnType<typeof Mt19937.min>, UInt32<0n>>
>;

type Mt19937Maximum = Expect<
  Equal<ReturnType<typeof Mt19937.max>, UInt32<0xffff_ffffn>>
>;

type Mt19937_64Engine = InstanceType<typeof Mt19937_64>;

type Mt19937_64Minimum = Expect<
  Equal<ReturnType<typeof Mt19937_64.min>, UInt64<0n>>
>; 

type Mt19937_64Maximum = Expect<
  Equal<ReturnType<typeof Mt19937_64.max>, UInt64<0xffff_ffff_ffff_ffffn>>
>;

type Mt19937_64UniformRandomBitGenerator = Expect<
  Equal<UniformRandomBitGeneratorStatusOf<Mt19937_64Engine>, true>
>;

const CustomMersenneTwisterEngine = defineMersenneTwisterEngine(UInt32Type, {
  wordSize: 32,
  stateSize: 624,
  shiftSize: 397,
  maskBits: 31,
  xorMask: uint32(0x9908b0dfn),
  temperingU: 11,
  temperingD: uint32(0xffffffffn),
  temperingS: 7,
  temperingB: uint32(0x9d2c5680n),
  temperingT: 15,
  temperingC: uint32(0xefc60000n),
  temperingL: 18,
  initializationMultiplier: uint32(1812433253n),
});

type CustomMersenneTwisterEngineInstance = InstanceType<typeof CustomMersenneTwisterEngine>;

type CustomMinimum = Expect<
  Equal<ReturnType<typeof CustomMersenneTwisterEngine.min>, UInt32<0n>>
>; 

type CustomMaximum = Expect<
  Equal<ReturnType<typeof CustomMersenneTwisterEngine.max>, UInt32<0xffff_ffffn>>
>; 

type CustomStatus = Expect<
  Equal<UniformRandomBitGeneratorStatusOf<CustomMersenneTwisterEngineInstance>, true>
>;
