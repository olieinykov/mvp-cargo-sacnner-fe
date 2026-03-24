import React from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { AuditsPage } from './pages/AuditsPage';

const App: React.FC = () => (
  <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <MobileHeader />
      <main className="min-h-0 flex-1 overflow-auto bg-primary/[0.04] p-4 md:p-6">
        <AuditsPage />
      </main>
    </div>
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-border bg-background text-foreground shadow-lg text-sm',
          title: 'font-semibold',
          description: 'text-muted-foreground',
          success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
          error: 'border-red-200 bg-red-50 text-red-900',
        },
      }}
    />
  </div>
);

export default App;

