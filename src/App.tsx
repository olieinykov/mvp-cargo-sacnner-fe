import React from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { AuditsPage } from './pages/AuditsPage';
import { UsersPage } from './pages/UsersPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { InvitePage } from './pages/InvitePage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { Navigate, Outlet, Route, Routes, useSearchParams } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/routing/ProtectGuard';
import { useMeQuery } from './lib/api/auth';
import { CompanyDetailsPage } from './pages/CompanyDetailsPage';
import { CompanyInspectionsPage } from './pages/CompanyInspectionsPage';

const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="min-h-0 flex-1 overflow-auto bg-primary/[0.04] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ─── App ───────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const { data: user, isLoading } = useMeQuery();
  const isAdmin = user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/invite" element={<InvitePage token={token} />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/audits" element={<AuditsPage />} />
            
            <Route 
              path="/users" 
              element={
                isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : isAdmin ? (
                  <UsersPage />
                ) : (
                  <Navigate to="/audits" replace />
                )
              } 
            />
            <Route path="/company" element={<CompanyDetailsPage />} />
            <Route path="/company/inspections" element={<CompanyInspectionsPage />} />
            <Route path="*" element={<Navigate to="/audits" replace />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
      
      <AppToaster />
    </>
  );
};

export default App;

// ─── Toaster ───────────────────────────────────────────────────────────────────

function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:       'rounded-xl border border-border bg-background text-foreground shadow-lg text-sm',
          title:       'font-semibold',
          description: 'text-muted-foreground',
          success:     'border-emerald-200 bg-emerald-50 text-emerald-900',
          error:       'border-red-200 bg-red-50 text-red-900',
        },
      }}
    />
  );
}