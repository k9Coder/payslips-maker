import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { IForm } from '@payslips-maker/shared';

// Register Heebo Hebrew font once (guard against HMR double-registration)
if (!(window as unknown as Record<string, boolean>).__heeboFontRegistered) {
  Font.register({
    family: 'Heebo',
    fonts: [
      { src: '/fonts/Heebo-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Heebo-Medium.ttf', fontWeight: 500 },
      { src: '/fonts/Heebo-Bold.ttf', fontWeight: 700 },
    ],
  });
  (window as unknown as Record<string, boolean>).__heeboFontRegistered = true;
}

const COLORS = {
  primary: '#1d4ed8',
  border: '#e2e8f0',
  muted: '#64748b',
  heading: '#1e293b',
  background: '#f8fafc',
  white: '#ffffff',
  deduction: '#dc2626',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Heebo',
    fontSize: 10,
    direction: 'rtl',
    padding: 30,
    backgroundColor: COLORS.white,
  },
  // Header
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `2px solid ${COLORS.primary}`,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.primary,
  },
  headerSubtext: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
  },
  titleBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  periodText: {
    fontSize: 11,
    fontWeight: 500,
    color: COLORS.heading,
    marginTop: 4,
  },
  // Employee info bar
  employeeBar: {
    backgroundColor: COLORS.background,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 14,
    borderRadius: 4,
    border: `1px solid ${COLORS.border}`,
  },
  employeeField: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: 8,
    color: COLORS.muted,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    fontWeight: 500,
    color: COLORS.heading,
  },
  // Two-column table
  tableContainer: {
    flexDirection: 'row-reverse',
    marginBottom: 14,
    gap: 8,
  },
  tableColumn: {
    flex: 1,
  },
  tableHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  tableHeaderText: {
    color: COLORS.white,
    fontWeight: 700,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableRowAlt: {
    backgroundColor: COLORS.background,
  },
  tableCellLabel: {
    fontSize: 9,
    color: COLORS.heading,
  },
  tableCellValue: {
    fontSize: 9,
    fontWeight: 500,
    color: COLORS.heading,
    textAlign: 'left',
  },
  deductionValue: {
    color: COLORS.deduction,
  },
  // Totals row
  totalsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: COLORS.heading,
  },
  totalsText: {
    color: COLORS.white,
    fontWeight: 700,
    fontSize: 10,
  },
  // Net salary highlight
  netSalaryBox: {
    backgroundColor: COLORS.primary,
    padding: 12,
    marginBottom: 14,
    borderRadius: 4,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netSalaryLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 700,
  },
  netSalaryValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 700,
  },
  // Bottom section
  bottomSection: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 20,
  },
  bottomBox: {
    flex: 1,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
  },
  bottomBoxHeader: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  bottomBoxHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.heading,
    textAlign: 'right',
  },
  bottomBoxRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // Signature
  signatureRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    gap: 40,
    marginTop: 10,
    paddingTop: 10,
    borderTop: `1px solid ${COLORS.border}`,
  },
  signatureField: {
    alignItems: 'flex-end',
  },
  signatureLine: {
    width: 160,
    borderBottom: `1px solid ${COLORS.heading}`,
    marginBottom: 4,
    height: 20,
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textAlign: 'right',
  },
});

function formatCurrencyPDF(amount: number): string {
  return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const MONTH_NAMES = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

interface PayslipPDFProps {
  form: IForm;
}

export function PayslipPDF({ form }: PayslipPDFProps) {
  const { employeeInfo, period, workDetails, payCalculation, deductions, employerContributions, paymentInfo, netSalary } = form;

  const totalDeductions = deductions.incomeTax + deductions.nationalInsurance + deductions.healthInsurance + deductions.otherDeductions;
  const periodLabel = `${MONTH_NAMES[period.month]} ${period.year}`;

  return (
    <Document title={`תלוש שכר - ${employeeInfo.fullName} - ${periodLabel}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{employeeInfo.employerName}</Text>
            <Text style={styles.headerSubtext}>ח.פ / מ.ע: {employeeInfo.employerTaxId}</Text>
          </View>
          <View style={styles.headerLeft}>
            <Text style={styles.titleBadge}>תלוש שכר</Text>
            <Text style={styles.periodText}>{periodLabel}</Text>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.employeeBar}>
          <View style={styles.employeeField}>
            <Text style={styles.fieldLabel}>שם עובד</Text>
            <Text style={styles.fieldValue}>{employeeInfo.fullName}</Text>
          </View>
          <View style={styles.employeeField}>
            <Text style={styles.fieldLabel}>מספר זהות / דרכון</Text>
            <Text style={styles.fieldValue}>{employeeInfo.idNumber}</Text>
          </View>
          <View style={styles.employeeField}>
            <Text style={styles.fieldLabel}>לאום</Text>
            <Text style={styles.fieldValue}>{employeeInfo.nationality}</Text>
          </View>
          <View style={styles.employeeField}>
            <Text style={styles.fieldLabel}>ימי עבודה בפועל</Text>
            <Text style={styles.fieldValue}>{workDetails.workedDays} / {workDetails.standardDays}</Text>
          </View>
          <View style={styles.employeeField}>
            <Text style={styles.fieldLabel}>תעריף יומי</Text>
            <Text style={styles.fieldValue}>{formatCurrencyPDF(payCalculation.dailyRate)}</Text>
          </View>
        </View>

        {/* Earnings / Deductions two-column table */}
        <View style={styles.tableContainer}>
          {/* Earnings column */}
          <View style={styles.tableColumn}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>הכנסות</Text>
              <Text style={styles.tableHeaderText}>סכום</Text>
            </View>
            {[
              { label: 'שכר בסיס', value: payCalculation.baseSalary },
              ...(payCalculation.overtimePay > 0 ? [{ label: 'שעות נוספות', value: payCalculation.overtimePay }] : []),
              ...(payCalculation.vacationPay > 0 ? [{ label: 'פדיון חופשה', value: payCalculation.vacationPay }] : []),
            ].map((row, i) => (
              <View key={row.label} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={styles.tableCellLabel}>{row.label}</Text>
                <Text style={styles.tableCellValue}>{formatCurrencyPDF(row.value)}</Text>
              </View>
            ))}
            {/* Work details footnotes */}
            {workDetails.vacationDays > 0 && (
              <View style={[styles.tableRow, { backgroundColor: '#f0f9ff' }]}>
                <Text style={styles.tableCellLabel}>ימי חופשה: {workDetails.vacationDays}</Text>
                <Text style={styles.tableCellValue}></Text>
              </View>
            )}
            {workDetails.sickDays > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>ימי מחלה: {workDetails.sickDays}</Text>
                <Text style={styles.tableCellValue}></Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsText}>ברוטו</Text>
              <Text style={styles.totalsText}>{formatCurrencyPDF(payCalculation.grossSalary)}</Text>
            </View>
          </View>

          {/* Deductions column */}
          <View style={styles.tableColumn}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>ניכויים</Text>
              <Text style={styles.tableHeaderText}>סכום</Text>
            </View>
            {[
              { label: 'מס הכנסה', value: deductions.incomeTax },
              { label: 'ביטוח לאומי (עובד)', value: deductions.nationalInsurance },
              { label: 'ביטוח בריאות', value: deductions.healthInsurance },
              ...(deductions.otherDeductions > 0 ? [{ label: 'ניכויים אחרים', value: deductions.otherDeductions }] : []),
            ].map((row, i) => (
              <View key={row.label} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={styles.tableCellLabel}>{row.label}</Text>
                <Text style={[styles.tableCellValue, styles.deductionValue]}>
                  -{formatCurrencyPDF(row.value)}
                </Text>
              </View>
            ))}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsText}>סה"כ ניכויים</Text>
              <Text style={styles.totalsText}>-{formatCurrencyPDF(totalDeductions)}</Text>
            </View>
          </View>
        </View>

        {/* Net Salary */}
        <View style={styles.netSalaryBox}>
          <Text style={styles.netSalaryLabel}>נטו לתשלום</Text>
          <Text style={styles.netSalaryValue}>{formatCurrencyPDF(netSalary)}</Text>
        </View>

        {/* Employer contributions + Payment info */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomBox}>
            <View style={styles.bottomBoxHeader}>
              <Text style={styles.bottomBoxHeaderText}>תשלומי מעסיק</Text>
            </View>
            <View style={styles.bottomBoxRow}>
              <Text style={styles.tableCellLabel}>ביטוח לאומי (מעסיק)</Text>
              <Text style={styles.tableCellValue}>{formatCurrencyPDF(employerContributions.nationalInsurance)}</Text>
            </View>
            <View style={[styles.bottomBoxRow, { backgroundColor: COLORS.background }]}>
              <Text style={styles.tableCellLabel}>פנסיה</Text>
              <Text style={styles.tableCellValue}>{formatCurrencyPDF(employerContributions.pension)}</Text>
            </View>
          </View>

          <View style={styles.bottomBox}>
            <View style={styles.bottomBoxHeader}>
              <Text style={styles.bottomBoxHeaderText}>פרטי תשלום</Text>
            </View>
            {paymentInfo.bankName && (
              <View style={styles.bottomBoxRow}>
                <Text style={styles.tableCellLabel}>בנק</Text>
                <Text style={styles.tableCellValue}>{paymentInfo.bankName}</Text>
              </View>
            )}
            {paymentInfo.branchNumber && (
              <View style={[styles.bottomBoxRow, { backgroundColor: COLORS.background }]}>
                <Text style={styles.tableCellLabel}>סניף</Text>
                <Text style={styles.tableCellValue}>{paymentInfo.branchNumber}</Text>
              </View>
            )}
            {paymentInfo.accountNumber && (
              <View style={styles.bottomBoxRow}>
                <Text style={styles.tableCellLabel}>מספר חשבון</Text>
                <Text style={styles.tableCellValue}>{paymentInfo.accountNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureField}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>חתימת המעסיק</Text>
          </View>
          <View style={styles.signatureField}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>תאריך</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
