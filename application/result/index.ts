export interface ErrorDetail {
  message: string;
  code?: string;
  field?: string;
}

export class Result<T, M = any> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public errors?: ErrorDetail[];
  public metadata?: M;
  private readonly _value?: T;

  private constructor(
    isSuccess: boolean,
    value?: T,
    errors?: ErrorDetail[],
    metadata?: M
  ) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.errors = errors;
    this._value = value;
    this.metadata = metadata;

    if (isSuccess && errors) {
      throw new Error(
        "InvalidOperation: A successful result cannot have errors"
      );
    }
    if (!isSuccess && !errors) {
      throw new Error(
        "InvalidOperation: A failed result must have at least one error"
      );
    }
  }

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error("Cannot get the value of a failed result");
    }
    return this._value!;
  }

  public withMetadata<NewM>(metadata: NewM): Result<T, NewM> {
    return new Result<T, NewM>(
      this.isSuccess,
      this._value,
      this.errors,
      metadata
    );
  }

  public static Ok<U, M = undefined>(value?: U): Result<U, M> {
    return new Result<U, M>(true, value);
  }

  public static Fail<U, M = undefined>(errors: ErrorDetail[]): Result<U, M> {
    return new Result<U, M>(false, undefined, errors);
  }

  public static Error<U, M = { statusCode: number }>(
    message: string,
    metadata?: M
  ): Result<U, M> {
    return new Result<U, M>(false, undefined, [{ message }], metadata);
  }
}
