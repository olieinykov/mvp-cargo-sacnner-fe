import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { AuditsPage } from './pages/AuditsPage';

const App: React.FC = () => (
  <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <Sidebar />
    <main className="min-h-0 flex-1 overflow-auto p-6">
      <AuditsPage />
    </main>
  </div>
);

export default App;

