import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Users, SlidersHorizontal, Search, Clock, Database, HardDrive, RefreshCw, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTherapists } from '../hooks/useTherapists';
import { TherapistData } from '../data/therapists';
import TherapistCard from './TherapistCard';
import { getTherapistAvailability } from '../lib/availability';

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
  sessionFormats?: string; // Added this field
}

// Custom Select Component
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border-0 border-b border-black text-left flex items-center justify-between text-sm focus:outline-none"
      >
        <span className={value ? 'text-fixes-heading-dark' : 'text-black'}>
          {displayText}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-b border-black shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-neutral-100 ${
                value === option.value ? 'bg-neutral-100 text-black' : 'text-black'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TherapistListing: React.FC<TherapistListingProps> = ({ onBack, initialFilter, onOpenAuth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SimpleFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'specialty' | 'availability'>('name');
  const [todayAvailability, setTodayAvailability] = useState<Record<string, boolean>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Use the custom hook to fetch therapists
  const { therapists: allTherapists, loading, error, refetch } = useTherapists({
    useFirebase: true
  });

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

  // Get unique values for filters from current data
  const sessionFormats = [
    ...new Set(
      allTherapists
        .flatMap(t => Array.isArray(t.sessionFormats) ? t.sessionFormats : [t.sessionFormats])
        .filter(Boolean)
        .map(format => format.toLowerCase())
    )
  ];
  const languages = [...new Set(allTherapists.flatMap(t => t.languages))];
  const serviceCategories = [...new Set(allTherapists.map(t => t.serviceCategory))];

  // Compute which therapists have a special date for today with at least one available time slot
  useEffect(() => {
    const updateTodayAvailability = async () => {
      if (filters.availability !== 'available' || allTherapists.length === 0) {
        setTodayAvailability({});
        setAvailabilityLoading(false);
        return;
      }

      setAvailabilityLoading(true);

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

      const availabilityMap: Record<string, boolean> = {};

      await Promise.all(
        allTherapists.map(async (therapist) => {
          try {
            const availability = await getTherapistAvailability(therapist.id);
            if (!availability || !availability.isActive) {
              availabilityMap[therapist.id] = false;
            } else {
              const specialDate = availability.specialDates.find((sd) => sd.date === todayStr);
              const isAvailableToday = !!specialDate && (
                // If specialDate.isAvailable exists, respect it
                (typeof specialDate.isAvailable === 'boolean'
                  ? specialDate.isAvailable
                  // Otherwise, fall back to any available timeslot under this date
                  : (Array.isArray(specialDate.timeSlots) &&
                     specialDate.timeSlots.some((slot) => slot.isAvailable)))
              );

              availabilityMap[therapist.id] = isAvailableToday;
            }
          } catch (e) {
            availabilityMap[therapist.id] = false;
          }
        })
      );

      setTodayAvailability(availabilityMap);
      setAvailabilityLoading(false);
    };

    updateTodayAvailability();
  }, [filters.availability, allTherapists]);

  // Filter and search therapists
  const filteredTherapists = useMemo(() => {
    let filtered = allTherapists;

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

    if (filters.sessionFormats) {
      filtered = filtered.filter(therapist => {
        const formats = Array.isArray(therapist.sessionFormats) ? therapist.sessionFormats : [therapist.sessionFormats];
        return formats.some(format => format.toLowerCase() === filters.sessionFormats);
      });
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter(therapist => todayAvailability[therapist.id]);
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
  }, [allTherapists, filters, searchQuery, sortBy, todayAvailability]);

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

  // Prepare options for custom selects
  const sessionFormatOptions = [
    { value: '', label: 'Session type' },
    ...sessionFormats.map(format => ({
      value: format,
      label: format === 'audio' ? 'Audio' : format === 'video' ? 'Video' : format === 'chat' ? 'Chat' : format
    }))
  ];

  const serviceCategoryOptions = [
    { value: '', label: 'All Services' },
    ...serviceCategories.map(category => ({
      value: category,
      label: getServiceCategoryDisplayName(category)
    }))
  ];

  const languageOptions = [
    { value: '', label: 'All Languages' },
    ...languages.map(lang => ({ value: lang, label: lang }))
  ];

  // Slider ref for horizontal scroll
  const sliderRef = useRef<HTMLDivElement>(null);

  // Scroll slider left/right
  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.3;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-fixes-bg-white relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.1%27%3E%3Ccircle cx=%277%27 cy=%277%27 r=%271%27/%3E%3Ccircle cx=%2727%27 cy=%277%27 r=%271%27/%3E%3Ccircle cx=%2747%27 cy=%277%27 r=%271%27/%3E%3Ccircle cx=%277%27 cy=%2727%27 r=%271%27/%3E%3Ccircle cx=%2727%27 cy=%2727%27 r=%271%27/%3E%3Ccircle cx=%2747%27 cy=%2727%27 r=%271%27/%3E%3Ccircle cx=%277%27 cy=%2747%27 r=%271%27/%3E%3Ccircle cx=%2727%27 cy=%2747%27 r=%271%27/%3E%3Ccircle cx=%2747%27 cy=%2747%27 r=%271%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 font-body">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2  text-fixes-heading-dark hover:text-black transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-fixes-accent-purple rounded-2xl flex items-center justify-center hidden md:flex">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-fixes-heading-dark">Find Your Therapist</h1>
                <p className="text-fixes-heading-dark">Connect with licensed mental health professionals</p>
                {initialFilter && (
                  <p className="text-fixes-accent-purple text-sm mt-1">
                    Showing therapists for: {getServiceCategoryDisplayName(initialFilter)}
                  </p>
                )}
              </div>
            </div>

            {/* Data Source Toggle & Sort Options */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Sort Options */}
              <div className="flex items-center space-x-3">
                {/* Sort options commented out in original, keeping same */}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden mb-6 space-y-4">
          {/* Mobile Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-fixes-bg-white px-4 py-3 text-sm text-fixes-accent-black overflow-hidden text-ellipsis"
          >
            <option value="name">Sort by Name</option>
            <option value="specialty">Sort by Specialty</option>
            <option value="availability">Sort by Availability</option>
          </select>
        </div>

        {/* Simplified Filters */}
        <div className="bg-white border border-black shadow-lg p-6 mb-8 relative rounded-xl"
             style={{ zIndex: 10 }}>
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fixes-heading-dark" />
                <input
                  type="text"
                  placeholder="Search therapists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-black placeholder-fixes-heading-dark border-0 border-b border-black focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Service Category Filter - Using Custom Select */}
            <CustomSelect
              value={filters.serviceCategory || ''}
              onChange={(value) => setFilters({ ...filters, serviceCategory: value || undefined })}
              options={serviceCategoryOptions}
              placeholder="All Services"
            />

            {/* Session Type Filter - Using Custom Select */}
            <CustomSelect
              value={filters.sessionFormats || ''}
              onChange={(value) => setFilters({ ...filters, sessionFormats: value || undefined })}
              options={sessionFormatOptions}
              placeholder="Session type"
            />

            {/* Language Filter - Using Custom Select */}
            <CustomSelect
              value={filters.language || ''}
              onChange={(value) => setFilters({ ...filters, language: value || undefined })}
              options={languageOptions}
              placeholder="All Languages"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilters({ 
                  ...filters, 
                  availability: filters.availability === 'available' ? undefined : 'available' 
                })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-normal ${
                  filters.availability === 'available'
                    ? 'bg-fixes-accent-black text-white border-fixes-accent-black'
                    : 'bg-fixes-bg-white text-fixes-accent-black border-fixes-accent-black hover:border-fixes-accent-black hover:bg-fixes-accent-black hover:text-fixes-bg-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Available Today</span>
              </button>
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-fixes-accent-black hover:text-semibold transition-colors duration-200"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {(loading || availabilityLoading) && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-fixes-box-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Loading therapists...</p>
              <p className="text-neutral-400 text-sm mt-2">
                {'Fetching from Firebase...'}
              </p>
            </div>
          </div>
        )}

        {/* Therapist Slider with Arrows */}
        {!loading && !availabilityLoading && filteredTherapists.length > 0 ? (
          <div className="relative">
            {/* Slider Arrows - Desktop/Tablet Only */}
            <div className="hidden sm:block">
              <button
                type="button"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-fixes-box-purple text-white rounded-full p-2 shadow-lg transition-all duration-200"
                style={{ display: filteredTherapists.length > 1 ? 'block' : 'none' }}
                onClick={() => scrollSlider('left')}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-fixes-box-purple text-white rounded-full p-2 shadow-lg transition-all duration-200"
                style={{ display: filteredTherapists.length > 1 ? 'block' : 'none' }}
                onClick={() => scrollSlider('right')}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Slider */}
            <div
              ref={sliderRef}
              className="flex overflow-x-auto gap-6 pb-2 hide-scrollbar snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
              {filteredTherapists.map((therapist) => (
                <div
                  key={therapist.id}
                  className="snap-center min-w-[70vw] max-w-[90vw] md:min-w-[320px] md:max-w-xs"
                >
                  <TherapistCard
                    therapist={therapist}
                    onBookNow={handleBookNow}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : !loading && !availabilityLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-fixes-heading-dark mb-2">No therapists found</h3>
            <p className="text-fixes-heading-dark mb-6">
              {/* {'No therapists have been added to Firebase yet. Add therapists through the admin panel.'} */}
              {'Try Different Filters'}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={clearFilters}
                className="bg-fixes-box-purple text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : null}
        {/* Bottom Arrows - Mobile Only */}
        <div className="flex justify-center gap-6 mt-4 sm:hidden">
          <button
            type="button"
            className="bg-black/60 hover:bg-fixes-box-purple text-white rounded-full p-2 shadow-lg transition-all duration-200"
            style={{ display: filteredTherapists.length > 1 ? 'block' : 'none' }}
            onClick={() => scrollSlider('left')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            className="bg-black/60 hover:bg-fixes-box-purple text-white rounded-full p-2 shadow-lg transition-all duration-200"
            style={{ display: filteredTherapists.length > 1 ? 'block' : 'none' }}
            onClick={() => scrollSlider('right')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TherapistListing;