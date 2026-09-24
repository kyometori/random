import assert from 'node:assert/strict';
import test from 'node:test';
import { defineLinearCongruentialEngine } from '../../dist/index.mjs';

const TestEngine = defineLinearCongruentialEngine({
  multiplier: 5n,
  increment: 1n,
  modulus: 31n,
  defaultSeed: 1n,
  resultBits: 32,
});

const ModulusZeroEngine = defineLinearCongruentialEngine({
  multiplier: 5n,
  increment: 1n,
  modulus: 0n,
  defaultSeed: 1n,
  resultBits: 32
});

const ZeroIncrementEngine = defineLinearCongruentialEngine({
  multiplier: 5n,
  increment: 0n,
  modulus: 31n,
  defaultSeed: 1n,
  resultBits: 32
});

const SeedSequenceEngine = defineLinearCongruentialEngine({
  multiplier: 1n,
  increment: 0n,
  modulus: 0xffffffffn,
  defaultSeed: 1n,
  resultBits: 32
});

const SeedSequence64Engine = defineLinearCongruentialEngine({
  multiplier: 1n,
  increment: 0n,
  modulus: 0n,
  defaultSeed: 1n,
  resultBits: 64
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
