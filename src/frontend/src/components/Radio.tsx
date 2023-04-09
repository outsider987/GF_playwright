import React, { ChangeEvent } from 'react';
import clsx from 'clsx';

interface Props {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
const Radio = ({ label, name, value, checked, onChange }) => {
  const inputClasses = clsx(
    'form-radio absolute inset-0 rounded-full text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
    {
      'ring-2 ring-offset-2 ring-orange-500': checked,
    },
  );
  const container = clsx(
    'relative flex h-[5vw] w-[5vw] items-center space-x-2 rounded-full bg-white',
    checked ? 'bg-orange-500' : 'bg-white',
  );

  return (
    <label className={container}>
      <input type="radio" className={inputClasses} name={name} value={value} checked={checked} onChange={onChange} />
      <span className="font-medium text-gray-900">{label}</span>
    </label>
  );
};

export default Radio;
