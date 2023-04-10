import React from 'react';

type Props = {
  children?: React.ReactNode;
};
const MainWrapper: React.FC<Props> = ({ children }) => {
  return <div className="flex h-[90vh] w-full flex-row bg-greyscale px-[1vw] ">{children}</div>;
};
export default MainWrapper;
