import React from 'react';
import { Star, Award, MessageCircle } from 'lucide-react';

const Therapists: React.FC = () => {
  const therapists = [
    {
      name: 'Dr. Priya Perera',
      specialty: 'Anxiety & Depression',
      experience: '8 years',
      rating: 4.9,
      reviews: 127,
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'PhD Clinical Psychology'
    },
    {
      name: 'Dr. Rohan Silva',
      specialty: 'Relationship Counseling',
      experience: '12 years',
      rating: 4.8,
      reviews: 203,
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala', 'Tamil'],
      credentials: 'MSc Counseling Psychology'
    },
    {
      name: 'Dr. Amara Fernando',
      specialty: 'Stress & Trauma',
      experience: '10 years',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'PhD Trauma Psychology'
    },
    {
      name: 'Dr. Kavitha Raj',
      specialty: 'Family Therapy',
      experience: '15 years',
      rating: 4.7,
      reviews: 89,
      image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Tamil'],
      credentials: 'MSc Family Therapy'
    }
  ];

  return (
    <section id="therapists" className="py-20 lg:py-32 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
            Meet Our Therapists
          </h2>
          <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Our team of licensed, experienced therapists are here to support your mental wellness journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {therapists.map((therapist, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative mb-6">
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                  {therapist.name}
                </h3>
                <p className="text-primary-500 font-medium text-sm mb-2">
                  {therapist.specialty}
                </p>
                <p className="text-neutral-600 text-sm">
                  {therapist.experience} experience
                </p>
              </div>

              <div className="flex items-center justify-center space-x-1 mb-4">
                <Star className="w-4 h-4 text-accent-yellow fill-current" />
                <span className="text-sm font-medium text-neutral-800">
                  {therapist.rating}
                </span>
                <span className="text-sm text-neutral-600">
                  ({therapist.reviews} reviews)
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Languages:</p>
                  <div className="flex flex-wrap gap-1">
                    {therapist.languages.map((lang, langIndex) => (
                      <span
                        key={langIndex}
                        className="px-2 py-1 bg-cream-100 text-neutral-700 text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Credentials:</p>
                  <p className="text-xs text-neutral-700">{therapist.credentials}</p>
                </div>
              </div>

              <button className="w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Book Session</span>
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto">
            <span>View All Therapists</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Therapists;