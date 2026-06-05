// Shared CDN cache headers for read-only API routes. Aggregates change at most
// daily (realtime sources) / monthly (bulk loads), so we cache hard at Vercel's
// edge and serve stale while revalidating. The Route Handlers still run at origin
// when the edge cache misses, but repeat hits are served from the CDN without
// touching Supabase — this is the main fix for slow first/repeat page loads.
export const CACHE = {
  'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
};

// For more dynamic, query-dependent endpoints (filtered record lists, search).
export const CACHE_SHORT = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
};
