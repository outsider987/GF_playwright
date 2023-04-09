import React from 'react';

type Props = {
  children?: React.ReactNode;
};
const MainWrapper: React.FC<Props> = ({ children }) => {
  return <div className="flex min-h-screen w-full flex-row  bg-greyscale">{children}</div>;
};
export default MainWrapper;
