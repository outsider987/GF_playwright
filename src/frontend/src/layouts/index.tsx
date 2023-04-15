import React from 'react';

type Props = {
  children?: React.ReactNode;
};
const MainWrapper: React.FC<Props> = ({ children }) => {
  return <div className="f-full flex min-h-[90vh] w-full flex-row bg-greyscale px-[2vw] py-[2vh] ">{children}</div>;
};
export default MainWrapper;
