import clsx from 'clsx';
import React, { useState } from 'react';

interface NumberInputProps extends React.HTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  value: number;
  setValue: (value: number) => void;
}

const NumberInput: React.FC<NumberInputProps> = (props) => {
  const { min = 0, max = 100, value, setValue, className } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      setValue(newValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setValue(Math.min(value + 1, max));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setValue(Math.max(value - 1, min));
    }
  };

  const inputClasses = clsx(
    className,
    'flex-1',
    'w-full',
    'rounded-lg',
    'border-2',
    'border-solid',
    'border-white',
    'bg-black',
    'px-2',
    'pt-2',
    'pb-2',
    'text-sm',
    'text-white',
    'focus:border-orange-400',
    'focus:outline-none',
  );

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      className={inputClasses}
      min={min}
      max={max}
      onKeyDown={handleKeyDown}
    />
  );
};

export default NumberInput;
