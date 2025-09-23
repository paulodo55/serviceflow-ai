'use client';

import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function ToggleSwitch({ 
  enabled, 
  onChange, 
  label, 
  description, 
  size = 'md',
  disabled = false 
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: {
      switch: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: enabled ? 'translate-x-5' : 'translate-x-0'
    },
    md: {
      switch: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translate: enabled ? 'translate-x-6' : 'translate-x-0.5'
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: enabled ? 'translate-x-7' : 'translate-x-0.5'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${label || description ? 'justify-between' : ''}`}>
      {(label || description) && (
        <div className="flex-1 mr-4">
          {label && (
            <h4 className="text-sm font-medium text-gray-900">{label}</h4>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`${classes.switch} relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled 
            ? 'bg-blue-600' 
            : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        role="switch"
        aria-checked={enabled}
      >
        <motion.span
          className={`${classes.thumb} inline-block bg-white rounded-full shadow-sm transform transition-transform duration-200`}
          animate={{ x: enabled ? (size === 'sm' ? 20 : size === 'md' ? 24 : 28) : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
