# Payslip Generation from Worklog — Design Spec
**Date:** 2026-04-21  
**Status:** Approved  
**Reference:** `docs/PAY_SLIP_101.md`

---

## Overview

Rebuild the payslip creation flow so that all values are **derived automatically** from the worklog, employee contract settings, and user employer profile — per Israeli law as documented in PAY_SLIP_101. The resulting form is a **read-only payslip display** (all fields disabled). The user's only editing surface is the worklog calendar.

Approach: **Full schema replacement** — remove all fields not applicable to live-in foreign caregivers. No data migration needed (all existing data is seed/demo data; the seed script is updated as part of this work).

---

## Section 1 — Data Model Changes

### 1a. Worklog — new `rest_day` entry type

`WorkLogEntryType` gains a fifth value: `'rest_day'`.

- Represents a weekly rest day (25h) that the employee worked — triggering the 150% premium (₪426.35).
- Added to: `shared/src/types/worklog.types.ts`, `server/src/domains/worklog/worklog.model.ts`
- `WorkLogMonthSummary` gains `restDays: number`
- `getMonthSummary` service counts distinct dates with `type === 'rest_day'`
- Worklog calendar legend gets a new color for rest day
- `DayEntryDialog` exposes `rest_day` as a selectable type

### 1b. Employee model — contract settings (new fields)

Added to `IEmployee` (shared types) and `EmployeeSchema` (server model):

| Field | Type | Default | Notes |
|---|---|---|---|
| `hasPocketMoney` | boolean | false | ₪100/weekend in contract |
| `weeklyRestDay` | `'friday' \| 'saturday' \| 'sunday'` | `'saturday'` | Used to count weekends for pocket money |
| `medicalInsuranceMonthlyCost` | number | 0 | Actual cost employer pays |
| `accommodationDeduction` | number | 0 | Monthly amount agreed |
| `utilitiesDeduction` | number | 0 | Monthly, max ₪94.34 |
| `hasFoodDeduction` | boolean | false | Written consent in contract |

These are shown in a new "הגדרות חוזה" section on the employee edit form.

### 1c. User model — employer info (new fields)

Added to `IUser` (shared types) and `UserSchema` (server model):

| Field | Type |
|---|---|
| `employerName` | `MultiLangString` |
| `employerTaxId` | string |
| `employerAddress?` | string |
| `employerCity?` | string |
| `employerZip?` | string |

Shown in Settings page. In impersonation mode, the payslip uses the **employee's actual owner's** profile (not the impersonating admin's).

### 1d. Payslip schema — full reshape

#### Removed fields

| Section | Removed |
|---|---|
| `workDetails` | `standardDays`, `overtime100h`, `overtime125h`, `overtime150h` |
| `payCalculation` | `overtimePay`, `vacationPay` |
| `deductions` | `nationalInsurance` (employee side), `healthInsurance` (employee side) |
| `employerContributions` | `pensionFund`, `pensionEmployeeRate`, `pensionEmployerRate`, `educationFund`, `educationFundEmployee` |
| `employeeInfo` | `jobTitle`, `department`, `familyStatus`, `grade`, `jobFraction`, `taxCalcType`, `nationalInsuranceType`, `salaryBasis`, `employeeAddress`, `employeeCity`, `employeeZip`, `employerRegistrationNumber`, `taxFileNumber`, `employeeNumber` |
| top-level | `customPayItems` |

#### New / replaced shape

```typescript
employeeInfo: {
  fullName: MultiLangString       // from employee
  passportNumber: string          // from employee
  nationality: string             // from employee
  employerName: MultiLangString   // from user profile
  employerTaxId: string           // from user profile
  employerAddress?: string
  employerCity?: string
  employerZip?: string
  employmentStartDate: string     // from employee.startDate
  seniorityMonths: number         // calculated
}

workDetails: {
  workedDays: number
  restDaysWorked: number          // NEW — from worklog rest_day entries
  vacationDays: number
  sickDays: number
  holidayDays: number
}

payCalculation: {
  minimumWage: number             // 6443.85 (constant)
  dailyRate: number               // 257.75 (constant)
  baseSalary: number              // = minimumWage
  restDayPremium: number          // restDaysWorked × 426.35
  holidayPremium: number          // holidaysWorked × 426.35 (if worked on holiday)
  sickPayAdjustment: number       // net reduction for sick days
  recoveryPay: number             // דמי הבראה if applicable
  pocketMoneyPaid: number         // advance paid this month
  grossSalary: number             // sum
}

deductions: {
  medicalInsuranceDeduction: number   // min(actualCost/2, 164.91)
  accommodationDeduction: number
  utilitiesDeduction: number
  foodDeduction: number               // hasFoodDeduction ? min(10% gross, cap) : 0
  incomeTax: number                   // 0 at minimum wage
  totalPermittedDeductions: number    // enforced ≤ 25% of gross
}

employerContributions: {
  nii: number                         // 3.6% × netSalary
  pensionSubstitute: number           // 6.5% × 6443.85 (from month 7)
  severanceSubstitute: number         // 6.0% × 6443.85 (from month 7)
  cumulativePensionBalance: number    // carried from prev payslip
  cumulativeSeveranceBalance: number  // carried from prev payslip
}

netSalary: number
bankTransfer: number                  // netSalary − pocketMoneyPaid

vacationAccount: {
  previousBalance: number   // from prev payslip remaining
  accrued: number           // 14/12 per month (years 1-5), higher for longer tenure
  used: number              // from worklog
  remaining: number
}

sickAccount: {
  previousBalance: number   // from prev payslip remaining
  accrued: number           // 1.5 per month
  used: number              // from worklog
  remaining: number
}

paymentInfo: { paymentMethod, bankName, accountNumber, branchNumber }
```

---

## Section 2 — Calculation Engine & Flow

### 2a. Four data sources (fetched in parallel on form init)

1. **Employee** — name, passport, nationality, startDate, contract settings
2. **User profile** (employee's owner) — employer info
3. **Worklog summary** `(employeeId, year, month)` — all day counts
4. **Previous payslip** — most recent payslip for this employee before this period (for carry-forward balances)

### 2b. Pure calculation function

`client/src/domains/payslip/payslip.calculations.ts` — `computePayslip(sources)` → `PayslipFormValues`

```
seniority          = months(employee.startDate → period)
minimumWage        = 6443.85
dailyRate          = 257.75

baseSalary         = minimumWage
restDayPremium     = worklog.restDaysWorked × 426.35
holidayPremium     = worklog.holidayDaysWorked × 426.35
  // NOTE: worklog 'holiday' type = employee did NOT work (full pay, no premium).
  // A separate 'holiday_worked' entry type is NOT added — instead, a holiday on which
  // the employee DID work is logged as 'rest_day' (same 150% premium rate per PAY_SLIP_101 §3.3).
  // holidayDaysWorked is derived as entries where type === 'rest_day' AND the date
  // falls on one of the employee's 9 chosen holidays. For simplicity in v1:
  // the form shows restDayPremium as a single line covering both rest days and worked holidays.
sickPayAdjustment  = −(day1 × 257.75) − (days2to3 × 128.88)
grossSalary        = baseSalary + restDayPremium + holidayPremium
                   + recoveryPay + sickPayAdjustment

medicalDeduction   = min(employee.medicalInsuranceMonthlyCost / 2, 164.91)
foodDeduction      = employee.hasFoodDeduction ? min(gross × 0.10, 644.39) : 0
totalDeductions    = clamp(medical + accommodation + utilities + food, max: gross × 0.25)
incomeTax          = 0
netSalary          = grossSalary − totalDeductions

weekendsInMonth    = count of days matching employee.weeklyRestDay in the month
pocketMoneyPaid    = employee.hasPocketMoney ? weekendsInMonth × 100 : 0
bankTransfer       = netSalary − pocketMoneyPaid

nii                = netSalary × 0.036
pensionSubstitute  = seniority >= 7 ? 6443.85 × 0.065 : 0
severanceSubstitute= seniority >= 7 ? 6443.85 × 0.060 : 0
cumulativePension  = (prev?.employerContributions.cumulativePensionBalance ?? 0) + pensionSubstitute
cumulativeSeverance= (prev?.employerContributions.cumulativeSeveranceBalance ?? 0) + severanceSubstitute

vacationAccrued    = vacationDaysPerYear(seniority) / 12
vacationRemaining  = (prev?.vacationAccount.remaining ?? 0) + vacationAccrued − worklog.vacationDays

sickAccrued        = 1.5
sickRemaining      = (prev?.sickAccount.remaining ?? 0) + sickAccrued − worklog.sickDays
```

`vacationDaysPerYear(seniority)` → 14 (years 1-5), 16 (year 6), 18 (year 7), +1 each year after.

### 2c. New API endpoint

`GET /api/forms/previous?employeeId=X&year=Y&month=M`

Returns the most recent `formType: 'payslip'` for this employee with period strictly before `(year, month)`. Returns `{ data: null }` if none exists.

### 2d. Entry flow

Two entry points:
- **WorkLog page** — "צור תלוש" button (month already selected). Navigates to `/forms/new?employeeId=X&year=Y&month=M`.
- **Employee detail page** — "תלוש חדש" button with a month/year picker before navigating.

`NewFormPage` fetches all four sources, calls `computePayslip()`, resets the form to the result.

---

## Section 3 — UI Form Structure

All fields are **disabled** (read-only). The form is a payslip display, not a data entry screen.

### Form sections

| # | Section | Hebrew | Source |
|---|---|---|---|
| 1 | Header | פרטי מעסיק ועובד | User profile + Employee |
| 2 | Work summary | יומן עבודה | Worklog |
| 3 | Pay calculation | חישוב שכר | Calculated |
| 4 | Deductions | ניכויים | Contract settings |
| 5 | Net pay | שכר נטו | Calculated |
| 6 | Employer memo | עלויות מעסיק | Calculated |
| 7 | Leave balances | יתרות | Calculated + prev payslip |
| 8 | Payment info | אמצעי תשלום | Employee/User |

Section 2 includes a small "ערוך ביומן ←" link back to the worklog for that month.

### Removed UI sections / components

- Overtime fields from `WorkDetailsSection`
- Vacation pay / overtime pay lines from `PaySection`
- Employee-side NII / health insurance from `DeductionsSection`
- Pension fund / education fund from `EmployerContributionsSection`
- `CustomPayItemsSection` — removed entirely

### Seed script

`server/scripts/seed.ts` is updated to:
- Add employer info fields to mock users
- Add contract settings to mock employees
- Include `rest_day` worklog entries for some employees
- Use the new payslip schema (new fields, removed fields)
- Remove old irrelevant payslip fields

---

## Out of Scope

- Recovery pay month selection (when to trigger דמי הבראה) — manual input on the form for now, defaults to 0
- Income tax overrides — always 0, no override UI needed yet
- Multiple employees per employer entity — one employer profile per user account

---

## Constants (April 2026)

| Constant | Value |
|---|---|
| Minimum monthly wage | ₪6,443.85 |
| Daily rate (÷25) | ₪257.75 |
| Rest day / holiday premium | ₪426.35 |
| Medical deduction ceiling | ₪164.91/month |
| Utilities deduction ceiling | ₪94.34/month |
| Food deduction ceiling | 10% of salary |
| Total deductions ceiling | 25% of gross |
| NII rate (employer only) | 3.6% of net paid |
| Pension substitute | 6.5% from month 7 |
| Severance substitute | 6.0% from month 7 |
| Pocket money | ₪100/weekend (if in contract) |
