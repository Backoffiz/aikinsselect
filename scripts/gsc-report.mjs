/**
 * Google Search Console report — the real SEO signal (impressions, clicks, queries, top pages).
 *
 * Read-only. Authenticates as a Google service account (JWT → OAuth token, RS256 signed with
 * node:crypto — no googleapis dependency) and pulls Search Analytics for the last 28 days. It is
 * INERT until configured: with no credentials it prints a one-line setup pointer and exits 0, so
 * it never fails CI before the Google-side setup (see docs/SEO-MONITORING.md) is done.
 *
 * Config (from .env.local — gitignored — or the environment):
 *   GSC_PROPERTY               The Search Console property. Domain property:  sc-domain:aikinsselect.com
 *                              URL-prefix property:                           https://aikinsselect.com/
 *   GSC_SERVICE_ACCOUNT_KEY    The service-account JSON key, inline (used by CI secrets), OR
 *   GSC_SERVICE_ACCOUNT_FILE   a path to the service-account JSON key file (used locally).
 *
 * Run from the Code/ directory:
 *   npm run seo:gsc
 *
 * A newly verified property legitimately returns no rows for a few days — that's reported as an
 * empty result, not an error.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// --- env (mirrors scripts/validate-catalog.mjs) ----------------------------
function loadEnvLocal() {
  const file = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnvLocal()

const PROPERTY = process.env.GSC_PROPERTY
const KEY_INLINE = process.env.GSC_SERVICE_ACCOUNT_KEY
const KEY_FILE = process.env.GSC_SERVICE_ACCOUNT_FILE

function loadServiceAccount() {
  let raw = KEY_INLINE
  if (!raw && KEY_FILE && fs.existsSync(KEY_FILE)) raw = fs.readFileSync(KEY_FILE, 'utf8')
  if (!raw) return null
  try { return JSON.parse(raw) } catch (e) {
    console.error('GSC service-account key is not valid JSON:', e.message)
    process.exit(1)
  }
}

const sa = loadServiceAccount()
if (!PROPERTY || !sa) {
  console.log('GSC report skipped — not configured.')
  console.log('  Set GSC_PROPERTY and GSC_SERVICE_ACCOUNT_KEY/FILE to enable. See docs/SEO-MONITORING.md.')
  process.exit(0) // inert, never fails CI
}

// --- service-account JWT → access token ------------------------------------
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

// Fixed issue/expiry timestamps (Date.now is fine in a standalone Node script, unlike workflows).
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key)
  const assertion = `${signingInput}.${b64url(signature)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error('token exchange failed: ' + JSON.stringify(data))
  }
  return data.access_token
}

// --- Search Analytics query ------------------------------------------------
function isoDaysAgo(days) {
  const d = new Date(Date.now() - days * 86400_000)
  return d.toISOString().slice(0, 10)
}

async function searchAnalytics(token, dimensions, rowLimit = 10) {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: isoDaysAgo(28),
      endDate: isoDaysAgo(1),
      dimensions,
      rowLimit,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Search Analytics (${dimensions.join(',')}) failed: ${JSON.stringify(data)}`)
  return data.rows || []
}

const pct = (n) => `${(n * 100).toFixed(1)}%`
const pos = (n) => n.toFixed(1)

function printRows(title, rows) {
  console.log(`\n${title}`)
  if (rows.length === 0) { console.log('   (no data)'); return }
  for (const r of rows) {
    const key = (r.keys || []).join(' ')
    console.log(`   ${String(r.clicks).padStart(4)} clk  ${String(r.impressions).padStart(6)} imp  ${pct(r.ctr).padStart(6)} ctr  pos ${pos(r.position).padStart(5)}   ${key}`)
  }
}

async function main() {
  console.log(`\nGoogle Search Console — ${PROPERTY}  (last 28 days, ${isoDaysAgo(28)} → ${isoDaysAgo(1)})`)
  const token = await getAccessToken()

  const totals = await searchAnalytics(token, [], 1)
  if (totals.length === 0) {
    console.log('\nNo Search Analytics data yet. A newly verified property typically has no data for')
    console.log('2–3 days after verification, and little until Google has crawled and indexed pages.')
    return
  }
  const t = totals[0]
  console.log(`\nTotals:  ${t.clicks} clicks · ${t.impressions} impressions · ${pct(t.ctr)} CTR · avg position ${pos(t.position)}`)

  printRows('Top queries:', await searchAnalytics(token, ['query'], 15))
  printRows('Top pages:', await searchAnalytics(token, ['page'], 15))

  console.log('\nDone. (Index coverage / crawl errors are per-URL and live in the Search Console UI.)')
}

main().catch((e) => {
  console.error('gsc-report failed:', e.message)
  process.exit(1)
})
