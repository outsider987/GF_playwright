import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import Page404 from '~/pages/Page404';

const lazyLoad = (Comp: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (
    <Suspense fallback={<>加载中...</>}>
      <Comp />
    </Suspense>
  );
};
const HomeRoute = {
  path: '/',
  element: lazyLoad(React.lazy(() => import('~/pages'))),
  icon: 'logo',
  children: [
    {
      path: '/routine',
      element: lazyLoad(React.lazy(() => import('~/pages/Routine'))),
      iconName: 'template',
      isShow: true,
      text: 'routine',
    },
    {
      path: '/downLoadImage',
      element: lazyLoad(React.lazy(() => import('~/pages/downLoadImage'))),
      iconName: 'template',
      isShow: true,
      text: 'downLoad',
    },
    {
      path: '/settings',
      element: lazyLoad(React.lazy(() => import('~/pages/Settings'))),
      iconName: 'template',
      isShow: true,
      text: 'settings',
    },
  ],
};
const routes = [
  HomeRoute,
  {
    path: '*',
    element: <Page404 />,
    icon: 'logo',
  },
];

const MYRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

export { MYRoutes, routes, HomeRoute };
