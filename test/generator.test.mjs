import assert from 'node:assert/strict';
import test from 'node:test';

import { MinstdRand0, MinstdRand, Mt19937, Mt19937_64 } from '../dist/index.mjs';

test('generator: predefined parameters', () => {
  assert.equal(MinstdRand0.multiplier, 16807n);
  assert.equal(MinstdRand0.increment, 0n);
  assert.equal(MinstdRand0.modulus, 2147483647n);

  assert.equal(MinstdRand.multiplier, 48271n);
  assert.equal(MinstdRand.increment, 0n);
  assert.equal(MinstdRand.modulus, 2147483647n);

  assert.equal(Mt19937.wordSize, 32);
  assert.equal(Mt19937.stateSize, 624);
  assert.equal(Mt19937.shiftSize, 397);
  assert.equal(Mt19937.maskBits, 31);
  assert.equal(Mt19937.xorMask, 0x9908b0dfn);

  assert.equal(Mt19937_64.wordSize, 64);
  assert.equal(Mt19937_64.stateSize, 312);
  assert.equal(Mt19937_64.shiftSize, 156);
  assert.equal(Mt19937_64.maskBits, 31);
  assert.equal(Mt19937_64.xorMask, 0xb5026f5aa96619e9n);
});
