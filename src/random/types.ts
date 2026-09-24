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

export const UINT32_MAX = 0xffff_ffffn;
export const UINT64_MAX = 0xffff_ffff_ffff_ffffn;

export const UINT32_MODULUS = UINT32_MAX + 1n;
export const UINT64_MODULUS = UINT64_MAX + 1n;

/**
 * Converts a bigint to a uint32 value.
 *
 * @param value The value to convert.
 * @returns The value typed as `UInt32`.
 * @throws {RangeError} If the value is outside the uint32 range.
 */
export function uint32(value: bigint): UInt32 {
  if (value < 0n || value > UINT32_MAX) {
    throw new RangeError(`Value is outside uint32 range: ${value}`);
  }

  return value as UInt32;
}

/**
 * Converts a bigint to a uint64 value.
 *
 * @param value The value to convert.
 * @returns The value typed as `UInt64`.
 * @throws {RangeError} If the value is outside the uint64 range.
 */
export function uint64(value: bigint): UInt64 {
  if (value < 0n || value > UINT64_MAX) {
    throw new RangeError(`Value is outside uint64 range: ${value}`);
  }

  return value as UInt64;
}
