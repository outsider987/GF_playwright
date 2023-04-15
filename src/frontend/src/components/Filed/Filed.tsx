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
  arrays?: any[];
}

const Filed: React.FC<Props> = (props) => {
  switch (props.type) {
    case 'input':
      return <Input name={props.name} value={props.value} onChange={props.onChange}></Input>;
    case 'checkbox':
      return <CheckBox name={props.name} onChange={props.onChange} checked={props.value}></CheckBox>;

    default:
      return <div></div>;
  }
};

export default Filed;
