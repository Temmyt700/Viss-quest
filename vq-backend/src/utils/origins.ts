import { env } from "../config/env.js";

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

export const isAllowedFrontendOrigin = (origin?: string | null) => {
  if (!origin) return true;
  if (origin === env.FRONTEND_URL) return true;

  // Local frontend ports can shift during Vite development when other apps
  // are already using the default port. We allow localhost/127.0.0.1 origins
  // only in development so auth and API cookies keep working without manual
  // env edits every time the port changes.
  if (env.NODE_ENV === "development" && LOCAL_ORIGIN_PATTERN.test(origin)) {
    return true;
  }

  return false;
};

export const getTrustedOrigins = (requestOrigin?: string | null) => {
  const origins = new Set<string>([env.FRONTEND_URL]);

  if (env.NODE_ENV === "development" && requestOrigin && LOCAL_ORIGIN_PATTERN.test(requestOrigin)) {
    origins.add(requestOrigin);
  }

  return [...origins];
};

export const describeTrustedOrigins = () => {
  if (env.NODE_ENV === "development") {
    return `${env.FRONTEND_URL} plus any http://localhost:<port> or http://127.0.0.1:<port> origin`;
  }

  return env.FRONTEND_URL;
};
