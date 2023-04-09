import React from 'react';
import Button from '../Button';
import Modal from './Modal';
import { ModalProps } from './Modal';

interface Props extends ModalProps {
  msg?: string;
  children?: React.ReactNode;
  titile: string;
}
const ErrorDialog = (props: Props) => {
  return (
    <Modal toggle={props.toggle} backdrop={props.backdrop}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex min-h-[50vh] w-0 animate-pop flex-col rounded-xl bg-greyscale p-[1%] shadow-2xl sm:min-w-[90vw]  lg:min-w-[50vw]"
      >
        <div className="flex justify-center space-y-2 text-3xl font-bold text-white">{props.titile}</div>
        <span
          style={{ wordBreak: 'break-word' }}
          className="m-auto flex h-full max-h-[50vh] max-w-[90vw] items-center overflow-auto text-orange-400"
        >
          {props.msg}
        </span>
        <Button className="border-[0px]" white={false} onClick={props.backdrop}>
          OK!
        </Button>
      </div>
    </Modal>
  );
};
export default ErrorDialog;
