export type AnimbrioErrorCode =
  | "EMPTY_PROJECT"
  | "EMPTY_MODULE"
  | "MODULE_NOT_FOUND"
  | "SLIDE_NOT_FOUND"
  | "LAYER_NOT_FOUND"
  | "INVALID_DOCUMENT"
  | "INVALID_PROJECT"
  | "INVALID_SR_EXPORT"
  | "UNSUPPORTED_SCHEMA"
  | "UNSUPPORTED_MEDIA"
  | "PROJECT_NOT_FOUND"
  | "HTTP_ERROR";

export class AnimbrioError extends Error {
  readonly code: AnimbrioErrorCode;

  constructor(code: AnimbrioErrorCode, message: string) {
    super(message);
    this.name = "AnimbrioError";
    this.code = code;
  }
}

export function isAnimbrioError(value: unknown): value is AnimbrioError {
  return value instanceof AnimbrioError;
}
