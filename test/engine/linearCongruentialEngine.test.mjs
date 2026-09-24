import assert from 'node:assert/strict';
import test from 'node:test';
import { defineLinearCongruentialEngine, RANDOM_ERROR_CODES, UInt32Type, UInt64Type } from '../../dist/index.mjs';

const TestEngine = defineLinearCongruentialEngine(UInt32Type, {
  multiplier: 5n,
  increment: 1n,
  modulus: 31n,
  defaultSeed: 1n,
});

const ModulusZeroEngine = defineLinearCongruentialEngine(UInt32Type, {
  multiplier: 5n,
  increment: 1n,
  modulus: 0n,
  defaultSeed: 1n
});

const ZeroIncrementEngine = defineLinearCongruentialEngine(UInt32Type, {
  multiplier: 5n,
  increment: 0n,
  modulus: 31n,
  defaultSeed: 1n
});

const SeedSequenceEngine = defineLinearCongruentialEngine(UInt32Type, {
  multiplier: 1n,
  increment: 0n,
  modulus: 0xffffffffn,
  defaultSeed: 1n
});

const SeedSequence64Engine = defineLinearCongruentialEngine(UInt64Type, {
  multiplier: 1n,
  increment: 0n,
  modulus: 0n,
  defaultSeed: 1n
});

test('engine: generates the successor state', () => {
  const engine = new TestEngine(2n);

  assert.equal(engine.next(), 11n);
  assert.equal(engine.next(), 25n);
  assert.equal(engine.next(), 2n);
});

test('engine: reports the output range statically', () => {
  assert.equal(TestEngine.min(), 0n);
  assert.equal(TestEngine.max(), 30n);
});

test('engine: seeds zero as one when increment is zero', () => {
  const engine = new ZeroIncrementEngine(0n);

  assert.equal(engine.next(), 5n);
});

test('engine: uses result type modulus when modulus is zero', () => {
  const engine = new ModulusZeroEngine(0n);

  assert.equal(ModulusZeroEngine.min(), 0n);
  assert.equal(ModulusZeroEngine.max(), 0xffffffffn);
  assert.equal(engine.next(), 1n);
});

test('engine: initializes from a seed sequence', () => {
  const seq = {
    generate(destination) {
      destination[3] = 0x89abcdefn;
    },
    size() {
      return 1;
    },
    param() {
      return [];
    },
  };

  const engine = new SeedSequenceEngine(seq);

  assert.equal(engine.next(), 0x89abcdefn);
});

test('engine: combines 64-bit seed sequence values', () => {
  const seq = {
    generate(destination) {
      assert.equal(destination.length, 6);

      destination[3] = 0x89abcdefn;
      destination[4] = 0x01234567n;
    },
    size() {
      return 2;
    },
    param() {
      return [];
    },
  };

  const engine = new SeedSequence64Engine(seq);

  assert.equal(engine.next(), 0x0123456789abcdefn);
});

test('engine: rejects a seed outside the result type range', () => {
  assert.throws(
    () => new TestEngine(0x1_0000_0000n),
    (error) => (
      error?.code === RANDOM_ERROR_CODES.OUT_OF_RANGE
    ),
  );
});

test('engine: rejects an invalid seed sequence value', () => {
  const seq = {
    generate(destination) {
      destination[3] = -1n;
    },
    size() {
      return 1;
    },
    param() {
      return [];
    },
  };

  assert.throws(
    () => new SeedSequenceEngine(seq),
    (error) => (
      error?.code === RANDOM_ERROR_CODES.INVALID_SEED_SEQUENCE
    ),
  );
});

test('engine: rejects an incomplete seed sequence', () => {
  const seq = {
    generate(destination) {
      destination[3] = undefined;
    },
    size() {
      return 1;
    },
    param() {
      return [];
    },
  };

  assert.throws(
    () => new SeedSequenceEngine(seq),
    (error) => (
      error?.code === RANDOM_ERROR_CODES.INVALID_SEED_SEQUENCE
    ),
  );
});

test('engine: discard matches repeated generation', () => {
  const discarded = new TestEngine(7n);
  const repeated = new TestEngine(7n);

  discarded.discard(1000n);

  for (let i = 0; i < 1000; i += 1) {
    repeated.next();
  }

  assert.equal(discarded.next(), repeated.next());
});

test('engine: copy construction preserves state', () => {
  const original = new TestEngine(7n);

  original.next();

  const copy = new TestEngine(original);

  assert.equal(copy.equals(original), true);
  assert.equal(copy.next(), original.next());
});
