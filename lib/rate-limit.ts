/**
 * Simple Token Bucket Rate Limiter
 * 
 * Strategy:
 * - Each IP has a bucket of tokens.
 * - Each request consumes 1 token.
 * - Tokens refill at a specific rate (interval).
 * - If bucket is empty, request is denied.
 * 
 * Cleaning:
 * - We use a Map to store buckets.
 * - To prevent memory leaks, we clean up old buckets periodically.
 */

type RatelimitConfig = {
    limit: number;      // Max tokens in bucket
    window: number;     // Window size in ms (time to refill full limit)
};

const trackers = new Map<string, { count: number, resetAt: number }>();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

const verifyCleanup = () => {
    const now = Date.now();
    if (now - lastCleanup > CLEANUP_INTERVAL) {
        lastCleanup = now;
        for (const [ip, data] of trackers.entries()) {
            if (now > data.resetAt) {
                trackers.delete(ip);
            }
        }
    }
};

/**
 * Check if a request is rate limited.
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export const rateLimit = async (identifier: string) => {
    // Config: 10 requests per 10 seconds for Auth endpoints seems reasonable to prevent brute force
    // Adjust based on needs. We can pass config as args later if we need different limits for different routes.
    const config: RatelimitConfig = {
        limit: 10,
        window: 10 * 1000 // 10 seconds
    };

    verifyCleanup();

    const now = Date.now();
    const tracker = trackers.get(identifier) || { count: 0, resetAt: now + config.window };

    if (now > tracker.resetAt) {
        tracker.count = 0;
        tracker.resetAt = now + config.window;
    }

    tracker.count++;
    trackers.set(identifier, tracker);

    const remaining = Math.max(0, config.limit - tracker.count);

    return {
        success: tracker.count <= config.limit,
        limit: config.limit,
        remaining,
        reset: tracker.resetAt
    };
};
