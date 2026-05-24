import DodoPayments from 'dodopayments'

// Singleton DodoPayments client
export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: process.env.DODO_ENV === 'production' ? 'live_mode' : 'test_mode',
})

// ── Plan → product mapping ────────────────────────────────────────────────────
export const PLAN_PRODUCT_IDS: Record<string, string> = {
  starter: process.env.DODO_STARTER_PRODUCT_ID!,
  growth:  process.env.DODO_GROWTH_PRODUCT_ID!,
}

// ── Reverse map: product_id → plan name ──────────────────────────────────────
// Used in webhooks when metadata.plan is absent (e.g. checkoutSessions flow)
export const PRODUCT_ID_TO_PLAN: Record<string, string> = {
  [process.env.DODO_STARTER_PRODUCT_ID!]: 'starter',
  [process.env.DODO_GROWTH_PRODUCT_ID!]:  'growth',
}

// What to set in user_profiles when a plan activates / renews
export const PLAN_CONFIGS: Record<string, { credits_limit: number }> = {
  starter: { credits_limit: 5_000  },
  growth:  { credits_limit: 10_000 },
}
