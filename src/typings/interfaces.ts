import type { SeedResult, Size, UInt } from './types';

/**
 * A `SeedSequence` is an object that produces unsigned integer 
 * values i in the UInt32 range based on a consumed range of 
 * integer data.
 *
 * @see https://en.cppreference.com/cpp/named_req/SeedSequence
 */
export interface SeedSequence {
  /**
   * Fills `destination` with 32-bit quantities depending on 
   * the initial supplied values and potential previous calls 
   * to generate. If `destination.length === 0`, it does nothing.
   *
   * @param destination The destination array to populate.
   */
  generate(destination: SeedResult[]): void;

  /** @returns The amount of 32-bit integers copied by `param`. */
  size(): Size;

  /** @returns A copy of the stored seed values. **/
  param(): SeedResult[];
}

/**
 * The minimal structural interface shared by random engines.
 *
 * This interface intentionally does not imply UniformRandomBitGenerator or
 * RandomNumberEngine requirements.
 *
 * @typeParam Type The value produced by the engine.
 */
export interface RandomEngine<Type extends UInt = UInt> {
  /** @returns The next value produced by the engine. */
  next(): Type;
}
