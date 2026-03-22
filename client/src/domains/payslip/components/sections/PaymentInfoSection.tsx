import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PayslipFormValues } from '../../payslip.schema';

export function PaymentInfoSection() {
  const { t } = useTranslation();
  const { register, setValue, watch } = useFormContext<PayslipFormValues>();
  const paymentMethod = watch('paymentInfo.paymentMethod');

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label>{t('payslip.paymentInfo.paymentMethod')}</Label>
        <Select
          value={paymentMethod}
          onValueChange={(v) => setValue('paymentInfo.paymentMethod', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">{t('payslip.paymentInfo.paymentMethods.bank')}</SelectItem>
            <SelectItem value="cash">{t('payslip.paymentInfo.paymentMethods.cash')}</SelectItem>
            <SelectItem value="check">{t('payslip.paymentInfo.paymentMethods.check')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod === 'bank' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentInfo.bankName">{t('payslip.paymentInfo.bankName')}</Label>
            <Input id="paymentInfo.bankName" {...register('paymentInfo.bankName')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paymentInfo.branchNumber">{t('payslip.paymentInfo.branchNumber')}</Label>
            <Input id="paymentInfo.branchNumber" {...register('paymentInfo.branchNumber')} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="paymentInfo.accountNumber">{t('payslip.paymentInfo.accountNumber')}</Label>
            <Input id="paymentInfo.accountNumber" {...register('paymentInfo.accountNumber')} />
          </div>
        </>
      )}
    </div>
  );
}
