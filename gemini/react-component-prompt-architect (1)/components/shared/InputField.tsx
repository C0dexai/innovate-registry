import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, hint, className, ...props }) => (
  <div className={className}>
    <div className="flex justify-between items-center mb-1">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-muted)]">
        {label}
      </label>
      {hint}
    </div>
    <input
      id={id}
      {...props}
      className="w-full bg-[var(--color-background-offset)] border border-[var(--border-color)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
    />
  </div>
);

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: React.ReactNode;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, id, hint, ...props }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-muted)]">
                {label}
            </label>
            {hint}
        </div>
        <textarea
            id={id}
            rows={3}
            {...props}
            className="w-full bg-[var(--color-background-offset)] border border-[var(--border-color)] rounded-md shadow-sm py-2 px-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
        />
    </div>
);