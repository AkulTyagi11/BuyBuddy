import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ListDetailPage from './pages/ListDetailPage';
import PantryPage from './pages/PantryPage';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import useThemeStore from './stores/themeStore';

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            border: '1px solid var(--color-border-default)',
            boxShadow: '0 14px 30px rgba(43, 36, 28, 0.18)',
            padding: '12px 14px',
            background: 'var(--color-surface)',
            color: 'var(--color-neutral-dark)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/lists/:id" element={<ListDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
