import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SvgICon from '~/components/SvgIcon';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  iconName: string;
  path: string;
  text: string;
  isFocus: boolean;
  isShow: boolean;
  onClick?: () => void;
  children?: any[];
  slug?: React.ReactNode;
  level?: number;
}

const NavBarItem: React.FC<Props> = ({ level = 0, children, iconName, path, isShow, isFocus, text, onClick }) => {
  if (!isShow) {
    return <></>;
  }
  level++;

  const [isOpen, setIsOpen] = useState(false);
  const renderRootItem = () => {
    {
      return (
        <Link
          onClick={onClick}
          to={path}
          className="relative flex flex-col items-center justify-center  hover:bg-greyscale/20 "
        >
          <SvgICon
            name={iconName}
            className={`relative flex justify-center ${isFocus ? 'text-white' : 'text-[#6A6A6A]'}`}
          >
            {isFocus && <div className="absolute right-4 top-[-20.83%] h-2 w-2 rounded-full bg-navBarUnFocusBlue" />}
          </SvgICon>
          <span className="min-h-[18px] text-center  leading-[150%] tracking-[0.4px] text-white ">{text}</span>
        </Link>
      );
    }
  };

  return <div className="relative flex w-full flex-col">{renderRootItem()}</div>;
};
export default NavBarItem;
