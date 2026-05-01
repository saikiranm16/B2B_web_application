import React from 'react';

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioCardGroupProps {
  options: RadioCardOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  name?: string;
  columns?: number;
}

export const RadioCardGroup: React.FC<RadioCardGroupProps> = ({
  options,
  value,
  onChange,
  label,
  name,
  columns = 2,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className={`grid grid-cols-${columns} gap-3`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="sr-only"
            />
            <div
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
                flex items-start gap-3
                ${
                  value === option.value
                    ? 'border-[#1E3A5F] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div
                className={`
                  flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center
                  ${
                    value === option.value
                      ? 'border-[#1E3A5F] bg-[#1E3A5F]'
                      : 'border-gray-300'
                  }
                `}
              >
                {value === option.value && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{option.label}</p>
                {option.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

RadioCardGroup.displayName = 'RadioCardGroup';
