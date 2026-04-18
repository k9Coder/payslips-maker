import mongoose from 'mongoose';
import { WorkLog } from './worklog.model';

export async function getMonthEntries(
  userId: string,
  employeeId: string,
  year: number,
  month: number
) {
  const paddedMonth = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  const start = `${year}-${paddedMonth}-01`;
  const end = `${year}-${paddedMonth}-${String(lastDay).padStart(2, '0')}`;

  return WorkLog.find({
    userId: new mongoose.Types.ObjectId(userId),
    employeeId: new mongoose.Types.ObjectId(employeeId),
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();
}

export async function upsertEntry(
  userId: string,
  data: { employeeId: string; date: string; type: string; hours?: number; notes?: string }
) {
  return WorkLog.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      date: data.date,
    },
    {
      $set: {
        type: data.type,
        hours: data.hours,
        notes: data.notes,
        userId: new mongoose.Types.ObjectId(userId),
        employeeId: new mongoose.Types.ObjectId(data.employeeId),
        date: data.date,
      },
    },
    { upsert: true, new: true }
  ).lean();
}

export async function deleteEntry(userId: string, entryId: string) {
  return WorkLog.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(entryId),
    userId: new mongoose.Types.ObjectId(userId),
  });
}

export async function getMonthSummary(
  userId: string,
  employeeId: string,
  year: number,
  month: number
) {
  const entries = await getMonthEntries(userId, employeeId, year, month);
  return {
    employeeId,
    userId,
    year,
    month,
    workDays: entries.filter((e) => e.type === 'work').length,
    vacationDays: entries.filter((e) => e.type === 'vacation').length,
    sickDays: entries.filter((e) => e.type === 'sick').length,
    holidayDays: entries.filter((e) => e.type === 'holiday').length,
    overtimeHours: entries
      .filter((e) => e.type === 'overtime')
      .reduce((sum, e) => sum + (e.hours ?? 0), 0),
    entries,
  };
}
