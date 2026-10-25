import NodeCache from 'node-cache';

// Create a new cache instance.
// stdTTL: default time to live in seconds (3600 = 1 hour).
// checkperiod: period in seconds, as used for the automatic delete check interval.
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Middleware to intercept the request and send cached response if available.
 * Usually applied to GET routes.
 */
export const cacheMiddleware = (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        console.log("Cannot cache non-GET methods!");
        return next();
    }

    // Generate a unique key based on the URL and query parameters.
    const key = req.originalUrl || req.url;

    // Check if the key exists in cache
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        console.log(`[Cache Hit] Serving from cache: ${key}`);
        return res.json(cachedResponse);
    } else {
        console.log(`[Cache Miss] Fetching data: ${key}`);
        // Intercept res.json to cache the response before sending it
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // we don't cache errors
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, body);
            }
            originalJson(body);
        };
        next();
    }
};

export const clearCache = (key) => {
    if (key) cache.del(key);
    else cache.flushAll();
};
