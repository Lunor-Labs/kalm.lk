/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, Upload, X, Save,
  Star, Clock, Award, Video, Phone, MessageCircle,
  Eye, EyeOff, ArrowLeft, Calendar, DollarSign, ChevronLeft, ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { uploadTherapistPhoto, deleteTherapistPhoto, getStoragePathFromUrl, validateImageFile } from '../../lib/storage';
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
  password: string;
  credentials: string[];
  specializations: string[];
  languages: string[];
  services: string[];
  sessionFormats: string[];
  bio: string;
  experience: number;
  hourlyRate: number;
  nextAvailableSlot: string;
  profilePhoto: string;
}

const TherapistManagement: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [viewingTherapist, setViewingTherapist] = useState<Therapist | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [formData, setFormData] = useState<TherapistFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    credentials: [],
    specializations: [],
    languages: [],
    services: [],
    sessionFormats: [],
    bio: '',
    experience: 1,
    hourlyRate: 4500,
    nextAvailableSlot: 'Please set availability',
    profilePhoto: ''
  });
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    credentials: false,
    specializations: false,
    languages: false,
    services: false,
    sessionFormats: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [customCredential, setCustomCredential] = useState('');
  const [customSpecialization, setCustomSpecialization] = useState('');
  const therapistsPerPage = 6;

  // Updated credential options including "Other"
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

  const languageOptions = [
    'English',
    'Sinhala',
    'Tamil'
  ];

  const serviceOptions = [
    'Individual Therapy',
    'Family and Couples Therapy',
    'Teen Counseling',
    'LGBTQIA+ Support',
  ];

  const sessionFormatOptions = [
    'video',
    'audio',
    'chat'
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadTherapists();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const therapistsRef = collection(db, 'therapists');
      const q = query(therapistsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const therapistsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Therapist));
      
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Error loading therapists:', error);
      toast.error('Failed to load therapists');
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
      const result = await uploadTherapistPhoto(file, editingTherapist?.id);
      setFormData(prev => ({ ...prev, profilePhoto: result.url }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingTherapist && !formData.password) {
      toast.error('Password is required for new therapists');
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

    setLoading(true);
    try {
      if (editingTherapist) {
        const therapistRef = doc(db, 'therapists', editingTherapist.id);
        await updateDoc(therapistRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          credentials: formData.credentials.filter(c => c !== 'Other'),
          specializations: formData.specializations,
          languages: formData.languages,
          services: formData.services,
          sessionFormats: formData.sessionFormats,
          bio: formData.bio,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          nextAvailableSlot: formData.nextAvailableSlot,
          profilePhoto: formData.profilePhoto,
          updatedAt: serverTimestamp()
        });
        
        toast.success('Therapist updated successfully');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: `${formData.firstName} ${formData.lastName}`
        });
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: `${formData.firstName} ${formData.lastName}`,
          role: 'therapist',
          isAnonymous: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        const therapistData = {
          userId: user.uid,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          credentials: formData.credentials.filter(c => c !== 'Other'),
          specializations: formData.specializations,
          languages: formData.languages,
          services: formData.services,
          isAvailable: false,
          sessionFormats: formData.sessionFormats,
          bio: formData.bio,
          experience: formData.experience,
          rating: 5.0,
          reviewCount: 0,
          hourlyRate: formData.hourlyRate,
          profilePhoto: formData.profilePhoto || 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
          nextAvailableSlot: formData.nextAvailableSlot,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'therapists'), therapistData);
        toast.success('Therapist added successfully');
      }
      
      resetForm();
      setShowAddModal(false);
      setEditingTherapist(null);
      loadTherapists();
    } catch (error: any) {
      console.error('Error saving therapist:', error);
      toast.error(error.message || 'Failed to save therapist');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (therapist: Therapist) => {
    if (!window.confirm(`Are you sure you want to delete ${therapist.firstName} ${therapist.lastName}?`)) {
      return;
    }

    try {
      if (therapist.profilePhoto && !therapist.profilePhoto.includes('pexels.com')) {
        const photoPath = getStoragePathFromUrl(therapist.profilePhoto);
        if (photoPath) {
          await deleteTherapistPhoto(photoPath);
        }
      }
      
      await deleteDoc(doc(db, 'therapists', therapist.id));
      toast.success('Therapist deleted successfully');
      loadTherapists();
    } catch (error: any) {
      console.error('Error deleting therapist:', error);
      toast.error(error.message || 'Failed to delete therapist');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      credentials: [],
      specializations: [],
      languages: [],
      services: [],
      sessionFormats: [],
      bio: '',
      experience: 1,
      hourlyRate: 4500,
      nextAvailableSlot: 'Please set availability',
      profilePhoto: ''
    });
    setCustomCredential('');
    setCustomSpecialization('');
  };

  const openEditModal = (therapist: Therapist) => {
    setFormData({
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      email: therapist.email,
      password: '',
      credentials: therapist.credentials,
      specializations: therapist.specializations,
      languages: therapist.languages,
      services: therapist.services,
      sessionFormats: therapist.sessionFormats,
      bio: therapist.bio,
      experience: therapist.experience,
      hourlyRate: therapist.hourlyRate,
      nextAvailableSlot: therapist.nextAvailableSlot,
      profilePhoto: therapist.profilePhoto
    });
    setEditingTherapist(therapist);
    setShowAddModal(true);
  };

  const filteredTherapists = therapists.filter(therapist =>
    `${therapist.firstName} ${therapist.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    therapist.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTherapists.length / therapistsPerPage);
  const startIndex = (currentPage - 1) * therapistsPerPage;
  const paginatedTherapists = filteredTherapists.slice(startIndex, startIndex + therapistsPerPage);

  const getVisiblePages = () => {
    const maxPagesToShow = 5;
    const pages: (number | string)[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'audio': return <Phone className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'chat': return <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return null;
    }
  };

  if (loading && therapists.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading therapists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Therapist Management</h1>
          <p className="text-neutral-300 text-sm sm:text-base">Manage therapist profiles and accounts</p>
        </div>
        
        <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3">
          {!isMobile && (
            <div className="flex bg-neutral-800 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-sm font-medium ${
                  viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-sm font-medium ${
                  viewMode === 'table' ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Table
              </button>
            </div>
          )}

          <button
            onClick={() => {
              resetForm();
              setEditingTherapist(null);
              setShowAddModal(true);
            }}
            className="bg-primary-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl hover:bg-primary-600 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-sm sm:text-base">Add Therapist</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-primary-500" />
            <span className="text-neutral-300 text-xs sm:text-sm">Total Therapists</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">{therapists.length}</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-accent-green" />
            <span className="text-neutral-300 text-xs sm:text-sm">Available Now</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {therapists.filter(t => t.isAvailable).length}
          </p>
        </div>
      </div>

      <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search therapists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
          />
        </div>
      </div>

      {viewMode === 'grid' || isMobile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedTherapists.map((therapist) => (
            <div
              key={therapist.id}
              className="bg-black/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-300"
            >
              <div className="relative p-4 sm:p-6 pb-0">
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={therapist.profilePhoto}
                      alt={`${therapist.firstName} ${therapist.lastName}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 border-neutral-700"
                    />
                    <div className={`absolute bottom-0 right-0輪
 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-neutral-800 ${
                      therapist.isAvailable ? 'bg-accent-green' : 'bg-neutral-500'
                    }`}></div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 pt-2 sm:pt-4 text-center">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                  {therapist.firstName} {therapist.lastName}
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mb-2 line-clamp-1">{therapist.email}</p>

                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {therapist.specializations.slice(0, 2).map((spec, index) => (
                      <span
                        key={index}
                        className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                    {therapist.specializations.length > 2 && (
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs">
                        +{therapist.specializations.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                  <div className="text-center">
                    <p className="text-neutral-400">Experience</p>
                    <p className="text-white font-medium">{therapist.experience} yrs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-neutral-400">Rate</p>
                    <p className="text-white font-medium">LKR {therapist.hourlyRate.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  {therapist.sessionFormats.map((format, index) => (
                    <div key={index} className="flex items-center space-x-1 text-neutral-300">
                      {getSessionFormatIcon(format)}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setViewingTherapist(therapist)}
                    className="p-1 sm:p-2 bg-neutral-800 text-neutral-300 hover:text-primary-500 rounded-lg sm:rounded-xl transition-colors duration-200"
                    title="View details"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(therapist)}
                    className="p-1 sm:p-2 bg-neutral-800 text-neutral-300 hover:text-accent-yellow rounded-lg sm:rounded-xl transition-colors duration-200"
                    title="Edit therapist"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(therapist)}
                    className="p-1 sm:p-2 bg-neutral-800 text-neutral-300 hover:text-red-500 rounded-lg sm:rounded-xl transition-colors duration-200"
                    title="Delete therapist"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paginatedTherapists.length === 0 && (
            <div className="text-center py-8 sm:py-16 col-span-full">
              <Users className="w-12 sm:w-16 h-12 sm:h-16 text-neutral-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-neutral-300 mb-1 sm:mb-2 text-sm sm:text-base">No therapists found</p>
              <p className="text-neutral-400 text-xs sm:text-sm">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Add your first therapist to get started'
                }
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-800">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Therapists ({filteredTherapists.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800/50">
                <tr>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Therapist</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Specializations</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Experience</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Rate</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Status</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTherapists.map((therapist) => (
                  <tr key={therapist.id} className="border-t border-neutral-800 hover:bg-neutral-800/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={therapist.profilePhoto}
                          alt={`${therapist.firstName} ${therapist.lastName}`}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">
                            {therapist.firstName} {therapist.lastName}
                          </p>
                          <p className="text-neutral-400 text-xs sm:text-sm">{therapist.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {therapist.specializations.slice(0, 2).map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs sm:text-sm"
                          >
                            {spec}
                          </span>
                        ))}
                        {therapist.specializations.length > 2 && (
                          <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs sm:text-sm">
                            +{therapist.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-neutral-300 text-sm sm:text-base">{therapist.experience} years</p>
                    </td>
                    <td className="p-4">
                      <p className="text-neutral-300 text-sm sm:text-base">LKR {therapist.hourlyRate.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs sm:text-sm ${
                        therapist.isAvailable 
                          ? 'bg-accent-green/20 text-accent-green' 
                          : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          therapist.isAvailable ? 'bg-accent-green' : 'bg-neutral-400'
                        }`}></div>
                        <span>{therapist.isAvailable ? 'Available' : 'Unavailable'}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingTherapist(therapist)}
                          className="p-2 text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(therapist)}
                          className="p-2 text-neutral-400 hover:text-accent-yellow transition-colors duration-200"
                          title="Edit therapist"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(therapist)}
                          className="p-2 text-neutral-400 hover:text-red-500 transition-colors duration-200"
                          title="Delete therapist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedTherapists.length === 0 && (
            <div className="text-center py-8 sm:py-16">
              <Users className="w-12 sm:w-16 h-12 sm:h-16 text-neutral-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-neutral-300 mb-1 sm:mb-2 text-sm sm:text-base">No therapists found</p>
              <p className="text-neutral-400 text-xs sm:text-sm">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Add your first therapist to get started'
                }
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-4 overflow-x-auto">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-sm min-h-[40px] ${
            currentPage === 1
              ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          } transition-colors duration-200`}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <div className="flex items-center gap-0.5">
          {getVisiblePages().map((page, index) => (
            <button
              key={`${page}-${index}`}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              className={`px-2 py-1 rounded-lg text-sm min-w-[36px] min-h-[36px] text-center ${
                page === currentPage
                  ? 'bg-primary-500 text-white'
                  : typeof page === 'string'
                  ? 'text-neutral-400 cursor-default'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              } transition-colors duration-200`}
              aria-label={typeof page === 'number' ? `Go to page ${page}` : 'Page ellipsis'}
              disabled={typeof page === 'string'}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-sm min-h-[40px] ${
            currentPage === totalPages
              ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          } transition-colors duration-200`}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {viewingTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingTherapist(null)}
          ></div>

          <div className="relative bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800">
              <button
                onClick={() => setViewingTherapist(null)}
                className="sm:hidden w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-400" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left flex-1">
                Therapist Details
              </h2>
              <button
                onClick={() => setViewingTherapist(null)}
                className="hidden sm:flex w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center mb-6 sm:mb-8">
                <div className="relative inline-block">
                  <img
                    src={viewingTherapist.profilePhoto}
                    alt={`${viewingTherapist.firstName} ${viewingTherapist.lastName}`}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-2 sm:border-4 border-neutral-700 mx-auto"
                  />
                  <div className={`absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 sm:border-4 border-neutral-800 ${
                    viewingTherapist.isAvailable ? 'bg-accent-green' : 'bg-neutral-500'
                  }`}></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 sm:mt-4">
                  {viewingTherapist.firstName} {viewingTherapist.lastName}
                </h3>
                <p className="text-neutral-400 text-sm sm:text-base">{viewingTherapist.email}</p>
                
                <div className="flex items-center justify-center space-x-2 mt-2 sm:mt-3">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent-yellow fill-current" />
                  <span className="text-white font-medium text-base sm:text-lg">{viewingTherapist.rating}</span>
                  <span className="text-neutral-400 text-sm sm:text-base">({viewingTherapist.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-neutral-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center space-x-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                      <span>Professional Info</span>
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                        <span className="text-neutral-300 text-sm sm:text-base">{viewingTherapist.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                        <span className="text-neutral-300 text-sm sm:text-base">LKR {viewingTherapist.hourlyRate.toLocaleString()} per session</span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                        <span className="text-neutral-300 text-sm sm:text-base">{viewingTherapist.nextAvailableSlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Credentials</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {viewingTherapist.credentials.map((credential, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs sm:text-sm"
                        >
                          {credential}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-neutral-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Specializations</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {viewingTherapist.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 sm:px-3 sm:py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs sm:text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Session Formats</h4>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      {viewingTherapist.sessionFormats.map((format, index) => (
                        <div key={index} className="flex items-center space-x-1 sm:space-x-2 text-neutral-300">
                          {getSessionFormatIcon(format)}
                          <span className="text-xs sm:text-sm capitalize">{format}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {viewingTherapist.bio && (
                <div className="mt-4 sm:mt-6 bg-neutral-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">About</h4>
                  <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">{viewingTherapist.bio}</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 sm:space-x-4 mt-6 pt-4 sm:pt-6 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setViewingTherapist(null);
                    openEditModal(viewingTherapist);
                  }}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-primary-500 text-white rounded-xl sm:rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Therapist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false);
              setEditingTherapist(null);
              resetForm();
            }}
          ></div>

          <div className="relative bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTherapist(null);
                  resetForm();
                }}
                className="sm:hidden w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-400" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left flex-1">
                {editingTherapist ? 'Edit Therapist' : 'Add New Therapist'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTherapist(null);
                  resetForm();
                }}
                className="hidden sm:flex w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 sm:mb-3 text-center">
                  Profile Photo
                </label>
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center border-2 sm:border-4 border-neutral-700">
                    {formData.profilePhoto ? (
                      <img
                        src={formData.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-400" />
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

                {!editingTherapist && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

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

              {isMobile ? (
                <>
                  <div className="bg-neutral-800/50 rounded-xl overflow-hidden">
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
                  </div>

                  <div className="bg-neutral-800/50 rounded-xl overflow-hidden">
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
                        <input
                          type="text"
                          value={customSpecialization}
                          onChange={(e) => setCustomSpecialization(e.target.value)}
                          onKeyPress={handleSpecializationKeyPress}
                          className="w-full px-3 py-2 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400 text-xs"
                          placeholder="Enter specialization and press Enter"
                        />
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
                  </div>

                  <div className="bg-neutral-800/50 rounded-xl overflow-hidden">
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
                  </div>

                  <div className="bg-neutral-800/50 rounded-xl overflow-hidden">
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
                  </div>

                  <div className="bg-neutral-800/50 rounded-xl overflow-hidden">
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
                  </div>
                </>
              ) : (
                <>
                  <div>
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
                  </div>

                  <div>
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
                  </div>

                  <div>
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
                  </div>

                  <div>
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
                  </div>

                  <div>
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
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1 sm:mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 resize-none text-sm sm:text-base"
                  placeholder="Enter therapist bio..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 sm:space-x-4 pt-4 sm:pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTherapist(null);
                    resetForm();
                  }}
                  className="px-4 py-2 sm:px-6 sm:py-3 border border-neutral-700 text-neutral-300 rounded-xl sm:rounded-2xl hover:bg-neutral-800 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-primary-500 text-white rounded-xl sm:rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : editingTherapist ? 'Update' : 'Add Therapist'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistManagement;