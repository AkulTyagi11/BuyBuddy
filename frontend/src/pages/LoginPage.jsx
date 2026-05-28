import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, EyeOff, User, LockKeyhole, Sparkles } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      // error is handled in store
    }
  };

  const passwordStrength = !password
    ? null
    : password.length < 6
      ? { label: 'Weak', color: 'text-semantic-error' }
      : password.length < 10
        ? { label: 'Medium', color: 'text-semantic-warning' }
        : { label: 'Strong', color: 'text-semantic-success' };

  return (
    <div className="page-enter relative min-h-screen overflow-hidden bg-linear-to-br from-surface-muted via-surface to-surface-strong px-4 py-8 md:px-6">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-accent-warm/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-5">
        <section className="auth-fade-up hidden lg:col-span-3 lg:block">
          <div className="rounded-3xl border border-brand-primary/15 bg-surface/75 p-10 shadow-[0_30px_80px_rgba(43,36,28,0.16)] backdrop-blur-sm">
            <div className="mb-10 max-w-lg">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3 py-1 text-xs font-semibold tracking-wide text-brand-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Grocery Planning
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-neutral-dark font-heading">
                Shop smarter with lists that feel effortless.
              </h1>
              <p className="mt-4 text-base text-text-muted">
                Track essentials, organize categories, and keep your weekly shopping in sync.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="auth-float rounded-2xl border border-brand-primary/20 bg-surface p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">This Week</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-dark">23 items</p>
                <p className="mt-1 text-sm text-text-muted">across 3 active lists</p>
              </div>
              <div className="auth-float-delayed rounded-2xl border border-semantic-info/20 bg-surface p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-dark">78%</p>
                <p className="mt-1 text-sm text-text-muted">already purchased</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-fade-up w-full lg:col-span-2">
          <div className="mb-6 text-center lg:text-left">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-semibold text-neutral-dark font-heading">Welcome back</h2>
            <p className="mt-1 text-text-muted">Sign in to continue managing your grocery lists.</p>
          </div>

          <Card padding="lg" accent className="shadow-[0_24px_48px_rgba(31,41,55,0.1)]">
            {error && (
              <div className="shake-enter mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="float-right font-bold"
                  aria-label="Clear error"
                >
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                clearable
                placeholder="Enter your username"
                leftIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                leftIcon={<LockKeyhole className="h-4 w-4" />}
                rightElement={(
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded p-1 text-text-muted transition hover:bg-neutral-light hover:text-neutral-dark"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              />

              {passwordStrength ? (
                <p className={`text-xs font-medium ${passwordStrength.color}`}>
                  Password strength: {passwordStrength.label}
                </p>
              ) : null}

              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border-default bg-surface-muted/70 px-3 py-2 text-sm">
                <span className="text-text-muted">Remember me</span>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border-default text-brand-primary focus:ring-brand-primary"
                />
              </label>

              <Button type="submit" loading={loading} fullWidth>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4">
              <p className="mb-3 text-center text-sm text-text-muted lg:text-left">Don't have an account?</p>
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm font-medium text-neutral-dark transition hover:bg-surface-muted"
              >
                Create Account
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
