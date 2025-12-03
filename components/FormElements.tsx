import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: React.ReactNode;
  error?: string;
}

export const TextInput: React.FC<InputProps> = ({ label, description, error, ...props }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
      {props.required && <span className="text-red-500 text-xs font-normal ml-1">必須</span>}
    </label>
    <input
      {...props}
      className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
    />
    {description && <div className="mt-1 text-xs text-slate-500">{description}</div>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: React.ReactNode;
  error?: string;
}

export const TextareaInput: React.FC<TextareaProps> = ({ label, description, error, ...props }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
       {props.required && <span className="text-red-500 text-xs font-normal ml-1">必須</span>}
    </label>
    <textarea
      {...props}
      className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
    />
    {description && <div className="mt-1 text-xs text-slate-500 space-y-1">{description}</div>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);