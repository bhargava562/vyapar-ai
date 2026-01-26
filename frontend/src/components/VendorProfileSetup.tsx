/**
 * Vendor Profile Setup Component
 * Handles multilingual profile creation and editing with voice input support
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';
import LoadingSpinner from './LoadingSpinner';
import { 
  vendorService, 
  VendorProfile, 
  VendorProfileCreate, 
  VendorProfileUpdate,
  VendorProfileCompletion 
} from '../services/vendorService';

interface VendorProfileSetupProps {
  profile?: VendorProfile | null;
  onProfileSaved?: (profile: VendorProfile) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

interface FormData {
  name: string;
  stall_id: string;
  market_location: string;
  email: string;
  preferred_language: string;
}

interface FormErrors {
  [key: string]: string;
}

const VendorProfileSetup: React.FC<VendorProfileSetupProps> = ({
  profile,
  onProfileSaved,
  onCancel,
  isEditing = false
}) => {
  const { t, i18n } = useTranslation('vendor');
  const [formData, setFormData] = useState<FormData>({
    name: profile?.name || '',
    stall_id: profile?.stall_id || '',
    market_location: profile?.market_location || '',
    email: profile?.email || '',
    preferred_language: profile?.preferred_language || i18n.language
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [completion, setCompletion] = useState<VendorProfileCompletion | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Language options
  const languageOptions = [
    { code: 'hi', name: t('profile.languages.hi') },
    { code: 'en', name: t('profile.languages.en') },
    { code: 'ta', name: t('profile.languages.ta') },
    { code: 'te', name: t('profile.languages.te') },
    { code: 'bn', name: t('profile.languages.bn') },
    { code: 'mr', name: t('profile.languages.mr') },
    { code: 'gu', name: t('profile.languages.gu') },
    { code: 'kn', name: t('profile.languages.kn') },
    { code: 'ml', name: t('profile.languages.ml') },
    { code: 'or', name: t('profile.languages.or') }
  ];

  // Load completion status
  useEffect(() => {
    if (profile) {
      loadCompletion();
    }
  }, [profile]);

  const loadCompletion = async () => {
    const response = await vendorService.getProfileCompletion();
    if (response.data) {
      setCompletion(response.data);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = t('profile.messages.required_fields');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.market_location.trim()) {
      newErrors.market_location = t('profile.messages.required_fields');
    } else if (formData.market_location.trim().length < 2) {
      newErrors.market_location = 'Market location must be at least 2 characters long';
    }

    // Email validation (optional)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('profile.messages.invalid_email');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleVoiceResult = (field: string, text: string) => {
    handleInputChange(field as keyof FormData, text);
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error);
    // Could show a toast notification here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (isEditing && profile) {
        // Update existing profile
        const updateData: VendorProfileUpdate = {
          name: formData.name.trim(),
          stall_id: formData.stall_id.trim() || undefined,
          market_location: formData.market_location.trim(),
          email: formData.email.trim() || undefined,
          preferred_language: formData.preferred_language
        };
        
        response = await vendorService.updateProfile(updateData);
      } else {
        // Create new profile
        const createData: VendorProfileCreate = {
          name: formData.name.trim(),
          stall_id: formData.stall_id.trim() || undefined,
          market_location: formData.market_location.trim(),
          phone_number: profile?.phone_number || '', // This should come from auth
          email: formData.email.trim() || undefined,
          preferred_language: formData.preferred_language
        };
        
        response = await vendorService.createProfile(createData);
      }

      if (response.error) {
        setErrors({ general: response.error });
      } else if (response.data) {
        // Update language if changed
        if (formData.preferred_language !== i18n.language) {
          i18n.changeLanguage(formData.preferred_language);
        }
        
        if (onProfileSaved) {
          onProfileSaved(response.data);
        }
      }
    } catch (error) {
      setErrors({ general: t('profile.messages.save_error') });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('profile.setup.step_1')}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {t('profile.setup.subtitle')}
        </p>
      </div>

      {/* Name Field with Voice Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('profile.fields.name')} *
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={t('profile.fields.name_placeholder')}
            className={`
              flex-1 px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.name ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          <VoiceInput
            onVoiceResult={(text) => handleVoiceResult('name', text)}
            onError={handleVoiceError}
            placeholder={t('profile.voice.speak_name')}
            language={formData.preferred_language}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Market Location Field with Voice Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('profile.fields.market_location')} *
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={formData.market_location}
            onChange={(e) => handleInputChange('market_location', e.target.value)}
            placeholder={t('profile.fields.market_location_placeholder')}
            className={`
              flex-1 px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.market_location ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          <VoiceInput
            onVoiceResult={(text) => handleVoiceResult('market_location', text)}
            onError={handleVoiceError}
            placeholder={t('profile.voice.speak_location')}
            language={formData.preferred_language}
            disabled={isLoading}
          />
        </div>
        {errors.market_location && (
          <p className="mt-1 text-sm text-red-600">{errors.market_location}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('profile.setup.step_2')}
        </h3>
      </div>

      {/* Stall ID Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('profile.fields.stall_id')}
        </label>
        <input
          type="text"
          value={formData.stall_id}
          onChange={(e) => handleInputChange('stall_id', e.target.value)}
          placeholder={t('profile.fields.stall_id_placeholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('profile.fields.email')}
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder={t('profile.fields.email_placeholder')}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.email ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('profile.setup.step_3')}
        </h3>
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('profile.fields.preferred_language')} *
        </label>
        <p className="text-sm text-gray-600 mb-3">
          {t('profile.fields.language_help')}
        </p>
        <select
          value={formData.preferred_language}
          onChange={(e) => handleInputChange('preferred_language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Completion Status */}
      {completion && (
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              {t('profile.setup.completion', { percentage: completion.completion_percentage })}
            </span>
            <span className="text-sm text-blue-700">
              {completion.completion_percentage}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completion.completion_percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 text-center">
          {isEditing ? t('profile.actions.update') : t('profile.setup.title')}
        </h2>
        
        {/* Step Indicator */}
        {!isEditing && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Render appropriate step or all fields for editing */}
        {isEditing ? (
          <div className="space-y-6">
            {renderStep1()}
            {renderStep2()}
            {renderStep3()}
          </div>
        ) : (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          {/* Back/Cancel Button */}
          {isEditing ? (
            onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {t('profile.actions.cancel')}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
          )}

          {/* Next/Save Button */}
          {isEditing || currentStep === 3 ? (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {isEditing ? t('profile.actions.update') : t('profile.actions.complete_setup')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (validateForm()) {
                  setCurrentStep(currentStep + 1);
                }
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VendorProfileSetup;