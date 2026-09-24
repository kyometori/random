import { defineLinearCongruentialEngine } from './engine/linearCongruentialEngine';
import type { UInt32 } from './random';
import { UInt32Type } from './random';

/**
 * `minstd_rand0` is a predefined `LinearCongruentialEngine` specialization
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
  modulus: 2147483647n as UInt32,
  defaultSeed: 1n as UInt32,
});

/**
 * `minstd_rand` is a predefined `LinearCongruentialEngine` specialization
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
  modulus: 2147483647n as UInt32,
  defaultSeed: 1n as UInt32,
});
