import assert from 'node:assert/strict';
import test from 'node:test';
import { MinstdRand0, MinstdRand } from '../../dist/index.mjs';

test('generator: minstd_rand0 exposes the predefined parameters', () => {
  assert.equal(MinstdRand0.multiplier, 16807n);
  assert.equal(MinstdRand0.increment, 0n);
  assert.equal(MinstdRand0.modulus, 2147483647n);
  assert.equal(MinstdRand0.defaultSeed, 1n);
  assert.equal(MinstdRand0.min(), 1n);
  assert.equal(MinstdRand0.max(), 2147483646n);
});

test('generator: minstd_rand0 generates the predefined sequence', () => {
  const engine = new MinstdRand0();

  assert.equal(engine.next(), 16807n);
  assert.equal(engine.next(), 282475249n);
  assert.equal(engine.next(), 1622650073n);
});

test('generator: minstd_rand0 produces the predefined 10000th value', () => {
  const engine = new MinstdRand0();

  for (let i = 0; i < 9999; i += 1) {
    engine.next();
  }

  assert.equal(engine.next(), 1043618065n);
});

test('generator: minstd_rand exposes the predefined parameters', () => {
  assert.equal(MinstdRand.multiplier, 48271n);
  assert.equal(MinstdRand.increment, 0n);
  assert.equal(MinstdRand.modulus, 2147483647n);
  assert.equal(MinstdRand.defaultSeed, 1n);
  assert.equal(MinstdRand.min(), 1n);
  assert.equal(MinstdRand.max(), 2147483646n);
});

test('generator: minstd_rand generates the predefined sequence', () => {
  const engine = new MinstdRand();

  assert.equal(engine.next(), 48271n);
  assert.equal(engine.next(), 182605794n);
  assert.equal(engine.next(), 1291394886n);
});

test('generator: minstd_rand produces the predefined 10000th value', () => {
  const engine = new MinstdRand();

  for (let i = 0; i < 9999; i += 1) {
    engine.next();
  }

  assert.equal(engine.next(), 399268537n);
});
