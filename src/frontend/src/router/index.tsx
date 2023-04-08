import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import Home from '~/pages/Home';
import Sort from '~/pages/Home/Sort';
import QuickSort from '~/pages/Home/Sort/QuickSort';
import Page404 from '~/pages/Page404';

QuickSort;

const lazyLoad = (Comp: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (
    <Suspense fallback={<>加载中...</>}>
      <Comp />
    </Suspense>
  );
};
const HomeRoute = {
  path: '/',
  element: lazyLoad(React.lazy(() => import('~/pages/Home'))),
  icon: 'logo',
  children: [
    {
      path: '/profile',
      element: lazyLoad(React.lazy(() => import('~/pages/Home/Profile'))),
      icon: 'template',
      isShow: true,
      text: 'profile',
    },
    {
      path: '/sort',
      element: lazyLoad(React.lazy(() => import('~/pages/Home/Sort'))),
      icon: 'template',
      isShow: true,
      text: 'Sort',
      children: [
        {
          path: '/sort/quicksort',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Sort/QuickSort'))),
          icon: 'template',
          isShow: true,
          text: 'QuickSort',
        },
        {
          path: '/sort/mergesort',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Sort/MergeSort'))),
          icon: 'template',
          isShow: true,
          text: 'MergeSort',
          // children: [
          //   {
          //     path: '/sort/mergesort',
          //     element: lazyLoad(React.lazy(() => import('~/pages/Home/Sort/MergeSort'))),
          //     icon: 'template',
          //     isShow: true,
          //     text: 'test',
          //     children: [
          //       {
          //         path: '/sort/mergesort/2',
          //         element: lazyLoad(React.lazy(() => import('~/pages/Home/Sort/MergeSort'))),
          //         icon: 'template',
          //         isShow: true,
          //         text: 'test',
          //       },
          //     ],
          //   },
          // ],
        },
      ],
    },
    {
      path: '/member',
      element: lazyLoad(React.lazy(() => import('~/pages/Home/Member'))),
      icon: 'template',
      isShow: true,
      text: 'member',
      children: [
        {
          path: '/member/login',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Member/Login'))),
          icon: 'template',
          isShow: true,
          text: 'login',
        },
        {
          path: '/member/register',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Member/Register'))),
          icon: 'template',
          isShow: true,
          text: 'register',
        },
      ],
    },

    {
      path: '/performance',
      element: lazyLoad(React.lazy(() => import('~/pages/Home/Performance'))),
      icon: 'template',
      isShow: true,
      text: 'performance',
      children: [
        {
          path: '/performance/infinite',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Performance/InfiniteScroll'))),
          icon: 'template',
          isShow: true,
          text: 'infinite',
        },
        {
          path: '/performance/carousel',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Performance/Carousel'))),
          icon: 'template',
          isShow: true,
          text: 'carousel',
        },
        {
          path: '/performance/debounce',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Performance/Debounce'))),
          icon: 'template',
          isShow: true,
          text: 'debounce',
        },
      ],
    },
    {
      path: '/canvas',
      element: lazyLoad(React.lazy(() => import('~/pages/Home/Performance'))),
      icon: 'template',
      isShow: true,
      text: 'canvas',
      children: [
        // {
        //   path: '/canvas/game',
        //   element: lazyLoad(React.lazy(() => import('~/pages/Home/Canvas/Game'))),
        //   icon: 'template',
        //   isShow: true,
        //   text: 'Demo Game',
        // },
        {
          path: '/canvas/breakout',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Canvas/Breakout'))),
          icon: 'template',
          isShow: true,
          text: 'Breakout',
        },
        {
          path: '/canvas/image-editor',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Canvas/ImageEditor'))),
          icon: 'template',
          isShow: true,
          text: 'ImageEditor',
        },
        {
          path: '/canvas/chart',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Canvas/Chart'))),
          icon: 'template',
          isShow: true,
          text: 'Chart',
        },

        {
          path: '/canvas/box',
          element: lazyLoad(React.lazy(() => import('~/pages/Home/Canvas/Box'))),
          icon: 'template',
          isShow: true,
          text: 'Box Demo',
        },
      ],
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
