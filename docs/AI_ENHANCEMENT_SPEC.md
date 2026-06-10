# AI Enhancement Specification — Cricket IQ Coach

This document defines **non-invasive AI enhancement layers** for the Cricket IQ Coach website. All layers are **additive**, **toggleable via feature flags**, and **must not alter or replace existing functionality**.

---

## Table of contents

- [Core Safety Rules](#core-safety-rules)
- [Feature Flags](#feature-flags-central-toggle)
- [Quick start](#quick-start)
- [Layers 1–10](#1-behavioral-intelligence-layer)
- [Engineering Requirements](#engineering-requirements)
- [Summary table](#summary)
- [Implemented (off by default)](#implemented-off-by-default)

---

## Quick start

**Enable an implemented layer:** Add to `.env.local`:

```bash
# Optional: enable behavioral tracking (anonymous scroll/dwell/navigation)
NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED=true

# Optional: enable floating chat assistant (guide-only, no actions)
NEXT_PUBLIC_AI_CHAT_ENABLED=true
```

**Disable all AI:** Remove or set to `false` the above vars. Optionally remove `<AILayers />` from `app/layout.tsx`. Core app is unchanged.

**Add a new layer:** Follow the pattern in [Implemented](#implemented-off-by-default): feature flag in `lib/ai-features.ts`, client component only when enabled, optional API under `app/api/ai/`. See [Engineering Requirements](#engineering-requirements).

---

## Core Safety Rules

- **Do NOT** remove, rewrite, or refactor existing working logic unless explicitly instructed.
- **Do NOT** change routing, APIs, authentication, payments, databases, or core business flows.
- **Do NOT** modify existing UI behavior unless enhancement is additive and reversible.
- All AI features are **independent, modular layers**.
- Every change is **toggleable** (see `lib/ai-features.ts` and env vars).
- **Zero regression tolerance**: the site must work normally with all AI features disabled.

---

## Feature Flags (Central Toggle)

| Env Variable | Purpose | Default |
|--------------|---------|---------|
| `NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED` | Behavioral Intelligence Layer | `false` |
| `NEXT_PUBLIC_AI_CHAT_ENABLED` | Conversational Interface | `false` |
| `NEXT_PUBLIC_AI_PERSONALIZATION_ENABLED` | Intent-Based Personalization | `false` |
| `NEXT_PUBLIC_AI_SEARCH_FALLBACK_ENABLED` | AI Search (optional fallback) | `false` |
| `NEXT_PUBLIC_AI_INSIGHTS_ENABLED` | Insight Generation API | `false` |

**Rollback:** Set all to `false` or remove; no code paths in core app depend on them.

---

## 1. Behavioral Intelligence Layer

**Purpose:** Track anonymous interaction signals only (scroll depth, dwell time, navigation flow, hesitation). Output insights **separately** from production logic. No interference with UI rendering.

**Integration point:**
- Client: optional component/hook that mounts only when `NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED=true`.
- Sends events to `POST /api/ai/behavioral` (or similar) in batches, async.
- Server: endpoint logs or forwards to analytics; **no write to production DB**.

**Safety mechanism:**
- No PII; no form values; no auth tokens. Only: `pathname`, `scrollDepth`, `dwellMs`, `prevPath`, `timestamp`, `sessionId` (anonymous).
- Does not block rendering; fire-and-forget.

**Rollback method:** Set `NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED=false`. Remove or comment out the single provider/component that mounts the tracker.

**Failure behavior:** If the API fails, tracker catches and silences; no user-facing error. No retry required for non-critical insights.

---

## 2. Intent-Based Personalization

**Purpose:** Soft adaptation only—e.g. reorder or emphasize content by inferred intent. **Never remove content.** No permanent DB changes. Session-based inference only.

**Integration point:**
- Client: reads session/local state (e.g. from behavioral layer or explicit choices).
- Optional API: `GET /api/ai/personalization?path=...` returns suggested weights/order; client applies only to **display order** or **visibility** (e.g. collapse/expand), not to data fetching.
- Core list/API responses **unchanged**; personalization is a view-layer overlay.

**Safety mechanism:**
- All content remains available; no deletion. Personalization only reorders or highlights.
- No writes to Supabase or any production store.

**Rollback method:** Disable `NEXT_PUBLIC_AI_PERSONALIZATION_ENABLED`; UI falls back to default order and visibility.

**Failure behavior:** On API or logic failure, use default order; no blank or broken UI.

---

## 3. AI Search (Optional Fallback Mode)

**Purpose:** Offer an alternative search experience (e.g. natural language). **Existing search remains primary.** AI search runs as a separate layer.

**Integration point:**
- Current app: if there is a search input, it continues to use existing keyword/API behavior.
- Optional: "Try AI search" or secondary mode that calls `POST /api/ai/search` with query; result is **merged or shown as alternative**, not replacing primary results.
- If AI fails → **instant revert** to normal keyword search; user sees no error, only primary results.

**Safety mechanism:**
- Primary search path unchanged. AI is additive only.
- Timeout (e.g. 3s); on timeout or error, fallback to keyword search.

**Rollback method:** Disable `NEXT_PUBLIC_AI_SEARCH_FALLBACK_ENABLED`; remove or hide "AI search" entry point.

**Failure behavior:** On any AI failure or timeout, silently use normal search; no blocking, no error modal.

---

## 4. Conversational Interface

**Purpose:** Chat assistant that **guides** users (e.g. "Where do I add a player?"). Non-blocking; does not replace navigation or buttons; cannot perform irreversible actions.

**Integration point:**
- Floating chat button + panel (e.g. bottom-right). Renders only when `NEXT_PUBLIC_AI_CHAT_ENABLED=true`.
- Chat sends messages to `POST /api/ai/chat`; response is **text only**. No ability to trigger DELETE, payment, or data mutation; optional "suggested links" that are normal `<a>` or `router.push`.
- Page-aware context: read-only (e.g. current pathname) may be sent to improve answers.

**Safety mechanism:**
- No write operations from chat. No form submission, no delete, no publish.
- UI is additive; closing chat restores full normal UI.

**Rollback method:** Set `NEXT_PUBLIC_AI_CHAT_ENABLED=false`; chat UI does not mount.

**Failure behavior:** If API fails, show "I couldn't connect. Please try again." and allow retry; do not block rest of app.

---

## 5. Content Intelligence

**Purpose:** AI-generated content (e.g. suggestions, drafts) must be **reviewable before publishing**. No auto-publish to production.

**Integration point:**
- Any "AI suggest" action (e.g. for reports, descriptions) calls an API that returns draft text.
- UI shows draft in a **preview/review** state; user explicitly clicks "Use" or "Publish"; only then does existing app logic persist (using existing APIs).

**Safety mechanism:**
- No automatic write to DB or CMS. Human-in-the-loop only.

**Rollback method:** Disable the feature flag or remove the "AI suggest" button; existing manual flow unchanged.

**Failure behavior:** On API failure, show "Suggestion unavailable" and leave form/content as-is.

---

## 6. Conversion Optimization

**Purpose:** Probabilistic testing (e.g. A/B) for copy or layout. **Never force** variants on all users. Automatically stop experiments on negative impact.

**Integration point:**
- Feature-flagged component that assigns variant (e.g. from hash of sessionId).
- Variants only change **copy or styling**, not flows or APIs. Metrics (e.g. clicks) sent to analytics; evaluation logic runs offline or in a separate service.
- Kill switch: if a variant underperforms, disable it via config without deploy.

**Safety mechanism:**
- No change to auth, payment, or data. Only UI copy/order/style.
- All variants must keep core CTA and navigation intact.

**Rollback method:** Disable experiment flag; default variant shown for everyone.

**Failure behavior:** On config/API failure, show control variant; no broken layout.

---

## 7. Visual & UX Analysis

**Purpose:** Analyze layout and UX **passively** (e.g. heatmaps, click maps). No auto-design edits without human approval.

**Integration point:**
- Optional script or integration (e.g. third-party) that records anonymized interaction data.
- Output is **reports/dashboards** for humans; no code or CSS changed by the system.

**Safety mechanism:**
- Read-only observation. No DOM or style mutations by AI.

**Rollback method:** Remove or disable the analytics/script integration.

**Failure behavior:** No impact on site behavior; at worst, no data.

---

## 8. Performance Prediction

**Purpose:** Predict and recommend optimizations (e.g. "Consider lazy-loading this section"). **Do not directly change** infrastructure or deploy.

**Integration point:**
- Back-office or CI job that consumes metrics (e.g. Web Vitals, server logs) and outputs recommendations.
- Humans apply changes; no automated deployment or config change by AI.

**Safety mechanism:**
- Recommendations only; no execution.

**Rollback method:** N/A (no production changes by this layer).

**Failure behavior:** No impact on live site.

---

## 9. Security & Abuse Detection

**Purpose:** Operate in **monitoring mode first**. Alert-based system before any enforcement.

**Integration point:**
- Logs and optional anomaly detection (e.g. rate limits, suspicious patterns) feed into alerts (e.g. Slack, email).
- No automatic blocking or account action until operators enable enforcement.

**Safety mechanism:**
- Monitoring and alerts only by default. Enforcement is opt-in and reversible.

**Rollback method:** Disable enforcement; keep monitoring if desired.

**Failure behavior:** If detection fails, fail open (no false blocks); alert on failure.

---

## 10. Insight Generation

**Purpose:** Convert analytics into plain-language insights (e.g. "Sessions are up 20% this week"). **Do not alter** dashboards or metric definitions.

**Integration point:**
- Optional API or job: inputs = existing metrics (from current dashboard/API); output = text summary.
- Shown in a **separate** "Insights" block or tab; existing charts and KPIs unchanged.

**Safety mechanism:**
- Read-only on metrics. No change to how metrics are computed or stored.

**Rollback method:** Disable `NEXT_PUBLIC_AI_INSIGHTS_ENABLED`; hide Insights block.

**Failure behavior:** If insight generation fails, hide block or show "Insights unavailable"; dashboard unchanged.

---

## Engineering Requirements

- **Separation:** Core website ↔ AI services ↔ Analytics are clearly separated (different routes, env flags, and optionally different repos/services).
- **Logging:** Every AI action (e.g. behavioral event, chat request) is logged with timestamp and context (no PII) for audit and rollback.
- **Rollback:** Each layer documents rollback (env + code path) in this spec and in code comments.
- **Async:** No blocking calls in critical user flows; AI calls are fire-and-forget or behind "Submit" / "Try AI" actions.
- **Failure:** Each layer defines failure behavior (fail open, fallback to non-AI, or silent no-op) so the site remains reliable.

---

## Summary

| Layer | Purpose | Integration | Rollback |
|-------|---------|-------------|----------|
| 1. Behavioral | Anonymous interaction signals | Client hook + `/api/ai/behavioral` | Flag off |
| 2. Personalization | Soft ordering/visibility | Session + optional API | Flag off |
| 3. AI Search | Optional NL search | Secondary mode + fallback | Flag off |
| 4. Chat | Non-blocking guide | Floating UI + `/api/ai/chat` | Flag off |
| 5. Content Intel | Drafts, review before publish | Preview + explicit publish | Flag off |
| 6. Conversion | A/B tests, probabilistic | Variant component | Flag off |
| 7. Visual/UX | Passive analysis | External or script | Disable script |
| 8. Perf Prediction | Recommendations only | Back-office/CI | N/A |
| 9. Security | Monitor then alert | Logs + alerts | Disable enforcement |
| 10. Insights | Plain-language insights | Separate Insights block | Flag off |

**Objective:** Enhance intelligence, not control. Augment the website, never dominate it. Preserve reliability above all.

---

## Implemented (Off by Default)

| Layer | Code | Enable |
|-------|------|--------|
| 1. Behavioral | `components/ai/behavioral-provider.tsx`, `lib/behavioral-tracking.ts`, `app/api/ai/behavioral/route.ts` | `NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED=true` |
| 4. Chat | `components/ai/chat-widget.tsx`, `app/api/ai/chat/route.ts` | `NEXT_PUBLIC_AI_CHAT_ENABLED=true` |

All layers are mounted from a single entry: `components/ai/ai-layers.tsx` included in `app/layout.tsx`. No other app code depends on AI.

**Full rollback (disable all AI):** In `app/layout.tsx`, remove the `<AILayers />` line. Optionally delete `components/ai/`, `app/api/ai/`, `lib/ai-features.ts`, and `lib/behavioral-tracking.ts`. Core app behavior is unchanged.
