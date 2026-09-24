import assert from 'node:assert/strict';
import test from 'node:test';

import { SeedSeq, UInt32Type } from '../../dist/index.mjs';

test('seed sequence: default construction is empty', () => {
  const seq = new SeedSeq();

  assert.equal(seq.size(), 0);
  assert.deepEqual(seq.param(), []);
  assert.deepEqual(seq.v, []);
});

test('seed sequence: stores seed values modulo 2^32', () => {
  const seq = new SeedSeq([-1n, 0n, 1n, 0x1_0000_0000n, 0x1_0000_0001n]);

  assert.deepEqual(seq.v, [0xffff_ffffn, 0n, 1n, 0n, 1n]);

  assert.deepEqual(seq.param(), [0xffff_ffffn, 0n, 1n, 0n, 1n]);

  assert.equal(seq.size(), 5);
});

test('seed sequence: exposes the uint32 result type', () => {
  assert.equal(SeedSeq.resultType, UInt32Type);
});

test('seed sequence: param returns a copy', () => {
  const seq = new SeedSeq([1n, 2n, 3n]);

  const param = seq.param();

  param[0] = 999n;

  assert.deepEqual(seq.param(), [1n, 2n, 3n]);
});

test('seed sequence: generated values are uint32', () => {
  const seq = new SeedSeq([1n, 2n, 3n]);

  const destination = new Array(100);
  seq.generate(destination);

  for (const value of destination) {
    assert.equal(typeof value, 'bigint');
    assert.equal(value >= 0n, true);
    assert.equal(value <= 0xffff_ffffn, true);
  }
});

test('seed sequence: generate fills the destination', () => {
  const seq = new SeedSeq([1n, 2n, 3n]);

  const destination = new Array(100);
  seq.generate(destination);

  assert.equal(destination.some((value) => value === undefined), false);
});

test('seed sequence: generates an empty destination without error', () => {
  const seq = new SeedSeq([1n, 2n, 3n]);

  const destination = [];

  seq.generate(destination);

  assert.deepEqual(destination, []);
});

test('seed sequence: generate is deterministic', () => {
  const seq = new SeedSeq([1n, 2n, 3n, 4n, 5n]);

  const first = new Array(100);
  const second = new Array(100);

  seq.generate(first);
  seq.generate(second);

  assert.deepEqual(first, second);
});
