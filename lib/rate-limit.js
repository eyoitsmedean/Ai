/**
 * Fixed-window rate limiter kept in process memory.
 * One instance per server; keys are `${route}:${clientKey}`.
 */
function createRateLimiter({ sweepAt = 4000, now = Date.now } = {}) {
  const buckets = new Map();

  function sweep(t) {
    for (const [k, slot] of buckets) {
      if (t > slot.reset) buckets.delete(k);
    }
  }

  /** Returns true when the call is allowed, false when the window is exhausted. */
  function allow(key, limit, windowMs) {
    const t = now();
    if (buckets.size > sweepAt) sweep(t);
    let slot = buckets.get(key);
    if (!slot || t > slot.reset) {
      slot = { count: 0, reset: t + windowMs };
      buckets.set(key, slot);
    }
    slot.count += 1;
    return slot.count <= limit;
  }

  return { allow, size: () => buckets.size };
}

module.exports = { createRateLimiter };
