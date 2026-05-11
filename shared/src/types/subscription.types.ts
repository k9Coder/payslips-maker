export type SubscriptionPlan   = 'per_employee' | 'full';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface ISubscription {
  _id:         string;
  userId:      string;
  plan:        SubscriptionPlan;
  employeeId?: string;
  status:      SubscriptionStatus;
  amountILS:   number;
  startedAt:   Date | string;
  expiresAt:   Date | string;
  billingRef?: string;
  createdAt:   Date | string;
  updatedAt:   Date | string;
}

export interface CreateSubscriptionDto {
  plan:        SubscriptionPlan;
  employeeId?: string;
}

export interface EmployeeSubscriptionStatus {
  plan: SubscriptionPlan | null;
  features: {
    generatePdf:     boolean;
    sendEmail:       boolean;
    finalSettlement: boolean;
    worklog:         boolean;
  };
  pdfGenerateCount: number;
  pdfGenerateLimit: number;
}
