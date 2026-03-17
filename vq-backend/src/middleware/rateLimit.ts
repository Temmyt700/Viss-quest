import type { NextFunction, Request, Response } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  getKey: (req: Request) => string | null;
  message: string;
};

const buckets = new Map<string, Bucket>();

export const createRateLimit = (options: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => {
  const key = options.getKey(req);
  if (!key) {
    next();
    return;
  }

  const now = Date.now();
  const bucketKey = `${options.keyPrefix}:${key}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    next();
    return;
  }

  if (current.count >= options.maxRequests) {
    res.status(429).json({ message: options.message });
    return;
  }

  current.count += 1;
  buckets.set(bucketKey, current);
  next();
};
  ``