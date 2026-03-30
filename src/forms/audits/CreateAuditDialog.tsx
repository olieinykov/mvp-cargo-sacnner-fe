import React from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { Modal } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { useCreateAuditMutation } from "../../lib/api/audits";
import { ImageFilesField } from "./ImageFilesField";
import type { ServerAuditResponse } from "../../lib/utils/useAuditStore";

const fileSchema = z.instanceof(File);

const auditSchema = z.object({
  images: z
    .array(fileSchema)
    .min(1, "Upload at least one image to begin the audit"),
});

type AuditFormValues = z.infer<typeof auditSchema>;

type CreateAuditDialogProps = {
  open: boolean;
  handleClose: () => void;
  onAuditCreated: (response: ServerAuditResponse) => void;
};

const CREATE_AUDIT_FORM_ID = "create-audit-form";

const initialValues: AuditFormValues = {
  images: [],
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
        if (issue.path[0]) errors[String(issue.path[0])] = issue.message;
      });
      return errors;
    },
    onSubmit: async (values, helpers) => {
      try {
        const response = await createAuditMutation.mutateAsync(values);
        helpers.resetForm();
        onAuditCreated(response);
      } catch (error) {
        console.error(error);
      }
    },
  });

  if (!open) return null;

  const showError = formik.submitCount > 0 || Boolean(formik.touched.images);
  const imageError =
    typeof formik.errors.images === "string"
      ? formik.errors.images
      : undefined;

  const count = formik.values.images.length;

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="New Audit"
      description={
        count === 0
          ? "Upload shipment images — BOL, placards, and cargo photos."
          : `${count} image${count === 1 ? "" : "s"} selected — AI will classify and analyze each one.`
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
            className="min-w-[100px]"
          >
            {createAuditMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Analyzing…
              </span>
            ) : (
              "Run Audit"
            )}
          </Button>
        </>
      }
    >
      <form id={CREATE_AUDIT_FORM_ID} onSubmit={formik.handleSubmit}>

        <ImageFilesField
          id="images"
          label="Shipment images"
          files={formik.values.images}
          onFilesChange={(files) => formik.setFieldValue("images", files)}
          error={showError ? imageError : undefined}
          onBlur={formik.handleBlur}
          helpText="BOL documents · Placard photos · Cargo interior shots"
        />
      </form>
    </Modal>
  );
};