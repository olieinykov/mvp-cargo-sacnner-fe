import React from 'react';
import { toast } from 'sonner';
import { useFormik } from 'formik';

import { Card, CardHeader, CardContent } from '../components/ui/card';
import { useCompanyHazmatQuery, useCompanyQuery, useUpdateCompanyMutation } from '../lib/api/company';
import { useQueryClient } from '@tanstack/react-query';
import { useCompanyUsersQuery, useMeQuery } from '../lib/api/auth';

// ─── Validation ────────────────────────────────────────────────────────────────

function validateCompanyForm(values: { name: string; dotNumber: string; mcNumber: string }) {
  const errors: Partial<typeof values> = {};
  if (!values.name.trim()) errors.name = 'Company name is required.';
  if (!values.dotNumber.trim()) errors.dotNumber = 'DOT number is required.';
  else if (!/^[0-9]+$/.test(values.dotNumber.trim())) errors.dotNumber = 'DOT number must contain only digits.';
  if (values.mcNumber.trim() && !/^[0-9]+$/.test(values.mcNumber.trim())) errors.mcNumber = 'MC number must contain only digits.';
  return errors;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FormField({
  label,
  id,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  touched?: boolean;
  disabled: boolean;
  placeholder?: string;
}) {
  const showError = touched && !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder ?? ''}
        className={[
          'w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background transition-colors',
          'focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
          showError ? 'border-red-400 focus:ring-red-300' : 'border-border',
        ].join(' ')}
      />
      {showError && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function StaticInfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="text-sm font-medium text-foreground/90">{value}</div>
      </div>
    </div>
  );
}

function HazmatBadge({ status }: { status: 'Y' | 'N' | null | 'loading' | 'error' }) {
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        Checking FMCSA…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-200">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Not found in FMCSA
      </span>
    );
  }

  if (status === 'Y') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
        Authorized for Hazmat
      </span>
    );
  }

  if (status === 'N') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
        Not Authorized for Hazmat
      </span>
    );
  }

  return <span className="text-xs text-muted-foreground/50 italic">Unknown</span>;
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export const CompanyDetailsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useMeQuery();

  const { data: company, isLoading: companyLoading, error: companyError } = useCompanyQuery(user?.companyId);
  const { data: hazmatData, isLoading: hazmatLoading, isError: hazmatError } = useCompanyHazmatQuery(company?.dotNumber);
  const { mutateAsync: updateCompany } = useUpdateCompanyMutation();

  const { data: users } = useCompanyUsersQuery();
  const owner = users?.find((u) => u.id === company?.ownerId);

  const [isEditing, setIsEditing] = React.useState(false);

  const isAdmin = user?.role === 'admin';
  const hazmatStatus = hazmatLoading ? 'loading' : hazmatError ? 'error' : hazmatData?.hm_ind;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: company?.name ?? '',
      dotNumber: company?.dotNumber ?? '',
      mcNumber: company?.mcNumber ?? '',
    },
    validate: validateCompanyForm,
    onSubmit: async (values, { setSubmitting }) => {
      if (!company) return;

      try {
        await updateCompany({
          companyId: company.id,
          data: {
            name: values.name.trim(),
            dotNumber: values.dotNumber.trim(),
            mcNumber: values.mcNumber.trim() || null,
          },
        });
        toast.success('Company details updated successfully.');
        queryClient.invalidateQueries({ queryKey: ['company', company.id] });
        setIsEditing(false);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCancelEdit = () => {
    formik.resetForm();
    setIsEditing(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (userLoading || companyLoading) {
    return (
      <section className="flex h-full flex-col gap-4 overflow-hidden">
        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-xl bg-muted/30" />
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (companyError) {
    return (
      <section className="flex h-full flex-col gap-4">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 ring-1 ring-inset ring-red-600/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800">Failed to load company details</p>
                <p className="mt-0.5 text-xs text-red-700">{companyError.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!company) return null;

  return (
    <section className="flex h-full flex-col gap-4 overflow-auto">
      <Card className="flex flex-col">
        <CardHeader className="flex shrink-0 items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Company Details</h2>

          {/* Edit / Save / Cancel controls — admin only */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={formik.isSubmitting}
                    className="rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => formik.handleSubmit()}
                    disabled={formik.isSubmitting || !formik.dirty}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {formik.isSubmitting ? (
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pb-6">
          {/* ── Editable fields ── */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Editable Information
            </p>

            {isEditing ? (
              /* ── Edit mode: all fields as inputs ── */
              <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-muted/10 px-4 py-4">
                <FormField
                  label="Company Name"
                  id="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.name}
                  touched={formik.touched.name}
                  disabled={formik.isSubmitting}
                />
                <FormField
                  label="DOT Number"
                  id="dotNumber"
                  value={formik.values.dotNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.dotNumber}
                  touched={formik.touched.dotNumber}
                  disabled={formik.isSubmitting}
                />
                <FormField
                  label="MC Number"
                  id="mcNumber"
                  value={formik.values.mcNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.mcNumber}
                  touched={formik.touched.mcNumber}
                  disabled={formik.isSubmitting}
                  placeholder="Optional"
                />
              </div>
            ) : (
              /* ── View mode: static rows ── */
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Company Name', value: company.name },
                  { label: 'DOT Number', value: company.dotNumber },
                  { label: 'MC Number', value: company.mcNumber },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-sm font-medium text-foreground/90">
                        {value ?? <span className="italic text-muted-foreground/50">Not set</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Static fields ── */}
          <div className="mt-2">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              System Information
            </p>
            <div className="flex flex-col gap-2">
              <StaticInfoRow label="Company ID" value={
                <span className="font-mono text-xs text-muted-foreground">{company.id}</span>
              } />
              <StaticInfoRow label="Owner" value={
                owner ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {owner.firstName} {owner.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {owner.email}
                    </span>
                  </div>
                ) : company.ownerId ? (
                  <span className="font-mono text-xs text-muted-foreground">{company.ownerId}</span>
                ) : (
                  <span className="italic text-muted-foreground/50 text-xs">Not set</span>
                )
              } />
              <StaticInfoRow label="Email Confirmed" value={
                company.isEmailConfirmed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                    Pending Confirmation
                  </span>
                )
              } />
              <StaticInfoRow label="Hazmat Authorization (FMCSA)" value={
                <HazmatBadge status={hazmatStatus as any} />
              } />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};