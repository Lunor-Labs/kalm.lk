import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Users, SlidersHorizontal, Search, Clock, MessageCircle } from 'lucide-react';

interface TherapistListingProps {
  onBack: () => void;
  initialFilter?: string; // For filtering by service category
}

// Simplified therapist data structure matching landing page
interface SimpleTherapist {
  name: string;
  specialty: string;
  image: string;
  languages: string[];
  credentials: string;
  availability: string;
  serviceCategory: string; // Added to map to service categories
}

// Simple filters for the simplified structure
interface SimpleFilters {
  specialty?: string;
  language?: string;
  availability?: 'available' | 'all';
  serviceCategory?: string;
}

const TherapistListing: React.FC<TherapistListingProps> = ({ onBack, initialFilter }) => {
  const [filters, setFilters] = useState<SimpleFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'specialty' | 'availability'>('name');

  // Set initial filter based on service category
  useEffect(() => {
    if (initialFilter) {
      setFilters({ serviceCategory: initialFilter });
    }
  }, [initialFilter]);

  // Simplified therapist data matching landing page with service categories
  const therapistsData: SimpleTherapist[] = [
    {
      name: 'Dr. Priya Perera',
      specialty: 'Anxiety & Depression',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'PhD Clinical Psychology',
      availability: 'Available Today',
      serviceCategory: 'INDIVIDUALS'
    },
    {
      name: 'Dr. Rohan Silva',
      specialty: 'Relationship Counseling',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala', 'Tamil'],
      credentials: 'MSc Counseling Psychology',
      availability: 'Available Tomorrow',
      serviceCategory: 'FAMILY & COUPLES'
    },
    {
      name: 'Dr. Amara Fernando',
      specialty: 'Stress & Trauma',
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'PhD Trauma Psychology',
      availability: 'Available Today',
      serviceCategory: 'INDIVIDUALS'
    },
    {
      name: 'Dr. Kavitha Raj',
      specialty: 'Family Therapy',
      image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Tamil'],
      credentials: 'MSc Family Therapy',
      availability: 'Available This Week',
      serviceCategory: 'FAMILY & COUPLES'
    },
    {
      name: 'Dr. Nuwan Jayasinghe',
      specialty: 'Addiction Recovery',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'PhD Clinical Psychology',
      availability: 'Next Week',
      serviceCategory: 'INDIVIDUALS'
    },
    {
      name: 'Dr. Sanduni Wickramasinghe',
      specialty: 'Teen Counseling',
      image: 'https://images.pexels.com/photos/5327653/pexels-photo-5327653.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'MSc Clinical Psychology',
      availability: 'Available Today',
      serviceCategory: 'TEENS'
    },
    {
      name: 'Dr. Malini Perera',
      specialty: 'LGBTQIA+ Counseling',
      image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'MSc Inclusive Psychology',
      availability: 'Available Today',
      serviceCategory: 'LGBTQIA+'
    },
    {
      name: 'Dr. Chamara Silva',
      specialty: 'Adolescent Psychology',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala', 'Tamil'],
      credentials: 'PhD Adolescent Psychology',
      availability: 'Available Tomorrow',
      serviceCategory: 'TEENS'
    }
  ];

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

  const handleBookNow = (therapist: SimpleTherapist) => {
    alert(`Booking system for ${therapist.name} would be implemented here.`);
  };

  const getServiceCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'TEENS': return 'Teen Therapy (13-17)';
      case 'INDIVIDUALS': return 'Individual Therapy (18+)';
      case 'FAMILY & COUPLES': return 'Family & Couples Therapy';
      case 'LGBTQIA+': return 'LGBTQIA+ Therapy';
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
        <div className="bg-black/50 backdrop-blur-sm rounded-3xl shadow-lg border border-neutral-800 p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search therapists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-neutral-800 text-white placeholder-neutral-400"
                />
              </div>
            </div>

            {/* Service Category Filter */}
            <div>
              <select
                value={filters.serviceCategory || ''}
                onChange={(e) => setFilters({ ...filters, serviceCategory: e.target.value || undefined })}
                className="w-full p-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-neutral-800 text-white"
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
                className="w-full p-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-neutral-800 text-white"
              >
                <option value="">All Specialties</option>
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
                className="w-full p-3 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-neutral-800 text-white"
              >
                <option value="">All Languages</option>
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
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${
                  filters.availability === 'available'
                    ? 'bg-accent-green/20 text-accent-green border-accent-green/30'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Available Today</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-300">
                <span className="font-medium text-white">{filteredTherapists.length}</span> therapist{filteredTherapists.length !== 1 ? 's' : ''} found
              </div>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-200"
                >
                  Clear all
                </button>
              )}
            </div>
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

        {/* Therapist Grid - Using Landing Page Card Style with Dark Theme */}
        {filteredTherapists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTherapists.map((therapist, index) => (
              <div
                key={index}
                className="group bg-black/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-neutral-800"
              >
                {/* Large Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Availability Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                    <Clock className="w-3 h-3 text-accent-green" />
                    <span className={`text-xs font-medium ${
                      therapist.availability.toLowerCase().includes('today') ? 'text-accent-green' : 'text-neutral-300'
                    }`}>
                      {therapist.availability}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {therapist.name}
                    </h3>
                    <p className="text-primary-500 font-medium text-sm">
                      {therapist.specialty}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-xs text-neutral-400 mb-2 font-medium">Languages:</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {therapist.languages.map((lang, langIndex) => (
                          <span
                            key={langIndex}
                            className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 mb-1 font-medium">Credentials:</p>
                      <p className="text-xs text-neutral-300">{therapist.credentials}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleBookNow(therapist)}
                    className="w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Book Session</span>
                  </button>
                </div>
              </div>
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