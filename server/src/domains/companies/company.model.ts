import mongoose, { Schema, Document } from 'mongoose';
import type { ICompany } from '@payslips-maker/shared';

export interface CompanyDocument extends Omit<ICompany, '_id'>, Document {}

const CompanySchema = new Schema<CompanyDocument>(
  {
    name: { type: Schema.Types.Mixed, required: true },
    ein: { type: String },
    logo: { type: String },
    address: { type: String },
    phone: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

export const Company = mongoose.model<CompanyDocument>('Company', CompanySchema);
