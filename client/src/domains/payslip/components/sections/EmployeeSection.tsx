import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resolveMultiLangString } from '@payslips-maker/shared';
import type { PayslipFormValues } from '../../payslip.schema';

function DisabledField({ id, label, value }: { id: string; label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} disabled className="bg-muted" />
    </div>
  );
}

export function EmployeeSection() {
  const { watch } = useFormContext<PayslipFormValues>();
  const info = watch('employeeInfo');

  const fullName = resolveMultiLangString(info.fullName, 'he');
  const employerName = resolveMultiLangString(info.employerName, 'he');

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>שם מלא</Label>
          <Input value={fullName} disabled className="bg-muted" />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>שם מעסיק</Label>
          <Input value={employerName} disabled className="bg-muted" />
        </div>

        <DisabledField id="passportNumber" label="מספר דרכון" value={info.passportNumber} />
        <DisabledField id="nationality" label="לאום" value={info.nationality} />
        <DisabledField id="employerTaxId" label="ח.פ / ע.מ מעסיק" value={info.employerTaxId} />
        <DisabledField id="employmentStartDate" label="תאריך תחילת עבודה" value={info.employmentStartDate} />
        <DisabledField id="seniorityMonths" label="ותק" value={`${info.seniorityMonths} חודשים`} />
      </div>

      {(info.employerAddress || info.employerCity || info.employerZip) && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">כתובת מעסיק</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {info.employerAddress && <DisabledField id="employerAddress" label="כתובת" value={info.employerAddress} />}
            {info.employerCity && <DisabledField id="employerCity" label="עיר" value={info.employerCity} />}
            {info.employerZip && <DisabledField id="employerZip" label="מיקוד" value={info.employerZip} />}
          </div>
        </div>
      )}
    </div>
  );
}
