import mongoose, { Schema, Document } from 'mongoose';

export type WorkLogEntryType = 'work' | 'vacation' | 'sick' | 'holiday' | 'overtime';

export interface IWorkLogDocument extends Document {
  employeeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  type: WorkLogEntryType;
  hours?: number;
  notes?: string;
}

const WorkLogSchema = new Schema<IWorkLogDocument>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    type: {
      type: String,
      enum: ['work', 'vacation', 'sick', 'holiday', 'overtime'],
      required: true,
    },
    hours: { type: Number, min: 0, max: 24 },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// One entry per employee per date
WorkLogSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const WorkLog = mongoose.model<IWorkLogDocument>('WorkLog', WorkLogSchema);
