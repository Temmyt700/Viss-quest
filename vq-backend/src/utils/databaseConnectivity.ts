type ErrorLike = {
  code?: string;
  message?: string;
  cause?: unknown;
  hostname?: string;
  errors?: unknown[];
};

const databaseConnectivityCodes = new Set([
  "ENOTFOUND",
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "57P01",
  "08001",
  "08006",
]);

const asErrorLike = (value: unknown): ErrorLike | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as ErrorLike;
};

const readIssue = (value: unknown, seen = new Set<unknown>()): ErrorLike | null => {
  if (!value || seen.has(value)) {
    return null;
  }

  seen.add(value);
  const candidate = asErrorLike(value);
  if (!candidate) {
    return null;
  }

  if (
    (candidate.code && databaseConnectivityCodes.has(candidate.code))
    || databaseConnectivityCodes.has(String(candidate.message ?? "").trim())
  ) {
    return candidate;
  }

  if (Array.isArray(candidate.errors)) {
    for (const nested of candidate.errors) {
      const issue = readIssue(nested, seen);
      if (issue) {
        return issue;
      }
    }
  }

  if (candidate.cause) {
    const issue = readIssue(candidate.cause, seen);
    if (issue) {
      return issue;
    }
  }

  return null;
};

export const getDatabaseConnectivityIssue = (error: unknown) => readIssue(error);

export const isDatabaseConnectivityError = (error: unknown) => Boolean(getDatabaseConnectivityIssue(error));

export const getDatabaseConnectivityMessage = (error: unknown) => {
  const issue = getDatabaseConnectivityIssue(error);
  if (!issue) {
    return "Database connectivity is temporarily unavailable.";
  }

  const code = issue.code ? `${issue.code}` : "DB_UNAVAILABLE";
  const hostname = issue.hostname ? ` (${issue.hostname})` : "";
  return `Database connectivity is temporarily unavailable [${code}]${hostname}.`;
};
