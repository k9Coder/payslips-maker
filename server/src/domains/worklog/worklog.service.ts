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

export async function createEntry(
  userId: string,
  data: { employeeId: string; date: string; type: string; hours?: number; startTime?: string; endTime?: string; notes?: string }
) {
  return WorkLog.create({
    userId: new mongoose.Types.ObjectId(userId),
    employeeId: new mongoose.Types.ObjectId(data.employeeId),
    date: data.date,
    type: data.type,
    hours: data.hours,
    startTime: data.startTime,
    endTime: data.endTime,
    notes: data.notes,
  });
}

export async function updateEntry(
  userId: string,
  entryId: string,
  data: { type?: string; hours?: number; startTime?: string; endTime?: string; notes?: string }
) {
  return WorkLog.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(entryId),
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: data },
    { new: true }
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

  // Count distinct dates per type — a day with work+overtime counts as 1 work day
  const workDates = new Set(entries.filter((e) => e.type === 'work').map((e) => e.date));
  const vacationDates = new Set(entries.filter((e) => e.type === 'vacation').map((e) => e.date));
  const sickDates = new Set(entries.filter((e) => e.type === 'sick').map((e) => e.date));
  const holidayDates = new Set(entries.filter((e) => e.type === 'holiday').map((e) => e.date));

  return {
    employeeId,
    userId,
    year,
    month,
    workDays: workDates.size,
    vacationDays: vacationDates.size,
    sickDays: sickDates.size,
    holidayDays: holidayDates.size,
    overtimeHours: entries
      .filter((e) => e.type === 'overtime')
      .reduce((sum, e) => sum + (e.hours ?? 0), 0),
    totalWorkHours: entries
      .filter((e) => e.type === 'work')
      .reduce((sum, e) => sum + (e.hours ?? 0), 0),
    entries,
  };
}
