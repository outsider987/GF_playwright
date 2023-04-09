import React, { useState } from 'react';
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  toggle: boolean;
  backdrop?: () => void;
}
const Modal: React.FC<ModalProps> = (props) => {
  const [toggle, setToggle] = useState(props.toggle);
  if (props.toggle) {
    return (
      <div
        {...props}
        onClick={props.backdrop}
        className={`absolute inset-0 z-50
        m-auto flex h-full animate-fade_in
        items-center
        justify-center
        overflow-hidden
        bg-gray-800/50
        `}
      >
        {props.children}
      </div>
    );
  } else {
    return <></>;
  }
};
export default Modal;
