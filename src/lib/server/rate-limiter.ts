import { NextApiRequest, NextApiResponse } from "next";

type Usage = { tries: number; maxTries: number; expiresAt: Date };
type GetOptionsFn = (req: NextApiRequest) => {
  /**
   * Preferably use the key format: `method.route.unique_prop` where
   * unique_prop can be the user id or request IP or something unique
   * */
  key: string;
  maxTries: number;
  expiresAt: Date;
};

const cache = new Map<string, Usage>();

// clear stale keys from cache every minute
setInterval(() => {
  const currentDate = new Date();
  for (const [key, usage] of cache) {
    if (!usage) continue;

    if (currentDate > usage.expiresAt) {
      cache.delete(key);
    }
  }
}, 10000);

export const applyRateLimiter = (
  req: NextApiRequest,
  res: NextApiResponse,
  getOptsFn: GetOptionsFn,
) => {
  const opts = getOptsFn(req);
  const usage = cache.get(opts.key);

  if (!usage) {
    cache.set(opts.key, {
      tries: 1,
      maxTries: opts.maxTries,
      expiresAt: opts.expiresAt,
    });

    return;
  }

  const currentDate = new Date();
  const retryAfter = usage.expiresAt.getTime() - currentDate.getTime();
  const canProceed = usage.tries < opts.maxTries && retryAfter >= 0;

  if (canProceed) {
    cache.set(opts.key, {
      ...usage,
      tries: usage.tries + 1,
    });

    return;
  }

  if (retryAfter <= 0) {
    cache.set(opts.key, {
      tries: 1,
      maxTries: opts.maxTries,
      expiresAt: opts.expiresAt,
    });

    return;
  }

  res.setHeader("Retry-After", retryAfter);
  return res.status(429).json({
    error: { message: "Too many requests" },
  });
};
