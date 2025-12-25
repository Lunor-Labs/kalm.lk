/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  User, Upload, Save, X, Video, Phone, MessageCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadTherapistPhoto, validateImageFile } from '../../lib/storage';
import toast from 'react-hot-toast';

interface Therapist {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  credentials: string[];
  specializations: string[];
  languages: string[];
  services: string[];
  isAvailable: boolean;
  sessionFormats: string[];
  bio: string;
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  profilePhoto: string;
  nextAvailableSlot: string;
  createdAt: any;
  updatedAt: any;
}

interface TherapistFormData {
  firstName: string;
  lastName: string;
  email: string;
  credentials: string[];
  specializations: string[];
  languages: string[];
  services: string[];
  sessionFormats: string[];
  bio: string;
  experience: number;
  hourlyRate: number;
  profilePhoto: string;
}

const TherapistProfile: React.FC = () => {
  const { user } = useAuth();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    credentials: false,
    specializations: false,
    languages: false,
    services: false,
    sessionFormats: false
  });
  const [customCredential, setCustomCredential] = useState('');
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState<TherapistFormData>({
    firstName: '',
    lastName: '',
    email: '',
    credentials: [],
    specializations: [],
    languages: [],
    services: [],
    sessionFormats: [],
    bio: '',
    experience: 1,
    hourlyRate: 4500,
    profilePhoto: ''
  });

  const credentialOptions = [
    'PhD Clinical Psychology',
    'MSc Clinical Psychology',
    'MSc Counseling Psychology',
    'MSc Family Therapy',
    'Bachelor\'s Degree in Psychology',
    'Diploma in Counseling Psychology',
    'Certified Counselor',
    'EMDR Certified',
    'CBT Certified',
    'Art Therapy Certified',
    'Play Therapy Certified',
    'Other'
  ];

  const languageOptions = ['English', 'Sinhala', 'Tamil'];
  const serviceOptions = [
    'Individual Therapy',
    'Family and Couples Therapy',
    'Teen Counseling',
    'LGBTQIA+ Support',
  ];
  const sessionFormatOptions = ['video', 'audio', 'chat'];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      loadTherapistProfile();
    }
  }, [user]);

  const loadTherapistProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        toast.error('User profile not found');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      if (!userData.therapistProfile) {
        toast.error('Therapist profile not found');
        setLoading(false);
        return;
      }

      const therapistData = {
        id: userDoc.id,
        ...userData.therapistProfile,
        email: userData.email,
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate()
      } as Therapist;

      setTherapist(therapistData);
      setFormData({
        firstName: therapistData.firstName,
        lastName: therapistData.lastName,
        email: therapistData.email,
        credentials: therapistData.credentials,
        specializations: therapistData.specializations,
        languages: therapistData.languages,
        services: therapistData.services,
        sessionFormats: therapistData.sessionFormats,
        bio: therapistData.bio,
        experience: therapistData.experience,
        hourlyRate: therapistData.hourlyRate,
        profilePhoto: therapistData.profilePhoto
      });
    } catch (error) {
      console.error('Error loading therapist profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleImageUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadTherapistPhoto(file, therapist?.id);
      setFormData(prev => ({ ...prev, profilePhoto: result.url }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCredentialKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customCredential.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        credentials: [...prev.credentials, customCredential.trim()]
      }));
      setCustomCredential('');
    }
  };

  const handleSpecializationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSpecialization.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, customSpecialization.trim()]
      }));
      setCustomSpecialization('');
    }
  };

  const handleArrayFieldChange = (field: keyof TherapistFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const removeCredential = (credential: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.filter(c => c !== credential)
    }));
  };

  const removeSpecialization = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specialization)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.credentials.length === 0) {
      toast.error('Please select or add at least one credential');
      return;
    }

    if (formData.specializations.length === 0) {
      toast.error('Please add at least one specialization');
      return;
    }

    if (formData.languages.length === 0) {
      toast.error('Please select at least one language');
      return;
    }

    if (formData.services.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    if (formData.sessionFormats.length === 0) {
      toast.error('Please select at least one session format');
      return;
    }

    if (!therapist) {
      toast.error('Therapist profile not found');
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', therapist.id);
      await updateDoc(userRef, {
        email: formData.email,
        therapistProfile: {
          ...therapist.therapistProfile,
          firstName: formData.firstName,
          lastName: formData.lastName,
          credentials: formData.credentials.filter(c => c !== 'Other'),
          specializations: formData.specializations,
          languages: formData.languages,
          services: formData.services,
          sessionFormats: formData.sessionFormats,
          bio: formData.bio,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          profilePhoto: formData.profilePhoto,
        },
        updatedAt: serverTimestamp()
      });
      
      toast.success('Profile updated successfully');
      await loadTherapistProfile(); // Reload to get updated data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="text-center py-16">
        <User className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Profile Not Found</h3>
        <p className="text-neutral-300">Your therapist profile could not be loaded. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">My Profile</h1>
        <p className="text-neutral-300 text-sm sm:text-base">Update your professional information and profile details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <label className="block text-sm font-medium text-neutral-300 mb-2 sm:mb-3 text-center">
            Profile Photo
          </label>
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center border-2 sm:border-4 border-neutral-700">
              {formData.profilePhoto ? (
                <img
                  src={formData.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-400" />
              )}
            </div>
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
                id="profile-photo"
                disabled={uploading}
              />
              <label
                htmlFor="profile-photo"
                className={`inline-flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-500 text-white rounded-lg sm:rounded-xl hover:bg-primary-600 transition-colors duration-200 cursor-pointer text-sm sm:text-base ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
              </label>
              <p className="text-xs text-neutral-400 mt-1 sm:mt-2">
                JPEG, PNG, or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
                placeholder="Enter last name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
                Experience (Years)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
                Hourly Rate (LKR)
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                step="500"
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 4500 }))}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => toggleSection('credentials')}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="text-sm font-medium text-neutral-300">
                  Credentials * (Select or add at least one)
                </span>
                {expandedSections.credentials ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {expandedSections.credentials && (
                <div className="p-4 pt-0 grid grid-cols-1 gap-2">
                  {credentialOptions.map((credential) => (
                    <div key={credential}>
                      <label className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.credentials.includes(credential)}
                          onChange={(e) => handleArrayFieldChange('credentials', credential, e.target.checked)}
                          className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-neutral-300 text-xs">{credential}</span>
                      </label>
                      {credential === 'Other' && formData.credentials.includes('Other') && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={customCredential}
                            onChange={(e) => setCustomCredential(e.target.value)}
                            onKeyPress={handleCredentialKeyPress}
                            className="w-full px-3 py-2 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 text-xs"
                            placeholder="Enter custom credential and press Enter"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {formData.credentials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.credentials.filter(c => c !== 'Other').map((credential, index) => (
                        <div
                          key={index}
                          className="flex items-center px-2 py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs"
                        >
                          {credential}
                          <button
                            type="button"
                            onClick={() => removeCredential(credential)}
                            className="ml-2 text-primary-500 hover:text-primary-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-neutral-300 mb-2 sm:mb-3">
                Credentials * (Select or add at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {credentialOptions.map((credential) => (
                  <div key={credential}>
                    <label className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg sm:rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.credentials.includes(credential)}
                        onChange={(e) => handleArrayFieldChange('credentials', credential, e.target.checked)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm">{credential}</span>
                    </label>
                    {credential === 'Other' && formData.credentials.includes('Other') && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={customCredential}
                          onChange={(e) => setCustomCredential(e.target.value)}
                          onKeyPress={handleCredentialKeyPress}
                          className="w-full px-3 py-2 border border-neutral-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 text-sm"
                          placeholder="Enter custom credential and press Enter"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {formData.credentials.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.credentials.filter(c => c !== 'Other').map((credential, index) => (
                    <div
                      key={index}
                      className="flex items-center px-2 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm"
                    >
                      {credential}
                      <button
                        type="button"
                        onClick={() => removeCredential(credential)}
                        className="ml-2 text-primary-500 hover:text-primary-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Specializations */}
     <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => toggleSection('specializations')}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="text-sm font-medium text-neutral-300">
                  Specializations * (Add at least one)
                </span>
                {expandedSections.specializations ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {expandedSections.specializations && (
                <div className="p-4 pt-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSpecialization}
                      onChange={(e) => setCustomSpecialization(e.target.value)}
                      onKeyPress={handleSpecializationKeyPress}
                      className="flex-1 px-3 py-2 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 text-xs"
                      placeholder="Enter specialization"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customSpecialization.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            specializations: [...prev.specializations, customSpecialization.trim()]
                          }));
                          setCustomSpecialization('');
                        }
                      }}
                      className="px-3 py-2 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors"
                      disabled={!customSpecialization.trim()}
                    >
                      Add
                    </button>
                  </div>
                  {formData.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.specializations.map((spec, index) => (
                        <div
                          key={index}
                          className="flex items-center px-2 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeSpecialization(spec)}
                            className="ml-2 text-accent-yellow hover:text-accent-yellow/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-neutral-300 mb-2 sm:mb-3">
                Specializations * (Add at least one)
              </label>
              <div>
                <input
                  type="text"
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  onKeyPress={handleSpecializationKeyPress}
                  className="w-full px-3 py-2 border border-neutral-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 text-sm"
                  placeholder="Enter specialization and press Enter"
                />
                {formData.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.specializations.map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center px-2 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-sm"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => removeSpecialization(spec)}
                          className="ml-2 text-accent-yellow hover:text-accent-yellow/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Languages */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => toggleSection('languages')}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="text-sm font-medium text-neutral-300">
                  Languages * (Select at least one)
                </span>
                {expandedSections.languages ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {expandedSections.languages && (
                <div className="p-4 pt-0 grid grid-cols-1 gap-2">
                  {languageOptions.map((language) => (
                    <label key={language} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={(e) => handleArrayFieldChange('languages', language, e.target.checked)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-xs">{language}</span>
                    </label>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-neutral-300 mb-2 sm:mb-3">
                Languages * (Select at least one)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {languageOptions.map((language) => (
                  <label key={language} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg sm:rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(language)}
                      onChange={(e) => handleArrayFieldChange('languages', language, e.target.checked)}
                      className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-neutral-300 text-sm">{language}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Services */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => toggleSection('services')}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="text-sm font-medium text-neutral-300">
                  Services * (Select at least one)
                </span>
                {expandedSections.services ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {expandedSections.services && (
                <div className="p-4 pt-0 grid grid-cols-1 gap-2">
                  {serviceOptions.map((service) => (
                    <label key={service} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={(e) => handleArrayFieldChange('services', service, e.target.checked)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-xs">{service}</span>
                    </label>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-neutral-300 mb-2 sm:mb-3">
                Services * (Select at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {serviceOptions.map((service) => (
                  <label key={service} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg sm:rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={(e) => handleArrayFieldChange('services', service, e.target.checked)}
                      className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-neutral-300 text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Session Formats */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => toggleSection('sessionFormats')}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="text-sm font-medium text-neutral-300">
                  Session Formats * (Select at least one)
                </span>
                {expandedSections.sessionFormats ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>
              {expandedSections.sessionFormats && (
                <div className="p-4 pt-0 grid grid-cols-1 gap-2">
                  {sessionFormatOptions.map((format) => (
                    <label key={format} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sessionFormats.includes(format)}
                        onChange={(e) => handleArrayFieldChange('sessionFormats', format, e.target.checked)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex items-center space-x-2">
                        {format === 'video' && <Video className="w-3 h-3 text-primary-500" />}
                        {format === 'audio' && <Phone className="w-3 h-3 text-primary-500" />}
                        {format === 'chat' && <MessageCircle className="w-3 h-3 text-primary-500" />}
                        <span className="text-neutral-300 text-xs capitalize">{format}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-neutral-300 mb-2 sm:mb-3">
                Session Formats * (Select at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {sessionFormatOptions.map((format) => (
                  <label key={format} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg sm:rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sessionFormats.includes(format)}
                      onChange={(e) => handleArrayFieldChange('sessionFormats', format, e.target.checked)}
                      className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      {format === 'video' && <Video className="w-4 h-4 text-primary-500" />}
                      {format === 'audio' && <Phone className="w-4 h-4 text-primary-500" />}
                      {format === 'chat' && <MessageCircle className="w-4 h-4 text-primary-500" />}
                      <span className="text-neutral-300 text-sm capitalize">{format}</span>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bio */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 resize-none text-sm sm:text-base"
            placeholder="Enter your professional bio..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-4 pt-4 sm:pt-6 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-primary-500 text-white rounded-xl sm:rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TherapistProfile;

