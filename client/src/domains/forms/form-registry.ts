import type { FormType } from '@payslips-maker/shared';
import type { FormConfig } from './types/form-config.types';
import { payslipFormConfig } from '../payslip/payslip.form-config';
import { finalSettlementFormConfig } from '../final-settlement/final-settlement.form-config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<FormType, FormConfig<any>>();

registry.set('payslip', payslipFormConfig);
registry.set('final_settlement', finalSettlementFormConfig);

export function getFormConfig<T extends Record<string, unknown>>(
  formType: FormType
): FormConfig<T> {
  const config = registry.get(formType);
  if (!config) throw new Error(`No form config registered for type: ${formType}`);
  return config as FormConfig<T>;
}

export { registry as formRegistry };
