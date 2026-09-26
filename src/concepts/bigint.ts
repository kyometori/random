type DecimalDigit =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type DecimalDigitValue<Value extends DecimalDigit> =
  Value extends '0' ? 0 :
  Value extends '1' ? 1 :
  Value extends '2' ? 2 :
  Value extends '3' ? 3 :
  Value extends '4' ? 4 :
  Value extends '5' ? 5 :
  Value extends '6' ? 6 :
  Value extends '7' ? 7 :
  Value extends '8' ? 8 :
  Value extends '9' ? 9 :
  never;

type DecimalDigitFromValue<Value extends number> =
  Value extends 0 ? '0' :
  Value extends 1 ? '1' :
  Value extends 2 ? '2' :
  Value extends 3 ? '3' :
  Value extends 4 ? '4' :
  Value extends 5 ? '5' :
  Value extends 6 ? '6' :
  Value extends 7 ? '7' :
  Value extends 8 ? '8' :
  Value extends 9 ? '9' :
  never;

type NextDecimalDigit<Value extends DecimalDigit> =
  Value extends '0' ? '1' :
  Value extends '1' ? '2' :
  Value extends '2' ? '3' :
  Value extends '3' ? '4' :
  Value extends '4' ? '5' :
  Value extends '5' ? '6' :
  Value extends '6' ? '7' :
  Value extends '7' ? '8' :
  Value extends '8' ? '9' :
  never;

type PreviousDecimalDigit<Value extends DecimalDigit> =
  Value extends '1' ? '0' :
  Value extends '2' ? '1' :
  Value extends '3' ? '2' :
  Value extends '4' ? '3' :
  Value extends '5' ? '4' :
  Value extends '6' ? '5' :
  Value extends '7' ? '6' :
  Value extends '8' ? '7' :
  Value extends '9' ? '8' :
  never;

type ReverseString<Value extends string, Result extends string = ''> =
  Value extends `${infer Head}${infer Rest}` ? ReverseString<Rest, `${Head}${Result}`> : Result;

type StripLeadingZeros<Value extends string> =
  Value extends `0${infer Rest}` ? (Rest extends '' ? '0' : StripLeadingZeros<Rest>) : Value;

type NormalizeDecimal<Value extends string> = StripLeadingZeros<Value>;

type BuildTuple<Length extends number, Result extends unknown[] = []> =
  Result['length'] extends Length ? Result : BuildTuple<Length, [...Result, unknown]>;

type SmallLessThan<Left extends number, Right extends number, Index extends unknown[] = []> =
  Left extends Right ? false : 
    Index['length'] extends Left ? true :
      Index['length'] extends Right ? false : SmallLessThan<Left, Right, [...Index, unknown]>;

type SmallAdd<Left extends number, Right extends number> = [...BuildTuple<Left>, ...BuildTuple<Right>]['length'] & number;

type SmallSubtract<Left extends number, Right extends number> =
  Left extends Right ? 0 :
    SmallLessThan<Left, Right> extends true ? never :
      BuildTuple<Left> extends [...BuildTuple<Right>, ...infer Result] ? Result['length'] & number : never;

type DecimalDigitLessThan<Left extends DecimalDigit, Right extends DecimalDigit> = SmallLessThan<DecimalDigitValue<Left>, DecimalDigitValue<Right>>;

type DecimalStringLength<Value extends string, Result extends unknown[] = []> =
  Value extends `${infer _}${infer Rest}` ? DecimalStringLength<Rest, [...Result, unknown]> : Result['length'];

type DecimalLessThanSameLength<Left extends string, Right extends string> =
  Left extends `${infer LeftDigit}${infer LeftRest}`
    ? Right extends `${infer RightDigit}${infer RightRest}`
      ? DecimalDigitLessThan<
          LeftDigit & DecimalDigit,
          RightDigit & DecimalDigit
        > extends true
        ? true
        : DecimalDigitLessThan<
            RightDigit & DecimalDigit,
            LeftDigit & DecimalDigit
          > extends true
          ? false
          : DecimalLessThanSameLength<LeftRest, RightRest>
      : false
    : false;

type CompareNormalizedDecimal<Left extends string, Right extends string> =
  Left extends Right ? 0 : 
    DecimalStringLength<Left> extends infer LeftLength extends number
      ? DecimalStringLength<Right> extends infer RightLength extends number
        ? LeftLength extends RightLength
          ? DecimalLessThanSameLength<Left, Right> extends true ? -1 : 1
          : SmallLessThan<LeftLength, RightLength> extends true ? -1 : 1
        : never
      : never;

type CompareNonNegativeBigInt<Left extends bigint, Right extends bigint> =
  CompareNormalizedDecimal<NormalizeDecimal<`${Left}`>, NormalizeDecimal<`${Right}`>>;

/**
 * Compares two non-negative bigint literal types.
 *
 * The result is `-1` when `Left < Right`, `0` when they are equal, and `1`
 * when `Left > Right`.
 *
 * When either operand is the broad `bigint` type, the result is `'unknown'`
 * because the comparison cannot be decided statically.
 *
 * @typeParam Left The left-hand bigint value.
 * @typeParam Right The right-hand bigint value.
 */
export type CompareBigInt<Left extends bigint, Right extends bigint> =
  bigint extends Left | Right ? 'unknown' : CompareNonNegativeBigInt<Left, Right>;

/**
 * Tests whether one non-negative bigint literal is smaller than another.
 *
 * When either operand is the broad `bigint` type, the result is `boolean`.
 *
 * @typeParam Left The left-hand bigint value.
 * @typeParam Right The right-hand bigint value.
 */
export type IsLessThan<Left extends bigint, Right extends bigint> =
  CompareBigInt<Left, Right> extends 'unknown' ? boolean :
    CompareBigInt<Left, Right> extends -1 ? true : false;

type AddDecimalDigits<Left extends DecimalDigit, Right extends DecimalDigit, Carry extends 0 | 1> =
  SmallAdd<SmallAdd<DecimalDigitValue<Left>, DecimalDigitValue<Right>>, Carry> extends infer Sum extends number
    ? `${Sum}` extends `${infer Tens extends DecimalDigit}${infer Ones extends DecimalDigit}`
      ? [Ones, 1]
      : [DecimalDigitFromValue<Sum>, 0]
    : never;

type AddReversedDecimal<Left extends string, Right extends string, Carry extends 0 | 1 = 0, Result extends string = ''> =
  Left extends `${infer LeftDigit}${infer LeftRest}`
    ? Right extends `${infer RightDigit}${infer RightRest}`
      ? AddDecimalDigits<
          LeftDigit & DecimalDigit,
          RightDigit & DecimalDigit,
          Carry
        > extends [
          infer Digit extends DecimalDigit,
          infer NextCarry extends 0 | 1,
        ]
        ? AddReversedDecimal<LeftRest, RightRest, NextCarry, `${Result}${Digit}`>
        : never
      : AddDecimalDigits<LeftDigit & DecimalDigit, '0', Carry> extends [
          infer Digit extends DecimalDigit,
          infer NextCarry extends 0 | 1,
        ]
        ? AddReversedDecimal<LeftRest, '', NextCarry, `${Result}${Digit}`>
        : never
    : Right extends `${infer RightDigit}${infer RightRest}`
      ? AddDecimalDigits<'0', RightDigit & DecimalDigit, Carry> extends [
          infer Digit extends DecimalDigit,
          infer NextCarry extends 0 | 1,
        ]
        ? AddReversedDecimal<'', RightRest, NextCarry, `${Result}${Digit}`>
        : never
      : Carry extends 1 ? `${Result}1` : Result;

type AddDecimal<Left extends string, Right extends string> =
  NormalizeDecimal<
    ReverseString<
      AddReversedDecimal<
        ReverseString<NormalizeDecimal<Left>>,
        ReverseString<NormalizeDecimal<Right>>
      >
    >
  >;

/**
 * Adds two non-negative bigint literal types.
 *
 * If either operand is the broad `bigint` type, the result is `bigint`.
 *
 * @typeParam Left The left-hand bigint value.
 * @typeParam Right The right-hand bigint value.
 */
export type AddBigInt<Left extends bigint, Right extends bigint> =
  bigint extends Left | Right ? bigint :
    AddDecimal<`${Left}`, `${Right}`> extends infer Result extends string
      ? Result extends `${infer Value extends bigint}` ? Value : never
      : never;

type SubtractDecimalDigits<Left extends DecimalDigit, Right extends DecimalDigit, Borrow extends 0 | 1> =
  SmallAdd<DecimalDigitValue<Right>, Borrow> extends infer Required extends number
    ? SmallLessThan<DecimalDigitValue<Left>, Required> extends true
      ? SmallSubtract<10, SmallSubtract<Required, DecimalDigitValue<Left>> & number> extends infer Result extends number
        ? [DecimalDigitFromValue<Result>, 1]
        : never
      : SmallSubtract<DecimalDigitValue<Left>, Required> extends infer Result extends number
        ? [DecimalDigitFromValue<Result>, 0]
        : never
    : never;

type SubtractReversedDecimal<Left extends string, Right extends string, Borrow extends 0 | 1 = 0, Result extends string = ''> =
  Left extends `${infer LeftDigit}${infer LeftRest}`
    ? Right extends `${infer RightDigit}${infer RightRest}`
      ? SubtractDecimalDigits<LeftDigit & DecimalDigit, RightDigit & DecimalDigit, Borrow> extends [
          infer Digit extends DecimalDigit,
          infer NextBorrow extends 0 | 1,
        ]
        ? SubtractReversedDecimal<LeftRest, RightRest, NextBorrow, `${Result}${Digit}`>
        : never
      : SubtractDecimalDigits<LeftDigit & DecimalDigit, '0', Borrow> extends [
          infer Digit extends DecimalDigit,
          infer NextBorrow extends 0 | 1,
        ]
        ? SubtractReversedDecimal<LeftRest, '', NextBorrow, `${Result}${Digit}`>
        : never
    : Right extends `${infer RightDigit}${infer RightRest}`
      ? SubtractDecimalDigits<'0', RightDigit & DecimalDigit, Borrow> extends [
          infer Digit extends DecimalDigit,
          infer NextBorrow extends 0 | 1,
        ]
        ? SubtractReversedDecimal<'', RightRest, NextBorrow, `${Result}${Digit}`>
        : never
      : Borrow extends 1 ? never : Result;

type SubtractDecimal<Left extends string, Right extends string> =
  CompareNormalizedDecimal<NormalizeDecimal<Left>, NormalizeDecimal<Right>> extends -1
    ? never
    : NormalizeDecimal<
        ReverseString<
          SubtractReversedDecimal<
            ReverseString<NormalizeDecimal<Left>>,
            ReverseString<NormalizeDecimal<Right>>
          >
        >
      >;

/**
 * Subtracts one non-negative bigint literal type from another.
 *
 * The left operand must be greater than or equal to the right operand.
 * Otherwise the result is `never`.
 *
 * If either operand is the broad `bigint` type, the result is `bigint`.
 *
 * @typeParam Left The minuend.
 * @typeParam Right The subtrahend.
 */
export type SubtractBigInt<Left extends bigint, Right extends bigint> =
  bigint extends Left | Right ? bigint :
    SubtractDecimal<`${Left}`, `${Right}`> extends infer Result extends string
      ? Result extends `${infer Value extends bigint}` ? Value : never
      : never;

type SmallMultiply<Left extends number, Right extends number, Result extends unknown[] = []> =
  Right extends 0
    ? Result['length'] & number
    : SmallMultiply<
        Left,
        Right extends 1 ? 0 :
        Right extends 2 ? 1 :
        Right extends 3 ? 2 :
        Right extends 4 ? 3 :
        Right extends 5 ? 4 :
        Right extends 6 ? 5 :
        Right extends 7 ? 6 :
        Right extends 8 ? 7 :
        8,
        [...Result, ...BuildTuple<Left>]
      >;

type MultiplyDecimalDigits<
  Left extends DecimalDigit,
  Right extends DecimalDigit,
  Carry extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
> =
  SmallMultiply<
    DecimalDigitValue<Left>,
    DecimalDigitValue<Right>
  > extends infer Product extends number
    ? SmallAdd<Product, Carry> extends infer Value extends number
      ? `${Value}` extends `${infer Tens extends DecimalDigit}${infer Ones extends DecimalDigit}`
        ? [Ones, DecimalDigitValue<Tens>]
        : [DecimalDigitFromValue<Value>, 0]
      : never
    : never;

type MultiplyByDecimalDigitReversed<
  Value extends string,
  Digit extends DecimalDigit,
  Carry extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 0,
  Result extends string = '',
> =
  Value extends `${infer Head}${infer Rest}`
    ? MultiplyDecimalDigits<
        Head & DecimalDigit,
        Digit,
        Carry
      > extends [
        infer Output extends DecimalDigit,
        infer NextCarry extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
      ]
      ? MultiplyByDecimalDigitReversed<
          Rest,
          Digit,
          NextCarry,
          `${Result}${Output}`
        >
      : never
    : Carry extends 0 ? Result : `${Result}${Carry}`;

type MultiplyByDecimalDigit<Value extends string, Digit extends DecimalDigit> =
  NormalizeDecimal<
    ReverseString<
      MultiplyByDecimalDigitReversed<
        ReverseString<NormalizeDecimal<Value>>,
        Digit
      >
    >
  >;

type AppendDecimalZeros<Value extends string, Count extends number, Result extends unknown[] = []> =
  Result['length'] extends Count
    ? Value
    : AppendDecimalZeros<
        `${Value}0`,
        Count,
        [...Result, unknown]
      >;

type IncrementSmallNumber<Value extends number> =
  [...BuildTuple<Value>, unknown]['length'] & number;

type MultiplyDecimal<Left extends string, Right extends string, Position extends number = 0, Result extends string = '0'> =
  Right extends `${infer Digit}${infer Rest}`
    ? MultiplyDecimal<
        Left,
        Rest,
        IncrementSmallNumber<Position>,
        AddDecimal<
          Result,
          AppendDecimalZeros<
            MultiplyByDecimalDigit<Left, Digit & DecimalDigit>,
            Position
          >
        >
      >
    : NormalizeDecimal<Result>;

/**
 * Multiplies two non-negative bigint literal types.
 *
 * If either operand is the broad `bigint` type, the result is `bigint`.
 *
 * @typeParam Left The left-hand bigint value.
 * @typeParam Right The right-hand bigint value.
 */
export type MultiplyBigInt<Left extends bigint, Right extends bigint> =
  bigint extends Left | Right
    ? bigint
    : MultiplyDecimal<
        `${Left}`,
        ReverseString<`${Right}`>
      > extends infer Result extends string
      ? Result extends `${infer Value extends bigint}` ? Value : never
      : never;

type FindQuotientDecimalDigit<Current extends string, Divisor extends string, Candidate extends DecimalDigit = '0'> =
  CompareNormalizedDecimal<
    MultiplyByDecimalDigit<Divisor, Candidate>,
    Current
  > extends 1
    ? Candidate extends '0' ? '0' : PreviousDecimalDigit<Candidate>
    : Candidate extends '9'
      ? '9'
      : FindQuotientDecimalDigit<
          Current,
          Divisor,
          NextDecimalDigit<Candidate>
        >;

type LongDivideDecimal<Dividend extends string, Divisor extends string, Remainder extends string = '0', Quotient extends string = ''> =
  Dividend extends `${infer Digit}${infer Rest}`
    ? NormalizeDecimal<
        `${Remainder extends '0' ? '' : Remainder}${Digit}`
      > extends infer Current extends string
      ? FindQuotientDecimalDigit<
          Current,
          Divisor
        > extends infer QuotientDigit extends DecimalDigit
        ? SubtractDecimal<
            Current,
            MultiplyByDecimalDigit<Divisor, QuotientDigit>
          > extends infer NextRemainder extends string
          ? LongDivideDecimal<
              Rest,
              Divisor,
              NextRemainder,
              `${Quotient}${QuotientDigit}`
            >
          : never
        : never
      : never
    : [NormalizeDecimal<Quotient>, NormalizeDecimal<Remainder>];

/**
 * Divides two non-negative bigint literal types and returns their quotient
 * and remainder.
 *
 * A zero divisor produces `never`.
 *
 * If either operand is the broad `bigint` type, both results are `bigint`.
 *
 * @typeParam Dividend The dividend.
 * @typeParam Divisor The divisor.
 */
export type DivideWithRemainder<Dividend extends bigint, Divisor extends bigint> =
  Divisor extends 0n ? never : 
    bigint extends Dividend | Divisor ? { quotient: bigint; remainder: bigint } : 
      LongDivideDecimal<`${Dividend}`, `${Divisor}`> extends [
        infer Quotient extends string,
        infer Remainder extends string,
      ] ? {
          quotient: Quotient extends `${infer Value extends bigint}` ? Value : never;
          remainder: Remainder extends `${infer Value extends bigint}` ? Value : never;
      } : never;

/**
 * Divides one non-negative bigint literal type by another.
 *
 * A zero divisor produces `never`.
 *
 * @typeParam Dividend The dividend.
 * @typeParam Divisor The divisor.
 */
export type DivideBigInt<Dividend extends bigint, Divisor extends bigint> =
  DivideWithRemainder<Dividend, Divisor> extends infer Result
    ? Result extends { quotient: infer Quotient extends bigint }
      ? Quotient
      : never
    : never;

/**
 * Computes the remainder of dividing one non-negative bigint literal type by
 * another.
 *
 * A zero divisor produces `never`.
 *
 * @typeParam Dividend The dividend.
 * @typeParam Divisor The divisor.
 */
export type ModuloBigInt<Dividend extends bigint, Divisor extends bigint> =
  DivideWithRemainder<Dividend, Divisor> extends infer Result
    ? Result extends { remainder: infer Remainder extends bigint }
      ? Remainder
      : never
    : never;

/**
 * Raises a non-negative bigint literal type to a non-negative bigint
 * exponent.
 *
 * Exponentiation uses exponentiation by squaring, so recursion depth grows
 * logarithmically with the exponent instead of linearly with its value.
 *
 * If either operand is the broad `bigint` type, the result is `bigint`.
 *
 * @typeParam Base The base value.
 * @typeParam Exponent The exponent.
 */
export type PowerBigInt<Base extends bigint, Exponent extends bigint> =
  bigint extends Base | Exponent ? bigint :
    Exponent extends 0n ? 1n :
      ModuloBigInt<Exponent, 2n> extends 0n ? PowerBigInt<
        MultiplyBigInt<Base, Base>,
        DivideBigInt<Exponent, 2n>
      > : MultiplyBigInt<
        Base,
        PowerBigInt<MultiplyBigInt<Base, Base>, DivideBigInt<Exponent, 2n>>
      >;

export type NumberToBigInt<Value extends number> =
  `${Value}` extends `${infer Result extends bigint}` ? Result : bigint;
