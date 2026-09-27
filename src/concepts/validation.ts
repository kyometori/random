import { type RandomEngine, RandomError, RandomErrorCode } from '../typings';
import type { KnownUniformRandomBitGenerator, RandomLibraryConstraintError, UniformRandomBitGeneratorStatic, UniformRandomBitGeneratorStatusOf, ValidatedRandomNumberEngine } from './engine';

type UniformRandomBitGeneratorValidationInput<
  Engine extends RandomEngine,
> =
  Engine & ([UniformRandomBitGeneratorStatusOf<NoInfer<Engine>>] extends [false]
    ? RandomLibraryConstraintError<
        'The engine is known not to satisfy UniformRandomBitGenerator because min() is not less than max.'
      >
    : unknown);

type UniformRandomBitGeneratorAssertionResult<Engine extends RandomEngine> =
  KnownUniformRandomBitGenerator<Engine> & UniformRandomBitGeneratorValidationInput<Engine>;

type RandomNumberEngineAssertionResult<Engine extends RandomEngine> =
  ValidatedRandomNumberEngine<Engine> & UniformRandomBitGeneratorValidationInput<Engine>;

/**
 * Runtime-validates the observable UniformRandomBitGenerator requirements of
 * an external engine.
 *
 * Normal UniformRandomBitGenerator APIs do not require callers to invoke this
 * function.
 *
 * The check verifies that static `min()` and `max()` exist and that
 * `min() < max()`.
 *
 * @param engine The engine to validate.
 * @throws {RandomError} If static range functions are missing or invalid.
 */
export function assertUniformRandomBitGenerator<Engine extends RandomEngine>(
  engine: UniformRandomBitGeneratorValidationInput<Engine>
): asserts engine is UniformRandomBitGeneratorAssertionResult<Engine> {
  const constructor = engine.constructor as Partial<UniformRandomBitGeneratorStatic>;

  if (typeof constructor.min !== 'function' || typeof constructor.max !== 'function') {
    throw new RandomError(
      RandomErrorCode.INVALID_ARGUMENT,
      'The engine does not provide static min() and max().',
    );
  }

  const minimum = constructor.min();
  const maximum = constructor.max();

  if (typeof minimum !== 'bigint' || typeof maximum !== 'bigint' ||
      minimum < 0n || maximum < 0n || minimum >= maximum) {
    throw new RandomError(
      RandomErrorCode.INVALID_ARGUMENT,
      'The engine does not satisfy the UniformRandomBitGenerator range requirement.',
      { minimum, maximum },
    );
  }
}

/**
 * Runtime-validates and returns the same object as a known
 * UniformRandomBitGenerator.
 *
 * No wrapper object is created.
 *
 * @param engine The engine to validate.
 * @returns The same engine object with a compile-time proof marker.
 */
export function toUniformRandomBitGenerator<Engine extends RandomEngine>(
  engine: UniformRandomBitGeneratorValidationInput<Engine>
): KnownUniformRandomBitGenerator<Engine> {
  assertUniformRandomBitGenerator(engine);
  return engine;
}

/**
 * Runtime-validates the observable RandomNumberEngine requirements of an
 * external engine.
 *
 * This first validates the UniformRandomBitGenerator range requirement and
 * then checks `seed()`, `discard()`, and `equals()`.
 *
 * @param engine The engine to validate.
 * @throws {RandomError} If the engine does not satisfy the observable
 * requirements.
 */
export function assertRandomNumberEngine<Engine extends RandomEngine>(
  engine: UniformRandomBitGeneratorValidationInput<Engine>
): asserts engine is RandomNumberEngineAssertionResult<Engine> {
  assertUniformRandomBitGenerator(engine);

  const candidate = engine as Engine & {
    seed?: unknown;
    discard?: unknown;
    equals?: unknown;
  };

  if (typeof candidate.seed !== 'function' ||
      typeof candidate.discard !== 'function' ||
      typeof candidate.equals !== 'function') {
    throw new RandomError(
      RandomErrorCode.INVALID_ARGUMENT,
      'The engine does not provide the RandomNumberEngine state-management operations.',
    );
  }
}

/**
 * Runtime-validates and returns the same object as a RandomNumberEngine.
 *
 * No wrapper object is created.
 *
 * @param engine The engine to validate.
 * @returns The same engine object with compile-time RandomNumberEngine requirements.
 */
export function toRandomNumberEngine<Engine extends RandomEngine>(
  engine: UniformRandomBitGeneratorValidationInput<Engine>
): ValidatedRandomNumberEngine<Engine> {
  assertRandomNumberEngine(engine);
  return engine;
}
