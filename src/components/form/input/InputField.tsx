import React, { FC } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | "file" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string; // Optional hint text
  multiple?: boolean; // For file inputs
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  multiple,
}) => {
  // Determine input styles based on state (disabled, success, error)
  let inputClasses = `input-modern h-12 w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${className}`;

  // Add styles for the different states
  if (disabled) {
    inputClasses += ` text-gray-500 cursor-not-allowed opacity-50 dark:text-gray-400`;
  } else if (error) {
    inputClasses += ` text-red-800 border-red-500 focus:ring-red-500/20 focus:border-red-500 dark:text-red-400 dark:border-red-500`;
  } else if (success) {
    inputClasses += ` text-green-800 border-green-500 focus:ring-green-500/20 focus:border-green-500 dark:text-green-400 dark:border-green-500`;
  } else {
    inputClasses += ` text-gray-800 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white dark:border-gray-600 dark:focus:border-blue-400`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
        multiple={multiple}
      />

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
