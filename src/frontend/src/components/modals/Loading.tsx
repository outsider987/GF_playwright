import React from 'react';
import Button from '../Button';
import Modal from './Modal';
import { ModalProps } from './Modal';
import SvgICon from '../SvgIcon';

interface Props extends ModalProps {
  msg?: string;
  children?: React.ReactNode;
  titile?: string;
}
const LoadingModal = (props: Props) => {
  return (
    <Modal toggle={props.toggle} backdrop={props.backdrop}>
      <SvgICon className="animate-spin" name="spin" />
    </Modal>
  );
};
export default LoadingModal;
