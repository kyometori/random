import assert from 'node:assert/strict';
import test from 'node:test';
import { Mt19937, Mt19937_64 } from '../../dist/index.mjs';

test('generator: mt19937 matches std::mt19937 sequence', () => {
  const engine = new Mt19937();

  const expected = [
    3499211612n,
    581869302n,
    3890346734n,
    3586334585n,
    545404204n,
    4161255391n,
    3922919429n,
    949333985n,
    2715962298n,
    1323567403n,
  ];

  for (const value of expected) {
    assert.equal(engine.next(), value);
  }
});

test('generator: mt19937 produces the predefined 10000th value', () => {
  const engine = new Mt19937();

  engine.discard(9999n);

  assert.equal(engine.next(), 4123659995n);
});

test('generator: mt19937 seeded with 1 matches std::mt19937', () => {
  const engine = new Mt19937(1n);

  assert.equal(engine.next(), 1791095845n);
});

test('generator: mt19937_64 matches std::mt19937_64 sequence', () => {
  const engine = new Mt19937_64();

  const expected = [
    14514284786278117030n,
    4620546740167642908n,
    13109570281517897720n,
    17462938647148434322n,
    355488278567739596n,
    7469126240319926998n,
    4635995468481642529n,
    418970542659199878n,
    9604170989252516556n,
    6358044926049913402n,
  ];

  for (const value of expected) {
    assert.equal(engine.next(), value);
  }
});

test('generator: mt19937_64 produces the predefined 10000th value', () => {
  const engine = new Mt19937_64();

  engine.discard(9999n);

  assert.equal(engine.next(), 9981545732273789042n);
});

test('generator: mt19937_64 seeded with 1 matches std::mt19937_64', () => {
  const engine = new Mt19937_64(1n);

  assert.equal(engine.next(), 2469588189546311528n);
});
