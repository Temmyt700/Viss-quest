import { env } from "../config/env.js";

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const normalizeOrigin = (value?: string | null) => {
  if (!value) return "";

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return value.trim().replace(/\/+$/, "").toLowerCase();
  }
};

const normalizedPrimaryOrigin = normalizeOrigin(env.FRONTEND_URL);
const normalizedConfiguredOrigins = env.FRONTEND_ORIGINS
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

export const isAllowedFrontendOrigin = (origin?: string | null) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return true;
  if (normalizedOrigin === normalizedPrimaryOrigin) return true;
  if (normalizedConfiguredOrigins.includes(normalizedOrigin)) return true;

  // Local frontend ports can shift during Vite development when other apps
  // are already using the default port. We allow localhost/127.0.0.1 origins
  // only in development so auth and API cookies keep working without manual
  // env edits every time the port changes.
  if (env.NODE_ENV === "development" && LOCAL_ORIGIN_PATTERN.test(normalizedOrigin)) {
    return true;
  }

  return false;
};

export const getTrustedOrigins = (requestOrigin?: string | null) => {
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);
  const origins = new Set<string>([normalizedPrimaryOrigin, ...normalizedConfiguredOrigins]);

  if (env.NODE_ENV === "development" && normalizedRequestOrigin && LOCAL_ORIGIN_PATTERN.test(normalizedRequestOrigin)) {
    origins.add(normalizedRequestOrigin);
  }

  return [...origins];
};

export const describeTrustedOrigins = () => {
  const configured = [normalizedPrimaryOrigin, ...normalizedConfiguredOrigins].join(", ");

  if (env.NODE_ENV === "development") {
    return `${configured} plus any http://localhost:<port> or http://127.0.0.1:<port> origin`;
  }

  return configured;
};
