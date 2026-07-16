import { ReactNode, Ref } from "react";
import { FaTimes } from "react-icons/fa";

import "./formModal.css";

export type FormModalField<T> = {
  name: keyof T & string;
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  inputRef?: Ref<HTMLInputElement>;
};

interface FormModalProps<T extends Record<string, any>> {
  isOpen: boolean;
  title: string;
  description: string;
  titleId: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  values: T;
  fields: Array<FormModalField<T>>;
  onFieldChange: (field: keyof T & string, value: string) => void;
  submitLabel: string;
  formClassName: string;
  saving?: boolean;
  error?: string;
  extraContent?: ReactNode;
  className?: string;
}

function FormModal<T extends Record<string, any>>({
  isOpen,
  title,
  description,
  titleId,
  onClose,
  onSubmit,
  values,
  fields,
  onFieldChange,
  submitLabel,
  formClassName,
  saving = false,
  error = "",
  extraContent,
  className = ""
}: FormModalProps<T>) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className={`form-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="form-modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Lukk"
          >
            {FaTimes({ className: "icon" })}
          </button>
        </div>

        <form className={formClassName} onSubmit={onSubmit}>
          {/* Feltene bygges fra options slik at bruker- og team-skjema kan bruke samme modal. */}
          {fields.map((field) => (
            <div className="form-field" key={field.name}>
              <label htmlFor={field.id}>{field.label}</label>

              {/* Har feltet options rendres select, ellers rendres vanlig input. */}
              {field.options ? (
                <select
                  id={field.id}
                  value={values[field.name] ?? ""}
                  onChange={(event) => onFieldChange(field.name, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.id}
                  ref={field.inputRef}
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  onChange={(event) => onFieldChange(field.name, event.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          {extraContent}
          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-action-button"
              onClick={onClose}
              disabled={saving}
            >
              Avbryt
            </button>

            <button
              type="submit"
              className="primary-action-button"
              disabled={saving}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default FormModal;
