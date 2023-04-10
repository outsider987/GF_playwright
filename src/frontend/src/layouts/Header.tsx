import { Close } from '@mui/icons-material';
import React from 'react';
import { ipcRenderer } from 'electron';

type Props = {
  children?: React.ReactNode;
};
const Header: React.FC<Props> = ({ children }) => {
  const handleClose = async () => {
    console.log('test');
    // ipcRenderer.send('closeWindow');
    const res = await ipcRenderer.invoke('closeWindow').then(() => {
      console.log('Window closed successfully');
    });
    console.log(res);
  };

  return (
    <div className=" relative flex h-[10vw] w-full items-center justify-center bg-orange-500 text-center text-4xl font-bold text-white">
      <div id="header" className="flex w-full justify-center text-center">
        Robot
      </div>

      <div id="close" className="flex w-[5vw]" onClick={handleClose}>
        <Close></Close>
      </div>
    </div>
  );
};
export default Header;
