import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/context/DataContext';
import routes from './routes';

const App: React.FC = () => {
  return (
    <DataProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[210px] min-h-screen">
          <div className="mx-auto max-w-[1120px] px-4 md:px-6 lg:px-8 py-5 md:py-6">
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
