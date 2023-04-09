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
    if (children) {
      return (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex cursor-pointer flex-row items-center justify-between"
        >
          <SvgICon name={iconName} className={`relative justify-center ${isFocus ? 'text-white' : 'text-[#6A6A6A]'}`}>
            {isFocus && (
              <div className="absolute right-[-16.6%] top-[-20.83%] h-[22%] w-[22%] rounded-full bg-navBarUnFocusBlue" />
            )}
          </SvgICon>
          <span
            className={`absolute inset-0 m-auto min-h-[18px] text-center ${
              level > 1 ? 'text-xs' : 'text-lg'
            } leading-[150%] tracking-[0.4px] text-white`}
          >
            {text}
          </span>
          <SvgICon name="arrow" className={isOpen ? 'rotate-90' : 'rotate-[270deg]'}></SvgICon>
        </div>
      );
    } else {
      return (
        <Link
          onClick={onClick}
          to={path}
          className="relative flex flex-col items-center justify-center hover:bg-greyscale/20 "
        >
          <SvgICon name={iconName} className={`relative justify-center ${isFocus ? 'text-white' : 'text-[#6A6A6A]'}`}>
            {isFocus && (
              <div className="absolute right-[-16.6%] top-[-20.83%] h-[22%] w-[22%] rounded-full bg-navBarUnFocusBlue" />
            )}
          </SvgICon>
          <span className="min-h-[18px] text-center text-xs leading-[150%] tracking-[0.4px] text-white ">{text}</span>
        </Link>
      );
    }
  };

  return (
    <div className="relative flex w-full flex-col">
      {renderRootItem()}
      {children && isOpen && (
        <li className="relative flex flex-col space-y-2  bg-orange-500 ">
          {children.map((subItem, index) => (
            <NavBarItem className="z-[99] " key={index} {...subItem} level={level} />
          ))}
          {/* <div className=" absolute inset-0 bg-greyscale/50 blur-md"></div> */}
        </li>
      )}
    </div>
  );
};
export default NavBarItem;
