export type UInt32 = bigint & {
  readonly __uint32: unique symbol;
};

export type UInt64 = bigint & {
  readonly __uint64: unique symbol;
};

export type UInt = UInt32 | UInt64;

export type Real = number;
export type Size = number;
export type UnsignedLongLong = bigint;
export type SeedResult = UInt32;

export interface UIntType<T extends UInt> {
  readonly max: T;
  readonly modulus: bigint;
  cast(value: bigint): T;
}

