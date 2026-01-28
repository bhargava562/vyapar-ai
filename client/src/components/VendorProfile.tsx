/**
 * Vendor Profile Display Component
 * Shows vendor profile information with edit capabilities
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VendorProfileSetup from './VendorProfileSetup';
import LoadingSpinner from './LoadingSpinner';
import { vendorService } from '../services/vendorService';
import type {
  VendorProfile as VendorProfileType,
  VendorStatistics,
  VendorProfileCompletion
} from '../services/vendorService';

interface VendorProfileProps {
  onProfileUpdated?: (profile: VendorProfileType) => void;
}

const VendorProfile: React.FC<VendorProfileProps> = ({ onProfileUpdated }) => {
  const { t, i18n } = useTranslation('vendor');
  const [profile, setProfile] = useState<VendorProfileType | null>(null);
  const [statistics, setStatistics] = useState<VendorStatistics | null>(null);
  const [completion, setCompletion] = useState<VendorProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load profile, statistics, and completion in parallel
      const [profileResponse, statsResponse, completionResponse] = await Promise.all([
        vendorService.getProfile(),
        vendorService.getStatistics(),
        vendorService.getProfileCompletion()
      ]);

      if (profileResponse.error) {
        setError(profileResponse.error);
      } else if (profileResponse.data) {
        setProfile(profileResponse.data);
      }

      if (statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      if (completionResponse.data) {
        setCompletion(completionResponse.data);
      }
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSaved = (updatedProfile: VendorProfileType) => {
    setProfile(updatedProfile);
    setIsEditing(false);
    loadProfileData(); // Reload to get updated statistics and completion

    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    const response = await vendorService.deleteProfile();

    if (response.error) {
      setError(response.error);
      setIsLoading(false);
    } else {
      // Profile deleted successfully - redirect to setup
      setProfile(null);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLanguageName = (code: string) => {
    const languageNames: Record<string, string> = {
      'hi': t('profile.languages.hi'),
      'en': t('profile.languages.en'),
      'ta': t('profile.languages.ta'),
      'te': t('profile.languages.te'),
      'bn': t('profile.languages.bn'),
      'mr': t('profile.languages.mr'),
      'gu': t('profile.languages.gu'),
      'kn': t('profile.languages.kn'),
      'ml': t('profile.languages.ml'),
      'or': t('profile.languages.or')
    };
    return languageNames[code] || code;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProfileData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show setup form if no profile or editing
  if (!profile || isEditing) {
    return (
      <VendorProfileSetup
        profile={profile}
        onProfileSaved={handleProfileSaved}
        onCancel={isEditing ? () => setIsEditing(false) : undefined}
        isEditing={isEditing}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{profile.name}</h1>
            <p className="text-blue-100">{profile.market_location}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{statistics?.points || 0}</div>
            <div className="text-blue-100 text-sm">Points</div>
          </div>
        </div>
      </div>

      {/* Profile Completion Status */}
      {completion && !completion.is_complete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Profile Incomplete
              </h3>
              <p className="text-sm text-yellow-700">
                {t('profile.setup.completion', { percentage: completion.completion_percentage })}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200"
            >
              Complete Profile
            </button>
          </div>
          <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completion.completion_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profile.personal_info')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t('profile.fields.name')}
                </label>
                <p className="text-gray-900">{profile.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t('profile.fields.phone_number')}
                </label>
                <p className="text-gray-900">{profile.phone_number}</p>
              </div>

              {profile.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    {t('profile.fields.email')}
                  </label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Market Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profile.market_info')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t('profile.fields.market_location')}
                </label>
                <p className="text-gray-900">{profile.market_location}</p>
              </div>

              {profile.stall_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    {t('profile.fields.stall_id')}
                  </label>
                  <p className="text-gray-900">{profile.stall_id}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t('profile.fields.preferred_language')}
                </label>
                <p className="text-gray-900">{getLanguageName(profile.preferred_language)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.submissions_count}</div>
                <div className="text-sm text-blue-800">Price Submissions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.fpc_count}</div>
                <div className="text-sm text-green-800">Certificates</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.achievements_count}</div>
                <div className="text-sm text-purple-800">Achievements</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.points}</div>
                <div className="text-sm text-yellow-800">Total Points</div>
              </div>
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Member since {formatDate(profile.created_at)}</span>
            <span>Last active {formatDate(profile.last_active)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('profile.actions.update')}
          </button>

          <button
            onClick={handleDeleteProfile}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {t('profile.actions.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;