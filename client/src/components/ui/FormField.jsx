/**
 * FormField — THE universal form field component (build instruction #13).
 *
 * Handles every input shape the project needs via the `type` prop:
 *   text | email | tel | password | number | date | textarea | select |
 *   radio-group | checkbox | file-dropzone
 *
 * FEATURES:
 *   - Embedded label + optional hint text + inline error message
 *   - Optional character counter (for maxLength-bound fields like
 *     Referral Code — "12/20 characters")
 *   - Password fields get a built-in show/hide toggle
 *   - Date fields get a themed calendar icon affordance (native
 *     picker indicator is stretched invisibly over the full field
 *     so the whole input opens the picker, not just the icon)
 *   - Focus ring matches the design spec: ring-2 ring-primary,
 *     offset-4, border shifts to primary
 *   - `validate` prop accepts an array of validator functions from
 *     utils/validation.js — runs onBlur, shows the error inline
 *
 * This single component eliminates the need for separate Input/Select/
 * Textarea/Checkbox/RadioGroup components in most call sites — those
 * still exist as thin named exports below for cases where a field is
 * used completely outside a form context (e.g. a filter bar), but
 * FormField is the default choice everywhere a labeled, validated field
 * is needed.
 */

import { useState, useId } from 'react';
import { Eye, EyeOff, Upload, X, FileText, Calendar } from 'lucide-react';
import { runValidators } from '../../utils/validation.js';
import { formatFileSize } from '../../utils/formatters.js';

export function FormField({
  type = 'text',
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
  error: externalError,
  required = false,
  disabled = false,
  maxLength,
  showCounter = false,
  validate = [],
  options = [], // for select / radio-group: [{ value, label }]
  file, // for file-dropzone: { file, previewUrl, error, dragHandlers, handleInputChange, isPdf, clearFile }
  className = '',
  ...rest
}) {
  const id = useId();
  const [internalError, setInternalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const error = externalError || (touched ? internalError : null);

  const handleBlur = (e) => {
    setTouched(true);
    if (validate.length > 0) {
      setInternalError(runValidators(value, validate));
    }
    onBlur?.(e);
  };

  /* ── Frosted / theme-blendable field background (same treatment as Modal) ── */
  const baseFieldClasses = `
    w-full px-4 py-2.5 rounded-sm border 
    bg-[color-mix(in_oklab,var(--color-surface-elevated),white_10%)] 
    backdrop-blur-sm ring-1 ring-white/10
    text-text-primary placeholder:text-text-secondary transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 focus:border-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-error' : 'border-border'}
  `;


  // ── File Dropzone ────────────────────────────────────────────────
  if (type === 'file-dropzone') {
    return (
      <div className={className}>
        {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
        {!file.hasFile ? (
          <label
            htmlFor={id}
            {...file.dragHandlers}
            // className={`
            //   flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed
            //   px-6 py-10 text-center cursor-pointer transition-colors
            //   ${file.isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}
            className={`
              flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed
              px-6 py-10 text-center cursor-pointer transition-colors
              bg-[color-mix(in_oklab,var(--color-surface-elevated),white_8%)] backdrop-blur-sm
              ${file.isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}
            `}
          >
            <Upload size={28} className="text-text-secondary" />
            <p className="text-sm text-text-primary">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-text-secondary">JPG, PNG, or PDF — max 5MB</p>
            <input
              id={id}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={file.handleInputChange}
            />
          </label>
        ) : (
            <div className="flex items-center gap-3 rounded-md border border-border 
            bg-[color-mix(in_oklab,var(--color-surface-elevated),white_10%)] 
            backdrop-blur-sm ring-1 ring-white/10 p-3">
          {/* <div className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated p-3"> */}
            {file.previewUrl ? (
              <img src={file.previewUrl} alt="Receipt preview" className="h-14 w-14 rounded-sm object-cover" />
            ) : (
              <FileText size={40} className="text-primary" />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{file.file.name}</p>
              <p className="text-xs text-text-secondary">{formatFileSize(file.file.size)}</p>
            </div>
            <button type="button" onClick={file.clearFile} className="p-1 text-text-secondary hover:text-error">
              <X size={18} />
            </button>
          </div>
        )}
        {(file.error || error) && <FieldError message={file.error || error} />}
        {hint && !error && <FieldHint>{hint}</FieldHint>}
      </div>
    );
  }

  // ── Checkbox ─────────────────────────────────────────────────────
  if (type === 'checkbox') {
    return (
      <div className={className}>
        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
          <input
            id={id}
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="mt-1 h-4 w-4 rounded-sm border-border text-primary focus:ring-primary"
            {...rest}
          />
          <span className="text-sm text-text-primary">{label}</span>
        </label>
        {error && <FieldError message={error} />}
      </div>
    );
  }

  // ── Radio Group ──────────────────────────────────────────────────
  if (type === 'radio-group') {
    return (
      <div className={className}>
        {label && <FieldLabel required={required}>{label}</FieldLabel>}
        <div className="flex flex-wrap gap-4">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                className="h-4 w-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">{opt.label}</span>
            </label>
          ))}
        </div>
        {error && <FieldError message={error} />}
      </div>
    );
  }

  // ── Select ───────────────────────────────────────────────────────
  if (type === 'select') {
    return (
      <div className={className}>
        {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
        <select
          id={id}
          name={name}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className={baseFieldClasses}
          {...rest}
        >
          <option value="" disabled>
            {placeholder || 'Select an option'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <FieldError message={error} />}
        {hint && !error && <FieldHint>{hint}</FieldHint>}
      </div>
    );
  }

  // ── Textarea ─────────────────────────────────────────────────────
  if (type === 'textarea') {
    return (
      <div className={className}>
        {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
        <textarea
          id={id}
          name={name}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          rows={rest.rows || 4}
          className={`${baseFieldClasses} resize-y`}
          {...rest}
        />
        <FieldFooter error={error} hint={hint} value={value} maxLength={maxLength} showCounter={showCounter} />
      </div>
    );
  }

  // ── Password ─────────────────────────────────────────────────────
  if (type === 'password') {
    return (
      <div className={className}>
        {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
        <div className="relative">
          <input
            id={id}
            type={showPassword ? 'text' : 'password'}
            name={name}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseFieldClasses} pr-11`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <FieldError message={error} />}
        {hint && !error && <FieldHint>{hint}</FieldHint>}
      </div>
    );
  }

  // ── Date ─────────────────────────────────────────────────────────
  if (type === 'date') {
    return (
      <div className={className}>
        {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
        <div className="relative">
          <input
            id={id}
            type="date"
            name={name}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className={`${baseFieldClasses} pr-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0`}
            {...rest}
          />
          <Calendar
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
        </div>
        {error && <FieldError message={error} />}
        {hint && !error && <FieldHint>{hint}</FieldHint>}
      </div>
    );
  }

  // ── Default: text / email / tel / number ───────────────────────
  return (
    <div className={className}>
      {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
      <input
        id={id}
        type={type}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={baseFieldClasses}
        {...rest}
      />
      <FieldFooter error={error} hint={hint} value={value} maxLength={maxLength} showCounter={showCounter} />
    </div>
  );
}

// ── Internal sub-components (not exported — implementation detail) ──

function FieldLabel({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-text-primary">
      {children}
      {required && <span className="ml-0.5 text-error">*</span>}
    </label>
  );
}

function FieldError({ message }) {
  return <p className="mt-1.5 text-sm text-error">{message}</p>;
}

function FieldHint({ children }) {
  return <p className="mt-1.5 text-sm text-text-secondary">{children}</p>;
}

function FieldFooter({ error, hint, value, maxLength, showCounter }) {
  const nearLimit = maxLength && value?.length >= maxLength;
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        {error && <FieldError message={error} />}
        {hint && !error && <FieldHint>{hint}</FieldHint>}
      </div>
      {showCounter && maxLength && (
        <span className={`mt-1.5 shrink-0 text-xs ${nearLimit ? 'text-error font-medium' : 'text-text-secondary'}`}>
          {(value || '').length}/{maxLength}
          {nearLimit ? ' — maximum reached' : ''}
        </span>
      )}
    </div>
  );
}

export default FormField;