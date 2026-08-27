import type { NextFunction, Request, RequestHandler, Response } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const MAX_TRACKED_CLIENTS = 10_000;

type Counter = { count: number; resetAt: number };

function clientKey(req: Request): string {
  // Use the socket address instead of an untrusted X-Forwarded-For header.
  return req.socket.remoteAddress ?? "unknown";
}

export function createRateLimiter(
  windowMs = WINDOW_MS,
  maxRequests = MAX_REQUESTS_PER_WINDOW,
): RequestHandler {
  const counters = new Map<string, Counter>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = clientKey(req);
    const current = counters.get(key);

    if (counters.size > MAX_TRACKED_CLIENTS) {
      counters.forEach((counter, trackedKey) => {
        if (counter.resetAt <= now) counters.delete(trackedKey);
      });
    }

    if (!current || current.resetAt <= now) {
      counters.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > maxRequests) {
      res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      res.status(429).send("Too many requests");
      return;
    }

    next();
  };
}
