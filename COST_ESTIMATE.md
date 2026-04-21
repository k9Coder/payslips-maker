# Infrastructure Cost Estimate

> Last updated: April 2026
> Based on actual services used in this repo. Prices are approximate and subject to change.
> Exchange rate reference: 1 USD ≈ 3.7 NIS

---

## Quick Summary Table

| Service | What For | Free Tier | First Paid Tier | Monthly (est.) |
|---|---|---|---|---|
| **Domain** | Custom domain | ❌ None | ~$10–15/year | ~$1/month |
| **Cloudflare** | DNS + CDN + SSL | ✅ Forever free | $20/month (Pro) | $0 |
| **GitHub Pages** | Client hosting | ✅ Forever free | N/A | $0 |
| **GitHub Actions** | CI/CD | ✅ Free (public repo) | $0.008/min (private) | $0 |
| **AWS ECR** | Docker image registry | ✅ 500MB/12mo | $0.10/GB/month | ~$0.10–0.20 |
| **AWS ECS Fargate** | Server hosting | ❌ None | ~$8.90/month (0.25vCPU+0.5GB) | $9–35 |
| **Clerk** | Authentication | ✅ 10,000 MAU | $25/month (Pro) | $0–25+ |
| **MongoDB Atlas** | Database | ✅ 512MB (M0) | $8/month (Flex) | $0–25 |
| **SendGrid / Resend** | Transactional email | ✅ 3K/month (100/day) | $19.95–20/month | $0–20 |
| **Bit (via Meshulam)** | Israeli payments | ✅ No monthly fee | 1.6% per transaction | 0 + commission |
| **WhatsApp (WATI)** | Payslip notifications | ❌ None (API requires paid) | ~$49/month + $0.01/msg | $49–150+ |
| **LogRocket** | Client session replay | ✅ 1,000 sessions/mo | $99/month | $0–99 |
| **Grafana Cloud** | Server-side logging | ✅ 50GB/month | ~$0.50/GB over | $0 |
| **Sentry** | Error tracking | ✅ 5K errors/month | $26/month | $0 |

---

## Cost by User Scale

> Assumptions:
> - ~70% of registered users are Monthly Active Users (MAU) — payslip customers log in ~once/month
> - Each active user receives ~1 WhatsApp notification/month (payslip ready)
> - Payslip documents are 10–50 KB; worklog entries are ~1 KB each
> - Average subscription price: ~100 NIS/month (~$27)
> - All costs are infrastructure/subscription costs only — Bit commission is shown separately as revenue impact

| Users (registered) | MAU | Fargate | MongoDB | Clerk | WhatsApp (WATI) | Email (Resend) | Other | **Total Infra/mo** | Bit Commission (revenue impact) |
|---|---|---|---|---|---|---|---|---|---|
| **50** | ~35 | $9 (0.25vCPU) | $0 (M0 free) | $0 | $0 (skip or test) | $0 (free tier) | $1 domain | **~$10/mo** | ~$24/mo taken by Bit |
| **200** | ~140 | $9 (0.25vCPU) | $0 (M0 free) | $0 | $49 base + $1.40 msgs | $0 (free tier) | $1 | **~$60/mo** | ~$97/mo |
| **500** | ~350 | $9 (0.25vCPU) | $9 (M2 or Flex) | $0 | $49 base + $3.50 msgs | $0 (free tier) | $1 | **~$72/mo** | ~$243/mo |
| **1,000** | ~700 | $18 (0.5vCPU) | $9 (M2) | $0 | $49 base + $7 msgs | $0 (free tier) | $1 | **~$84/mo** | ~$486/mo |
| **2,000** | ~1,400 | $18 (0.5vCPU) | $9 (M2) | $0 | $99 (Growth) + $14 msgs | $20/mo | $1 | **~$161/mo** | ~$972/mo |
| **5,000** | ~3,500 | $36 (1vCPU) | $25 (M5) | $0 | $99 + $35 msgs | $20/mo | $1 | **~$216/mo** | ~$2,430/mo |
| **10,000** | ~7,000 | $72 (2vCPU) | $57 (M10) | $0 (<10K MAU) | $279 + $70 msgs | $20/mo | $27 (Sentry) | **~$525/mo** | ~$4,860/mo |
| **15,000** | ~10,500 | $142 (2x 2vCPU) | $57 (M10) | $125 (15K MAU) | $279 + $105 | $20/mo | $27 | **~$755/mo** | ~$7,290/mo |

> **Key insight:** At scale, Clerk becomes the dominant cost driver above 10K MAU. Bit commission is not an infrastructure cost but reduces effective revenue — factor it into pricing strategy.

---

## Per-Service Breakdown

---

### 🌐 Domain

No free tier exists. You pay the registrar annually.

| Registrar | .com/year | Notes |
|---|---|---|
| **Cloudflare Registrar** | ~$10.44 | At-cost, no markup — best price |
| **Namecheap** | ~$9–13 | Often cheap first year, check renewal price |
| **GoDaddy** | ~$12–20 | Expensive renewals, avoid |

**Recommendation:** Cloudflare Registrar — cheapest and integrates with Cloudflare DNS for free.

---

### ☁️ Cloudflare (DNS + CDN + SSL)

**Free tier — forever.** This is the one service that genuinely costs nothing and never will for a small app.

| Feature | Free | Pro ($20/month) |
|---|---|---|
| DNS | ✅ Unlimited | ✅ |
| CDN | ✅ Global | ✅ + more edge rules |
| SSL/TLS | ✅ Automatic | ✅ |
| DDoS protection | ✅ Basic | ✅ Advanced |
| Page Rules | ✅ 3 rules | ✅ 20 rules |

**Recommendation:** Stay on free forever. Pro is not needed for this app.

---

### 🖥️ GitHub Pages + GitHub Actions (CI/CD)

**Client hosting** is on GitHub Pages (see `deploy-client.yml`).
**Server deploys** are triggered via `deploy-server.yml` → AWS ECS.

| Plan | Actions Minutes | Pages | Cost |
|---|---|---|---|
| **Free (public repo)** | Unlimited | ✅ Free | $0 |
| **Free (private repo)** | 2,000 min/month | ✅ Free | $0 (until 2K min) |
| **Overage (private)** | $0.008/min | — | ~$1.20–2/month |

**Recommendation:** Keep repo public if possible. If private, Actions cost is negligible.

---

### 🐳 AWS ECR (Elastic Container Registry)

| Tier | Storage | Cost |
|---|---|---|
| Free (first 12 months) | 500MB/month | $0 |
| After free tier | Any | $0.10/GB/month + $0.09/GB transfer |

After the 12-month free tier: ~$0.10–0.20/month — essentially negligible.

---

### 🚀 AWS ECS Fargate (Server Hosting)

**Fargate has NO free tier.** Pricing in `us-east-1` (confirmed April 2026):

| Resource | Price |
|---|---|
| vCPU | $0.04048/vCPU-hour |
| Memory | $0.004445/GB-hour |

**Monthly cost by task size (24/7 uptime):**

| Task Size | vCPU | Memory | Monthly |
|---|---|---|---|
| Tiny | 0.25 | 0.5 GB | ~$8.90 |
| Small | 0.5 | 1 GB | ~$17.76 |
| Medium | 1 | 2 GB | ~$35.52 |
| Large | 2 | 4 GB | ~$71.04 |

> Fargate Spot (interruptible tasks) offers up to 70% discount — suitable for batch/non-critical workloads.

#### Cheaper alternatives to ECS Fargate

| Service | Free Tier | Paid | Notes |
|---|---|---|---|
| **Render.com** | ✅ (spins down after 15min) | $7/month (always-on) | Much simpler than ECS |
| **Railway** | ✅ $5 credit/month | ~$5–20/month | Great DX, simple deploys |
| **Fly.io** | ✅ 3 shared VMs | ~$1.94/month | Very cheap, Docker-native |

**Recommendation:** ECS is already set up. Keep it unless ops burden grows.

---

### 🔐 Clerk (Authentication)

| Plan | MAU Included | Price | Extra MAU |
|---|---|---|---|
| **Free** | 10,000 | $0 | — |
| **Pro** | 10,000 | $25/month | $0.02/MAU |

**Cost at scale:**

| Monthly Active Users | Monthly Cost |
|---|---|
| 0–10,000 | $0 |
| 15,000 | $25 + (5,000 × $0.02) = **$125** |
| 20,000 | $25 + (10,000 × $0.02) = **$225** |
| 50,000 | $25 + (40,000 × $0.02) = **$825** |

> Note: Payslip users log in monthly (payday), so MAU ≈ total active users.

**Alternative at scale:** Supabase Auth — 50,000 MAU free, then $25/month (Pro includes more features).

---

### 🍃 MongoDB Atlas (Database)

| Tier | Storage | RAM | Price | Notes |
|---|---|---|---|---|
| **M0 (Free)** | 512 MB | Shared | $0 | No SLA, shared cluster |
| **Flex** | 5 GB | Shared | ~$8–30/month | Replaced Serverless; auto-scales |
| **M2** | 2 GB | Shared | ~$9/month | Light production |
| **M5** | 5 GB | Shared | ~$25/month | Moderate load |
| **M10** | 10 GB | Dedicated | ~$57/month | Production-grade SLA |

> Worklog + payslip data: each payslip ~10–50 KB, each worklog entry ~1 KB. M0 comfortably holds ~500–1,000 users' data before upgrade.

**When to upgrade:**
- M0 → Flex/M2: When you hit 512MB or need guaranteed connections (~500+ active users)
- M2 → M5: Storage exceeds 2GB or concurrent connections required (~2,000+ users)

---

### 💳 Bit Payment Integration (Israeli Payments)

Bit is Israel's dominant peer-to-peer and business payment app (Bank Hapoalim). For businesses, Bit is accessed via an Israeli payment gateway — not directly via API.

#### How it works
1. You register with an Israeli gateway (Meshulam or PayMe/Grow)
2. Your gateway handles Bit, credit cards, Apple Pay, Google Pay under one API
3. Bit payments appear as a redirect/QR flow to the customer
4. Transaction limit: up to 5,000 NIS/transaction, 20,000 NIS/month (removable upon approval)

#### Pricing model

| Component | Cost | Notes |
|---|---|---|
| Monthly gateway fee (Meshulam/PayMe) | ~0–150 NIS/month | Depends on plan and volume |
| Bit commission per transaction | **~1.6%** | Bit's cut (user-confirmed) |
| Gateway processing fee | ~0.5–1.5% + fixed | Meshulam/PayMe on top of Bit |
| **Effective total per transaction** | **~2.1–3.1%** | Combined Bit + gateway |

> The 1.6% goes to Bit/Isracard. The gateway (Meshulam/PayMe) takes an additional slice. Factor ~2.5% total into your pricing model to stay profitable.

#### Revenue impact at scale (assuming 100 NIS avg subscription)

| Users paying | Monthly Revenue | ~2.5% Commission | Net Revenue |
|---|---|---|---|
| 50 | 5,000 NIS | 125 NIS | 4,875 NIS |
| 200 | 20,000 NIS | 500 NIS | 19,500 NIS |
| 500 | 50,000 NIS | 1,250 NIS | 48,750 NIS |
| 1,000 | 100,000 NIS | 2,500 NIS | 97,500 NIS |
| 5,000 | 500,000 NIS | 12,500 NIS | 487,500 NIS |

**Recommendation:** Use Meshulam (Grow) — it supports Bit natively, integrates with React frontend easily, and has a clean webhook system for payment confirmation. No PayPal needed — Bit covers the Israeli market. If you ever need international payments, add Stripe for non-IL users.

---

### 📱 WhatsApp Business Integration

WhatsApp Business API (via Meta Cloud API or a provider like WATI) is required for programmatic messaging. The free WhatsApp Business App does not support automation or API access.

#### Meta pricing model (January 2026 update: per-message, not per-conversation)

| Message Type | Price (Israel recipient) | Use Case |
|---|---|---|
| **Service** (user-initiated, 24h window) | **Free** | Customer replies, support |
| **Utility** | ~$0.008–0.015 | Payslip ready, payment confirmed |
| **Marketing** | ~$0.025–0.05 | Promotions, plan upsells |
| **Authentication** | ~$0.008–0.015 | OTP, verification |

#### Provider options (platform fee on top of Meta charges)

| Provider | Base Plan | Included | Notes |
|---|---|---|---|
| **WATI (Growth)** | ~$49/month | 1,000 conversations | Most popular for SMBs, good UI |
| **WATI (Pro)** | ~$99/month | 5,000 conversations | More agents, advanced automation |
| **WATI (Business)** | ~$279/month | Unlimited | Enterprise |
| **360dialog** | ~$5–10/month | Low platform fee | Cheaper but more DIY setup |
| **Meta Cloud API (direct)** | $0 platform fee | Pay-per-message only | Most complex to set up |

#### Monthly WhatsApp cost at user scale

Assumption: 1 utility message/active user/month (payslip ready notification)

| Active Users | WATI Plan | Meta msg cost | **Total WhatsApp/mo** |
|---|---|---|---|
| < 50 | Skip or test | — | $0 (use email only) |
| 50–500 | WATI Growth $49 | ~$0.50–5 | **~$50/mo** |
| 500–2,000 | WATI Growth $49 | ~$5–20 | **~$55–70/mo** |
| 2,000–5,000 | WATI Pro $99 | ~$20–50 | **~$120–150/mo** |
| 5,000–15,000 | WATI Pro/Business $279 | ~$50–150 | **~$330–430/mo** |

> **Important:** At early stage (<200 users) consider sending via email only and adding WhatsApp later. The $49/month WATI base fee is not worth it until you have consistent MAU.

**Recommendation:** Start with Resend email only. Add WATI WhatsApp when you reach ~200 paying users who are actively requesting it. Use utility messages only (not marketing) to keep Meta costs minimal.

---

### 📧 SendGrid / Resend (Email)

| Plan | Emails/month | Price |
|---|---|---|
| **Resend Free** | 3,000 (100/day) | $0 |
| **Resend Pro** | 50,000 | $20/month |
| **SendGrid Free** | 3,000 (100/day) | $0 |
| **SendGrid Essentials 40K** | 40,000 | $19.95/month |

> Payslip emails sent once/month per user. At 500 users: 500 emails/month — well within free tier. You only exceed 3K/month at ~3,000+ active users sending monthly.

**Recommendation:** Use Resend — better API, better deliverability defaults, React Email support for HTML templates. Switch from SendGrid when you integrate email properly.

---

### 🎥 LogRocket (Client Session Replay)

| Plan | Sessions/month | Price |
|---|---|---|
| **Free** | 1,000 | $0 |
| **Team** | 10,000 | $99/month |

**Alternative: PostHog** — 15,000 session recordings/month free + analytics, feature flags, A/B testing.

**Recommendation:** PostHog replaces LogRocket and adds more. Switch when LogRocket free tier runs out.

---

### 📋 Server-Side Logging (Grafana Cloud)

| Service | Free Tier | Paid |
|---|---|---|
| **Grafana Cloud** | 50 GB/month, 14-day retention | ~$0.50/GB over |
| **Better Stack** | 3 GB/month, 3-day retention | $0.15/GB ingestion |

**Recommendation:** Grafana Cloud — 50GB free is massive for a low-traffic app. Connect via Loki agent.

---

### 🐛 Sentry (Error Tracking)

| Plan | Errors/month | Price |
|---|---|---|
| **Free** | 5,000 | $0 |
| **Team** | 50,000 | $26/month |

**Recommendation:** Add Sentry now on the free tier — catches unhandled exceptions with stack traces on both client and server.

---

## Full Scenario Cost Tables

### Scenario A — Early Stage (50 users, everything free tier)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| Cloudflare | $0 |
| GitHub Pages + Actions | $0 |
| AWS ECR | $0 (first year) |
| AWS ECS Fargate (0.25vCPU) | ~$9 |
| Clerk (< 10K MAU) | $0 |
| MongoDB Atlas M0 | $0 |
| Resend | $0 |
| WhatsApp (WATI) | $0 (skip, email only) |
| Bit integration | $0 platform + ~2.5% per transaction |
| Grafana Cloud | $0 |
| Sentry | $0 |
| **Total** | **~$10/month** |

---

### Scenario B — Light Production (200–500 users, small paying cohort)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| AWS ECS Fargate (0.25vCPU) | ~$9 |
| MongoDB Atlas M0 or M2 | $0–9 |
| Resend | $0 |
| WhatsApp WATI Growth | $49–55 (if enabled) |
| Bit integration | $0 + ~2.5%/tx |
| Clerk (< 10K MAU) | $0 |
| Grafana Cloud | $0 |
| Sentry | $0 |
| **Total (no WhatsApp)** | **~$10–20/month** |
| **Total (with WhatsApp)** | **~$60–75/month** |

---

### Scenario C — Growing (1,000–2,000 users)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| AWS ECS Fargate (0.5vCPU) | ~$18 |
| MongoDB Atlas M2 | $9 |
| Resend | $0 (still free) |
| WhatsApp WATI Growth/Pro | $49–99 + $10–20 msgs |
| Bit integration | $0 + ~2.5%/tx |
| Clerk (< 10K MAU) | $0 |
| Grafana Cloud | $0 |
| Sentry | $0 |
| **Total** | **~$90–150/month** |

---

### Scenario D — Scale (5,000+ users)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| AWS ECS Fargate (1vCPU) | ~$36 |
| MongoDB Atlas M5 | $25 |
| Resend Pro | $20 |
| WhatsApp WATI Pro | $99 + $50 msgs |
| Bit integration | $0 + ~2.5%/tx |
| Clerk (< 10K MAU still) | $0 |
| PostHog (replaces LogRocket) | $0 |
| Grafana Cloud | $0 |
| Sentry | $0 |
| **Total** | **~$230/month** |

---

### Scenario E — Large Scale (10,000–15,000 MAU)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| AWS ECS Fargate (2x 2vCPU) | ~$142 |
| MongoDB Atlas M10 | $57 |
| Resend Pro | $20 |
| WhatsApp WATI Business | $279 + $100 msgs |
| Bit integration | $0 + ~2.5%/tx |
| Clerk Pro (15K MAU) | $125 |
| PostHog | $0 |
| Grafana Cloud | $0–20 |
| Sentry Team | $26 |
| **Total** | **~$750–780/month** |

> At 10K+ MAU, Clerk becomes the dominant non-infra cost. Evaluate Supabase Auth (50K MAU free) as a migration target.

---

## Services Not Currently Used (Recommended Additions)

| Service | Why | Cost |
|---|---|---|
| **Sentry** | Runtime error tracking client + server | Free up to 5K errors/month |
| **Grafana Cloud** | Server-side log aggregation | Free up to 50GB/month |
| **Resend** | Better email API, React Email templates | Free 3K/month |
| **WhatsApp WATI** | Payslip notifications (add at ~200 users) | $49+/month |
