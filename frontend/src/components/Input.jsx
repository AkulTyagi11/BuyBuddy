import { forwardRef, useId } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const baseInputClasses =
  'w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-neutral-dark placeholder:text-text-muted/80 outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out';

function getStateClasses({ error, success, disabled }) {
  if (disabled) {
    return 'border-border-default bg-surface-muted text-text-muted';
  }

  if (error) {
    return 'border-semantic-error focus:border-semantic-error focus:shadow-[0_0_0_3px_rgba(217,91,74,0.18)]';
  }

  if (success) {
    return 'border-semantic-success focus:border-semantic-success focus:shadow-[0_0_0_3px_rgba(123,191,74,0.18)]';
  }

  return 'border-border-default focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(123,191,74,0.18)]';
}

const Input = forwardRef(function Input(
  {
    id,
    label,
    required = false,
    error,
    success,
    hint,
    clearable = false,
    onClear,
    leftIcon,
    rightElement,
    wrapperClassName = '',
    inputClassName = '',
    className = '',
    type = 'text',
    value,
    onChange,
    disabled = false,
    readOnly = false,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || `field-${generatedId}`;

  const canClear =
    clearable
    && !disabled
    && !readOnly
    && typeof value === 'string'
    && value.length > 0;

  const showSuccessIcon = Boolean(success) && !error;

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  const inputClasses = [
    baseInputClasses,
    getStateClasses({ error, success, disabled }),
    leftIcon ? 'pl-10' : '',
    canClear || rightElement || showSuccessIcon ? 'pr-10' : '',
    inputClassName,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={["space-y-1", wrapperClassName].filter(Boolean).join(' ')}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-dark">
          {label}
          {required ? <span className="ml-1 text-semantic-error">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {leftIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClasses}
          {...props}
        />

        {canClear ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition hover:bg-neutral-light hover:text-neutral-dark"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {!canClear && rightElement ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</div>
        ) : null}

        {!canClear && !rightElement && showSuccessIcon ? (
          <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-semantic-success" />
        ) : null}
      </div>

      {error ? <p className="text-sm text-semantic-error">{error}</p> : null}
      {!error && typeof success === 'string' ? <p className="text-sm text-semantic-success">{success}</p> : null}
      {!error && !success && hint ? <p className="text-sm text-text-muted">{hint}</p> : null}
    </div>
  );
});

export default Input;
