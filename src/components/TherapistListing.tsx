import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Users, SlidersHorizontal, Search, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { therapistsData, TherapistData } from '../data/therapists';
import TherapistCard from './TherapistCard';

interface TherapistListingProps {
  onBack: () => void;
  initialFilter?: string; // For filtering by service category
  onOpenAuth: (mode: 'login' | 'signup' | 'anonymous') => void;
}

// Simple filters for the simplified structure
interface SimpleFilters {
  specialty?: string;
  language?: string;
  availability?: 'available' | 'all';
  serviceCategory?: string;
}

const TherapistListing: React.FC<TherapistListingProps> = ({ onBack, initialFilter, onOpenAuth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SimpleFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'specialty' | 'availability'>('name');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set initial filter based on service category
  useEffect(() => {
    if (initialFilter) {
      setFilters({ serviceCategory: initialFilter });
    }
  }, [initialFilter]);

  // Get unique values for filters
  const specialties = [...new Set(therapistsData.map(t => t.specialty))];
  const languages = [...new Set(therapistsData.flatMap(t => t.languages))];
  const serviceCategories = [...new Set(therapistsData.map(t => t.serviceCategory))];

  // Filter and search therapists
  const filteredTherapists = useMemo(() => {
    let filtered = therapistsData;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(therapist => 
        therapist.name.toLowerCase().includes(query) ||
        therapist.specialty.toLowerCase().includes(query) ||
        therapist.credentials.toLowerCase().includes(query) ||
        therapist.languages.some(lang => lang.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.specialty) {
      filtered = filtered.filter(therapist => 
        therapist.specialty === filters.specialty
      );
    }

    if (filters.language) {
      filtered = filtered.filter(therapist => 
        therapist.languages.includes(filters.language!)
      );
    }

    if (filters.serviceCategory) {
      filtered = filtered.filter(therapist => 
        therapist.serviceCategory === filters.serviceCategory
      );
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter(therapist => 
        therapist.availability.toLowerCase().includes('today')
      );
    }

    // Sort therapists
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'availability':
          if (a.availability.includes('Today') && !b.availability.includes('Today')) return -1;
          if (!a.availability.includes('Today') && b.availability.includes('Today')) return 1;
          return a.name.localeCompare(b.name);
        case 'specialty':
          return a.specialty.localeCompare(b.specialty);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [filters, searchQuery, sortBy]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;

  const handleBookNow = (therapist: TherapistData) => {
    if (user) {
      // User is logged in, proceed to booking with pre-selected therapist
      navigate('/client/book', { 
        state: { 
          preSelectedTherapist: therapist.id,
          therapistName: therapist.name,
          returnTo: 'booking'
        } 
      });
    } else {
      // User not logged in, store intended action and prompt for auth
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        therapistId: therapist.id,
        therapistName: therapist.name,
        action: 'book',
        timestamp: Date.now()
      }));
      onOpenAuth('login'); // Show login first for better UX
    }
  };

  const getServiceCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'TEENS': return 'Teen Therapy (13-17)';
      case 'INDIVIDUALS': return 'Individual Therapy (18+)';
      case 'FAMILY_COUPLES': return 'Family & Couples Therapy';
      case 'LGBTQIA': return 'LGBTQIA+ Therapy';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Find Your Therapist</h1>
                <p className="text-neutral-300">Connect with licensed mental health professionals</p>
                {initialFilter && (
                  <p className="text-primary-500 text-sm mt-1">
                    Showing therapists for: {getServiceCategoryDisplayName(initialFilter)}
                  </p>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div className="hidden md:flex items-center space-x-3">
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/50 border border-neutral-700 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="specialty">Sort by Specialty</option>
                <option value="availability">Sort by Availability</option>
              </select>
            </div>
          </div>
        </div>

        {/* Simplified Filters */}
<div className="bg-cream-50 backdrop-blur-sm rounded-3xl shadow-lg border border-cream-200 p-6 mb-8">
  <div className="grid md:grid-cols-5 gap-4 mb-4">
    {/* Search */}
    <div className="md:col-span-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-600" />
        <input
          type="text"
          placeholder="Search therapists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white text-cream-900 placeholder-cream-400"
        />
      </div>
    </div>

    {/* Service Category Filter */}
    <div>
      <select
        value={filters.serviceCategory || ''}
        onChange={(e) => setFilters({ ...filters, serviceCategory: e.target.value || undefined })}
        className="w-full p-3 border border-cream-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white text-cream-900"
      >
        <option value="">All Services</option>
        {serviceCategories.map((category) => (
          <option key={category} value={category}>{getServiceCategoryDisplayName(category)}</option>
        ))}
      </select>
    </div>

    {/* Specialty Filter */}
    <div>
      <select
        value={filters.specialty || ''}
        onChange={(e) => setFilters({ ...filters, specialty: e.target.value || undefined })}
        className="w-full p-3 border border-cream-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white text-cream-900"
      >
        {specialties.map((spec) => (
          <option key={spec} value={spec}>{spec}</option>
        ))}
      </select>
    </div>

    {/* Language Filter */}
    <div>
      <select
        value={filters.language || ''}
        onChange={(e) => setFilters({ ...filters, language: e.target.value || undefined })}
        className="w-full p-3 border border-cream-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white text-cream-900"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
    </div>
  </div>

  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button
        onClick={() => setFilters({ 
          ...filters, 
          availability: filters.availability === 'available' ? undefined : 'available' 
        })}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium whitespace-nowrap ${
          filters.availability === 'available'
            ? 'bg-cream-200 text-cream-800 border-cream-300'
            : 'bg-white text-cream-700 border-cream-300 hover:border-cream-400'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>Available Today</span>
      </button>
    </div>
    
    {hasActiveFilters && (
      <button
        onClick={clearFilters}
        className="text-sm text-cream-600 hover:text-cream-800 transition-colors duration-200"
      >
        Clear all
      </button>
    )}
  </div>
</div>

        {/* Mobile Sort */}
        <div className="md:hidden mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-black/50 border border-neutral-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="specialty">Sort by Specialty</option>
            <option value="availability">Sort by Availability</option>
          </select>
        </div>

        {/* Therapist Grid - Using TherapistCard component */}
        {filteredTherapists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTherapists.map((therapist) => (
              <TherapistCard
                key={therapist.id}
                therapist={therapist}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No therapists found</h3>
            <p className="text-neutral-300 mb-6">
              Try adjusting your search criteria or filters to find more therapists.
            </p>
            <button
              onClick={clearFilters}
              className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistListing;