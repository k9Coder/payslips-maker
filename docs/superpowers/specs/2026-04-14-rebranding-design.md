# Rebranding Design: פשוט תלוש

**Date:** 2026-04-14  
**Status:** Approved  

## Summary

Rebrand the product from the generic "יוצר תלושי שכר" to **פשוט תלוש** — a named, professional brand targeting Israeli accountants and employers who manage foreign workers. The personality is **professional/formal**: trustworthy, compliance-forward, institutional.

---

## Brand Identity

### Name
**פשוט תלוש** (Simple Payslip — "Simple" leads)

### Color Palette — Navy Blueprint

| Token | Hex | Usage |
|---|---|---|
| Primary | `#1e3a8a` | Navbar bg, headings, logo bg |
| Accent | `#3b82f6` | Buttons, links, highlights |
| Light | `#93c5fd` | Nav link text on dark bg, icon tints |
| Lighter | `#bfdbfe` | Subtle tints, hover states |
| Background tint | `#f0f4ff` | Hero section bg, card backgrounds |
| Dark | `#0f172a` | Footer background |

CSS variable changes in `index.css`:
- `--primary`: `221.2 83.2% 53.3%` → `224 71% 33%` (navy `#1e3a8a`)
- `--ring`: same as new primary

### Logo — Payslip Rows SVG

An abstract SVG icon representing a payslip table (rows of varying widths). Structure:
- Top bar (full width, white) — header row
- Two data rows (left label in sky blue `#93c5fd`, right value in white at 70% opacity)
- Bottom bar (full width, white at 90%) — total row

Used in three contexts:
1. **Navbar icon** — 20×20px inside a 34×34 rounded square with `rgba(255,255,255,0.12)` bg
2. **Footer mark** — 22×22px, rendered in `#3b82f6` / `#93c5fd` tones on dark bg
3. **Favicon** — `favicon.svg` in `client/public/`, same icon on navy `#1e3a8a` square bg

---

## Components

### 1. Favicon (`client/public/favicon.svg`)

New SVG file. Navy `#1e3a8a` square background with rounded corners, payslip-rows icon in white/sky-blue centered inside.

### 2. `index.html`

- `<title>`: `פשוט תלוש` (was: `יוצר תלושי שכר`)
- `<meta name="description">`: `מערכת מקצועית ליצירת תלושי שכר לעובדים זרים בישראל`

### 3. `index.css`

Update CSS custom properties:
- `--primary`: navy `#1e3a8a` (hsl `224 71% 33%`)
- `--ring`: same as primary

### 4. `Navbar.tsx`

- Replace `<FileText>` lucide icon with the inline payslip-rows SVG
- Replace hardcoded brand name string `"יוצר תלושי שכר"` with `"פשוט תלוש"`
- Change navbar background from `bg-background/95` to `bg-[#1e3a8a]`
- Nav links: text color `text-[#bfdbfe]`, hover `hover:bg-white/10 hover:text-white`
- "תלוש חדש" button: styled as solid accent blue `bg-[#3b82f6]` on the navbar
- Impersonation navbar: keep amber theme (admin warning) but update brand name

### 5. `Footer.tsx` (new component)

Location: `client/src/shared/components/Footer.tsx`

Structure:
```
<footer> dark bg #0f172a
  ├── Top row
  │   ├── Left: Logo icon + "פשוט תלוש" wordmark + tagline
  │   └── Right: Legal compliance callout block (blue left border)
  ├── <hr> divider
  └── Bottom row
      ├── Left: © 2025 פשוט תלוש. כל הזכויות שמורות.
      └── Right: links — מדריך · פרטיות · צור קשר
```

Legal callout text (Hebrew):
> ⚖️ **עמידה בדרישות החוק:** המערכת מחושבת לפי חוקי העבודה הישראלים, לרבות פקודת מס הכנסה, חוק הביטוח הלאומי וחוק פנסיית חובה (2008). החישובים מיועדים לצרכי מידע בלבד — יש להתייעץ עם רואה חשבון לצרכי אישור.

The footer renders on **all pages** (inside `Layout.tsx`). It does not appear in impersonation mode (amber navbar already signals context change — add the footer normally there too, it's not conflicting).

### 6. `Layout.tsx`

Import and render `<Footer />` below `<main>`. The existing `<Toaster />` stays inside `Layout` above the footer.

### 7. `HomePage.tsx`

Replace the current minimal hero with a full marketing landing section (pre-login only):

**Section 1 — Hero** (gradient bg `#1e3a8a → #2563eb`):
- Trust badge: `✓ מחושב לפי חוקי העבודה הישראלי`
- H1: `תלושי שכר לעובדים זרים — בקלות ובמהירות`
- Subtitle: `מערכת מקצועית ליצירת תלושי שכר תקינים, חישוב מס אוטומטי ושליחה ישירה לעובד — בעברית ובשפת האם שלו.`
- CTA buttons: "כניסה למערכת" (solid white) + "הרשמה" (outline white)

**Section 2 — Trust bar** (white bg):
- 3 items: חישוב מס אוטומטי · 7 שפות · PDF בלחיצה

**Section 3 — Feature cards** (light tint bg):
- 3 cards: ניהול חברות ועובדים · תאימות משפטית מלאה · שליחה ישירה לעובד

The existing `t('home.title')` / `t('home.subtitle')` i18n keys are replaced by hardcoded Hebrew strings in this component (the homepage is Hebrew-only — it's the pre-auth marketing page, not the app UI).

### 8. i18n locale files

Update all locale files (`he.json`, `en.json`, `ar.json`, `fil.json`, `th.json`, `am.json`, `hi.json`):

| Key | Old value (he) | New value (he) |
|---|---|---|
| `home.title` | `יוצר תלושי שכר` | `פשוט תלוש` |
| `home.subtitle` | `מערכת ליצירת תלושי שכר לעובדים זרים` | `מערכת מקצועית ליצירת תלושי שכר לעובדים זרים` |

Update English and other locales to equivalent translations.

---

## Files Changed

| File | Change type |
|---|---|
| `client/public/favicon.svg` | New |
| `client/src/shared/components/Footer.tsx` | New |
| `client/index.html` | Edit — title + meta |
| `client/src/index.css` | Edit — primary color CSS vars |
| `client/src/shared/components/Navbar.tsx` | Edit — logo, brand name, colors |
| `client/src/shared/components/Layout.tsx` | Edit — add Footer |
| `client/src/pages/HomePage.tsx` | Edit — full hero redesign |
| `client/src/i18n/locales/he.json` | Edit — home.title, home.subtitle |
| `client/src/i18n/locales/en.json` | Edit — home.title, home.subtitle |
| `client/src/i18n/locales/ar.json` | Edit — home.title, home.subtitle |
| `client/src/i18n/locales/fil.json` | Edit — home.title, home.subtitle |
| `client/src/i18n/locales/th.json` | Edit — home.title, home.subtitle |
| `client/src/i18n/locales/am.json` | Edit — home.title, home.subtitle |
| `client/src/i18n/locales/hi.json` | Edit — home.title, home.subtitle |

---

## Out of Scope

- No changes to the PDF template branding (PayslipPDF.tsx) — the PDF is a legal document format, not a brand touchpoint
- No changes to server-side code
- No changes to authentication pages (Clerk handles those)
- No dark mode
- No new routes
