import { Routes, Route, Outlet } from 'react-router-dom';
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
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
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
const EmployeesPage = lazy(() =>
  import('@/domains/employees/components/EmployeesPage').then((m) => ({ default: m.EmployeesPage }))
);
const EmployeeFormPage = lazy(() =>
  import('@/domains/employees/components/EmployeeFormPage').then((m) => ({ default: m.EmployeeFormPage }))
);
const CompaniesPage = lazy(() =>
  import('@/domains/companies/components/CompaniesPage').then((m) => ({ default: m.CompaniesPage }))
);
const CompanyFormPage = lazy(() =>
  import('@/domains/companies/components/CompanyFormPage').then((m) => ({ default: m.CompanyFormPage }))
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
            path="profile"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="companies"
            element={
              <Suspense fallback={<PageLoading />}>
                <CompaniesPage />
              </Suspense>
            }
          />
          <Route
            path="companies/new"
            element={
              <Suspense fallback={<PageLoading />}>
                <CompanyFormPage mode="create" />
              </Suspense>
            }
          />
          <Route
            path="companies/:id/edit"
            element={
              <Suspense fallback={<PageLoading />}>
                <CompanyFormPage mode="edit" />
              </Suspense>
            }
          />
          <Route
            path="employees"
            element={
              <Suspense fallback={<PageLoading />}>
                <EmployeesPage />
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

          {/* Impersonation routes — admin managing another user's data */}
          <Route path=":userId" element={<ImpersonationLayout />}>
            <Route
              path="companies"
              element={
                <Suspense fallback={<PageLoading />}>
                  <CompaniesPage />
                </Suspense>
              }
            />
            <Route
              path="companies/new"
              element={
                <Suspense fallback={<PageLoading />}>
                  <CompanyFormPage mode="create" />
                </Suspense>
              }
            />
            <Route
              path="companies/:id/edit"
              element={
                <Suspense fallback={<PageLoading />}>
                  <CompanyFormPage mode="edit" />
                </Suspense>
              }
            />
            <Route
              path="employees"
              element={
                <Suspense fallback={<PageLoading />}>
                  <EmployeesPage />
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
