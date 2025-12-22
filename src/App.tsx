import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataProvider } from '@/context/DataContext';
import routes from './routes';

const App: React.FC = () => {
  return (
    <DataProvider>
      <div className="flex min-h-screen relative">
        {/* Premium Background Pattern */}
        <div className="fixed inset-0 -z-10 bg-background">
          <div className="absolute inset-0 bg-gradient-radial opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 p-3 md:p-4 lg:p-8 transition-all duration-300 overflow-x-hidden w-full">
          <div className="mx-auto max-w-7xl w-full">
            <Routes>
              {routes.map((route, index) => {
                const Component = route.component;
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={<Component />}
                  />
                );
              })}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <Toaster />
      </div>
    </DataProvider>
  );
};

export default App;
