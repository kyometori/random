import assert from 'node:assert/strict';
import { accessSync, constants } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  defineMersenneTwisterEngine,
  MinstdRand0,
  MinstdRand,
  Mt19937,
  Mt19937_64,
  UInt32Type,
} from '../../dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORACLE = process.env.ORACLE_PATH ?? join(__dirname, 'oracle');
const MASK64 = 0xffff_ffff_ffff_ffffn;

const CustomMte8 = defineMersenneTwisterEngine(UInt32Type, {
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

/*
 * Add engines here
 */
const ENGINES = [
  { name: 'minstd_rand0', Engine: MinstdRand0, stateSize: 1 },
  { name: 'minstd_rand', Engine: MinstdRand, stateSize: 1 },
  { name: 'mt19937', Engine: Mt19937, stateSize: 624 },
  { name: 'mt19937_64', Engine: Mt19937_64, stateSize: 312 },
  { name: 'custom_mte8', Engine: CustomMte8, stateSize: 4 }
];

const BASE_DISCARDS = [0n, 1n, 2n, 3n, 4n, 1000n, 10_000n];

function discards(stateSize) {
  return [...new Set([
    ...BASE_DISCARDS,
    BigInt(stateSize - 1),
    BigInt(stateSize),
    BigInt(stateSize + 1),
    BigInt(stateSize * 2 - 1),
    BigInt(stateSize * 2),
    BigInt(stateSize * 2 + 1),
  ])];
}

function seeds(Engine) {
  const max = Engine.resultType.max;
  const mid = (max + 1n) >> 1n;
  return [0n, 1n, 2n, 42n, mid - 1n, mid, max];
}

function jsValues(Engine, seed, discard, count) {
  const engine = new Engine(seed);
  engine.discard(discard);
  const result = new Array(count);
  for (let i = 0; i < count; ++i) result[i] = engine.next();
  return result;
}

function jsDigest(Engine, seed, discard, count) {
  const engine = new Engine(seed);
  engine.discard(discard);

  let hash = 14_695_981_039_346_656_037n;
  let sum = 0n;
  let xors = 0n;

  for (let i = 0; i < count; ++i) {
    const value = engine.next();
    sum = (sum + value) & MASK64;
    xors ^= value;

    for (let byte = 0; byte < 8; ++byte) {
      hash ^= (value >> BigInt(byte * 8)) & 0xffn;
      hash = (hash * 1_099_511_628_211n) & MASK64;
    }
  }

  return [hash, sum, xors];
}

function checkOracle() {
  try {
    accessSync(ORACLE, constants.X_OK);
  } catch {
    throw new Error([
      `C++ oracle not found: ${ORACLE}`,
      'Build it with:',
      `  g++ -std=c++20 -O2 test/cpp/oracle.cpp -o ${ORACLE}`,
    ].join('\n'));
  }
}

function runOracle(requests) {
  const input = `${requests.map(({ command, name, seed, discard, count }) =>
    `${command} ${name} ${seed} ${discard} ${count}`
  ).join('\n')}\n`;

  const output = execFileSync(ORACLE, { input, encoding: 'utf8' });
  const blocks = output.trimEnd().split('END\n');

  assert.equal(blocks.length, requests.length);

  return blocks.map((block, i) => {
    const lines = block.trim().split('\n');
    const request = requests[i];

    if (request.command === 'digest') return lines[0].split(' ').map(BigInt);
    return lines.map(BigInt);
  });
}

checkOracle();

const exactCases = ENGINES.flatMap(engine => seeds(engine.Engine).flatMap(seed =>
  discards(engine.stateSize).map(discard => ({ ...engine, seed, discard, count: 100 }))
));

const stressCases = ENGINES.map(engine => ({
  ...engine,
  seed: seeds(engine.Engine)[0],
  discard: BigInt(engine.stateSize + 1),
  count: 1_000_000,
}));

const requests = [
  ...exactCases.map(({ name, seed, discard, count }) => ({ command: 'values', name, seed, discard, count })),
  ...stressCases.map(({ name, seed, discard, count }) => ({ command: 'digest', name, seed, discard, count })),
];

const oracleResults = runOracle(requests);

test('interop: C++ exact matrix', () => {
  let index = 0;

  for (const { Engine, name, seed, discard, count } of exactCases) {
    const expected = oracleResults[index++];
    const actual = jsValues(Engine, seed, discard, count);
    assert.deepEqual(actual, expected, `${name} seed=${seed} discard=${discard}`);
  }
});

test('interop: C++ stress digest', () => {
  let index = exactCases.length;

  for (const { Engine, name, seed, discard, count } of stressCases) {
    const expected = oracleResults[index++];
    const actual = jsDigest(Engine, seed, discard, count);
    assert.deepEqual(actual, expected, `${name} seed=${seed} discard=${discard} count=${count}`);
  }
});
