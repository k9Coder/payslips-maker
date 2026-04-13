import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type { IForm, SupportedLanguage, MultiLangString } from '@payslips-maker/shared';
import { resolveMultiLangString } from '@payslips-maker/shared';
import { getPDFTranslations, registerPDFFonts, getFontForLanguage, isRTL } from '@/lib/pdf-translations';

registerPDFFonts();

const COLORS = {
  border: '#aaaaaa',
  headerBg: '#d0d8e8',
  rowAlt: '#f5f5f5',
  text: '#111111',
  muted: '#555555',
  white: '#ffffff',
  totalsRow: '#e8edf5',
  labelText: '#333333',
  sectionBg: '#f8f9fb',
};

// Cache styles per (rtl, font) so StyleSheet.create() is called once per combination,
// preventing repeated yoga WASM Config allocations on every render.
const stylesCache = new Map<string, ReturnType<typeof StyleSheet.create>>();

function makeStyles(rtl: boolean, font: string) {
  const key = `${rtl}:${font}`;
  const cached = stylesCache.get(key);
  if (cached) return cached;

  const textAlign = rtl ? 'right' : 'left';
  const oppAlign = rtl ? 'left' : 'right';
  const rowDir = rtl ? 'row-reverse' : 'row';

  const styles = StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: 7.5,
      direction: rtl ? 'rtl' : 'ltr',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
      backgroundColor: COLORS.white,
    },
    // ── Section 1: Header ─────────────────────────────────────────────
    headerRow: {
      flexDirection: rowDir,
      justifyContent: 'space-between',
      marginBottom: 6,
      paddingBottom: 6,
      borderBottom: `1px solid ${COLORS.border}`,
    },
    companyBlock: {
      alignItems: rtl ? 'flex-end' : 'flex-start',
      border: `1px solid ${COLORS.border}`,
      padding: 6,
    },
    companyName: { fontSize: 11, fontWeight: 700, color: COLORS.text, textAlign },
    headerText: { fontSize: 7.5, color: COLORS.text, textAlign, marginTop: 1.5 },
    titleBlock: { alignItems: rtl ? 'flex-start' : 'flex-end' },
    titleText: { fontSize: 11, fontWeight: 700, color: COLORS.text, textAlign: oppAlign },
    headerSubText: { fontSize: 7.5, color: COLORS.muted, textAlign: oppAlign, marginTop: 1.5 },
    // ── Section 2: Personal Details + Address ─────────────────────────
    section2Row: {
      flexDirection: rowDir,
      marginBottom: 6,
      gap: 6,
    },
    personalBox: {
      flex: 3,
      border: `1px solid ${COLORS.border}`,
    },
    addressBox: {
      flex: 2,
      border: `1px solid ${COLORS.border}`,
    },
    sectionHeaderRow: {
      backgroundColor: COLORS.headerBg,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderBottom: `1px solid ${COLORS.border}`,
    },
    sectionHeaderText: { fontSize: 8, fontWeight: 700, color: COLORS.text, textAlign },
    personalGrid: {
      flexDirection: 'column',
      padding: 4,
    },
    personalGridRow: {
      flexDirection: rowDir,
      marginBottom: 1,
    },
    personalCell: {
      flex: 1,
      paddingHorizontal: 2,
      paddingVertical: 0.5,
    },
    personalLabel: { fontSize: 6.5, color: COLORS.muted, textAlign },
    personalValue: { fontSize: 7.5, fontWeight: 500, color: COLORS.text, textAlign },
    addressContent: { padding: 8 },
    addressLine: { fontSize: 8, color: COLORS.text, textAlign, marginBottom: 2 },
    // ── Section 3: Unified Table ───────────────────────────────────────
    tableWrapper: {
      border: `1px solid ${COLORS.border}`,
      marginBottom: 0,
    },
    tableHeaderRow: {
      flexDirection: rowDir,
      backgroundColor: COLORS.headerBg,
      borderBottom: `1px solid ${COLORS.border}`,
    },
    tableDataRow: {
      flexDirection: rowDir,
      borderBottom: `1px solid ${COLORS.border}`,
      minHeight: 14,
    },
    tableDataRowAlt: { backgroundColor: COLORS.rowAlt },
    colDesc: { flex: 3, paddingHorizontal: 4, paddingVertical: 2, borderInlineEnd: `1px solid ${COLORS.border}` },
    colQty: { flex: 1, paddingHorizontal: 4, paddingVertical: 2, borderInlineEnd: `1px solid ${COLORS.border}` },
    colRate: { flex: 1.5, paddingHorizontal: 4, paddingVertical: 2, borderInlineEnd: `1px solid ${COLORS.border}` },
    colGross: { flex: 1.5, paddingHorizontal: 4, paddingVertical: 2, borderInlineEnd: `1px solid ${COLORS.border}` },
    colTaxPct: { flex: 1, paddingHorizontal: 4, paddingVertical: 2, borderInlineEnd: `1px solid ${COLORS.border}` },
    colPayment: { flex: 2, paddingHorizontal: 4, paddingVertical: 2, borderInlineEnd: `1px solid ${COLORS.border}` },
    colMandDeduct: { flex: 2, paddingHorizontal: 4, paddingVertical: 2, borderInlineEnd: `1px solid ${COLORS.border}` },
    colDeductType: { flex: 1, paddingHorizontal: 4, paddingVertical: 2 },
    thText: { fontSize: 7, fontWeight: 700, color: COLORS.text, textAlign },
    tdText: { fontSize: 7.5, color: COLORS.text, textAlign },
    tdNumText: { fontSize: 7.5, color: COLORS.text, textAlign: oppAlign },
    // ── Section 4: Totals Row ─────────────────────────────────────────
    totalsRow: {
      flexDirection: rowDir,
      backgroundColor: COLORS.totalsRow,
      borderBottom: `1px solid ${COLORS.border}`,
      borderInlineStart: `1px solid ${COLORS.border}`,
      borderInlineEnd: `1px solid ${COLORS.border}`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginBottom: 6,
    },
    totalsLabel: { fontSize: 8, fontWeight: 700, color: COLORS.text, textAlign },
    totalsValue: { fontSize: 8, fontWeight: 700, color: COLORS.text },
    // ── Section 5: Bottom Panels ──────────────────────────────────────
    bottomRow: {
      flexDirection: rowDir,
      gap: 5,
      marginTop: 2,
    },
    bottomPanel: {
      flex: 1,
      border: `1px solid ${COLORS.border}`,
    },
    bottomPanelHeader: {
      backgroundColor: COLORS.headerBg,
      paddingHorizontal: 5,
      paddingVertical: 3,
      borderBottom: `1px solid ${COLORS.border}`,
    },
    bottomPanelHeaderText: { fontSize: 7.5, fontWeight: 700, color: COLORS.text, textAlign },
    bottomKvRow: {
      flexDirection: rowDir,
      justifyContent: 'space-between',
      paddingHorizontal: 5,
      paddingVertical: 1.5,
      borderBottom: `0.5px solid #dddddd`,
    },
    bottomKvLabel: { fontSize: 7, color: COLORS.muted, textAlign },
    bottomKvValue: { fontSize: 7.5, fontWeight: 500, color: COLORS.text, textAlign: oppAlign },
    bottomKvValueBold: { fontSize: 8, fontWeight: 700, color: COLORS.text, textAlign: oppAlign },
    subPanelDivider: {
      borderTop: `1px solid ${COLORS.border}`,
      paddingHorizontal: 5,
      paddingVertical: 2,
      backgroundColor: COLORS.sectionBg,
    },
    subPanelTitle: { fontSize: 7, fontWeight: 700, color: COLORS.text, textAlign },
    // ── Misc ──────────────────────────────────────────────────────────
    fieldLabel: { fontSize: 7.5, color: COLORS.muted },
    fieldValue: { fontSize: 8, fontWeight: 500, color: COLORS.text },
  });

  stylesCache.set(key, styles);
  return styles;
}

function fmtNum(amount: number | undefined | null): string {
  if (!amount) return '';
  return amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDay(n: number | undefined | null): string {
  if (!n) return '';
  return String(n);
}

function todayFormatted(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

interface PayslipPDFProps {
  form: IForm;
  language?: SupportedLanguage;
}

export function PayslipPDF({ form, language = 'he' }: PayslipPDFProps) {
  const t = getPDFTranslations(language).payslip;
  const font = getFontForLanguage(language);
  const rtl = isRTL(language);
  const styles = makeStyles(rtl, font);
  const resolve = (val: MultiLangString | string | undefined | null) =>
    resolveMultiLangString(val, language);

  const {
    employeeInfo,
    period,
    workDetails,
    payCalculation,
    deductions,
    employerContributions,
    paymentInfo,
    netSalary,
    customPayItems = [],
    vacationAccount,
    sickAccount,
  } = form;

  const periodLabel = `${t.months[period.month]}/${period.year}`;

  // Build earnings rows
  const earningsRows: Array<{ code: string; desc: string; qty?: number; rate?: number; gross?: number; taxPct?: number; payment?: number }> = [
    { code: '01', desc: t.earnings.baseSalary, qty: workDetails.workedDays, rate: payCalculation.dailyRate, payment: payCalculation.baseSalary },
    ...(workDetails.overtime125h > 0 ? [{ code: '06', desc: t.earnings.overtime125, qty: workDetails.overtime125h, payment: undefined }] : []),
    ...(workDetails.overtime150h > 0 ? [{ code: '07', desc: t.earnings.overtime150, qty: workDetails.overtime150h, payment: undefined }] : []),
    ...(payCalculation.overtimePay > 0 && workDetails.overtime125h === 0 && workDetails.overtime150h === 0
      ? [{ code: '06', desc: t.earnings.overtimePay, payment: payCalculation.overtimePay }]
      : []),
    ...(payCalculation.vacationPay > 0 ? [{ code: '09', desc: t.earnings.vacationPay, payment: payCalculation.vacationPay }] : []),
    ...customPayItems.map(item => ({
      code: item.code,
      desc: resolve(item.description),
      qty: item.quantity,
      rate: item.rate,
      gross: undefined,
      taxPct: item.taxPercent,
      payment: item.amount,
    })),
  ];

  // Build deduction rows (using short labels for the deduction type column)
  const deductionRows: Array<{ desc: string; amount: number }> = [
    ...(deductions.incomeTax > 0 ? [{ desc: t.deductionRows.incomeTaxShort, amount: deductions.incomeTax }] : []),
    ...(deductions.nationalInsurance > 0 ? [{ desc: t.deductionRows.niShort, amount: deductions.nationalInsurance }] : []),
    ...(deductions.healthInsurance > 0 ? [{ desc: t.deductionRows.healthShort, amount: deductions.healthInsurance }] : []),
    ...(employerContributions.pension > 0 ? [{ desc: t.deductionRows.pensionShort, amount: employerContributions.pension }] : []),
    ...(deductions.otherDeductions > 0 ? [{ desc: t.deductionRows.otherDeductions, amount: deductions.otherDeductions }] : []),
  ];

  const totalMandatoryDeductions =
    deductions.incomeTax + deductions.nationalInsurance + deductions.healthInsurance + deductions.otherDeductions;

  const maxRows = Math.max(earningsRows.length, deductionRows.length);
  const tableRows = Array.from({ length: maxRows }, (_, i) => ({
    earnings: earningsRows[i] ?? null,
    deduction: deductionRows[i] ?? null,
  }));

  return (
    <Document title={`${t.title} - ${resolve(employeeInfo.fullName)} - ${periodLabel}`}>
      <Page size="A4" style={styles.page}>

        {/* ── Section 1: Header ────────────────────────────────────── */}
        <View style={styles.headerRow}>
          {/* Company block (right in RTL) — bordered box with labeled fields */}
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{t.header.company}: {resolve(employeeInfo.employerName)}</Text>
            {!!employeeInfo.employerAddress && (
              <Text style={styles.headerText}>{t.header.address}: {employeeInfo.employerAddress}</Text>
            )}
            {!!(employeeInfo.employerCity || employeeInfo.employerZip) && (
              <Text style={styles.headerText}>
                {t.header.cityZip}: {[employeeInfo.employerCity, employeeInfo.employerZip].filter(Boolean).join(' ')}
              </Text>
            )}
            <Text style={styles.headerText}>
              {t.header.taxFileNumber}: {employeeInfo.taxFileNumber ?? employeeInfo.employerTaxId}
            </Text>
            {!!employeeInfo.employerRegistrationNumber && (
              <Text style={styles.headerText}>
                {t.header.employerRegistrationNumber}: {employeeInfo.employerRegistrationNumber}
              </Text>
            )}
          </View>
          {/* Title block (left in RTL) */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleText}>{t.title} {periodLabel}</Text>
            <Text style={styles.headerSubText}>{t.printedOn}: {todayFormatted()}</Text>
          </View>
        </View>

        {/* ── Section 2: Personal Details + Address ───────────────── */}
        <View style={styles.section2Row}>
          {/* Personal Details box (larger, left in RTL = right visually) */}
          <View style={styles.personalBox}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>{t.personalDetails.sectionTitle}</Text>
            </View>
            <View style={styles.personalGrid}>
              {/* Row 1: employeeNumber | taxCalcType | nationalInsuranceType | jobFraction */}
              <View style={styles.personalGridRow}>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.employeeNumber}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.employeeNumber ?? ''}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.taxCalcType}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.taxCalcType ?? ''}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.nationalInsuranceType}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.nationalInsuranceType ?? ''}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.jobFraction}</Text>
                  <Text style={styles.personalValue}>
                    {employeeInfo.jobFraction != null ? employeeInfo.jobFraction.toFixed(4) : '1.0000'}
                  </Text>
                </View>
              </View>
              {/* Row 2: employmentStartDate | idNumber | jobTitle | salaryBasis */}
              <View style={styles.personalGridRow}>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.employmentStartDate}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.employmentStartDate ?? ''}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.idNumber}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.idNumber}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.jobTitle}</Text>
                  <Text style={styles.personalValue}>{resolve(employeeInfo.jobTitle)}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.salaryBasis}</Text>
                  <Text style={styles.personalValue}>
                    {employeeInfo.salaryBasis
                      ? t.personalDetails.salaryBasisValues[employeeInfo.salaryBasis]
                      : t.personalDetails.salaryBasisValues.monthly}
                  </Text>
                </View>
              </View>
              {/* Row 3: department | familyStatus | grade | workedDays/standardDays */}
              <View style={styles.personalGridRow}>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.department}</Text>
                  <Text style={styles.personalValue}>{resolve(employeeInfo.department)}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.familyStatus}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.familyStatus ?? ''}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.grade}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.grade ?? ''}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.additionalData.workedDays}</Text>
                  <Text style={styles.personalValue}>{workDetails.workedDays}/{workDetails.standardDays}</Text>
                </View>
              </View>
              {/* Row 4 (bank): bankCode/branch | accountNumber | nationality */}
              <View style={styles.personalGridRow}>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.bankCode}</Text>
                  <Text style={styles.personalValue}>
                    {[paymentInfo.bankName, paymentInfo.branchNumber].filter(Boolean).join('/')}
                  </Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.personalDetails.bankAccount}</Text>
                  <Text style={styles.personalValue}>{paymentInfo.accountNumber}</Text>
                </View>
                <View style={styles.personalCell}>
                  <Text style={styles.personalLabel}>{t.employee.nationality}</Text>
                  <Text style={styles.personalValue}>{employeeInfo.nationality}</Text>
                </View>
                <View style={styles.personalCell} />
              </View>
            </View>
          </View>

          {/* Address box (לכבוד) (right in RTL = left visually) */}
          <View style={styles.addressBox}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>{t.addressBox.sectionTitle}</Text>
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressLine}>{resolve(employeeInfo.fullName)}</Text>
              {!!employeeInfo.employeeAddress && (
                <Text style={styles.addressLine}>{employeeInfo.employeeAddress}</Text>
              )}
              {!!(employeeInfo.employeeCity || employeeInfo.employeeZip) && (
                <Text style={styles.addressLine}>
                  {[employeeInfo.employeeCity, employeeInfo.employeeZip].filter(Boolean).join(' ')}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Section 3: Unified Earnings/Deductions Table ────────── */}
        <View style={styles.tableWrapper}>
          {/* Table header */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.colDesc}><Text style={styles.thText}>{t.table.paymentCode}</Text></View>
            <View style={styles.colQty}><Text style={styles.thText}>{t.table.quantity}</Text></View>
            <View style={styles.colRate}><Text style={styles.thText}>{t.table.rate}</Text></View>
            <View style={styles.colGross}><Text style={styles.thText}>{t.table.grossAmount}</Text></View>
            <View style={styles.colTaxPct}><Text style={styles.thText}>{t.table.taxPercent}</Text></View>
            <View style={styles.colPayment}><Text style={styles.thText}>{t.table.payment}</Text></View>
            <View style={styles.colMandDeduct}><Text style={styles.thText}>{t.table.mandatoryDeduction}</Text></View>
            <View style={styles.colDeductType}><Text style={styles.thText}>{t.table.deductionType}</Text></View>
          </View>

          {/* Table rows */}
          {tableRows.map((row, i) => (
            <View key={i} style={[styles.tableDataRow, i % 2 === 1 ? styles.tableDataRowAlt : {}]}>
              {/* Earnings columns */}
              <View style={styles.colDesc}>
                {row.earnings && (
                  <Text style={styles.tdText}>{row.earnings.code} {row.earnings.desc}</Text>
                )}
              </View>
              <View style={styles.colQty}>
                {row.earnings?.qty != null && (
                  <Text style={styles.tdNumText}>{fmtDay(row.earnings.qty)}</Text>
                )}
              </View>
              <View style={styles.colRate}>
                {row.earnings?.rate != null && (
                  <Text style={styles.tdNumText}>{fmtNum(row.earnings.rate)}</Text>
                )}
              </View>
              <View style={styles.colGross}>
                {row.earnings?.gross != null && (
                  <Text style={styles.tdNumText}>{fmtNum(row.earnings.gross)}</Text>
                )}
              </View>
              <View style={styles.colTaxPct}>
                {row.earnings?.taxPct != null && (
                  <Text style={styles.tdNumText}>{row.earnings.taxPct}</Text>
                )}
              </View>
              <View style={styles.colPayment}>
                {row.earnings?.payment != null && (
                  <Text style={styles.tdNumText}>{fmtNum(row.earnings.payment)}</Text>
                )}
              </View>
              {/* Deduction columns */}
              <View style={styles.colMandDeduct}>
                {row.deduction && (
                  <Text style={styles.tdNumText}>{fmtNum(row.deduction.amount)}</Text>
                )}
              </View>
              <View style={styles.colDeductType}>
                {row.deduction && (
                  <Text style={styles.tdText}>{row.deduction.desc}</Text>
                )}
              </View>
            </View>
          ))}

          {/* Padding rows if table is short (min 7 rows for visual density) */}
          {Array.from({ length: Math.max(0, 7 - tableRows.length) }).map((_, i) => (
            <View key={`pad-${i}`} style={[styles.tableDataRow, (tableRows.length + i) % 2 === 1 ? styles.tableDataRowAlt : {}]}>
              <View style={styles.colDesc}><Text style={styles.tdText}> </Text></View>
              <View style={styles.colQty} />
              <View style={styles.colRate} />
              <View style={styles.colGross} />
              <View style={styles.colTaxPct} />
              <View style={styles.colPayment} />
              <View style={styles.colMandDeduct} />
              <View style={styles.colDeductType} />
            </View>
          ))}
        </View>

        {/* ── Section 4: Totals Row ────────────────────────────────── */}
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>{t.deductionRows.totalMandatoryDeductions}</Text>
          <Text style={styles.totalsValue}>{fmtNum(totalMandatoryDeductions)}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.totalsLabel}>{t.earnings.grossSalary}</Text>
          <Text style={styles.totalsValue}>{fmtNum(payCalculation.grossSalary)}</Text>
        </View>

        {/* ── Section 5: Bottom Panels ─────────────────────────────── */}
        <View style={styles.bottomRow}>

          {/* Panel 1: Tax data */}
          <View style={styles.bottomPanel}>
            <View style={styles.bottomPanelHeader}>
              <Text style={styles.bottomPanelHeaderText}>{t.taxData.sectionTitle}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.taxData.cumulativeGross}</Text>
              <Text style={styles.bottomKvValue}>{fmtNum(payCalculation.grossSalary)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.taxData.cumulativeTax}</Text>
              <Text style={styles.bottomKvValue}>{fmtNum(deductions.incomeTax)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.additionalData.creditPoints}</Text>
              <Text style={styles.bottomKvValue}>2.25</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.employerContributions.nationalInsurance}</Text>
              <Text style={styles.bottomKvValue}>{fmtNum(employerContributions.nationalInsurance)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.employerContributions.pension}</Text>
              <Text style={styles.bottomKvValue}>{fmtNum(employerContributions.pension)}</Text>
            </View>
            {employerContributions.educationFund != null && employerContributions.educationFund > 0 && (
              <View style={styles.bottomKvRow}>
                <Text style={styles.bottomKvLabel}>{t.employerContributions.educationFund}</Text>
                <Text style={styles.bottomKvValue}>{fmtNum(employerContributions.educationFund)}</Text>
              </View>
            )}
            {employerContributions.severanceFund != null && employerContributions.severanceFund > 0 && (
              <View style={styles.bottomKvRow}>
                <Text style={styles.bottomKvLabel}>{t.employerContributions.severanceFund}</Text>
                <Text style={styles.bottomKvValue}>{fmtNum(employerContributions.severanceFund)}</Text>
              </View>
            )}
          </View>

          {/* Panel 2: Additional data */}
          <View style={styles.bottomPanel}>
            <View style={styles.bottomPanelHeader}>
              <Text style={styles.bottomPanelHeaderText}>{t.additionalData.sectionTitle}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.additionalData.standardDays}</Text>
              <Text style={styles.bottomKvValue}>{fmtDay(workDetails.standardDays)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.additionalData.workedDays}</Text>
              <Text style={styles.bottomKvValue}>{fmtDay(workDetails.workedDays)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.additionalData.vacationDays}</Text>
              <Text style={styles.bottomKvValue}>{fmtDay(workDetails.vacationDays)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.additionalData.sickDays}</Text>
              <Text style={styles.bottomKvValue}>{fmtDay(workDetails.sickDays)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.additionalData.holidayDays}</Text>
              <Text style={styles.bottomKvValue}>{fmtDay(workDetails.holidayDays)}</Text>
            </View>
          </View>

          {/* Panel 3: Vacation + Sick accounts */}
          <View style={styles.bottomPanel}>
            <View style={styles.bottomPanelHeader}>
              <Text style={styles.bottomPanelHeaderText}>{t.vacationAccount.sectionTitle}</Text>
            </View>
            {vacationAccount ? (
              <>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.vacationAccount.previousBalance}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(vacationAccount.previousBalance)}</Text>
                </View>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.vacationAccount.accrued}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(vacationAccount.accrued)}</Text>
                </View>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.vacationAccount.used}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(vacationAccount.used)}</Text>
                </View>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.vacationAccount.remaining}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(vacationAccount.remaining)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.bottomKvRow}><Text style={styles.bottomKvLabel}> </Text></View>
            )}
            {/* Sick sub-panel */}
            <View style={styles.subPanelDivider}>
              <Text style={styles.subPanelTitle}>{t.sickAccount.sectionTitle}</Text>
            </View>
            {sickAccount ? (
              <>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.sickAccount.previousBalance}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(sickAccount.previousBalance)}</Text>
                </View>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.sickAccount.accrued}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(sickAccount.accrued)}</Text>
                </View>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.sickAccount.used}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(sickAccount.used)}</Text>
                </View>
                <View style={styles.bottomKvRow}>
                  <Text style={styles.bottomKvLabel}>{t.sickAccount.remaining}</Text>
                  <Text style={styles.bottomKvValue}>{fmtNum(sickAccount.remaining)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.bottomKvRow}><Text style={styles.bottomKvLabel}> </Text></View>
            )}
          </View>

          {/* Panel 4: Net Pay Summary */}
          <View style={styles.bottomPanel}>
            <View style={styles.bottomPanelHeader}>
              <Text style={styles.bottomPanelHeaderText}>{t.netPayBox.netSalary}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.netPayBox.grossSalary}</Text>
              <Text style={styles.bottomKvValue}>{fmtNum(payCalculation.grossSalary)}</Text>
            </View>
            <View style={styles.bottomKvRow}>
              <Text style={styles.bottomKvLabel}>{t.netPayBox.totalDeductions}</Text>
              <Text style={styles.bottomKvValue}>{fmtNum(totalMandatoryDeductions)}</Text>
            </View>
            <View style={[styles.bottomKvRow, { borderTop: `1px solid ${COLORS.border}`, marginTop: 2 }]}>
              <Text style={styles.bottomKvLabel}>{t.netPayBox.netSalary}</Text>
              <Text style={styles.bottomKvValueBold}>{fmtNum(netSalary)}</Text>
            </View>
            <View style={styles.subPanelDivider}>
              <Text style={styles.subPanelTitle}>{t.netPayBox.voluntaryDeductions}</Text>
            </View>
            {deductions.otherDeductions > 0 && (
              <View style={styles.bottomKvRow}>
                <Text style={styles.bottomKvLabel}>{t.deductionRows.otherDeductions}</Text>
                <Text style={styles.bottomKvValue}>{fmtNum(deductions.otherDeductions)}</Text>
              </View>
            )}
            <View style={[styles.bottomKvRow, { marginTop: 2 }]}>
              <Text style={styles.bottomKvLabel}>{t.netPayBox.netPayment}</Text>
              <Text style={styles.bottomKvValueBold}>{fmtNum(netSalary)}</Text>
            </View>
          </View>

        </View>

      </Page>
    </Document>
  );
}
