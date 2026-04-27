import React, { FC } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  required?: boolean;
}

  const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  required = false,
}) => {
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] placeholder:text-[#737686] focus:outline-hidden focus:ring-[3px] ${className}`;

  if (disabled) {
    inputClasses += ` text-[#737686] border-[#c3c6d7] cursor-not-allowed bg-[#f2f4f6]`;
  } else if (error) {
    inputClasses += ` text-[#93000a] border-[#f04438] focus:ring-[#f04438]/10 bg-[#ffdad6]/30`;
  } else if (success) {
    inputClasses += ` text-[#027a48] border-[#12b76a] focus:ring-[#12b76a]/10 bg-[#d1fadf]/30`;
  } else {
    inputClasses += ` bg-[#f2f4f6] text-[#191c1e] border-[#c3c6d7] focus:border-[#2563eb] focus:ring-[#2563eb]/10`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-[#f04438]"
              : success
              ? "text-[#12b76a]"
              : "text-[#737686]"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;