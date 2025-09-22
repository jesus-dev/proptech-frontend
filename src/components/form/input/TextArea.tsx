import React from "react";

interface TextareaProps {
  placeholder?: string; // Placeholder text
  rows?: number; // Number of rows
  value?: string; // Current value
  onChange?: (value: string) => void; // Change handler
  className?: string; // Additional CSS classes
  disabled?: boolean; // Disabled state
  error?: boolean; // Error state
  hint?: string; // Hint text to display
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message", // Default placeholder
  rows = 3, // Default number of rows
  value = "", // Default value
  onChange, // Callback for changes
  className = "", // Additional custom styles
  disabled = false, // Disabled state
  error = false, // Error state
  hint = "", // Default hint text
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  let textareaClasses = `input-modern w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 resize-none ${className}`;

  if (disabled) {
    textareaClasses += ` opacity-50 text-gray-500 dark:text-gray-400 cursor-not-allowed`;
  } else if (error) {
    textareaClasses += ` text-red-800 border-red-500 focus:ring-red-500/20 focus:border-red-500 dark:text-red-400 dark:border-red-500`;
  } else {
    textareaClasses += ` text-gray-800 border-gray-300 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white dark:border-gray-600 dark:focus:border-blue-400`;
  }

  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
      />
      {hint && (
        <p
          className={`mt-2 text-sm ${
            error ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;
