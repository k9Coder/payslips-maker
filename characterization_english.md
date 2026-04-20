# Product Characterization — Payslip & End-of-Employment Service

> **Context:** A web service that generates payslips and end-of-employment settlements for foreign caregivers employed by Israeli households.

---

## Functional Requirements

### 1. User Accounts & Access

- Users must register with a username (email/password implied — needs confirmation).
- Two distinct service tracks:
  - **Self-service track:** User opens their own account and independently generates payslips.
  - **Premium track:** The business opens the account on behalf of the client, manages it, and handles delivery of generated documents.
- There is no public/anonymous usage — a login is required to generate documents.

### 2. Payslip Generation

- Users can generate a monthly payslip for a caregiver employed by a household.
- **Required input fields:**

  | Field | Notes |
  |---|---|
  | Patient (employer) name | |
  | Patient ID number | |
  | Patient residential area | Used for something — see clarifying questions |
  | Home ownership | Boolean: does the patient own the home? |
  | Caregiver name | |
  | Caregiver passport number | Foreign worker, not Israeli ID |
  | Gross salary | |
  | Hours worked | |
  | Employment percentage | % of full-time position |
  | Hourly/daily rate | |
  | Vacation days | Has a legal cap/limit |
  | Recuperation pay (הבראה) | |
  | Pension | |
  | Severance (פיצויים) | |
  | Holidays | Has a legal cap/limit |
  | Deductions | Have legal limits |
  | Employment start date | |

- Fields with legal limits (vacation days, holidays, deductions) must enforce those limits during input.

### 3. End-of-Employment Settlement (גמר חשבון)

- A separate document/flow from the monthly payslip.
- Calculates the full settlement owed to a caregiver upon termination.
- Expected to be used more frequently (potentially daily) compared to payslips.
- Should be available in the caregiver's own language (see §5).

### 4. Multi-Language Document Output

- The application UI is in **Hebrew**.
- Generated payslips and end-of-employment documents must be exportable in **additional languages** (which languages — see clarifying questions).
- The caregiver-facing documents (especially end-of-employment) should be in the caregiver's native language.

### 5. Document Delivery

- Every generated document can be **downloaded as a file** (PDF assumed).
- Every generated document can be **sent by email**.
- **Premium flow:** Generated documents are delivered to the business (admin), who then forwards them to the client. This is described as a temporary "for now" arrangement.
- **Self-service flow:** Users download/email documents themselves.

### 6. Archive

- The system must maintain an **archive of all generated documents** per user.
- Users (and/or admins) must be able to access past payslips and settlements.

---

## Non-Functional Requirements

| Category | Requirement |
|---|---|
| Language | UI must be in Hebrew; documents in Hebrew + at least one additional language |
| Layout | RTL (right-to-left) throughout |
| Usage pattern | Payslip generation is approximately once per month per caregiver; end-of-employment settlements may occur daily |
| Roles | At minimum two roles: regular user and admin/premium manager |
| Deliverability | System must support email delivery of generated PDFs |
| Data retention | Archive must persist all generated documents per account |

---

## Clarifying Questions

The following points are below 80% confidence and require answers before implementation:

### High Priority

1. **Languages for document output**
   What specific languages must payslips and settlements be generated in? (e.g., Filipino/Tagalog, Thai, Amharic, Hindi?) Is there a fixed list, or should this be dynamic/configurable?

2. **Two tracks — exact difference**
   In the self-service track, does the user register themselves, or does the business always create the account? In the premium track, is the client ever given portal access, or do they only receive documents by email?

3. **Premium delivery flow**
   "The payslips come down to us and we send to the client — for now." Does this mean:
   - The system auto-sends to an admin email, who manually forwards?
   - Or admin has a dashboard where they review and approve before sending?
   What is the intended long-term flow?

4. **Email sending — who/what sends it?**
   Is email delivery triggered by the user clicking a button, or is it automatic upon generation? Who is the email sent to — the user, the patient (employer), the caregiver, or all three?

5. **Field limits — values**
   What are the specific legal limits for:
   - Maximum vacation days per year?
   - Maximum holiday days?
   - Deduction caps?
   (These are needed to implement validation correctly.)

### Medium Priority

6. **Residential area field**
   What is the "patient residential area" used for in the payslip calculation? Is it for tax purposes, allowance calculations, or just informational?

7. **Home ownership field**
   What does "does the patient own the home?" affect in the payslip? Is it a legal/tax factor?

8. **Archive — access rights**
   Can users see only their own archive? Can admins see all archives? Is there a per-caregiver view (all payslips for one caregiver across months)?

9. **New client onboarding**
   You mentioned "maybe we open a username for them first, then they generate on their own." Is this confirmed, or is there also a fully self-registration option (user signs up without admin involvement)?

10. **End-of-employment — input fields**
    What fields are needed specifically for the end-of-employment settlement that aren't already on the payslip? (e.g., termination date, reason for termination, accumulated balances?)
