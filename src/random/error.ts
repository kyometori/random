export enum RandomErrorCode {
    INVALID_ARGUMENT,
    OUT_OF_RANGE,
    INVALID_STATE,
    INVALID_SEED_SEQUENCE
}

/**
 * Error thrown by the random library.
 *
 * @remarks
 * The error code identifies the category of failure, while `details`
 * carries structured information useful to callers and diagnostics.
 */
export class RandomError extends Error {
  /**
   * Creates a random-library error.
   *
   * @param code Standardized error code.
   * @param message Human-readable error message.
   * @param details Structured error details.
   */
  public constructor(
    public readonly code: RandomErrorCode,
    message: string,
    public readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = 'RandomError';
  }
}
