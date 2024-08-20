import { Navigate } from 'react-router-dom';

import DashboardLayout from '@/layouts/dashboard';
import { APP_HOMEPAGE } from '@/utils/contant';

import AuthGuard from '../components/auth-guard';
import { getRoutesFromModules } from '../utils';

import { AppRouteObject } from '#/router';

const menuModuleRoutes = getRoutesFromModules();

/**
 * dynamic routes
 */
export const menuRoutes: AppRouteObject = {
  path: '/',
  element: (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  ),
  children: [{ index: true, element: <Navigate to={APP_HOMEPAGE} replace /> }, ...menuModuleRoutes],
};
