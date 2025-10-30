/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import styles from './input.module.css';
import { cn } from '@/lib/utils';
import { validateEmail } from '@/utils';
import type { InputHTMLAttributes } from 'react';

interface ValidatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  title: string;
  dependencies?: any[];
  setValue?: (value: any) => void;
  overrideValidate?: (value: string) => boolean;
  isValid?: boolean | null;
  onValidChange?: (valid: boolean) => void;
  containerClassName?: string;
  labelClassName?: string;
  inputContainerClassName?: string;
  inputClassName?: string;
  iconContainerClassName?: string;
  children?: React.ReactNode;
}

function ValidatedInput({
  title,
  name,
  value,
  setValue,
  overrideValidate,
  isValid: externallyControlledValid,
  onValidChange,
  containerClassName,
  labelClassName,
  inputContainerClassName,
  inputClassName,
  iconContainerClassName,
  children,
  type = 'text',
  ...rest
}: ValidatedInputProps) {
  const [inputValue, setInputValue] = useState<string | number | readonly string[]>(value || '');
  const [internalValid, setInternalValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isControlled = value !== undefined && setValue !== undefined;

  const showValid = externallyControlledValid ?? internalValid;
  const inputCurrentValue = isControlled ? value : inputValue;

  const validate = useMemo(() => overrideValidate ?? ((val: string) => {
    if (type === 'email') return validateEmail(val);
    if (type === 'password') return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(val);
    if (type === 'phone') return /^\+?[1-9]\d{1,14}$/.test(val);
    if (type === 'text') return val.trim().length >= 1;
    return true;
  }), [overrideValidate, type]);

  useEffect(() => {
    setInternalValid(validate(String(inputCurrentValue)));
  }, [inputCurrentValue, validate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (isControlled) {
      setValue!(newVal);
    } else {
      setInputValue(newVal);
    }
    const valid = validate(newVal);
    setInternalValid(valid);
    onValidChange?.(valid);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn('flex flex-col', containerClassName)}>
      <label className={cn('text-lg font-medium', labelClassName)} htmlFor={name}>
        {title}
        {children}
      </label>

      <div className={cn('relative inline-block', inputContainerClassName)}>
        <input
          {...rest}
          className={cn('outline-none text-slate-900 placeholder:text-gray-500', inputClassName)}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          name={name}
          id={name}
          value={inputCurrentValue}
          onChange={handleChange}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={cn(
              'cursor-pointer absolute top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none',
              showValid !== null ? 'right-10' : 'right-3'
            )}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}

        {showValid !== null && (
          <span className={cn(styles.icon_container, iconContainerClassName)}>
            {showValid ? (
              <Check className={`${styles.icon} ${styles.icon_valid}`} />
            ) : (
              <X className={`${styles.icon} ${styles.icon_invalid}`} />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export default ValidatedInput;