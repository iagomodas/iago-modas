import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./_core/requestSecurity";

function requestFrom(address: string) {
  return { socket: { remoteAddress: address } } as never;
}

function response() {
  const status = vi.fn().mockReturnThis();
  return { set: vi.fn(), status, send: vi.fn() } as never;
}

describe("request security", () => {
  it("returns 429 after the per-origin limit is reached", () => {
    const limiter = createRateLimiter(60_000, 2);
    const firstResponse = response();
    const secondResponse = response();
    const thirdResponse = response();
    const next = vi.fn();

    limiter(requestFrom("10.0.0.1"), firstResponse, next);
    limiter(requestFrom("10.0.0.1"), secondResponse, next);
    limiter(requestFrom("10.0.0.1"), thirdResponse, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(thirdResponse.status).toHaveBeenCalledWith(429);
  });

  it("keeps separate quotas for separate socket addresses", () => {
    const limiter = createRateLimiter(60_000, 1);
    const firstResponse = response();
    const secondResponse = response();
    const next = vi.fn();

    limiter(requestFrom("10.0.0.1"), firstResponse, next);
    limiter(requestFrom("10.0.0.2"), secondResponse, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(firstResponse.status).not.toHaveBeenCalled();
    expect(secondResponse.status).not.toHaveBeenCalled();
  });
});
