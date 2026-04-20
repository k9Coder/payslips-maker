# CareSlip — Israeli Payslip & Settlement Generator

## What Is It?

CareSlip is a web application that automates payroll document generation for **Israeli households employing foreign caregivers**. It produces two types of legally-compliant documents:

1. **Monthly Payslips (תלוש שכר)** — with full Israeli tax math, overtime, pension, and deductions
2. **End-of-Employment Settlements (גמר חשבון)** — severance, vacation payout, recuperation pay, and notice period, all calculated per Israeli labor law

Documents are generated as PDFs entirely in the browser, can be sent by email, and are stored in a personal archive. They can be rendered in **7 languages** (Hebrew, English, Filipino, Thai, Amharic, Hindi, Arabic) to match the employee's native language.

---

## Who It's For

- **Household employers** paying a foreign caregiver and needing to issue a legal payslip each month
- **Payroll managers or agencies** handling multiple households and needing a scalable, consistent workflow

---

## What It Actually Does

### Payslip Generation
- Calculates gross and net pay from salary basis (monthly / daily / hourly)
- Applies 2025 Israeli progressive income tax brackets with the foreign worker credit (2.25 points)
- Deducts National Insurance (Bituach Leumi) and Health Insurance at the correct thresholds
- Tracks overtime at 100%, 125%, and 150% multipliers
- Handles pension fund, education fund (Keren Hishtalmut), and custom pay items
- Tracks running vacation and sick day balances
- Renders as a properly formatted, bilingual PDF

### End-of-Employment Settlement
- Calculates severance pay (12-month minimum tenure, ineligible for resignations)
- Computes unused vacation days based on tenure-based accrual table (12–28 days/year)
- Adds recuperation pay at the current fixed rate (378 NIS/day) by years worked
- Determines notice period (scales with tenure, caps at 30 days)
- Handles all three termination reasons: dismissal, resignation, mutual agreement

### Document Delivery
- One-click PDF download
- Email delivery via SendGrid (rate-limited at 3 sends/form/day, requires subscription)
- Full document archive with view, edit, and duplicate capabilities

### Multi-Language Output
- Each employee has a `preferredLanguage` field
- PDFs are rendered in that language with the correct font (Noto Sans family for Thai, Amharic, Devanagari; Heebo for Hebrew/Arabic/Latin)
- Full RTL layout for Hebrew and Arabic documents

---

## Business Model

| Tier | Forms | Email Delivery |
|---|---|---|
| Free | Up to 10 | No |
| Subscription | Unlimited | Yes |

Subscriptions are managed by admins — no self-serve checkout exists yet.

---

## Tech Stack (for the curious)

- **Frontend**: React 18 + Vite + TypeScript + Tailwind + Radix UI
- **PDF**: `@react-pdf/renderer` with bundled TTF fonts (no Google Fonts, full offline rendering)
- **Backend**: Express + MongoDB (Mongoose) + Clerk Auth
- **Monorepo**: npm workspaces (shared types → server → client)

---

---

# The Pitch

---

## You hired a caregiver. Now comes the paperwork.


Every month, you're legally required to give your foreign caregiver a payslip. Not a note. Not a number. A proper, itemized payslip — with income tax, national insurance, health deductions, pension contributions, and overtime, all calculated correctly.

Most employers either skip it (illegal), pay an accountant for a simple document (expensive), or wrestle with Excel at midnight (miserable).

**CareSlip takes 5 minutes and gets it right.**

---

### Here's what happens without CareSlip

You open a spreadsheet you half-remember setting up a year ago. You look up whether this month's salary is above or below the Bituach Leumi threshold. You try to remember how many overtime hours were 125% and how many were 150%. You wonder if the tax credit for foreign workers changed this year. You produce a document that might be correct. You print it out. Your caregiver can't read it because it's only in Hebrew.

You do this every single month.

---

### Here's what happens with CareSlip

You open the app. You enter the month's hours and any special items. CareSlip calculates the taxes, the deductions, the employer contributions — everything — using the actual 2025 brackets and rates. You click download. Your caregiver gets a PDF in their language: Filipino, Thai, Amharic, Hindi, Arabic, English, or Hebrew.

End of employment? CareSlip calculates the full גמר חשבון: severance (if owed), every unused vacation day at the correct daily rate, recuperation pay by years worked, notice period — all of it, all at once, legally correct.

---

### Why it's different

**It knows Israeli law.** Not "payroll software" that happens to have an Israel option. CareSlip is built specifically for the Israeli household employment context — the 22-day work month, the foreign worker tax credit, the vacation accrual table, the 378 NIS/day recuperation rate, the severance eligibility rules. These aren't configurable settings. They're baked in.

**It speaks your employee's language.** Your caregiver from the Philippines doesn't read Hebrew. Your caregiver from Thailand doesn't read English. For the first time, they can actually read their own payslip. That's not a nice-to-have — it's basic dignity, and it reduces disputes.

**It lives in your browser.** No software to install. No accountant to call. No waiting. The PDF is generated on your device in seconds.

**It remembers everything.** Every payslip, every settlement, archived. Need to look up what you paid last March? Two clicks.

---

### The bottom line

CareSlip doesn't replace an accountant for complex situations. But for the straightforward monthly payslip — the thing you have to do every month for as long as you have an employee — it's faster, cheaper, and more accurate than any alternative.

**Get compliant. Stay compliant. In any language.**

---

*CareSlip — payslips for the people who care for your family.*
