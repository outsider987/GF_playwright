import React from 'react';

type Props = {
  children?: React.ReactNode;
};
const MainWrapper: React.FC<Props> = ({ children }) => {
  return <div className="flex min-h-screen w-full bg-greyscale sm:flex-col lg:flex-row">{children}</div>;
};
export default MainWrapper;
