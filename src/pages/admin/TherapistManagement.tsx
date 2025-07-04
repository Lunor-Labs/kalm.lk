import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  MoreVertical, 
  Star, 
  Clock, 
  Award,
  X,
  Save,
  Trash2,
  UserCheck,
  MapPin,
  Upload,
  Camera
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { db, storage, auth } from '../../lib/firebase';
import { updateUserRole } from '../../lib/auth';
import toast from 'react-hot-toast';

interface TherapistProfile {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
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
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TherapistManagement: React.FC = () => {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<TherapistProfile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<TherapistProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    credentials: [],
    specializations: [],
    languages: [],
    services: [],
    isAvailable: true,
    sessionFormats: [],
    bio: '',
    experience: 0,
    rating: 5.0,
    reviewCount: 0,
    hourlyRate: 4500,
    profilePhoto: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
    nextAvailableSlot: 'Available today',
    location: 'Colombo, Sri Lanka'
  });

  // Password for new therapist account
  const [therapistPassword, setTherapistPassword] = useState('');

  const predefinedOptions = {
    credentials: [
      'PhD Clinical Psychology',
      'MSc Counseling Psychology',
      'MSc Clinical Psychology',
      'PhD Trauma Psychology',
      'MSc Family Therapy',
      'MSc Inclusive Psychology',
      'PhD Adolescent Psychology',
      'Licensed Therapist',
      'Certified Counselor'
    ],
    specializations: [
      'Anxiety & Depression',
      'Relationship Counseling',
      'Stress & Trauma',
      'Family Therapy',
      'Addiction Recovery',
      'Teen Counseling',
      'LGBTQIA+ Counseling',
      'Adolescent Psychology',
      'Couples Therapy',
      'Individual Therapy',
      'Group Therapy'
    ],
    languages: ['English', 'Sinhala', 'Tamil'],
    services: [
      'Individual Therapy',
      'Couples Therapy',
      'Family Therapy',
      'Group Therapy',
      'Teen Counseling',
      'Crisis Intervention',
      'Addiction Counseling'
    ],
    sessionFormats: ['video', 'audio', 'chat']
  };

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
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as TherapistProfile[];
      
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Error loading therapists:', error);
      toast.error('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }
      
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `therapist-photos/${timestamp}-${file.name}`;
      const storageRef = ref(storage, filename);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const downloadURL = await handleImageUpload(file);
      
      // Update form data
      setFormData({ ...formData, profilePhoto: downloadURL });
      
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message);
      setImagePreview(null);
    }
  };

  const createTherapistAccount = async (email: string, password: string, displayName: string): Promise<string> => {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore with therapist role
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'therapist',
        isAnonymous: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      return user.uid;
    } catch (error: any) {
      console.error('Error creating therapist account:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else {
        throw new Error(error.message || 'Failed to create therapist account');
      }
    }
  };

  const handleAddTherapist = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!therapistPassword || therapistPassword.length < 6) {
        toast.error('Please provide a password (minimum 6 characters)');
        return;
      }

      const displayName = `${formData.firstName} ${formData.lastName}`;
      
      // Create therapist account first
      const userId = await createTherapistAccount(formData.email, therapistPassword, displayName);
      
      // Create therapist profile
      const therapistId = `therapist_${Date.now()}`;
      const therapistData = {
        ...formData,
        id: therapistId,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'therapists', therapistId), therapistData);
      
      toast.success('Therapist account and profile created successfully');
      setShowAddModal(false);
      resetForm();
      loadTherapists();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add therapist');
    }
  };

  const handleEditTherapist = async () => {
    try {
      if (!editingTherapist || !formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      await updateDoc(doc(db, 'therapists', editingTherapist.id), {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Therapist updated successfully');
      setShowEditModal(false);
      setEditingTherapist(null);
      resetForm();
      loadTherapists();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update therapist');
    }
  };

  const handleDeleteTherapist = async (therapistId: string) => {
    if (!confirm('Are you sure you want to delete this therapist? This action cannot be undone.')) {
      return;
    }

    try {
      const therapist = therapists.find(t => t.id === therapistId);
      
      // Delete profile photo from storage if it's not a default image
      if (therapist?.profilePhoto && therapist.profilePhoto.includes('firebase')) {
        try {
          const photoRef = ref(storage, therapist.profilePhoto);
          await deleteObject(photoRef);
        } catch (error) {
          console.warn('Could not delete profile photo:', error);
        }
      }
      
      await deleteDoc(doc(db, 'therapists', therapistId));
      toast.success('Therapist deleted successfully');
      loadTherapists();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete therapist');
    }
  };

  const handleToggleAvailability = async (therapist: TherapistProfile) => {
    try {
      await updateDoc(doc(db, 'therapists', therapist.id), {
        isAvailable: !therapist.isAvailable,
        updatedAt: serverTimestamp(),
      });
      
      toast.success(`Therapist ${therapist.isAvailable ? 'disabled' : 'enabled'} successfully`);
      loadTherapists();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      credentials: [],
      specializations: [],
      languages: [],
      services: [],
      isAvailable: true,
      sessionFormats: [],
      bio: '',
      experience: 0,
      rating: 5.0,
      reviewCount: 0,
      hourlyRate: 4500,
      profilePhoto: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
      nextAvailableSlot: 'Available today',
      location: 'Colombo, Sri Lanka'
    });
    setTherapistPassword('');
    setImagePreview(null);
  };

  const openEditModal = (therapist: TherapistProfile) => {
    setEditingTherapist(therapist);
    setFormData(therapist);
    setImagePreview(therapist.profilePhoto);
    setShowEditModal(true);
  };

  const openViewModal = (therapist: TherapistProfile) => {
    setEditingTherapist(therapist);
    setShowViewModal(true);
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = 
      therapist.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'available' && therapist.isAvailable) ||
      (statusFilter === 'unavailable' && !therapist.isAvailable);
    
    return matchesSearch && matchesStatus;
  });

  const handleArrayFieldChange = (field: keyof TherapistProfile, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData({ ...formData, [field]: newArray });
  };

  if (loading) {
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
          <p className="text-neutral-300">Manage therapist profiles and availability</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Therapist</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-primary-500" />
            <span className="text-neutral-300 text-sm">Total Therapists</span>
          </div>
          <p className="text-2xl font-bold text-white">{therapists.length}</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <UserCheck className="w-5 h-5 text-accent-green" />
            <span className="text-neutral-300 text-sm">Available</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {therapists.filter(t => t.isAvailable).length}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-accent-yellow" />
            <span className="text-neutral-300 text-sm">Unavailable</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {therapists.filter(t => !t.isAvailable).length}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-3 mb-2">
            <Star className="w-5 h-5 text-accent-orange" />
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

      {/* Filters */}
      <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border border-neutral-800">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search */}
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

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Therapists Table */}
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
                <th className="text-left p-4 text-neutral-300 font-medium">Specialization</th>
                <th className="text-left p-4 text-neutral-300 font-medium">Rating</th>
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
                        className="w-10 h-10 rounded-full object-cover"
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
                    <div className="space-y-1">
                      {therapist.specializations.slice(0, 2).map((spec, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary-500/20 text-primary-500 px-2 py-1 rounded-full text-xs mr-1"
                        >
                          {spec}
                        </span>
                      ))}
                      {therapist.specializations.length > 2 && (
                        <span className="text-neutral-400 text-xs">
                          +{therapist.specializations.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-accent-yellow fill-current" />
                      <span className="text-white font-medium">{therapist.rating}</span>
                      <span className="text-neutral-400 text-sm">({therapist.reviewCount})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">LKR {therapist.hourlyRate.toLocaleString()}</p>
                    <p className="text-neutral-400 text-sm">per session</p>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailability(therapist)}
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                        therapist.isAvailable
                          ? 'bg-accent-green/20 text-accent-green'
                          : 'bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        therapist.isAvailable ? 'bg-accent-green' : 'bg-neutral-400'
                      }`}></div>
                      <span>{therapist.isAvailable ? 'Available' : 'Unavailable'}</span>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openViewModal(therapist)}
                        className="p-2 text-neutral-400 hover:text-white transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(therapist)}
                        className="p-2 text-neutral-400 hover:text-white transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTherapist(therapist.id)}
                        className="p-2 text-neutral-400 hover:text-red-400 transition-colors duration-200"
                        title="Delete"
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
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first therapist to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Therapist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-2xl font-bold text-white">Add New Therapist</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Photo Upload */}
              <div className="text-center">
                <label className="block text-sm font-medium text-neutral-300 mb-4">Profile Photo</label>
                <div className="relative inline-block">
                  <img
                    src={imagePreview || formData.profilePhoto}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-neutral-400 text-xs mt-2">Click the camera icon to upload a photo (max 5MB)</p>
              </div>

              {/* Account Information */}
              <div className="bg-neutral-800/30 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      placeholder="Enter email address"
                    />
                    <p className="text-neutral-400 text-xs mt-1">This will be used for login</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Password *</label>
                    <input
                      type="password"
                      value={therapistPassword}
                      onChange={(e) => setTherapistPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      placeholder="Enter password (min 6 characters)"
                      minLength={6}
                    />
                    <p className="text-neutral-400 text-xs mt-1">Minimum 6 characters</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      placeholder="Enter location"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      value={formData.experience || 0}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Hourly Rate (LKR)</label>
                    <input
                      type="number"
                      value={formData.hourlyRate || 4500}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 4500 })}
                      className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Credentials</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {predefinedOptions.credentials.map((credential) => (
                    <label key={credential} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.credentials || []).includes(credential)}
                        onChange={() => handleArrayFieldChange('credentials', credential)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm">{credential}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Specializations</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {predefinedOptions.specializations.map((specialization) => (
                    <label key={specialization} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.specializations || []).includes(specialization)}
                        onChange={() => handleArrayFieldChange('specializations', specialization)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm">{specialization}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedOptions.languages.map((language) => (
                    <label key={language} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.languages || []).includes(language)}
                        onChange={() => handleArrayFieldChange('languages', language)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm">{language}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Session Formats */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Session Formats</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedOptions.sessionFormats.map((format) => (
                    <label key={format} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.sessionFormats || []).includes(format)}
                        onChange={() => handleArrayFieldChange('sessionFormats', format)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm capitalize">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Services Offered</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {predefinedOptions.services.map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.services || []).includes(service)}
                        onChange={() => handleArrayFieldChange('services', service)}
                        className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-neutral-300 text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                  placeholder="Enter therapist bio..."
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable || false}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="isAvailable" className="text-neutral-300">Available for bookings</label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t border-neutral-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 border border-neutral-700 text-neutral-300 rounded-2xl hover:bg-neutral-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTherapist}
                disabled={uploadingImage}
                className="px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>Create Therapist Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure but without account creation */}
      {showEditModal && editingTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-2xl font-bold text-white">Edit Therapist</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Photo Upload */}
              <div className="text-center">
                <label className="block text-sm font-medium text-neutral-300 mb-4">Profile Photo</label>
                <div className="relative inline-block">
                  <img
                    src={imagePreview || formData.profilePhoto}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-neutral-400 text-xs mt-2">Click the camera icon to upload a new photo</p>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience || 0}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Hourly Rate (LKR)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate || 4500}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 4500 })}
                    className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                    min="0"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white"
                  placeholder="Enter therapist bio..."
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="editIsAvailable"
                  checked={formData.isAvailable || false}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded border-neutral-600 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="editIsAvailable" className="text-neutral-300">Available for bookings</label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t border-neutral-800">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-neutral-700 text-neutral-300 rounded-2xl hover:bg-neutral-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTherapist}
                disabled={uploadingImage}
                className="px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>Update Therapist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal - Same as before */}
      {showViewModal && editingTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          <div className="relative bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-2xl font-bold text-white">Therapist Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-1">
                  <div className="text-center mb-6">
                    <img
                      src={editingTherapist.profilePhoto}
                      alt={`${editingTherapist.firstName} ${editingTherapist.lastName}`}
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-white">
                      {editingTherapist.firstName} {editingTherapist.lastName}
                    </h3>
                    <p className="text-neutral-300">{editingTherapist.email}</p>
                    {editingTherapist.phone && (
                      <p className="text-neutral-400 text-sm">{editingTherapist.phone}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-neutral-800/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-accent-yellow" />
                        <span className="text-white font-medium">Rating</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {editingTherapist.rating} 
                        <span className="text-sm text-neutral-400 ml-2">
                          ({editingTherapist.reviewCount} reviews)
                        </span>
                      </p>
                    </div>

                    <div className="bg-neutral-800/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-primary-500" />
                        <span className="text-white font-medium">Experience</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{editingTherapist.experience} years</p>
                    </div>

                    <div className="bg-neutral-800/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-white font-medium">Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        LKR {editingTherapist.hourlyRate.toLocaleString()}
                        <span className="text-sm text-neutral-400 ml-2">per session</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Bio */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">About</h4>
                    <p className="text-neutral-300 leading-relaxed">{editingTherapist.bio}</p>
                  </div>

                  {/* Credentials */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Credentials</h4>
                    <div className="flex flex-wrap gap-2">
                      {editingTherapist.credentials.map((credential, index) => (
                        <span
                          key={index}
                          className="bg-primary-500/20 text-primary-500 px-3 py-1 rounded-full text-sm"
                        >
                          {credential}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {editingTherapist.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-accent-green/20 text-accent-green px-3 py-1 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {editingTherapist.languages.map((language, index) => (
                        <span
                          key={index}
                          className="bg-accent-yellow/20 text-accent-yellow px-3 py-1 rounded-full text-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Session Formats */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Session Formats</h4>
                    <div className="flex flex-wrap gap-2">
                      {editingTherapist.sessionFormats.map((format, index) => (
                        <span
                          key={index}
                          className="bg-accent-orange/20 text-accent-orange px-3 py-1 rounded-full text-sm capitalize"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Services</h4>
                    <div className="space-y-2">
                      {editingTherapist.services.map((service, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span className="text-neutral-300">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Status</h4>
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                      editingTherapist.isAvailable
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        editingTherapist.isAvailable ? 'bg-accent-green' : 'bg-neutral-400'
                      }`}></div>
                      <span>{editingTherapist.isAvailable ? 'Available for bookings' : 'Currently unavailable'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-6 border-t border-neutral-800">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(editingTherapist);
                }}
                className="px-6 py-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Therapist</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistManagement;