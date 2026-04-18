export type WorkLogEntryType =
  | 'work'
  | 'vacation'
  | 'sick'
  | 'holiday'
  | 'overtime';

export interface IWorkLogEntry {
  _id: string;
  employeeId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  type: WorkLogEntryType;
  hours?: number;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateWorkLogEntryDto {
  employeeId: string;
  date: string;
  type: WorkLogEntryType;
  hours?: number;
  notes?: string;
}

export interface UpdateWorkLogEntryDto {
  type?: WorkLogEntryType;
  hours?: number;
  notes?: string;
}

export interface WorkLogMonthSummary {
  employeeId: string;
  userId: string;
  year: number;
  month: number;
  workDays: number;
  vacationDays: number;
  sickDays: number;
  holidayDays: number;
  overtimeHours: number;
  entries: IWorkLogEntry[];
}
