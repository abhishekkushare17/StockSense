import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button, Input, ErrorMessage } from '../components/common';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.forgotPassword(email);
      setSuccessData(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email to receive password recovery instructions"
    >
      {successData ? (
        <div className="space-y-5 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Reset instructions sent</h3>
            <p className="text-sm text-gray-500 mt-1">
              {successData.message || 'Instructions have been dispatched to your email address.'}
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-left">
            <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1">
              Direct Recovery Shortcut
            </p>
            <p className="text-xs text-indigo-700 mb-3">
              For testing or immediate access, you can proceed directly to create a new password.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={KeyRound}
              className="w-full justify-center"
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
            >
              Reset Password Now
            </Button>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError('')}
            />
          )}

          <p className="text-sm text-gray-600">
            Enter the email associated with your StockSense account and we'll help you securely reset your credentials.
          </p>

          <Input
            label="Work Email Address"
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

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={KeyRound}
              className="w-full"
            >
              Send Reset Instructions
            </Button>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
