import React from 'react';
import clsx from 'clsx';
import Input from '../Input/Input';
import CheckBox from '../Input/CheckBox';

interface Props extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  type?: 'input' | 'select' | 'textarea' | 'checkbox';
  name?: string;
  value?: any;
}

const Filed: React.FC<Props> = (props) => {
  const { className } = props;
  const whiteClass = clsx('bg-white', 'text-[#121212]', 'hover:bg-[#121212]', 'hover:text-white');
  const darkClass = clsx('bg-[#121212]', 'text-white', 'hover:bg-white', 'hover:text-[#121212]');

  const buttonClass = clsx(
    'flex',
    'items-center',
    'justify-center',
    'border',
    'border-solid',
    'border-black',
    'py-[0.8125rem]',
    'px-[0.625rem]',
    'font-bold',
    'leading-[100%]',
    props.className,
  );
  switch (props.type) {
    case 'input':
      return <Input name={props.name} onChange={props.onChange}></Input>;
    case 'checkbox':
      return <CheckBox name={props.name} onChange={props.onChange} checked={props.value}></CheckBox>;

    default:
      return <div>1231</div>;
  }
};

export default Filed;
