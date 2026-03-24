import React from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { Dialog, DialogHeader } from '../../components/ui/dialog';
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
    typeof formik.errors.placardData === 'string'
      ? formik.errors.placardData
      : undefined;
  const intrierError =
    typeof formik.errors.intrierData === 'string'
      ? formik.errors.intrierData
      : undefined;
  // const exterierError = typeof formik.errors.exterierData === 'string' ? formik.errors.exterierData : undefined; // TODO: exterior disabled

  const bolTouched = Boolean(formik.touched.bolData);
  const placardTouched = Boolean(formik.touched.placardData);
  const intrierTouched = Boolean(formik.touched.intrierData);
  // const exterierTouched = Boolean(formik.touched.exterierData); // TODO: exterior disabled

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader
        title="Create audit"
        description="Upload all required file groups for this audit."
      />

      <form className="space-y-0" onSubmit={formik.handleSubmit}>
        <div className="flex flex-col"> 

          {/* BOL section */}
          <div className="py-5 first:pt-0">
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground">BOL data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bill of Lading — shipping document with hazmat entry details. Upload one or more files.
              </p>
            </div>
            <ImageFilesField
              id="bolData"
              label=""
              files={formik.values.bolData}
              onFilesChange={handleFilesChange('bolData')}
              error={bolTouched || showAfterSubmit ? bolError : undefined}
              onBlur={formik.handleBlur}
            />
          </div>

          {/* Placard section */}
          <div className="py-5">
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground">Placard data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Photos of hazmat placards on all sides of the trailer. Upload one or more files.
              </p>
            </div>
            <ImageFilesField
              id="placardData"
              label=""
              files={formik.values.placardData}
              onFilesChange={handleFilesChange('placardData')}
              error={placardTouched || showAfterSubmit ? placardError : undefined}
              onBlur={formik.handleBlur}
            />
          </div>

          {/* Interior section */}
          <div className="py-5">
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground">Interior data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Photos of cargo inside the vehicle showing labels and securement. Upload one or more files.
              </p>
            </div>
            <ImageFilesField
              id="intrierData"
              label=""
              files={formik.values.intrierData}
              onFilesChange={handleFilesChange('intrierData')}
              error={intrierTouched || showAfterSubmit ? intrierError : undefined}
              onBlur={formik.handleBlur}
            />
          </div>

        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            aria-label="Cancel create audit"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            aria-label="Submit create audit form"
            disabled={createAuditMutation.isPending}
          >
            {createAuditMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};