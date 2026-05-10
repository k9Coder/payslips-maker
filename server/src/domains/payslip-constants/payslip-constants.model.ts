import mongoose, { Schema, Document } from 'mongoose';
import type { IPayslipConstants } from '@payslips-maker/shared';

export interface PayslipConstantsDocument extends Omit<IPayslipConstants, '_id'>, Document {}

const PayslipConstantsSchema = new Schema<PayslipConstantsDocument>(
  {
    minimumMonthlyWage: { type: Number, required: true },
    minimumHourlyWage: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    restDayPremium: { type: Number, required: true },
    medicalDeductionCeiling: { type: Number, required: true },
    utilitiesDeductionCeiling: { type: Number, required: true },
    recoveryPayDayRate: { type: Number, required: true },
    niiEmployerRate: { type: Number, required: true },
    pensionSubstituteRate: { type: Number, required: true },
    severanceSubstituteRate: { type: Number, required: true },
    pocketMoneyPerWeekend: { type: Number, required: true },
    effectiveFrom: { type: String, required: true },
  },
  { timestamps: true }
);

export const PayslipConstants = mongoose.model<PayslipConstantsDocument>(
  'PayslipConstants',
  PayslipConstantsSchema
);
