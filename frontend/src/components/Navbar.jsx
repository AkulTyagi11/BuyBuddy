import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ShoppingCart, LayoutDashboard, Menu, X, ChevronDown, Package } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../stores/authStore';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pantry', label: 'Pantry', icon: Package },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border-default/75 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 font-bold text-xl text-brand-primary transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="hidden sm:inline text-neutral-dark group-hover:text-brand-primary">GroceryList</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 rounded-xl bg-neutral-light/80 p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-text-muted hover:bg-white/70 hover:text-neutral-dark'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-3 right-3 h-0.5 origin-left rounded-full bg-brand-primary transition-transform duration-250 ${
                      isActive(link.to) ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-white px-3 py-1.5 text-sm text-text-muted transition hover:bg-neutral-light"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary-light text-xs font-semibold text-brand-primary">
                {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="max-w-28 truncate">{user?.first_name || user?.username}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="dropdown-enter absolute right-6 top-14 z-50 w-56 rounded-xl border border-border-default bg-white p-2 shadow-xl" role="menu">
                <div className="mb-2 rounded-lg bg-neutral-light px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Signed in as</p>
                  <p className="mt-1 truncate text-sm font-medium text-neutral-dark">{user?.username}</p>
                </div>
                <Button
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await handleLogout();
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-text-muted hover:text-semantic-error hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setMobileOpen(!mobileOpen)}
              variant="ghost"
              size="sm"
              className="p-2! text-text-muted hover:text-neutral-dark"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-250 ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-neutral-dark/30"
          aria-label="Close navigation panel"
        />
        <div
          className={`absolute right-0 top-0 h-full w-72 border-l border-border-default bg-white p-4 shadow-2xl transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-text-muted">Navigation</span>
            <Button
              variant="ghost"
              size="sm"
              className="p-2! text-text-muted"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-brand-primary-light text-brand-primary'
                    : 'text-text-muted hover:bg-neutral-light hover:text-neutral-dark'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-border-default pt-4">
            <p className="mb-3 text-sm text-text-muted">
              Signed in as <strong>{user?.username}</strong>
            </p>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              fullWidth
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
