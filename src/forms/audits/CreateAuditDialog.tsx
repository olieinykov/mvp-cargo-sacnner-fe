import React from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { Modal } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { useCreateAuditMutation } from '../../lib/api/audits';
import { ImageFilesField } from './ImageFilesField';
import type { ServerAuditResponse } from '../../lib/utils/useAuditStore';

const fileSchema = z.instanceof(File);

const auditSchema = z.object({
  bolData: z.array(fileSchema).min(1, 'At least one file is required'),
  placardData: z.array(fileSchema).min(1, 'At least one file is required'),
  intrierData: z.array(fileSchema).min(1, 'At least one file is required'),
  // exterierData: z.array(fileSchema).min(1, 'At least one file is required'), // TODO: exterior disabled
});

type AuditFormValues = z.infer<typeof auditSchema>;

type CreateAuditDialogProps = {
  open: boolean;
  handleClose: () => void;
  /** Called with the full server response after a successful audit creation */
  onAuditCreated: (response: ServerAuditResponse) => void;
};

const CREATE_AUDIT_FORM_ID = 'create-audit-form';

const initialValues: AuditFormValues = {
  bolData: [],
  placardData: [],
  intrierData: [],
  // exterierData: [], // TODO: exterior disabled
};

export const CreateAuditDialog: React.FC<CreateAuditDialogProps> = ({
  open,
  handleClose,
  onAuditCreated,
}) => {
  const createAuditMutation = useCreateAuditMutation();

  const formik = useFormik<AuditFormValues>({
    initialValues,
    validate: (values) => {
      const result = auditSchema.safeParse(values);
      if (result.success) return {};
      const errors: Record<string, string> = {};
      result.error.errors.forEach((issue) => {
        if (issue.path[0]) errors[issue.path[0]] = issue.message;
      });
      return errors;
    },
    onSubmit: async (values, helpers) => {
      try {
        const response = await createAuditMutation.mutateAsync(values);
        helpers.resetForm();
        // Hand off the full server response — parent will store + open result dialog
        onAuditCreated(response);
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleFilesChange =
    (field: keyof AuditFormValues) => (nextFiles: File[]) => {
      formik.setFieldValue(field, nextFiles);
    };

  if (!open) return null;

  const showAfterSubmit = formik.submitCount > 0;

  const bolError =
    typeof formik.errors.bolData === 'string' ? formik.errors.bolData : undefined;
  const placardError =
    typeof formik.errors.placardData === 'string' ? formik.errors.placardData : undefined;
  const intrierError =
    typeof formik.errors.intrierData === 'string' ? formik.errors.intrierData : undefined;

  const bolTouched = Boolean(formik.touched.bolData);
  const placardTouched = Boolean(formik.touched.placardData);
  const intrierTouched = Boolean(formik.touched.intrierData);

  const bolDone = formik.values.bolData.length > 0;
  const placardDone = formik.values.placardData.length > 0;
  const intrierDone = formik.values.intrierData.length > 0;
  const filledCount = [bolDone, placardDone, intrierDone].filter(Boolean).length;
  const totalCount = 3;

  const sections = [
    {
      step: 1,
      title: 'BOL data',
      description: 'Bill of Lading — shipping document with hazmat entry details.',
      id: 'bolData' as keyof AuditFormValues,
      files: formik.values.bolData,
      error: bolTouched || showAfterSubmit ? bolError : undefined,
      done: bolDone,
      isLast: false,
    },
    {
      step: 2,
      title: 'Placard data',
      description: 'Photos of hazmat placards on all sides of the trailer.',
      id: 'placardData' as keyof AuditFormValues,
      files: formik.values.placardData,
      error: placardTouched || showAfterSubmit ? placardError : undefined,
      done: placardDone,
      isLast: false,
    },
    {
      step: 3,
      title: 'Interior data',
      description: 'Photos of cargo inside the vehicle showing labels and securement.',
      id: 'intrierData' as keyof AuditFormValues,
      files: formik.values.intrierData,
      error: intrierTouched || showAfterSubmit ? intrierError : undefined,
      done: intrierDone,
      isLast: true,
    },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Create audit"
      description={
        filledCount === totalCount
          ? 'All sections ready — you can submit.'
          : `${filledCount} of ${totalCount} sections ready`
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createAuditMutation.isPending}
            aria-label="Cancel create audit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={CREATE_AUDIT_FORM_ID}
            aria-label="Submit create audit form"
            disabled={createAuditMutation.isPending}
            className="min-w-[90px]"
          >
            {createAuditMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Creating…
              </span>
            ) : 'Create'}
          </Button>
        </>
      }
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(filledCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <form id={CREATE_AUDIT_FORM_ID} onSubmit={formik.handleSubmit}>
        {sections.map(({ step, title, description, id, files, error, done, isLast }) => (
          <div key={id} className="flex gap-4">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : 'border border-border bg-muted text-muted-foreground'
                }`}
                aria-label={done ? `Step ${step} complete` : `Step ${step}`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {!isLast && (
                <div className={`mt-1 w-px flex-1 transition-colors duration-300 ${done ? 'bg-emerald-300' : 'bg-border/50'}`} />
              )}
            </div>

            {/* Section content */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-7'}`}>
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>
              <ImageFilesField
                id={id}
                label=""
                files={files}
                onFilesChange={handleFilesChange(id)}
                error={error}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>
        ))}
      </form>
    </Modal>
  );
};