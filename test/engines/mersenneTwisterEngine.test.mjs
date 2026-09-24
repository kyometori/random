import assert from 'node:assert/strict';
import test from 'node:test';
import { defineMersenneTwisterEngine, RandomErrorCode, UInt32Type } from '../../dist/index.mjs';

const TestEngine = defineMersenneTwisterEngine(UInt32Type, {
  wordSize: 8,
  stateSize: 4,
  shiftSize: 2,
  maskBits: 3,
  xorMask: 0xb8n,
  temperingU: 2,
  temperingD: 0xffn,
  temperingS: 3,
  temperingB: 0xe0n,
  temperingT: 2,
  temperingC: 0x30n,
  temperingL: 1,
  initializationMultiplier: 5n,
});

test('engine: reports the output range statically', () => {
  assert.equal(TestEngine.min(), 0n);
  assert.equal(TestEngine.max(), 0xffn);
});

test('engine: generates the expected sequence', () => {
  const engine = new TestEngine(1n);

  const expected = [
    110n,
    158n,
    172n,
    228n,
    110n,
    171n,
    248n,
    220n,
    58n,
    174n,
    162n,
    33n,
  ];

  for (const value of expected) {
    assert.equal(engine.next(), value);
  }
});

test('engine: seeded engines produce equivalent sequences', () => {
  const first = new TestEngine(42n);
  const second = new TestEngine(42n);

  for (let i = 0; i < 20; i += 1) {
    assert.equal(first.next(), second.next());
  }
});

test('engine: discard matches repeated generation', () => {
  const discarded = new TestEngine(42n);
  const repeated = new TestEngine(42n);

  discarded.discard(1000n);

  for (let i = 0; i < 1000; i += 1) {
    repeated.next();
  }

  assert.equal(discarded.next(), repeated.next());
});

test('engine: copy construction preserves state', () => {
  const original = new TestEngine(42n);

  for (let i = 0; i < 7; i += 1) {
    original.next();
  }

  const copy = new TestEngine(original);

  assert.equal(copy.equals(original), true);
  assert.equal(copy.next(), original.next());
});

test('engine: copy construction rejects a different engine type', () => {
  const OtherEngine = defineMersenneTwisterEngine(UInt32Type, {
    wordSize: 8,
    stateSize: 4,
    shiftSize: 2,
    maskBits: 3,
    xorMask: 0xb8n,
    temperingU: 2,
    temperingD: 0xffn,
    temperingS: 3,
    temperingB: 0xe0n,
    temperingT: 2,
    temperingC: 0x30n,
    temperingL: 1,
    initializationMultiplier: 7n,
  });

  assert.throws(
    () => new TestEngine(new OtherEngine()),
    (error) => (
      error?.code === RandomErrorCode.INVALID_ARGUMENT
    ),
  );
});

test('engine: seed resets the sequence', () => {
  const engine = new TestEngine(42n);

  const expected = new TestEngine(42n);

  for (let i = 0; i < 10; i += 1) {
    engine.next();
  }

  engine.seed(42n);

  for (let i = 0; i < 10; i += 1) {
    assert.equal(engine.next(), expected.next());
  }
});
