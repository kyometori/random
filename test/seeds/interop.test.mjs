import assert from 'node:assert/strict';
import { accessSync, constants } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  MinstdRand,
  MinstdRand0,
  Mt19937,
  Mt19937_64,
  SeedSeq,
} from '../../dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORACLE = process.env.ORACLE_PATH ?? join(__dirname, 'oracle');
const MASK64 = 0xffff_ffff_ffff_ffffn;

const ENGINES = [
  { name: 'minstd_rand0', Engine: MinstdRand0, stateSize: 1 },
  { name: 'minstd_rand', Engine: MinstdRand, stateSize: 1 },
  { name: 'mt19937', Engine: Mt19937, stateSize: 624 },
  { name: 'mt19937_64', Engine: Mt19937_64, stateSize: 312 },
];

function checkOracle() {
  try {
    accessSync(ORACLE, constants.X_OK);
  } catch {
    throw new Error(`C++ oracle not found: ${ORACLE}\nBuild it with: make`);
  }
}

function jsSeedSeqValues(seed, count) {
  const seq = new SeedSeq(seed);
  const output = new Array(count);

  seq.generate(output);

  return output;
}

function jsSeedSeqDigest(seed, count) {
  const output = jsSeedSeqValues(seed, count);

  let hash = 14_695_981_039_346_656_037n;
  let sum = 0n;
  let xors = 0n;

  for (const value of output) {
    sum = (sum + value) & MASK64;
    xors ^= value;

    for (let byte = 0; byte < 4; ++byte) {
      hash ^= (value >> BigInt(byte * 8)) & 0xffn;
      hash = (hash * 1_099_511_628_211n) & MASK64;
    }
  }

  return [hash, sum, xors];
}

function jsEngineValues(Engine, seed, discard, count) {
  const engine = new Engine(new SeedSeq(seed));

  engine.discard(discard);

  const output = new Array(count);

  for (let i = 0; i < count; ++i) {
    output[i] = engine.next();
  }

  return output;
}

function jsEngineDigest(Engine, seed, discard, count) {
  const engine = new Engine(new SeedSeq(seed));

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

function runOracle(requests) {
  const input = `${requests.map((request) => {
    if (
      request.command === 'seedseq-values' ||
      request.command === 'seedseq-digest'
    ) {
      return [
        request.command,
        request.seed.length,
        request.count,
        ...request.seed,
      ].join(' ');
    }

    return [
      request.command,
      request.engine,
      request.seed.length,
      request.discard,
      request.count,
      ...request.seed,
    ].join(' ');
  }).join('\n')}\n`;

  const output = execFileSync(ORACLE, {
    input,
    encoding: 'utf8',
  });

  const blocks = output.trimEnd().split('END\n');

  assert.equal(blocks.length, requests.length);

  return blocks.map((block, index) => {
    const lines = block.trim() === '' ? [] : block.trim().split('\n');
    const request = requests[index];

    if (request.command.endsWith('digest')) {
      return lines[0].split(' ').map(BigInt);
    }

    return lines.map(BigInt);
  });
}

checkOracle();

const SEEDS = [
  [],
  [0n],
  [1n],
  [1n, 2n, 3n, 4n, 5n],
  [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n],
  [0xffff_ffffn],
  [0n, 0xffff_ffffn, 0x1_0000_0000n, -1n],
  [-0x1_0000_0001n, -0x1_0000_0000n, -0xffff_ffffn, -0x1_0000n, -1n, 0n, 1n, 0xffffn, 0xffff_ffffn, 0x1_0000_0000n, 0x1_0000_0001n]
];

const COUNTS = [0, 1, 2, 6, 7, 38, 39, 67, 68, 622, 623, 624, 625];

const seedSeqExactCases = SEEDS.flatMap((seed) =>
  COUNTS.map((count) => ({
    command: 'seedseq-values',
    seed,
    count,
  })),
);

const seedSeqStressCases = [{
  seed: [],
  count: 1_000_000,
}, {
  seed: [1n, 2n, 3n, 4n, 5n],
  count: 1_000_000,
}, {
  seed: Array.from({ length: 1_000 }, (_, i) => BigInt(i)),
  count: 100_000,
}].map((value) => ({ command: 'seedseq-digest', ...value }));

const engineExactCases = ENGINES.flatMap(({ name, stateSize }) =>
  SEEDS.filter((seed) => seed.length > 0)
    .flatMap((seed) => [{
      command: 'engine-values',
      engine: name,
      seed,
      discard: 0n,
      count: 100,
    }, {
      command: 'engine-values',
      engine: name,
      seed,
      discard: 1n,
      count: 100,
    }, {
      command: 'engine-values',
      engine: name,
      seed,
      discard: BigInt(stateSize),
      count: 100,
    }, {
      command: 'engine-values',
      engine: name,
      seed,
      discard: BigInt(stateSize + 1),
      count: 100,
    }])
);

const engineStressCases = ENGINES.map(({ name, stateSize }) => ({
  command: 'engine-digest',
  engine: name,
  seed: [1n, 2n, 3n, 4n, 5n],
  discard: BigInt(stateSize + 1),
  count: 1_000_000,
}));

const requests = [
  ...seedSeqExactCases,
  ...seedSeqStressCases,
  ...engineExactCases,
  ...engineStressCases,
];

const oracleResults = runOracle(requests);

test('interop: C++ std::seed_seq exact values', () => {
  let index = 0;

  for (const { seed, count } of seedSeqExactCases) {
    const expected = oracleResults[index++];
    const actual = jsSeedSeqValues(seed, count);

    assert.deepEqual(
      actual,
      expected,
      `seed=[${seed.join(',')}] count=${count}`,
    );
  }
});

test('interop: C++ std::seed_seq stress digest', () => {
  let index = seedSeqExactCases.length;

  for (const { seed, count } of seedSeqStressCases) {
    const expected = oracleResults[index++];
    const actual = jsSeedSeqDigest(seed, count);

    assert.deepEqual(
      actual,
      expected,
      `seed=[${seed.join(',')}] count=${count}`,
    );
  }
});

test('interop: C++ SeedSeq to engines exact values', () => {
  let index = seedSeqExactCases.length + seedSeqStressCases.length;

  for (const { name, Engine } of ENGINES) {
    for (const request of engineExactCases.filter(({ engine }) =>
      engine === name
    )) {
      const expected = oracleResults[index++];
      const actual = jsEngineValues(
        Engine,
        request.seed,
        request.discard,
        request.count,
      );

      assert.deepEqual(
        actual,
        expected,
        `${name} seed=[${request.seed.join(',')}] discard=${request.discard}`,
      );
    }
  }
});

test('interop: C++ SeedSeq to engines stress digest', () => {
  let index = (
    seedSeqExactCases.length +
    seedSeqStressCases.length +
    engineExactCases.length
  );

  for (const { name, Engine } of ENGINES) {
    const request = engineStressCases.find(({ engine }) => engine === name);
    const expected = oracleResults[index++];
    const actual = jsEngineDigest(
      Engine,
      request.seed,
      request.discard,
      request.count,
    );

    assert.deepEqual(
      actual,
      expected,
      `${name} seed=[1,2,3,4,5] discard=${request.discard}`,
    );
  }
});
