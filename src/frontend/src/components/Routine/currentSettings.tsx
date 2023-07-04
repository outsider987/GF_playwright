import React from 'react';
import clsx from 'clsx';
import Button from '../Button';

interface Props extends React.ButtonHTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  rounded?: boolean;
  white?: boolean;
}

const CurrentSettings: React.FC<Props> = (props) => {
  return <Button {...props}>儲存</Button>;
};
CurrentSettings.defaultProps = { rounded: false, white: true };
export default CurrentSettings;
