import React from 'react';

type Props = {
  children?: React.ReactNode;
};
const Header: React.FC<Props> = ({ children }) => {
  return <div id="header" className=" h-[10vw]  bg-orange-500"></div>;
};
export default Header;
