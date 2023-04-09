import React, { ChangeEvent } from 'react';
import clsx from 'clsx';

interface Props {
  name?: string;

  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
const CheckBox = ({ name, checked, onChange }: Props) => {
  return (
    <div className="mb-4 flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
      />
    </div>
  );
};

export default CheckBox;
