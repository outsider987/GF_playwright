import React from 'react';
import Button from '../Button';
import Modal from './Modal';
import { ModalProps } from './Modal';
import Input from '../Input/Input';

interface Props extends ModalProps {
  msg?: string;
  children?: React.ReactNode;
  titile: string;
  value: string;
  setvalue: any;
  onConfirm: (event: any) => Promise<void>;
}
const NamingModal = (props: Props) => {
  const onInPutChange = (e: any) => {
    props.setvalue(e.target.value);
  };
  return (
    <Modal toggle={props.toggle} backdrop={props.backdrop}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex min-h-[50vh] w-0 animate-pop flex-col rounded-xl bg-greyscale p-[1%] shadow-2xl sm:min-w-[90vw]  lg:min-w-[50vw]"
      >
        <Input value={props.value} onChange={onInPutChange}></Input>
        <div className="mb-8 flex flex-row justify-center space-x-4 px-5">
          <Button className="flex w-[20vw] border-[0px]" white={true} onClick={props.backdrop}>
            取消
          </Button>

          <Button className="flex w-[20vw] border-[0px]" white={true} onClick={props.onConfirm}>
            確認
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default NamingModal;
