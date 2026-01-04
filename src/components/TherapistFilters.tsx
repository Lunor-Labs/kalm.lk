import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Star, Clock, DollarSign, Languages } from 'lucide-react';
import { TherapistFilters } from '../types/therapist';
import { specializations, languages, sessionFormats } from '../data/therapists';

interface TherapistFiltersProps {
  filters: TherapistFilters;
  onFiltersChange: (filters: TherapistFilters) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
}

const TherapistFiltersComponent: React.FC<TherapistFiltersProps> = ({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  resultsCount
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;

  const quickFilters = [
    {
      label: 'Available Now',
      active: filters.availability === 'available',
      onClick: () => onFiltersChange({ 
        ...filters, 
        availability: filters.availability === 'available' ? undefined : 'available' 
      }),
      icon: Clock,
      color: 'bg-accent-green/10 text-accent-green border-accent-green/20'
    },
    {
      label: 'Anxiety & Depression',
      active: filters.specialization === 'Anxiety Disorders',
      onClick: () => onFiltersChange({ 
        ...filters, 
        specialization: filters.specialization === 'Anxiety Disorders' ? undefined : 'Anxiety Disorders' 
      }),
      icon: Star,
      color: 'bg-primary-50 text-primary-600 border-primary-200'
    },
    {
      label: 'Couples Therapy',
      active: filters.specialization === 'Couples Therapy',
      onClick: () => onFiltersChange({ 
        ...filters, 
        specialization: filters.specialization === 'Couples Therapy' ? undefined : 'Couples Therapy' 
      }),
      icon: Star,
      color: 'bg-accent-pink/10 text-accent-pink border-accent-pink/20'
    },
    {
      label: 'Video Sessions',
      active: filters.sessionFormat === 'video',
      onClick: () => onFiltersChange({ 
        ...filters, 
        sessionFormat: filters.sessionFormat === 'video' ? undefined : 'video' 
      }),
      icon: Star,
      color: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-cream-200 p-6">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, specialization, or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-cream-200 rounded-2xl  focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
          />
        </div>

        {/* Quick Filters */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter, index) => {
              const Icon = filter.icon;
              return (
                <button
                  key={index}
                  onClick={filter.onClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${
                    filter.active 
                      ? filter.color
                      : 'bg-white text-neutral-600 border-cream-200 hover:border-cream-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">{resultsCount}</span> therapist{resultsCount !== 1 ? 's' : ''} found
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-cream-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Advanced Filters</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Specialization Filter */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-3">
                <Star className="w-4 h-4 text-primary-500" />
                <span>Specialization</span>
              </label>
              <select
                value={filters.specialization || ''}
                onChange={(e) => onFiltersChange({ ...filters, specialization: e.target.value || undefined })}
                className="w-full p-3 border border-cream-200 rounded-2xl  focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-3">
                <Languages className="w-4 h-4 text-accent-green" />
                <span>Language</span>
              </label>
              <select
                value={filters.language || ''}
                onChange={(e) => onFiltersChange({ ...filters, language: e.target.value || undefined })}
                className="w-full p-3 border border-cream-200 rounded-2xl  focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Session Format Filter */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-3">
                <Filter className="w-4 h-4 text-accent-yellow" />
                <span>Session Format</span>
              </label>
              <select
                value={filters.sessionFormat || ''}
                onChange={(e) => onFiltersChange({ ...filters, sessionFormat: e.target.value || undefined })}
                className="w-full p-3 border border-cream-200 rounded-2xl  focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
              >
                <option value="">All Formats</option>
                {sessionFormats.map((format) => (
                  <option key={format} value={format}>
                    {format.charAt(0).toUpperCase() + format.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-3">
                <Clock className="w-4 h-4 text-accent-orange" />
                <span>Availability</span>
              </label>
              <select
                value={filters.availability || 'all'}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  availability: e.target.value === 'all' ? undefined : e.target.value as 'available'
                })}
                className="w-full p-3 border border-cream-200 rounded-2xl  focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
              >
                <option value="all">All Therapists</option>
                <option value="available">Available Now</option>
              </select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mt-6">
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 mb-3">
              <DollarSign className="w-4 h-4 text-accent-pink" />
              <span>Price Range (LKR per session)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.priceRange?.[0] || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseInt(e.target.value) : undefined;
                    const max = filters.priceRange?.[1];
                    onFiltersChange({ 
                      ...filters, 
                      priceRange: min !== undefined || max !== undefined ? [min || 0, max || 10000] : undefined 
                    });
                  }}
                  className="w-full p-3 border border-cream-200 rounded-2xl  focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.priceRange?.[1] || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseInt(e.target.value) : undefined;
                    const min = filters.priceRange?.[0];
                    onFiltersChange({ 
                      ...filters, 
                      priceRange: min !== undefined || max !== undefined ? [min || 0, max || 10000] : undefined 
                    });
                  }}
                  className="w-full p-3 border border-cream-200 rounded-2xl  focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistFiltersComponent;