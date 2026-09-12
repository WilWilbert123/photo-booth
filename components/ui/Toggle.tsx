import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  icon,
}) => {
  return (
    <div className="flex items-center justify-between py-1.5 cursor-pointer" onClick={() => onChange(!checked)}>
      {(label || description || icon) && (
        <div className="flex items-center gap-3 pr-4">
          {icon && <div className="text-zinc-500 dark:text-zinc-400 shrink-0">{icon}</div>}
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>}
            {description && <span className="text-xs text-zinc-400 dark:text-zinc-500">{description}</span>}
          </div>
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
