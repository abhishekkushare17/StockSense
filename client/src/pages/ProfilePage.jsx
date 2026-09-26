import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Badge, ErrorMessage } from '../components/common';
import { User, Mail, ShieldCheck, KeyRound, CheckCircle2, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { ROLES } from '../utils/constants';

export const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const isInventoryManager = user?.role === ROLES.INVENTORY_MANAGER;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileName.trim() || profileName.trim().length < 2) {
      setProfileError('Name must be at least 2 characters long');
      return;
    }
    if (!profileEmail.trim()) {
      setProfileError('Email is required');
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({ name: profileName, email: profileEmail });
      setProfileSuccess('Profile details successfully updated');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password successfully changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Profile & Account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal details, credentials, and check your system authorization level.
        </p>
      </div>

      {/* Account Overview Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Badge variant={isInventoryManager ? 'purple' : 'info'} size="md" dot>
            {user?.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Personal Details</h3>
          </div>

          {profileError && (
            <ErrorMessage
              message={profileError}
              onDismiss={() => setProfileError('')}
              className="mb-4"
            />
          )}

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              id="profileName"
              name="profileName"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
              icon={User}
            />

            <Input
              label="Email Address"
              id="profileEmail"
              name="profileEmail"
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              required
              icon={Mail}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role (Assigned)
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>{user?.role}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Roles are managed by administrative policy.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={profileLoading}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Change Password</h3>
          </div>

          {passwordError && (
            <ErrorMessage
              message={passwordError}
              onDismiss={() => setPasswordError('')}
              className="mb-4"
            />
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Input
              label="New Password"
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
            />

            <Input
              label="Confirm New Password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                isLoading={passwordLoading}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
