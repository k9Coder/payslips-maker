import type { ZodType, ZodTypeDef } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import type { IEmployee, IForm, SupportedLanguage, FormType } from '@payslips-maker/shared';
import type { ReactElement } from 'react';

export interface ToApiPayloadCtx {
  formType: FormType;
  employeeId: string;
}

export interface FormConfig<TData extends Record<string, unknown>> {
  /** Human-readable label in Hebrew */
  labelHe: string;
  formType: FormType;

  /** Zod validation schema */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<TData, ZodTypeDef, any>;

  /** Initial form values for a new form, seeded from the employee record */
  defaultValues: (employee: IEmployee) => DefaultValues<TData>;

  /**
   * Convert a saved IForm (from the API) into form values for editing.
   * Extracts the subset of IForm fields relevant to this form type.
   */
  fromApiForm: (form: IForm) => TData;

  /**
   * Optional: build the full CreateFormDto from form data.
   * Use when the DTO shape differs from TData (e.g. final settlement wraps data in finalSettlementData).
   * When absent, FormContainer defaults to: { ...data, formType, employeeId }
   */
  toApiPayload?: (
    data: TData,
    ctx: ToApiPayloadCtx
  ) => Partial<import('@payslips-maker/shared').CreateFormDto>;

  /**
   * Form sections component.
   * May use useFormContext internally — must be rendered inside a FormProvider.
   */
  FormSections: () => ReactElement;

  /**
   * React-PDF Document element.
   * Used with PDFDownloadLink / PDFViewer.
   * Language support expanded in Plan 07.
   */
  PDFDocument: (props: { form: IForm; language: SupportedLanguage }) => ReactElement;
}
