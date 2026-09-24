import { defineLinearCongruentialEngine, defineMersenneTwisterEngine } from './engines';
import type { UInt32, UInt64 } from './typings';
import { UInt32Type, UInt64Type } from './typings';

/**
 * `MinstdRand0` is a predefined `LinearCongruentialEngine` specialization
 * with the following parameter set:
 *
 * - result type: `UInt32`
 * - multiplier: `16807`
 * - increment: `0`
 * - modulus: `2147483647`
 *
 * It was discovered in 1969 by Lewis, Goodman and Miller and adopted as the
 * "Minimal standard" in 1988 by Park and Miller.
 *
 * @see https://en.cppreference.com/cpp/numeric/random/linear_congruential_engine
 */
export const MinstdRand0 = defineLinearCongruentialEngine<UInt32>(UInt32Type, {
  multiplier: 16807n as UInt32,
  increment: 0n as UInt32,
  modulus: 2147483647n as UInt32
});

/**
 * `MinstdRand` is a predefined `LinearCongruentialEngine` specialization
 * with the following parameter set:
 *
 * - result type: `UInt32`
 * - multiplier: `48271`
 * - increment: `0`
 * - modulus: `2147483647`
 *
 * It is the newer "Minimum standard", recommended by Park, Miller, and
 * Stockmeyer in 1993.
 *
 * @see https://en.cppreference.com/cpp/numeric/random/linear_congruential_engine
 */
export const MinstdRand = defineLinearCongruentialEngine<UInt32>(UInt32Type, {
  multiplier: 48271n as UInt32,
  increment: 0n as UInt32,
  modulus: 2147483647n as UInt32
});

/**
 * `Mt19937` is a predefined `MersenneTwisterEngine` specialization
 * with the following parameter set:
 *
 * - result type: `UInt32`
 * - word size: `32`
 * - state size: `624`
 * - shift size: `397`
 * - mask bits: `31`
 * - xor mask: `0x9908b0df`
 * - tempering u: `11`
 * - tempering d: `0xffffffff`
 * - tempering s: `7`
 * - tempering b: `0x9d2c5680`
 * - tempering t: `15`
 * - tempering c: `0xefc60000`
 * - tempering l: `18`
 * - initialization multiplier: `1812433253`
 *
 * It corresponds to `std::mt19937`.
 *
 * @see https://en.cppreference.com/cpp/numeric/random/mersenne_twister_engine
 */
export const Mt19937 = defineMersenneTwisterEngine<UInt32>(UInt32Type, {
  wordSize: 32,
  stateSize: 624,
  shiftSize: 397,
  maskBits: 31,
  xorMask: 0x9908b0dfn as UInt32,
  temperingU: 11,
  temperingD: 0xffffffffn as UInt32,
  temperingS: 7,
  temperingB: 0x9d2c5680n as UInt32,
  temperingT: 15,
  temperingC: 0xefc60000n as UInt32,
  temperingL: 18,
  initializationMultiplier: 1812433253n as UInt32,
});

/**
 * `Mt19937_64` is a predefined `MersenneTwisterEngine` specialization
 * with the following parameter set:
 *
 * - result type: `UInt64`
 * - word size: `64`
 * - state size: `312`
 * - shift size: `156`
 * - mask bits: `31`
 * - xor mask: `0xb5026f5aa96619e9`
 * - tempering u: `29`
 * - tempering d: `0x5555555555555555`
 * - tempering s: `17`
 * - tempering b: `0x71d67fffeda60000`
 * - tempering t: `37`
 * - tempering c: `0xfff7eee000000000`
 * - tempering l: `43`
 * - initialization multiplier: `6364136223846793005`
 *
 * It corresponds to `std::mt19937_64`.
 *
 * @see https://en.cppreference.com/cpp/numeric/random/mersenne_twister_engine
 */
export const Mt19937_64 = defineMersenneTwisterEngine<UInt64>(UInt64Type, {
  wordSize: 64,
  stateSize: 312,
  shiftSize: 156,
  maskBits: 31,
  xorMask: 0xb5026f5aa96619e9n as UInt64,
  temperingU: 29,
  temperingD: 0x5555555555555555n as UInt64,
  temperingS: 17,
  temperingB: 0x71d67fffeda60000n as UInt64,
  temperingT: 37,
  temperingC: 0xfff7eee000000000n as UInt64,
  temperingL: 43,
  initializationMultiplier: 6364136223846793005n as UInt64,
});
