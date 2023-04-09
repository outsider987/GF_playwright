import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import MainWrapper from '~/layouts';
import NavBar from '~/layouts/NavBar';

const Main = () => {
    const { pathname } = useLocation();
    let contentContainer = pathname === '/profile' ? 'content_tags_container' : 'content_container';
    contentContainer = pathname === '/canvas/image-editor' ? 'content_editor_container' : 'content_container';
    return (
        <MainWrapper>
            <NavBar></NavBar>
            <div className={contentContainer}>
                {useLocation().pathname !== '/home' ? <Outlet /> : <Navigate to={'/profile'} />}
                {/* <Outlet /> */}
            </div>
        </MainWrapper>
    );
};
export default Main;
