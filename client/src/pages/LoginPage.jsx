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
