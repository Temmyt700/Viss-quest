import { getDatabaseConnectivityIssue } from "./databaseConnectivity.js";

type ErrorLike = {
  code?: string;
  message?: string;
  cause?: unknown;
  statusCode?: number;
};

export class ServiceUnavailableError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, code = "SERVICE_UNAVAILABLE") {
    super(message);
    this.name = "ServiceUnavailableError";
    this.statusCode = 503;
    this.code = code;
  }
}

const asErrorLike = (value: unknown): ErrorLike | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as ErrorLike;
};

const readByCode = (value: unknown, expectedCodes: Set<string>, seen = new Set<unknown>()): ErrorLike | null => {
  if (!value || seen.has(value)) return null;
  seen.add(value);

  const error = asErrorLike(value);
  if (!error) return null;

  if (error.code && expectedCodes.has(error.code)) {
    return error;
  }

  if (error.cause) {
    return readByCode(error.cause, expectedCodes, seen);
  }

  return null;
};

const emailDeliveryCodes = new Set([
  "EMAIL_DELIVERY_FAILED",
  "EMAIL_PROVIDER_UNAVAILABLE",
  "EMAIL_PROVIDER_TIMEOUT",
  "EMAIL_PROVIDER_AUTH_FAILED",
  "EMAIL_PROVIDER_NOT_CONFIGURED",
]);

export const isEmailDeliveryFailure = (error: unknown) => Boolean(readByCode(error, emailDeliveryCodes));

export const isServiceUnavailableFailure = (error: unknown) =>
  Boolean(
    getDatabaseConnectivityIssue(error)
      || isEmailDeliveryFailure(error)
      || (asErrorLike(error)?.statusCode === 503),
  );

