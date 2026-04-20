# Infrastructure Cost Estimate

> Last updated: March 2026
> Based on actual services used in this repo. Prices are approximate and subject to change.

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
| **MongoDB Atlas** | Database | ✅ 512MB (M0) | $9/month (M2) | $0–9 |
| **SendGrid** | Transactional email | ✅ 100/day (3K/mo) | $19.95/month (40K/mo) | $0–20 |
| **LogRocket** | Client session replay | ✅ 1,000 sessions/mo | $99/month (10K sessions) | $0–99 |
| **Grafana Cloud** | Server-side logging | ✅ 50GB/month | ~$0.50/GB over 50GB | $0 |
| **Sentry** | Error tracking (missing!) | ✅ 5K errors/month | $26/month | $0 |

**Estimated monthly total (free tier):** ~$9–18/month (domain + small Fargate task)
**Estimated monthly total (light production):** ~$35–60/month

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

- Pages limits: 1GB storage, 100GB bandwidth/month — plenty for a React SPA
- If repo is private and you deploy ~50×/month at 3 min each = 150 min → well within free tier

**Recommendation:** Keep repo public if possible. If private, Actions cost is negligible.

---

### 🐳 AWS ECR (Elastic Container Registry)

Used to store Docker images for the server.

| Tier | Storage | Cost |
|---|---|---|
| Free (first 12 months) | 500MB/month | $0 |
| After free tier | Any | $0.10/GB/month storage + $0.09/GB transfer out |

- A typical Node.js Docker image is 300–700MB
- After the 12-month free tier: ~$0.10–0.20/month — essentially negligible
- ECR is not where your AWS bill comes from. ECS Fargate is.

---

### 🚀 AWS ECS Fargate (Server Hosting)

**Fargate has NO free tier.** You pay from day one for the compute.

Pricing in `us-east-1` (as configured in `deploy-server.yml`):

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

> For a low-traffic payslip SaaS, **0.25 vCPU + 0.5 GB (~$9/month)** is usually enough to start.

#### Cheaper alternatives to ECS Fargate

If ECS complexity isn't worth it for a small app:

| Service | Free Tier | Paid | Notes |
|---|---|---|---|
| **Render.com** | ✅ (spins down after 15min inactivity) | $7/month (Starter, always-on) | Much simpler than ECS |
| **Railway** | ✅ $5 credit/month | ~$5–20/month usage-based | Great DX, simple deploys |
| **Fly.io** | ✅ 3 shared VMs free | ~$1.94/month (shared-cpu-1x) | Very cheap, Docker-native |

**Recommendation:** ECS is already set up and works. Keep it unless ops burden grows. If starting fresh, Render Starter ($7/month) is far simpler.

---

### 🔐 Clerk (Authentication)

Used for sign-in, sign-up, JWT issuance, and webhooks.

| Plan | MAU Included | Price | Extra MAU |
|---|---|---|---|
| **Free** | 10,000 | $0 | — |
| **Pro** | 10,000 | $25/month | $0.02/MAU |
| **Enterprise** | Custom | Custom | — |

**Cost at scale:**

| Monthly Active Users | Monthly Cost |
|---|---|
| 0–10,000 | $0 |
| 15,000 | $25 + (5,000 × $0.02) = **$125** |
| 20,000 | $25 + (10,000 × $0.02) = **$225** |
| 50,000 | $25 + (40,000 × $0.02) = **$825** |

> Note: MAU = any user who logs in at least once per month. Payslip users tend to log in monthly (payday), so your MAU count ≈ total active users.

#### Alternatives if Clerk gets expensive

| Service | Free MAU | Paid |
|---|---|---|
| **Supabase Auth** | 50,000 MAU free | $25/month (Pro, includes more) |
| **Auth0** | 7,500 MAU free | $23/month (up to 1,000 MAU) |
| **Firebase Auth** | Unlimited free (email/password) | Pay only for phone auth |

**Recommendation:** Clerk free tier handles up to 10K MAU. At that scale you're likely generating enough revenue to cover $25+/month anyway.

---

### 🍃 MongoDB Atlas (Database)

| Tier | Storage | RAM | Price | Notes |
|---|---|---|---|---|
| **M0 (Free)** | 512 MB | Shared | $0 | No SLA, shared cluster |
| **M2** | 2 GB | Shared | ~$9/month | OK for light production |
| **M5** | 5 GB | Shared | ~$25/month | Moderate load |
| **M10** | 10 GB | Dedicated | ~$57/month | Production-grade |
| **Serverless** | Pay-per-use | — | $0.10/M reads + $1.00/M writes + $0.25/GB | Good for spiky traffic |

> A single payslip document is roughly 5–20 KB. M0's 512MB fits ~25,000–100,000 payslips before needing an upgrade.

**When to upgrade:**
- M0 → M2 ($9/month): When you hit 512MB or need a guaranteed connection limit
- M2 → M5 ($25/month): When storage exceeds 2GB or you need more concurrent connections

---

### 📧 SendGrid (Email)

Used for sending payslip PDFs and notifications.

| Plan | Emails/month | Price |
|---|---|---|
| **Free** | ~3,000 (100/day) | $0 |
| Essentials 40K | 40,000 | $19.95/month |
| Essentials 100K | 100,000 | $29.95/month |

#### Alternative: Resend (recommended)

SendGrid is owned by Twilio and can be overkill. **Resend** has a cleaner API and a better free tier for developers:

| Plan | Emails/month | Price |
|---|---|---|
| **Free** | 3,000 (100/day) | $0 |
| Pro | 50,000 | $20/month |
| Scale | 200,000 | $90/month |

**Recommendation:** Switch to Resend — same free tier limit but better API, better deliverability defaults, and simpler setup. Only requires changing `@sendgrid/mail` to `resend` package.

---

### 🎥 LogRocket (Client Session Replay & Monitoring)

| Plan | Sessions/month | Retention | Price |
|---|---|---|---|
| **Free** | 1,000 | 1 month | $0 |
| **Team** | 10,000 | 1 year | $99/month |
| **Professional** | 25,000 | 1 year | $150/month |
| **Enterprise** | Custom | Custom | Custom |

> 1,000 sessions/month = roughly 1,000 unique user visits. For early-stage this is fine.

#### Alternative: PostHog (much more generous free tier)

| Plan | Events/month | Session Recordings | Price |
|---|---|---|---|
| **Free** | 1,000,000 | 15,000 | $0 |
| Paid | Beyond free | Beyond free | Pay-as-you-go |

**Recommendation:** If you're hitting the 1K session limit, switch to PostHog — 15K recordings/month free is 15× more generous and it also includes analytics, feature flags, and A/B testing.

---

### 📋 Server-Side Logging

Currently **console-only** (there's a TODO in `server/src/infrastructure/logger/logger.ts`). Here's what the options look like:

| Service | Free Tier | Retention (free) | Paid | Notes |
|---|---|---|---|---|
| **Grafana Cloud** ⭐ | 50 GB/month | 14 days | ~$0.50/GB over 50GB | Best free tier by far |
| **Better Stack** ⭐ | 3 GB/month | 3 days | $0.15/GB ingestion + $0.08/GB/mo retention | Best paid pricing |
| **Datadog** | 5 hosts, logs 1 day only | 1 day | $0.10/GB ingestion + $1.70/million events/month | Only worth it if using full Datadog suite |
| **Coralogix** | ❌ 14-day trial only | — | $0.42/GB | No free option |
| **Logz.io** | ❌ 14-day trial only | — | $0.92/GB/day (~$27/mo per GB) | Very expensive, avoid |

**Recommendation:**
- **Start:** Grafana Cloud — 50GB/month free is more than enough for a low-traffic app. No credit card required.
- **If paying:** Better Stack — clearest pricing, best developer experience, $0.15/GB ingestion.
- **Avoid:** Logz.io (overpriced), Coralogix (no free tier).

---

### 🐛 Sentry (Error Tracking — not yet added, recommended)

This is missing from the current stack and worth adding on the free tier.

| Plan | Errors/month | Users | Price |
|---|---|---|---|
| **Free** | 5,000 | 1 | $0 |
| **Team** | 50,000 | Unlimited | $26/month |
| **Business** | 100,000 | Unlimited | $80/month |

Sentry captures unhandled exceptions on both client and server, with stack traces, breadcrumbs, and release tracking. The free tier is sufficient for early-stage.

---

## Cost Scenarios

### Scenario A — Early Stage (everything on free tier)

| Service | Monthly |
|---|---|
| Domain | ~$1 (amortized) |
| Cloudflare DNS | $0 |
| GitHub Pages + Actions | $0 |
| AWS ECR | $0 (first year) |
| AWS ECS Fargate (0.25vCPU) | ~$9 |
| Clerk (< 10K MAU) | $0 |
| MongoDB Atlas M0 | $0 |
| SendGrid / Resend | $0 |
| LogRocket (< 1K sessions) | $0 |
| Grafana Cloud logging | $0 |
| Sentry (< 5K errors) | $0 |
| **Total** | **~$10/month** |

---

### Scenario B — Light Production (few hundred paying users)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| AWS ECS Fargate (0.5vCPU) | ~$18 |
| MongoDB Atlas M2 | $9 |
| SendGrid/Resend | $0 (still in free tier) |
| Clerk (< 10K MAU) | $0 |
| LogRocket | $0 (or $99 if you want more) |
| Grafana Cloud | $0 |
| Sentry | $0 |
| **Total** | **~$28/month (~$336/year)** |

---

### Scenario C — Growing (1K–5K MAU, active usage)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| AWS ECS Fargate (1vCPU) | ~$36 |
| MongoDB Atlas M5 | $25 |
| Resend Pro (high email volume) | $20 |
| Clerk (< 10K MAU) | $0 |
| PostHog (replacing LogRocket) | $0 |
| Grafana Cloud | $0 |
| Sentry | $0 |
| **Total** | **~$82/month (~$984/year)** |

---

### Scenario D — Scale (10K–50K MAU)

| Service | Monthly |
|---|---|
| Domain | ~$1 |
| AWS ECS Fargate (2vCPU, 2 tasks) | ~$140 |
| MongoDB Atlas M10 | $57 |
| Resend Pro | $20–90 |
| Clerk Pro (20K MAU) | $225 |
| PostHog / LogRocket Team | $0–99 |
| Grafana Cloud | $0–20 |
| Sentry Team | $26 |
| **Total** | **~$570–660/month (~$6,840–7,920/year)** |

> At 10K+ MAU Clerk becomes the dominant cost driver. If you reach this scale, evaluate Supabase Auth (50K MAU free) as a drop-in alternative.

---

## Services Not Currently Used (Recommended Additions)

| Service | Why | Cost |
|---|---|---|
| **Sentry** | Catches runtime errors on client + server | Free up to 5K errors/month |
| **Grafana Cloud** | Server-side log aggregation (currently missing) | Free up to 50GB/month |
| **Cloudflare** | DNS + CDN + SSL in one place | Free forever |
| **Resend** | Better email API than SendGrid | Free 3K/month |
