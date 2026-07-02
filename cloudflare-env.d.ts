/**
 * Augments the (empty) `CloudflareEnv` interface that `@cloudflare/next-on-pages`
 * declares globally, so `getOptionalRequestContext().env.DB` is typed instead of a
 * compile error. Mirrors the D1 binding in wrangler.jsonc.
 *
 * Typed structurally (only the surface `lib/db.ts` uses) to avoid a hard dependency on
 * `@cloudflare/workers-types`; the query layer casts to its own shape internally.
 */
export {}

declare global {
  interface CloudflareEnv {
    DB: {
      prepare(query: string): {
        bind(...values: unknown[]): {
          all<T = unknown>(): Promise<{ results?: T[] }>
          run(): Promise<{ meta?: { changes?: number } }>
        }
      }
    }
  }
}
