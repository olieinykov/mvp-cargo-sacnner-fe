import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuditsPage } from './pages/AuditsPage';

const App: React.FC = () => (
  <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <AuditsPage />
      </main>
    </div>
  </div>
);

export default App;

