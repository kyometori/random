import type { AddBigInt, SubtractBigInt, MultiplyBigInt, DivideBigInt, ModuloBigInt, PowerBigInt } from '../src/concepts/bigint';
import type { Equal, Expect } from './assert';

type AddTest = Expect<Equal<
  AddBigInt<123n, 456n>,
  579n
>>;

type SubtractTest = Expect<Equal<
  SubtractBigInt<456n, 123n>,
  333n
>>;

type MultiplyTest = Expect<Equal<
  MultiplyBigInt<123n, 456n>,
  56088n
>>;

type DivideTest = Expect<Equal<
  DivideBigInt<56088n, 456n>,
  123n
>>;

type ModuloTest = Expect<Equal<
  ModuloBigInt<56089n, 456n>,
  1n
>>;

type PowerTest = Expect<Equal<
  PowerBigInt<2n, 64n>,
  18446744073709551616n
>>;
