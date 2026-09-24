import type { UInt32, UInt64, UIntType } from './types';

export const UINT32_MAX = 0xffff_ffffn;
export const UINT64_MAX = 0xffff_ffff_ffff_ffffn;

export const UINT32_MODULUS = UINT32_MAX + 1n;
export const UINT64_MODULUS = UINT64_MAX + 1n;

export const UInt32Type: UIntType<UInt32> = {
  max: UINT32_MAX as UInt32,
  modulus: UINT32_MODULUS,

  cast(value: bigint): UInt32 {
    if (value < 0n || value > UINT32_MAX) {
      throw new RangeError(`Value is outside uint32 range: ${value}`);
    }

    return value as UInt32;
  },
};

export const UInt64Type: UIntType<UInt64> = {
  max: UINT64_MAX as UInt64,
  modulus: UINT64_MODULUS,

  cast(value: bigint): UInt64 {
    if (value < 0n || value > UINT64_MAX) {
      throw new RangeError(`Value is outside uint64 range: ${value}`);
    }

    return value as UInt64;
  },
};

/**
 * Converts a bigint to a uint32 value.
 *
 * @param value The value to convert.
 * @returns The value typed as `UInt32`.
 * @throws {RangeError} If the value is outside the uint32 range.
 */
export function uint32(value: bigint): UInt32 {
  return UInt32Type.cast(value);
}

/**
 * Converts a bigint to a uint64 value.
 *
 * @param value The value to convert.
 * @returns The value typed as `UInt64`.
 * @throws {RangeError} If the value is outside the uint64 range.
 */
export function uint64(value: bigint): UInt64 {
  return UInt64Type.cast(value);
}
