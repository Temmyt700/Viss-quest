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

const expandWwwVariants = (origin: string) => {
  if (!origin || LOCAL_ORIGIN_PATTERN.test(origin)) {
    return [origin];
  }

  try {
    const url = new URL(origin);
    const variants = new Set<string>([origin]);
    const host = url.hostname.toLowerCase();
    const prefix = `${url.protocol}//`;
    const port = url.port ? `:${url.port}` : "";

    if (host.startsWith("www.")) {
      variants.add(`${prefix}${host.replace(/^www\./, "")}${port}`);
    } else {
      variants.add(`${prefix}www.${host}${port}`);
    }

    return [...variants];
  } catch {
    return [origin];
  }
};

const configuredOrigins = [
  env.FRONTEND_URL,
  ...env.FRONTEND_ORIGINS.split(","),
]
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean)
  .flatMap((origin) => expandWwwVariants(origin));

const allowedOrigins = new Set<string>(configuredOrigins);

export const isAllowedFrontendOrigin = (origin?: string | null) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return true;
  if (allowedOrigins.has(normalizedOrigin)) return true;

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
  const origins = new Set<string>(allowedOrigins);

  if (env.NODE_ENV === "development" && normalizedRequestOrigin && LOCAL_ORIGIN_PATTERN.test(normalizedRequestOrigin)) {
    origins.add(normalizedRequestOrigin);
  }

  return [...origins];
};

export const describeTrustedOrigins = () => {
  const configured = [...allowedOrigins].join(", ");

  if (env.NODE_ENV === "development") {
    return `${configured} plus any http://localhost:<port> or http://127.0.0.1:<port> origin`;
  }

  return configured;
};
