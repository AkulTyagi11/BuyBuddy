import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  LockKeyhole,
  UserRoundPlus,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch {
      // error is handled in store
    }
  };

  const passwordStrength = !form.password
    ? null
    : form.password.length < 6
      ? { label: 'Weak', color: 'text-semantic-error' }
      : form.password.length < 10
        ? { label: 'Medium', color: 'text-semantic-warning' }
        : { label: 'Strong', color: 'text-semantic-success' };

  const confirmError =
    form.password2 && form.password !== form.password2
      ? 'Passwords do not match.'
      : undefined;

  const confirmSuccess =
    form.password2 && form.password === form.password2
      ? 'Passwords match.'
      : undefined;

  return (
    <div className="page-enter relative min-h-screen overflow-hidden bg-linear-to-br from-surface-muted via-surface to-surface-strong px-4 py-8 md:px-6">
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-brand-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-accent-warm/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-5">
        <section className="auth-fade-up hidden lg:col-span-3 lg:block">
          <div className="rounded-3xl border border-brand-primary/15 bg-surface/75 p-10 shadow-[0_30px_80px_rgba(43,36,28,0.16)] backdrop-blur-sm">
            <div className="mb-10 max-w-lg">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3 py-1 text-xs font-semibold tracking-wide text-brand-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Organized Kitchen, Effortless Shopping
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-neutral-dark font-heading">
                Build lists, stay on budget, and never miss essentials.
              </h1>
              <p className="mt-4 text-base text-text-muted">
                Create your account and start planning groceries with a cleaner weekly routine.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="auth-float rounded-2xl border border-brand-primary/20 bg-surface p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Start Strong</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-dark">5 minutes</p>
                <p className="mt-1 text-sm text-text-muted">to set up your first list</p>
              </div>
              <div className="auth-float-delayed rounded-2xl border border-semantic-info/20 bg-surface p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Built For You</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-dark">Any device</p>
                <p className="mt-1 text-sm text-text-muted">sync your planning anywhere</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-fade-up w-full lg:col-span-2">
          <div className="mb-6 text-center lg:text-left">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <UserRoundPlus className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-semibold text-neutral-dark font-heading">Create your account</h2>
            <p className="mt-1 text-text-muted">Get started with BuyBuddy in under a minute.</p>
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  clearable
                  leftIcon={<User className="h-4 w-4" />}
                />
                <Input
                  label="Last Name"
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  clearable
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <Input
                label="Username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                clearable
                leftIcon={<User className="h-4 w-4" />}
                placeholder="Choose a username"
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                clearable
                leftIcon={<Mail className="h-4 w-4" />}
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                leftIcon={<LockKeyhole className="h-4 w-4" />}
                placeholder="Create a secure password"
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

              <Input
                label="Confirm Password"
                type="password"
                name="password2"
                value={form.password2}
                onChange={handleChange}
                required
                leftIcon={<LockKeyhole className="h-4 w-4" />}
                error={confirmError}
                success={confirmSuccess}
              />

              <Button type="submit" loading={loading} fullWidth>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4">
              <p className="mb-3 text-center text-sm text-text-muted lg:text-left">Already have an account?</p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-lg border border-border-default bg-surface px-4 py-2.5 text-sm font-medium text-neutral-dark transition hover:bg-surface-muted"
              >
                Sign in
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
