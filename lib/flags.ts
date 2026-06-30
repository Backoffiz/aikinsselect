/**
 * Feature flags — flip a value to `true` and redeploy to turn a feature on.
 *
 * These are plain module constants (not env vars) so they evaluate identically
 * in server and client components and toggle with a one-line edit plus a
 * redeploy. Typed as `boolean` (not the literal value) on purpose so a flag can
 * gate a route via `notFound()` without TS treating the rest as unreachable.
 */
export interface FeatureFlags {
  /**
   * "Save" / wishlist: the heart buttons on product cards and product pages,
   * the header "Saved" badge, and the /saved page. Off until the saved-list
   * persistence (currently localStorage-only) is finished and wired up.
   */
  saved: boolean
  /**
   * Newsletter capture form + the header "Subscribe" CTA. Off until an email
   * provider is connected — the form currently posts nowhere.
   */
  newsletter: boolean
}

export const FEATURES: FeatureFlags = {
  saved: false,
  newsletter: false,
}
