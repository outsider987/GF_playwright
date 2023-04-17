import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import MainWrapper from '~/layouts';
import NavBar from '~/layouts/NavBar';
import { RotateLeft, ArtTrack } from '@mui/icons-material';
import clsx from 'clsx';
import Header from '~/layouts/Header';
import { useGlobalContext } from '~/store/context/hooks/global/useGlobalStateHook';
import { routes } from '~/router';
import { useGlobalIPC } from '~/ipcRenderAPI/global';
const Main = () => {
  const { pathname } = useLocation();
  let contentContainer = pathname === '/profile' ? 'content_tags_container' : 'content_container';
  contentContainer = pathname === '/canvas/image-editor' ? 'content_editor_container' : 'content_container';
  const container = clsx('flex', 'flex-col', 'text-white');
  const IconSize = '20vw';
  const { globalState, setGlobalState } = useGlobalContext();
  const { INVOKE_GET_GLOBAL_STATE } = useGlobalIPC();

  useEffect(() => {
    console.log(pathname);
    switch (pathname) {
      case '/sizeImage':
        setGlobalState({ ...globalState, mode: 'sizeImage', isRunning: false });
        break;

      case '/routine':
        setGlobalState({ ...globalState, mode: 'routine', isRunning: false });
        break;

      default:
        break;
    }
  }, [pathname]);
  useEffect(() => {
    INVOKE_GET_GLOBAL_STATE(globalState).then((res) => {
      setGlobalState({ ...globalState, ...res });
    });
  }, [pathname]);
  return (
    <>
      <Header></Header>
      <MainWrapper>
        <NavBar></NavBar>
        <div className={container}>
          {useLocation().pathname !== '/' ? (
            <Outlet />
          ) : (
            <div className="flex flex-row space-x-3">
              <div className="text-col flex w-full flex-col justify-center ">
                <RotateLeft sx={{ fontSize: IconSize }}></RotateLeft>
              </div>
              <div className="text-col flex w-full flex-col justify-center ">
                <ArtTrack sx={{ fontSize: IconSize }}></ArtTrack>
                <span className=" text-xl">sizeImage</span>
              </div>
            </div>
          )}
        </div>
      </MainWrapper>
    </>
  );
};
export default Main;
