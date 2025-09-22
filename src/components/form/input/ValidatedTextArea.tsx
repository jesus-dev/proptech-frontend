import React, { FC } from "react";
import { X } from "lucide-react";

interface ValidatedTextAreaProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  disabled?: boolean;
  error?: string | boolean;
  label?: string;
  required?: boolean;
}

const ValidatedTextArea: FC<ValidatedTextAreaProps> = ({
  id,
  name,
  placeholder = "Ingrese su mensaje",
  value = "",
  onChange,
  className = "",
  rows = 3,
  disabled = false,
  error = false,
  label,
  required = false,
}) => {
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className}`;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (hasError) {
    textareaClasses += ` bg-transparent text-gray-800 border-red-500 focus:border-red-300 focus:ring-3 focus:ring-red-500/10 dark:border-red-500 dark:bg-gray-900 dark:text-white/90 dark:focus:border-red-800`;
  } else {
    textareaClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          rows={rows}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          className={textareaClasses}
        />

        {/* Error Icon */}
        {hasError && (
          <div className="absolute top-3 right-3 pointer-events-none">
            <X className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && errorMessage && (
        <div className="flex items-start mt-1.5 space-x-1">
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ValidatedTextArea; 