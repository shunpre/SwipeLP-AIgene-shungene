
import React from 'react';

interface RadioToggleProps {
  label: string;
  description?: string;
  options: { label: string; value: boolean }[];
  value: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}

const RadioToggle: React.FC<RadioToggleProps> = ({ label, description, options, value, onChange, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h3 className="text-lg font-semibold text-slate-800">{label}</h3>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {options.map((option) => (
            <label key={option.label} className="flex items-center space-x-2 cursor-pointer text-slate-700">
              <input
                type="radio"
                name={label}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
                className="hidden"
              />
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${value === option.value ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                {value === option.value && <span className="w-2 h-2 rounded-full bg-white"></span>}
              </span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      {value && (
        <div className="mt-6 pt-6 border-t border-slate-200/80">
          {children}
        </div>
      )}
    </div>
  );
};

export default RadioToggle;
