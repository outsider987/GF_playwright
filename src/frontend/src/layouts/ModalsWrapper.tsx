import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorDialog from '~/components/modals/ErrorDialog';
import LoadingModal from '~/components/modals/Loading';
import { store, selectGlobal } from '~/store';
import { setAlertDialog } from '~/store/global';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  // children: React.ReactNode;
}

const ModalsWrapper = (props: Props) => {
  const globalSelector = useSelector(selectGlobal);
  const dispatch = useDispatch();
  return (
    <>
      <LoadingModal titile={'loading'} toggle={globalSelector.loadingDialog.show} />
      <ErrorDialog
        toggle={globalSelector.alertDialog.show}
        msg={globalSelector.alertDialog.msg}
        backdrop={() => dispatch(setAlertDialog({ ...globalSelector.alertDialog, show: false }))}
        titile={globalSelector.alertDialog.title}
      />
      {props.children}
    </>
  );
};
export default ModalsWrapper;
