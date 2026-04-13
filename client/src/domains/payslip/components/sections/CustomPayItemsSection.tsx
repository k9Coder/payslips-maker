import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiLangInput } from '@/shared/components/MultiLangInput';
import type { PayslipFormValues } from '../../payslip.schema';
import type { MultiLangString } from '@payslips-maker/shared';

export function CustomPayItemsSection() {
  const { t } = useTranslation();
  const { register, control } = useFormContext<PayslipFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'customPayItems' });

  return (
    <div className="space-y-4">
      {fields.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-start pb-2 pe-2 font-medium w-20">{t('payslip.customPayItems.code')}</th>
                <th className="text-start pb-2 pe-2 font-medium">{t('payslip.customPayItems.description')}</th>
                <th className="text-start pb-2 pe-2 font-medium w-24">{t('payslip.customPayItems.quantity')}</th>
                <th className="text-start pb-2 pe-2 font-medium w-24">{t('payslip.customPayItems.rate')}</th>
                <th className="text-start pb-2 pe-2 font-medium w-28">{t('payslip.customPayItems.amount')}</th>
                <th className="text-start pb-2 pe-2 font-medium w-24">{t('payslip.customPayItems.taxPercent')}</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b last:border-0">
                  <td className="py-2 pe-2">
                    <Input
                      {...register(`customPayItems.${index}.code`)}
                      placeholder="01"
                      className="h-8"
                    />
                  </td>
                  <td className="py-2 pe-2">
                    <Controller
                      name={`customPayItems.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <MultiLangInput
                          value={typeof field.value === 'string' ? { he: field.value } : (field.value as MultiLangString ?? {})}
                          onChange={field.onChange}
                          compact
                        />
                      )}
                    />
                  </td>
                  <td className="py-2 pe-2">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...register(`customPayItems.${index}.quantity`, { valueAsNumber: true })}
                      className="h-8"
                    />
                  </td>
                  <td className="py-2 pe-2">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...register(`customPayItems.${index}.rate`, { valueAsNumber: true })}
                      className="h-8"
                    />
                  </td>
                  <td className="py-2 pe-2">
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`customPayItems.${index}.amount`, { valueAsNumber: true })}
                      className="h-8"
                    />
                  </td>
                  <td className="py-2 pe-2">
                    <Input
                      type="number"
                      step="1"
                      min={0}
                      max={100}
                      {...register(`customPayItems.${index}.taxPercent`, { valueAsNumber: true })}
                      className="h-8"
                    />
                  </td>
                  <td className="py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('payslip.customPayItems.empty')}</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ code: '', description: {}, amount: 0 })}
      >
        <Plus className="h-4 w-4 me-2" />
        {t('payslip.customPayItems.add')}
      </Button>
    </div>
  );
}
