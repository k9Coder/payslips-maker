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
  primary: '#1d4ed8',
  border: '#e2e8f0',
  muted: '#64748b',
  heading: '#1e293b',
  background: '#f8fafc',
  white: '#ffffff',
  deduction: '#dc2626',
};

const stylesCache = new Map<string, ReturnType<typeof StyleSheet.create>>();

function makeStyles(rtl: boolean, font: string) {
  const key = `${rtl}:${font}`;
  const cached = stylesCache.get(key);
  if (cached) return cached;

  const textAlign = rtl ? 'right' : 'left';
  const rowDir = rtl ? 'row-reverse' : 'row';

  const styles = StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: 10,
      direction: rtl ? 'rtl' : 'ltr',
      padding: 30,
      backgroundColor: COLORS.white,
    },
    header: {
      flexDirection: rowDir,
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: `2px solid ${COLORS.primary}`,
    },
    companyName: { fontSize: 16, fontWeight: 700, color: COLORS.primary, textAlign },
    headerSubtext: { fontSize: 9, color: COLORS.muted, marginTop: 2, textAlign },
    titleBadge: {
      backgroundColor: COLORS.primary,
      color: COLORS.white,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: 13,
      fontWeight: 700,
      textAlign: 'center',
    },
    employeeBox: {
      flexDirection: rowDir,
      justifyContent: 'space-between',
      backgroundColor: COLORS.background,
      borderRadius: 6,
      padding: 10,
      marginBottom: 16,
      border: `1px solid ${COLORS.border}`,
    },
    employeeLabel: { fontSize: 8, color: COLORS.muted },
    employeeValue: { fontSize: 10, fontWeight: 500, color: COLORS.heading },
    table: { marginBottom: 8 },
    tableRow: {
      flexDirection: rowDir,
      borderBottom: `1px solid ${COLORS.border}`,
      paddingVertical: 5,
      paddingHorizontal: 4,
    },
    tableRowAlt: { backgroundColor: COLORS.background },
    colDescription: { flex: 3, textAlign },
    colDetail: { flex: 2, textAlign: 'center', color: COLORS.muted },
    colAmount: { flex: 2, textAlign: rtl ? 'left' : 'right' },
    tableHeader: {
      flexDirection: rowDir,
      backgroundColor: COLORS.primary,
      paddingVertical: 6,
      paddingHorizontal: 4,
      borderRadius: 4,
      marginBottom: 2,
    },
    tableHeaderText: { fontWeight: 700, color: COLORS.white, fontSize: 9 },
    sectionLabel: {
      fontSize: 9,
      fontWeight: 700,
      color: COLORS.muted,
      paddingTop: 6,
      paddingBottom: 2,
      paddingHorizontal: 4,
      textAlign,
    },
    subtotalRow: {
      flexDirection: rowDir,
      paddingVertical: 5,
      paddingHorizontal: 4,
      backgroundColor: '#f0f4ff',
      borderTop: `1px solid ${COLORS.primary}`,
    },
    subtotalLabel: { flex: 5, textAlign, fontWeight: 700, color: COLORS.heading },
    subtotalAmount: { flex: 2, textAlign: rtl ? 'left' : 'right', fontWeight: 700, color: COLORS.heading },
    deductionAmount: { color: COLORS.deduction },
    netBox: {
      backgroundColor: COLORS.primary,
      borderRadius: 6,
      padding: 12,
      flexDirection: rowDir,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    netLabel: { fontSize: 13, fontWeight: 700, color: COLORS.white },
    netAmount: { fontSize: 16, fontWeight: 700, color: COLORS.white },
    footer: {
      marginTop: 24,
      paddingTop: 12,
      borderTop: `1px solid ${COLORS.border}`,
      flexDirection: rowDir,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    footerText: { fontSize: 8, color: COLORS.muted, textAlign },
    signatureLine: { width: 160, borderBottom: `1px solid ${COLORS.heading}`, marginBottom: 4 },
    signatureLabel: { fontSize: 8, color: COLORS.muted, textAlign },
  });

  stylesCache.set(key, styles);
  return styles;
}

function fmt(n: number): string {
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function FinalSettlementPDF({ form, language = 'he' }: { form: IForm; language?: SupportedLanguage }) {
  const fs = form.finalSettlementData;
  if (!fs) return <Document />;

  const t = getPDFTranslations(language).finalSettlement;
  const font = getFontForLanguage(language);
  const rtl = isRTL(language);
  const styles = makeStyles(rtl, font);

  const { employeeInfo } = form;
  const resolve = (val: MultiLangString | string | undefined | null) =>
    resolveMultiLangString(val, language);
  const totalDeductions =
    fs.deductions.incomeTax +
    fs.deductions.nationalInsurance +
    fs.deductions.healthInsurance +
    fs.deductions.otherDeductions;

  const terminationLabel = t.terminationReasons[fs.terminationReason];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{resolve(employeeInfo.employerName)}</Text>
            {employeeInfo.employerTaxId ? (
              <Text style={styles.headerSubtext}>{employeeInfo.employerTaxId}</Text>
            ) : null}
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.titleBadge}>{t.title}</Text>
            <Text style={[styles.headerSubtext, { marginTop: 6, textAlign: 'center' }]}>
              {fs.employmentStartDate} — {fs.employmentEndDate}
            </Text>
          </View>
          <View>
            <Text style={styles.headerSubtext}>{terminationLabel}</Text>
            <Text style={styles.headerSubtext}>{t.totalMonths}: {fs.totalMonths}</Text>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.employeeBox}>
          <View>
            <Text style={styles.employeeLabel}>{t.employee.name}</Text>
            <Text style={styles.employeeValue}>{resolve(employeeInfo.fullName)}</Text>
          </View>
          <View>
            <Text style={styles.employeeLabel}>{t.employee.idNumber}</Text>
            <Text style={styles.employeeValue}>{employeeInfo.idNumber}</Text>
          </View>
          <View>
            <Text style={styles.employeeLabel}>{t.employee.nationality}</Text>
            <Text style={styles.employeeValue}>{employeeInfo.nationality}</Text>
          </View>
          <View>
            <Text style={styles.employeeLabel}>{t.employee.lastMonthlySalary}</Text>
            <Text style={styles.employeeValue}>{fmt(fs.lastMonthlySalary)}</Text>
          </View>
        </View>

        {/* Breakdown Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>{t.employmentPeriod}</Text>
            <Text style={[styles.tableHeaderText, styles.colDetail]}>{t.totalMonths}</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>₪</Text>
          </View>

          {fs.severanceEligible && (
            <View style={styles.tableRow}>
              <Text style={styles.colDescription}>{t.items.severance}</Text>
              <Text style={styles.colDetail}>{fs.totalMonths}</Text>
              <Text style={styles.colAmount}>{fmt(fs.severancePay)}</Text>
            </View>
          )}

          {fs.unusedVacationDays > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.colDescription}>{t.items.vacationPayout}</Text>
              <Text style={styles.colDetail}>{fs.unusedVacationDays}</Text>
              <Text style={styles.colAmount}>{fmt(fs.vacationPayout)}</Text>
            </View>
          )}

          {fs.recuperationPayout > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDescription}>{t.items.recuperation}</Text>
              <Text style={styles.colDetail}>{fs.recuperationDaysEntitled - fs.recuperationDaysAlreadyPaid}</Text>
              <Text style={styles.colAmount}>{fmt(fs.recuperationPayout)}</Text>
            </View>
          )}

          {!fs.noticeActuallyGiven && fs.noticePeriodPay > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.colDescription}>{t.items.noticePay}</Text>
              <Text style={styles.colDetail}>{fs.noticePeriodDays}</Text>
              <Text style={styles.colAmount}>{fmt(fs.noticePeriodPay)}</Text>
            </View>
          )}

          {fs.unpaidWages > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDescription}>{t.items.unpaidWages}</Text>
              <Text style={styles.colDetail}></Text>
              <Text style={styles.colAmount}>{fmt(fs.unpaidWages)}</Text>
            </View>
          )}

          {fs.otherAdditions > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.colDescription}>{t.items.otherAdditions}</Text>
              <Text style={styles.colDetail}></Text>
              <Text style={styles.colAmount}>{fmt(fs.otherAdditions)}</Text>
            </View>
          )}

          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>{t.subtotalGross}</Text>
            <Text style={styles.subtotalAmount}>{fmt(fs.totalGross)}</Text>
          </View>

          {/* Deductions */}
          <Text style={styles.sectionLabel}>{t.deductions.sectionTitle}</Text>

          {fs.deductions.incomeTax > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDescription}>{t.deductions.incomeTax}</Text>
              <Text style={styles.colDetail}></Text>
              <Text style={[styles.colAmount, styles.deductionAmount]}>-{fmt(fs.deductions.incomeTax)}</Text>
            </View>
          )}
          {fs.deductions.nationalInsurance > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.colDescription}>{t.deductions.nationalInsurance}</Text>
              <Text style={styles.colDetail}></Text>
              <Text style={[styles.colAmount, styles.deductionAmount]}>-{fmt(fs.deductions.nationalInsurance)}</Text>
            </View>
          )}
          {fs.deductions.healthInsurance > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDescription}>{t.deductions.healthInsurance}</Text>
              <Text style={styles.colDetail}></Text>
              <Text style={[styles.colAmount, styles.deductionAmount]}>-{fmt(fs.deductions.healthInsurance)}</Text>
            </View>
          )}
          {fs.deductions.otherDeductions > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.colDescription}>{t.deductions.otherDeductions}</Text>
              <Text style={styles.colDetail}></Text>
              <Text style={[styles.colAmount, styles.deductionAmount]}>-{fmt(fs.deductions.otherDeductions)}</Text>
            </View>
          )}

          {totalDeductions > 0 && (
            <View style={styles.subtotalRow}>
              <Text style={[styles.subtotalLabel, styles.deductionAmount]}>{t.deductions.total}</Text>
              <Text style={[styles.subtotalAmount, styles.deductionAmount]}>-{fmt(totalDeductions)}</Text>
            </View>
          )}
        </View>

        {/* Net Total */}
        <View style={styles.netBox}>
          <Text style={styles.netLabel}>{t.netTotal}</Text>
          <Text style={styles.netAmount}>{fmt(fs.netTotal)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.date}: {new Date().toLocaleDateString('he-IL')}</Text>
          <View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{t.signature}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
