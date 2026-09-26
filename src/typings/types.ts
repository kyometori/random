/**
 * A 32-bit unsigned integer type.
 *
 * The optional type parameter preserves a known bigint literal value,
 * such as `UInt32<31n>`.
 *
 * @typeParam Value The bigint value represented by the type.
 */
export type UInt32<Value extends bigint = bigint> = Value & {
  readonly __uint32: unique symbol;
};

/**
 * A 64-bit unsigned integer type.
 *
 * The optional type parameter preserves a known bigint literal value,
 * such as `UInt64<31n>`.
 *
 * @typeParam Value The bigint value represented by the type.
 */
export type UInt64<Value extends bigint = bigint> = Value & {
  readonly __uint64: unique symbol;
};

/** A supported unsigned integer type. */
export type UInt = UInt32 | UInt64;

/**
 * Extracts the bigint literal represented by a UInt type.
 *
 * @typeParam Value The UInt type.
 */
export type UIntLiteral<Value extends bigint> =
  Value extends UInt32<infer Literal> ? Literal :
  Value extends UInt64<infer Literal> ? Literal :
  Value;

/**
 * Gets the maximum representable value of a UInt family.
 *
 * @typeParam Value The UInt type.
 */
export type UIntMax<Value extends UInt> =
  Value extends UInt32<infer _> ? 0xffffffffn :
  Value extends UInt64<infer _> ? 0xffffffffffffffffn :
  bigint;

/**
 * Re-attaches a UInt family to a known bigint literal value.
 *
 * @typeParam Type The UInt family.
 * @typeParam Value The bigint literal value.
 */
export type UIntWithLiteralValue<Type extends UInt, Value extends bigint> =
  Type extends UInt32<infer _> ? UInt32<Value> :
  Type extends UInt64<infer _> ? UInt64<Value> :
  Type & Value;

export type Real = number;
export type Size = number;
export type UnsignedLongLong = bigint;
export type SeedResult = UInt32;

/**
 * Runtime type information for a UInt family.
 *
 * `cast()` preserves literal information so values used in engine definitions
 * remain available to type-level algorithms.
 *
 * @typeParam Type The UInt family represented by this object.
 */
export interface UIntType<Type extends UInt> {
  readonly max: Type;
  readonly modulus: bigint;

  /**
   * Converts a bigint to this UInt family.
   *
   * @typeParam Value The bigint literal value to preserve.
   * @param value The value to convert.
   * @returns The value typed as the corresponding UInt literal.
   * @throws {RangeError} If the value is outside the representable range.
   */
  cast<const Value extends bigint>(value: Value): UIntWithLiteralValue<Type, Value>;
}
