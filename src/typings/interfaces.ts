import type { UInt, SeedResult, Size } from './types';

export interface SeedSequence {
  generate(destination: SeedResult[]): void;
  size(): Size;
  param(): SeedResult[];
}

export interface UniformRandomBitGenerator<T extends UInt = UInt> {
  next(): T;
}
