import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, ErrorMessage } from '../components/common';
import { User, Mail, Lock, ShieldCheck, UserPlus, ArrowLeft } from 'lucide-react';
import { ROLES } from '../utils/constants';
import AuthLayout from '../layouts/AuthLayout';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.WAREHOUSE_STAFF,
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters)');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Please enter your email address');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join the StockSense platform to manage inventory"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <ErrorMessage
            message={formError}
            onDismiss={() => setFormError('')}
          />
        )}

        <Input
          label="Full Name"
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
          icon={User}
        />

        <Input
          label="Work Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="john@company.com"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
        />

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            System Role <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <ShieldCheck className="h-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={ROLES.WAREHOUSE_STAFF}>
                {ROLES.WAREHOUSE_STAFF} (Inbound / Outbound / Operations)
              </option>
              <option value={ROLES.INVENTORY_MANAGER}>
                {ROLES.INVENTORY_MANAGER} (Full Inventory Oversight & Approvals)
              </option>
            </select>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select your assigned role in the warehouse management hierarchy.
          </p>
        </div>

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
        />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={Lock}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            icon={UserPlus}
            className="w-full"
          >
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4 text-center">
        <p className="text-sm text-gray-600">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
