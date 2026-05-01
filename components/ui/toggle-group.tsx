import React from 'react';

interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  name?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  options,
  value,
  onChange,
  label,
  name,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg inline-flex">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center cursor-pointer flex-1"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="sr-only"
            />
            <span
              className={`
                px-4 py-2 rounded-md font-medium transition-all duration-200
                flex items-center gap-2 justify-center text-sm
                ${
                  value === option.value
                    ? 'bg-white text-[#1E3A5F] shadow-sm border border-[#1E3A5F]'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {option.icon && <span>{option.icon}</span>}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

ToggleGroup.displayName = 'ToggleGroup';
