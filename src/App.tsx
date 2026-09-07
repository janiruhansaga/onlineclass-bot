import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TestModeBanner } from './components/common/TestModeBanner';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';

import { DashboardPage } from './pages/DashboardPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { EscalationsPage } from './pages/EscalationsPage';
import { LmsSimulatorPage } from './pages/LmsSimulatorPage';
import { CoursesPage } from './pages/CoursesPage';
import { SequencesPage } from './pages/SequencesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'simulator': return <SimulatorPage />;
      case 'playground': return <PlaygroundPage />;
      case 'kb': return <KnowledgeBasePage />;
      case 'escalations': return <EscalationsPage />;
      case 'lms': return <LmsSimulatorPage />;
      case 'courses': return <CoursesPage />;
      case 'sequences': return <SequencesPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      case 'logs': return <ActivityLogsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner Indicator */}
      <TestModeBanner />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Deep Navy Sidebar */}
        <Sidebar />

        {/* Content View Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header />
          <main className="flex-1">
            {renderCurrentPage()}
          </main>
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
