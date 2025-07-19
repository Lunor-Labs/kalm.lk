import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  Save,
  Star,
  Clock,
  Award,
  Languages,
  Video,
  Phone,
  MessageCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Calendar,
  DollarSign
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
import { updateUserRole } from '../../lib/auth';
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

  // Predefined options
  const credentialOptions = [
    'PhD Clinical Psychology',
    'MSc Counseling Psychology',
    'MSc Clinical Psychology',
    'MSc Family Therapy',
    'Licensed Therapist',
    'Certified Counselor',
    'EMDR Certified',
    'CBT Certified'
  ];

  const specializationOptions = [
    'Anxiety Disorders',
    'Depression',
    'Trauma & PTSD',
    'Relationship Counseling',
    'Family Therapy',
    'Addiction Recovery',
    'Teen Counseling',
    'LGBTQIA+ Counseling',
    'Stress Management',
    'Grief Counseling',
    'Eating Disorders',
    'Sleep Disorders'
  ];

  const languageOptions = [
    'English',
    'Sinhala',
    'Tamil',
    'Hindi'
  ];

  const serviceOptions = [
    'Individual Therapy',
    'Couples Therapy',
    'Family Therapy',
    'Group Therapy',
    'Teen Counseling',
    'LGBTQIA+ Support',
    'Crisis Intervention',
    'Addiction Counseling'
  ];

  const sessionFormatOptions = [
    'video',
    'audio',
    'chat'
  ];

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const therapistsRef = collection(db, 'therapists');
      const q = query(therapistsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const therapistsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Therapist[];
      
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Error loading therapists:', error);
      toast.error('Failed to load therapists');
    } finally {
      setLoading(false);
    }
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
      toast.error('Please select at least one credential');
      return;
    }

    if (formData.specializations.length === 0) {
      toast.error('Please select at least one specialization');
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
        // Update existing therapist
        const therapistRef = doc(db, 'therapists', editingTherapist.id);
        await updateDoc(therapistRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          credentials: formData.credentials,
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
        // Create new therapist account
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Update display name
        await updateProfile(user, {
          displayName: `${formData.firstName} ${formData.lastName}`
        });
        
        // Create user document in Firestore first
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: `${formData.firstName} ${formData.lastName}`,
          role: 'therapist',
          isAnonymous: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Create therapist document
        const therapistData = {
          userId: user.uid,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          credentials: formData.credentials,
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
      
      // Reset form and close modal
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
    if (!confirm(`Are you sure you want to delete ${therapist.firstName} ${therapist.lastName}?`)) {
      return;
    }

    try {
      // Delete profile photo if it exists and is not a default image
      if (therapist.profilePhoto && !therapist.profilePhoto.includes('pexels.com')) {
        const photoPath = getStoragePathFromUrl(therapist.profilePhoto);
        if (photoPath) {
          await deleteTherapistPhoto(photoPath);
        }
      }
      
      // Delete therapist document
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
  };

  const openEditModal = (therapist: Therapist) => {
    setFormData({
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      email: therapist.email,
      password: '', // Don't populate password for security
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

  const handleArrayFieldChange = (field: keyof TherapistFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'audio': return <Phone className="w-3 h-3" />;
      case 'chat': return <MessageCircle className="w-3 h-3" />;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Therapist Management</h1>
          <p className="text-neutral-300">Manage therapist profiles and accounts</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-neutral-800 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                viewMode === 'table' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>

          <button
            onClick={() => {
              resetForm();
              setEditingTherapist(null);
              setShowAddModal(true);
            }}
            className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Therapist</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-primary-500" />
            <span className="text-neutral-300 text-sm">Total Therapists</span>
          </div>
          <p className="text-2xl font-bold text-white">{therapists.length}</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-accent-green" />
            <span className="text-neutral-300 text-sm">Available Now</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {therapists.filter(t => t.isAvailable).length}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Star className="w-5 h-5 text-accent-yellow" />
            <span className="text-neutral-300 text-sm">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {therapists.length > 0 
              ? (therapists.reduce((sum, t) => sum + t.rating, 0) / therapists.length).toFixed(1)
              : '0.0'
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search therapists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
          />
        </div>
      </div>

      {/* Therapists Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <div
              key={therapist.id}
              className="bg-black/50 backdrop-blur-sm rounded-3xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Profile Image - Centered */}
              <div className="relative p-6 pb-0">
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={therapist.profilePhoto}
                      alt={`${therapist.firstName} ${therapist.lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-neutral-700"
                    />
                    <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-neutral-800 ${
                      therapist.isAvailable ? 'bg-accent-green' : 'bg-neutral-500'
                    }`}></div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4 text-center">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {therapist.firstName} {therapist.lastName}
                </h3>
                <p className="text-neutral-400 text-sm mb-3">{therapist.email}</p>

                {/* Rating */}
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <Star className="w-4 h-4 text-accent-yellow fill-current" />
                  <span className="text-white font-medium">{therapist.rating}</span>
                  <span className="text-neutral-400 text-sm">({therapist.reviewCount})</span>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {therapist.specializations.slice(0, 2).map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                    {therapist.specializations.length > 2 && (
                      <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs">
                        +{therapist.specializations.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                  <div className="text-center">
                    <p className="text-neutral-400">Experience</p>
                    <p className="text-white font-medium">{therapist.experience} years</p>
                  </div>
                  <div className="text-center">
                    <p className="text-neutral-400">Rate</p>
                    <p className="text-white font-medium">LKR {therapist.hourlyRate.toLocaleString()}</p>
                  </div>
                </div>

                {/* Session Formats */}
                <div className="flex items-center justify-center space-x-3 mb-4">
                  {therapist.sessionFormats.map((format, index) => (
                    <div key={index} className="flex items-center space-x-1 text-neutral-300">
                      {getSessionFormatIcon(format)}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setViewingTherapist(therapist)}
                    className="p-2 bg-neutral-800 text-neutral-300 hover:text-primary-500 rounded-xl transition-colors duration-200"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(therapist)}
                    className="p-2 bg-neutral-800 text-neutral-300 hover:text-accent-yellow rounded-xl transition-colors duration-200"
                    title="Edit therapist"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(therapist)}
                    className="p-2 bg-neutral-800 text-neutral-300 hover:text-red-500 rounded-xl transition-colors duration-200"
                    title="Delete therapist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl border border-neutral-800 overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <h2 className="text-xl font-semibold text-white">
              Therapists ({filteredTherapists.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800/50">
                <tr>
                  <th className="text-left p-4 text-neutral-300 font-medium">Therapist</th>
                  <th className="text-left p-4 text-neutral-300 font-medium">Specializations</th>
                  <th className="text-left p-4 text-neutral-300 font-medium">Experience</th>
                  <th className="text-left p-4 text-neutral-300 font-medium">Rate</th>
                  <th className="text-left p-4 text-neutral-300 font-medium">Status</th>
                  <th className="text-left p-4 text-neutral-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTherapists.map((therapist) => (
                  <tr key={therapist.id} className="border-t border-neutral-800 hover:bg-neutral-800/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={therapist.profilePhoto}
                          alt={`${therapist.firstName} ${therapist.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">
                            {therapist.firstName} {therapist.lastName}
                          </p>
                          <p className="text-neutral-400 text-sm">{therapist.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {therapist.specializations.slice(0, 2).map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs"
                          >
                            {spec}
                          </span>
                        ))}
                        {therapist.specializations.length > 2 && (
                          <span className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs">
                            +{therapist.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-neutral-300">{therapist.experience} years</p>
                    </td>
                    <td className="p-4">
                      <p className="text-neutral-300">LKR {therapist.hourlyRate.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
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

          {filteredTherapists.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-300 mb-2">No therapists found</p>
              <p className="text-neutral-400 text-sm">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Add your first therapist to get started'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Therapist Modal */}
      {viewingTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingTherapist(null)}
          ></div>

          <div className="relative bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-2xl font-bold text-white">Therapist Details</h2>
              <button
                onClick={() => setViewingTherapist(null)}
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Profile Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img
                    src={viewingTherapist.profilePhoto}
                    alt={`${viewingTherapist.firstName} ${viewingTherapist.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-neutral-700 mx-auto"
                  />
                  <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-neutral-800 ${
                    viewingTherapist.isAvailable ? 'bg-accent-green' : 'bg-neutral-500'
                  }`}></div>
                </div>
                <h3 className="text-2xl font-bold text-white mt-4">
                  {viewingTherapist.firstName} {viewingTherapist.lastName}
                </h3>
                <p className="text-neutral-400">{viewingTherapist.email}</p>
                
                {/* Rating */}
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <Star className="w-5 h-5 text-accent-yellow fill-current" />
                  <span className="text-white font-medium text-lg">{viewingTherapist.rating}</span>
                  <span className="text-neutral-400">({viewingTherapist.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-neutral-800/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-primary-500" />
                      <span>Professional Info</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-300">{viewingTherapist.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-300">LKR {viewingTherapist.hourlyRate.toLocaleString()} per session</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-300">{viewingTherapist.nextAvailableSlot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="bg-neutral-800/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Credentials</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingTherapist.credentials.map((credential, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm"
                        >
                          {credential}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="bg-neutral-800/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Languages className="w-5 h-5 text-accent-green" />
                      <span>Languages</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingTherapist.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-accent-green/20 text-accent-green rounded-full text-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Specializations */}
                  <div className="bg-neutral-800/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingTherapist.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="bg-neutral-800/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingTherapist.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-accent-orange/20 text-accent-orange rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Session Formats */}
                  <div className="bg-neutral-800/50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Session Formats</h4>
                    <div className="flex items-center space-x-4">
                      {viewingTherapist.sessionFormats.map((format, index) => (
                        <div key={index} className="flex items-center space-x-2 text-neutral-300">
                          {getSessionFormatIcon(format)}
                          <span className="text-sm capitalize">{format}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {viewingTherapist.bio && (
                <div className="mt-8 bg-neutral-800/50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">About</h4>
                  <p className="text-neutral-300 leading-relaxed">{viewingTherapist.bio}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setViewingTherapist(null);
                    openEditModal(viewingTherapist);
                  }}
                  className="px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Therapist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
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

          <div className="relative bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-2xl font-bold text-white">
                {editingTherapist ? 'Edit Therapist' : 'Add New Therapist'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTherapist(null);
                  resetForm();
                }}
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Profile Photo - Centered */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3 text-center">
                  Profile Photo
                </label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center border-4 border-neutral-700">
                    {formData.profilePhoto ? (
                      <img
                        src={formData.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-neutral-400" />
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
                      className={`inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 cursor-pointer ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                    </label>
                    <p className="text-xs text-neutral-400 mt-2">
                      JPEG, PNG, or WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {!editingTherapist && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Hourly Rate (LKR)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="50000"
                    step="500"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 4500 }))}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                  />
                </div>
              </div>

              {/* Credentials */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Credentials * (Select at least one)
                </label>
                <div className="grid md:grid-cols-2 gap-2">
                  {credentialOptions.map((credential) => (
                    <label key={credential} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.credentials.includes(credential)}
                        onChange={(e) => handleArrayFieldChange('credentials', credential, e.target.checked)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm">{credential}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Specializations * (Select at least one)
                </label>
                <div className="grid md:grid-cols-3 gap-2">
                  {specializationOptions.map((specialization) => (
                    <label key={specialization} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(specialization)}
                        onChange={(e) => handleArrayFieldChange('specializations', specialization, e.target.checked)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm">{specialization}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Languages * (Select at least one)
                </label>
                <div className="grid md:grid-cols-4 gap-2">
                  {languageOptions.map((language) => (
                    <label key={language} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
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

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Services * (Select at least one)
                </label>
                <div className="grid md:grid-cols-2 gap-2">
                  {serviceOptions.map((service) => (
                    <label key={service} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
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

              {/* Session Formats */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">
                  Session Formats * (Select at least one)
                </label>
                <div className="grid md:grid-cols-3 gap-2">
                  {sessionFormatOptions.map((format) => (
                    <label key={format} className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors duration-200 cursor-pointer">
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

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 resize-none"
                  placeholder="Enter therapist bio..."
                />
              </div>

              {/* Next Available Slot */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Next Available Slot
                </label>
                <input
                  type="text"
                  value={formData.nextAvailableSlot}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextAvailableSlot: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400"
                  placeholder="e.g., Available Today, Tomorrow 2 PM, etc."
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTherapist(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-neutral-700 text-neutral-300 rounded-2xl hover:bg-neutral-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : editingTherapist ? 'Update Therapist' : 'Add Therapist'}</span>
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