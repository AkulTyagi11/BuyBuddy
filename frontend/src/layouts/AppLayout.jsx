import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent text-neutral-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
