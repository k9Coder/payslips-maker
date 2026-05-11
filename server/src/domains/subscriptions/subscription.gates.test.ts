import { checkGate, Feature } from './subscription.gates';
import type { ISubscription } from '@payslips-maker/shared';

const ACTIVE_FULL: ISubscription = {
  _id: '1', userId: 'u1', plan: 'full', status: 'active',
  amountILS: 85, startedAt: new Date(), expiresAt: new Date(),
  createdAt: new Date(), updatedAt: new Date(),
};

const ACTIVE_PER_EMP: ISubscription = {
  _id: '2', userId: 'u1', plan: 'per_employee', employeeId: 'emp1',
  status: 'active', amountILS: 40,
  startedAt: new Date(), expiresAt: new Date(),
  createdAt: new Date(), updatedAt: new Date(),
};

describe('checkGate — any_subscription', () => {
  it('allows when any active subscription exists', () => {
    expect(checkGate(Feature.CREATE_ADDITIONAL_EMPLOYEE, [ACTIVE_FULL])).toMatchObject({ allowed: true });
  });
  it('blocks when no subscriptions', () => {
    expect(checkGate(Feature.CREATE_ADDITIONAL_EMPLOYEE, [])).toMatchObject({
      allowed: false, reason: 'SUBSCRIPTION_REQUIRED',
    });
  });
});

describe('checkGate — employee_unlock', () => {
  it('allows with full plan regardless of employeeId', () => {
    expect(checkGate(Feature.SEND_EMAIL, [ACTIVE_FULL], { employeeId: 'emp99' })).toMatchObject({ allowed: true });
  });
  it('allows with matching per_employee plan', () => {
    expect(checkGate(Feature.SEND_EMAIL, [ACTIVE_PER_EMP], { employeeId: 'emp1' })).toMatchObject({ allowed: true });
  });
  it('blocks when per_employee plan is for a different employee', () => {
    expect(checkGate(Feature.SEND_EMAIL, [ACTIVE_PER_EMP], { employeeId: 'emp2' })).toMatchObject({
      allowed: false, reason: 'EMPLOYEE_SUBSCRIPTION_REQUIRED',
    });
  });
  it('blocks when no subscriptions', () => {
    expect(checkGate(Feature.WORKLOG, [], { employeeId: 'emp1' })).toMatchObject({ allowed: false });
  });
});

describe('checkGate — employee_unlock_or_free_limit', () => {
  it('allows unlimited when employee is unlocked', () => {
    const result = checkGate(Feature.GENERATE_PDF, [ACTIVE_FULL], { employeeId: 'emp1', currentCount: 99 });
    expect(result).toMatchObject({ allowed: true, remaining: null });
  });
  it('allows within free limit', () => {
    const result = checkGate(Feature.GENERATE_PDF, [], { employeeId: 'emp1', currentCount: 1 });
    expect(result).toMatchObject({ allowed: true, remaining: 2 });
  });
  it('blocks when free limit reached', () => {
    const result = checkGate(Feature.GENERATE_PDF, [], { employeeId: 'emp1', currentCount: 3 });
    expect(result).toMatchObject({ allowed: false, reason: 'FREE_LIMIT_REACHED', remaining: 0 });
  });
  it('remaining is 0 not negative when over limit', () => {
    const result = checkGate(Feature.GENERATE_PDF, [], { currentCount: 10 });
    expect(result.remaining).toBe(0);
  });
});
