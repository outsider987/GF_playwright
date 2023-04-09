import React, { ReactElement, useEffect, useState } from 'react';

interface Props {
  desktop: () => JSX.Element;
  mobile: () => JSX.Element;
}

const LayoutDivider: React.FC<Props> = ({ desktop, mobile }) => {
  const [width, setWindowWidth] = useState(0);
  useEffect(() => {
    updateDimensions();

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  const updateDimensions = () => {
    const width = window.innerWidth;
    setWindowWidth(width);
  };
  return <>{width > 1024 ? desktop() : mobile()}</>;
};
export default LayoutDivider;
