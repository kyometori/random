import type { SeedResult, SeedSequence, Size, UInt32, UIntType } from '../typings';
import { UINT32_MAX, UInt32Type } from '../typings';

/**
 * `SeedSeq` is a seed sequence that consumes integer-valued seed data and
 * produces a requested number of 32-bit unsigned integer values.
 *
 * The generated values are distributed over the entire 32-bit range even
 * when the supplied seed data is close or poorly distributed.
 *
 * `SeedSeq` models the standard C++ `std::seed_seq` facility and satisfies
 * the `SeedSequence` interface used by this library.
 *
 * ### Member types
 *
 * `resultType` represents `std::seed_seq::result_type`, which is
 * `uint_least32_t`.
 *
 * ### Data members
 *
 * `v` is the underlying seed sequence. In the C++ specification, this is an
 * exposition-only member object.
 *
 * ### Member functions
 *
 * - `generate()` generates unbiased 32-bit values from the stored seed data.
 * - `size()` returns the number of stored seed values.
 * - `param()` returns the stored seed values.
 *
 * ### Construction
 *
 * An empty seed sequence is default-constructed. A seed sequence may also be
 * constructed from an iterable sequence of integer values; each value is
 * reduced modulo 2^32 before being stored.
 *
 * @see https://en.cppreference.com/cpp/numeric/random/seed_seq
 * @see https://eel.is/c++draft/rand.util.seedseq
 */
export class SeedSeq implements SeedSequence {
  public static readonly resultType: UIntType<UInt32> = UInt32Type;

  public readonly v: SeedResult[];

  /**
   * Constructs an empty seed sequence.
   *
   * After construction, `v` is empty.
   *
   * @see https://en.cppreference.com/cpp/numeric/random/seed_seq/seed_seq
   * @see https://eel.is/c++draft/rand.util.seedseq
   */
  public constructor();

  /**
   * Constructs a seed sequence from integer-valued seed data.
   *
   * Each value is stored modulo 2^32.
   *
   * @param seed The initial seed sequence.
   *
   * @see https://en.cppreference.com/cpp/numeric/random/seed_seq/seed_seq
   * @see https://eel.is/c++draft/rand.util.seedseq
   */
  public constructor(seed: Iterable<bigint>);

  public constructor(seed: Iterable<bigint> = []) {
    this.v = [];

    for (const value of seed) this.v.push(UInt32Type.cast(value & UINT32_MAX));
  }

  /**
   * Generates a sequence of 32-bit unsigned integer values from the stored
   * seed sequence.
   *
   * If `destination` is empty, this function does nothing. Otherwise, every
   * element of `destination` is initialized and transformed according to the
   * `std::seed_seq` generation algorithm.
   *
   * All arithmetic in the algorithm is performed modulo 2^32. Indexing into
   * `destination` is performed modulo its length.
   *
   * Let:
   *
   * - `z` be `v.size()`.
   * - `n` be `destination.length`.
   * - `m` be `max(z + 1, n)`.
   * - `t` be selected from `n`.
   * - `p` be `(n - t) / 2`.
   * - `q` be `p + t`.
   *
   * The first transformation initializes every output element to
   * `0x8b8b8b8b`, then performs the first mixing loop. The second mixing loop
   * applies the final scrambling transformation.
   *
   * @param destination The mutable output range to fill.
   *
   * @see https://en.cppreference.com/cpp/numeric/random/seed_seq/generate
   * @see https://eel.is/c++draft/rand.util.seedseq
   */
  public generate(destination: SeedResult[]): void {
    const n = destination.length;
    if (n === 0) return;

    const z = this.v.length;
    const t = n < 7 ? Math.floor((n - 1) / 2) : n < 39 ? 3 : n < 68 ? 5 : n < 623 ? 7 : 11;
    const p = Math.floor((n - t) / 2);
    const q = p + t;
    const m = Math.max(z + 1, n);
    const begin = (i: number): SeedResult => destination[i < 0 ? n - 1 : i % n]!;
    const T = (x: bigint): bigint => x ^ (x >> 27n);

    destination.fill(0x8b8b_8b8bn as SeedResult);

    for (let k = 0; k < m; ++k) {
      const r1 = (1664525n * T(begin(k) ^ begin(k + p) ^ begin(k - 1))) & UINT32_MAX;
      const j = k === 0
        ? BigInt(z)
        : k <= z
          ? BigInt(k % n) + BigInt(this.v[k - 1]!)
          : BigInt(k % n);
      const r2 = (r1 + j) & UINT32_MAX;
      const pIndex = (k + p) % n;
      const qIndex = (k + q) % n;
      const kIndex = k % n;

      destination[pIndex] = (((destination[pIndex]! as bigint) + r1) & UINT32_MAX) as SeedResult;
      destination[qIndex] = (((destination[qIndex]! as bigint) + r2) & UINT32_MAX) as SeedResult;
      destination[kIndex] = r2 as SeedResult;
    }

    for (let k = m; k < m + n; ++k) {
      const r3 = (1566083941n * T((
        (begin(k) as bigint) +
        (begin(k + p) as bigint) +
        (begin(k - 1) as bigint)
      ) & UINT32_MAX)) & UINT32_MAX;
      const r4 = (r3 - BigInt(k % n)) & UINT32_MAX;
      const pIndex = (k + p) % n;
      const qIndex = (k + q) % n;
      const kIndex = k % n;

      destination[pIndex] = ((destination[pIndex]! as bigint) ^ r3) as SeedResult;
      destination[qIndex] = ((destination[qIndex]! as bigint) ^ r4) as SeedResult;
      destination[kIndex] = r4 as SeedResult;
    }
  }

  /**
   * Returns the number of stored 32-bit seed values.
   *
   * @returns The number of stored seed values.
   *
   * @see https://en.cppreference.com/cpp/numeric/random/seed_seq/size
   * @see https://eel.is/c++draft/rand.util.seedseq
   */
  public size(): Size {
    return this.v.length;
  }

  /**
   * Copies the stored seed values.
   *
   * @returns A copy of the stored seed sequence.
   *
   * @see https://en.cppreference.com/cpp/numeric/random/seed_seq/param
   * @see https://eel.is/c++draft/rand.util.seedseq
   */
  public param(): SeedResult[] {
    return [...this.v];
  }
}
