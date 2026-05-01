import React from 'react';

type FieldProps = {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
};

type FormFieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  touched?: boolean;
  disabled: boolean;
  placeholder?: string;
};

export const Field: React.FC<FieldProps> = ({ label, id, required, children, hint }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {!required && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
  placeholder,
}) => {
  const showError = touched && !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
      >
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
      {showError && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
