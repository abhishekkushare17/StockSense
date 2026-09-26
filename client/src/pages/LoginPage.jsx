import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, ErrorMessage } from '../components/common';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Please enter your email address');
      return;
    }
    if (!password) {
      setFormError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your StockSense account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <ErrorMessage
            message={formError}
            onDismiss={() => setFormError('')}
          />
        )}

        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            icon={LogIn}
            className="w-full"
          >
            Sign In
          </Button>
        </div>

        {/* Demo Credentials Quick-Fill */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500 mb-2 font-medium">Quick Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('manager@stocksense.com');
                setPassword('Password123!');
              }}
              className="text-xs py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors border border-indigo-200/60"
            >
              Manager Account
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('staff@stocksense.com');
                setPassword('Password123!');
              }}
              className="text-xs py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200"
            >
              Staff Account
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account yet?{' '}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1"
          >
            Sign up now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
