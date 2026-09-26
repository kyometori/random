import type { UInt32, UInt64, UIntType } from './types';

export const UINT32_MAX = 0xffff_ffffn;
export const UINT64_MAX = 0xffff_ffff_ffff_ffffn;
export const UINT32_MODULUS = UINT32_MAX + 1n;
export const UINT64_MODULUS = UINT64_MAX + 1n;

export const UInt32Type: UIntType<UInt32> = Object.freeze({
  max: UINT32_MAX as UInt32,
  modulus: UINT32_MODULUS,
  cast<const Value extends bigint>(value: Value): UInt32<Value> {
    if (value < 0n || value > UINT32_MAX) {
      throw new RangeError(`Value is outside uint32 range: ${value}`);
    }

    return value as UInt32<Value>;
  },
});

export const UInt64Type: UIntType<UInt64> = Object.freeze({
  max: UINT64_MAX as UInt64,
  modulus: UINT64_MODULUS,
  cast<const Value extends bigint>(value: Value): UInt64<Value> {
    if (value < 0n || value > UINT64_MAX) {
      throw new RangeError(`Value is outside uint64 range: ${value}`);
    }

    return value as UInt64<Value>;
  },
});

/**
 * Converts a bigint to `UInt32` while preserving its bigint literal type.
 *
 * @param value The value to convert.
 * @returns The value typed as `UInt32<Value>`.
 * @throws {RangeError} If the value is outside the uint32 range.
 */
export function uint32<const Value extends bigint>(value: Value): UInt32<Value> {
  return UInt32Type.cast(value);
}

/**
 * Converts a bigint to `UInt64` while preserving its bigint literal type.
 *
 * @param value The value to convert.
 * @returns The value typed as `UInt64<Value>`.
 * @throws {RangeError} If the value is outside the uint64 range.
 */
export function uint64<const Value extends bigint>(value: Value): UInt64<Value> {
  return UInt64Type.cast(value);
}
