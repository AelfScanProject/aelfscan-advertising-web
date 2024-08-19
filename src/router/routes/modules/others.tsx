import { Suspense, lazy } from 'react';

import { Iconify } from '@/components/icon';
import { CircleLoading } from '@/components/loading';

import { AppRouteObject } from '#/router';

const TextAdvertising = lazy(() => import('@/pages/text-advertising'));
const BannerAdvertising = lazy(() => import('@/pages/banner-advertising'));

function Wrapper({ children }: any) {
  return <Suspense fallback={<CircleLoading />}>{children}</Suspense>;
}
const others: AppRouteObject[] = [
  {
    path: 'text-advertising',
    element: (
      <Wrapper>
        <TextAdvertising />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.text_advertising',
      icon: <Iconify icon="solar:clipboard-bold-duotone" size={24} />,
      key: '/text-advertising',
    },
  },
  {
    path: 'banner-advertising',
    element: (
      <Wrapper>
        <BannerAdvertising />
      </Wrapper>
    ),
    meta: {
      label: 'sys.menu.banner_advertising',
      icon: <Iconify icon="solar:clipboard-bold-duotone" size={24} />,
      key: '/banner-advertising',
    },
  },
];

export default others;
