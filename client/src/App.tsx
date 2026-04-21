import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '@/shared/components/Layout';
import { ProtectedRoute } from '@/domains/auth/components/ProtectedRoute';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useUserSync } from '@/hooks/useUserSync';
import { ImpersonationProvider } from '@/domains/admin/context/ImpersonationContext';

import { HomePage } from '@/pages/HomePage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { ManualPage } from '@/pages/ManualPage';
import { UnderDevelopmentPage } from '@/pages/UnderDevelopmentPage';

// Lazy load heavier pages
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const NewFormPage = lazy(() =>
  import('@/pages/NewFormPage').then((m) => ({ default: m.NewFormPage }))
);
const FormDetailPage = lazy(() =>
  import('@/pages/FormDetailPage').then((m) => ({ default: m.FormDetailPage }))
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const PayslipsPage = lazy(() =>
  import('@/pages/PayslipsPage').then((m) => ({ default: m.PayslipsPage }))
);
const HelpPage = lazy(() =>
  import('@/pages/HelpPage').then((m) => ({ default: m.HelpPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const AdminUserDetailPage = lazy(() =>
  import('@/pages/admin/AdminUserDetailPage').then((m) => ({ default: m.AdminUserDetailPage }))
);
const AdminFormsPage = lazy(() =>
  import('@/pages/admin/AdminFormsPage').then((m) => ({ default: m.AdminFormsPage }))
);
const AdminPayslipConstantsPage = lazy(() =>
  import('@/pages/admin/AdminPayslipConstantsPage').then((m) => ({ default: m.AdminPayslipConstantsPage }))
);
const EmployeeCardsPage = lazy(() =>
  import('@/domains/employees/EmployeeCardsPage').then((m) => ({ default: m.EmployeeCardsPage }))
);
const EmployeeDetailPage = lazy(() =>
  import('@/domains/employees/EmployeeDetailPage').then((m) => ({ default: m.EmployeeDetailPage }))
);
const EmployeeFormPage = lazy(() =>
  import('@/domains/employees/components/EmployeeFormPage').then((m) => ({ default: m.EmployeeFormPage }))
);
const WorkLogPage = lazy(() =>
  import('@/domains/worklog/WorkLogPage').then((m) => ({ default: m.WorkLogPage }))
);

function ImpersonationLayout() {
  return (
    <ImpersonationProvider>
      <Outlet />
    </ImpersonationProvider>
  );
}

function AppRoutes() {
  useUserSync();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="sign-in/*" element={<SignInPage />} />
        <Route path="sign-up/*" element={<SignUpPage />} />
        <Route path="manual" element={<ManualPage />} />
        <Route path="under-development" element={<UnderDevelopmentPage />} />

        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageLoading />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="employees"
            element={
              <Suspense fallback={<PageLoading />}>
                <EmployeeCardsPage />
              </Suspense>
            }
          />
          <Route
            path="employees/new"
            element={
              <Suspense fallback={<PageLoading />}>
                <EmployeeFormPage mode="create" />
              </Suspense>
            }
          />
          <Route
            path="employees/:id"
            element={
              <Suspense fallback={<PageLoading />}>
                <EmployeeDetailPage />
              </Suspense>
            }
          />
          <Route
            path="employees/:id/edit"
            element={
              <Suspense fallback={<PageLoading />}>
                <EmployeeFormPage mode="edit" />
              </Suspense>
            }
          />
          <Route
            path="worklog"
            element={
              <Suspense fallback={<PageLoading />}>
                <WorkLogPage />
              </Suspense>
            }
          />
          <Route
            path="payslips"
            element={
              <Suspense fallback={<PageLoading />}>
                <PayslipsPage />
              </Suspense>
            }
          />
          <Route
            path="forms/new"
            element={
              <Suspense fallback={<PageLoading />}>
                <NewFormPage />
              </Suspense>
            }
          />
          <Route
            path="forms/:id"
            element={
              <Suspense fallback={<PageLoading />}>
                <FormDetailPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoading />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route path="profile" element={<Navigate to="/settings" replace />} />
          <Route
            path="help"
            element={
              <Suspense fallback={<PageLoading />}>
                <HelpPage />
              </Suspense>
            }
          />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route
            path="admin"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="admin/users"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminUsersPage />
              </Suspense>
            }
          />
          <Route
            path="admin/users/:id"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminUserDetailPage />
              </Suspense>
            }
          />
          <Route
            path="admin/forms"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminFormsPage />
              </Suspense>
            }
          />
          <Route
            path="admin/payslip-constants"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminPayslipConstantsPage />
              </Suspense>
            }
          />

          {/* Impersonation routes — admin managing another user's data */}
          <Route path=":userId" element={<ImpersonationLayout />}>
            <Route
              path="employees"
              element={
                <Suspense fallback={<PageLoading />}>
                  <EmployeeCardsPage />
                </Suspense>
              }
            />
            <Route
              path="employees/new"
              element={
                <Suspense fallback={<PageLoading />}>
                  <EmployeeFormPage mode="create" />
                </Suspense>
              }
            />
            <Route
              path="employees/:id/edit"
              element={
                <Suspense fallback={<PageLoading />}>
                  <EmployeeFormPage mode="edit" />
                </Suspense>
              }
            />
            <Route
              path="worklog"
              element={
                <Suspense fallback={<PageLoading />}>
                  <WorkLogPage />
                </Suspense>
              }
            />
            <Route
              path="forms/new"
              element={
                <Suspense fallback={<PageLoading />}>
                  <NewFormPage />
                </Suspense>
              }
            />
            <Route
              path="forms/:id"
              element={
                <Suspense fallback={<PageLoading />}>
                  <FormDetailPage />
                </Suspense>
              }
            />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoading />}>
                  <DashboardPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
