import React from 'react';
import { Award, MessageCircle, Clock } from 'lucide-react';

const Therapists: React.FC = () => {
  const therapists = [
    {
      name: 'Dr. Priya Perera',
      specialty: 'Anxiety & Depression',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'PhD Clinical Psychology',
      availability: 'Available Today'
    },
    {
      name: 'Dr. Rohan Silva',
      specialty: 'Relationship Counseling',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala', 'Tamil'],
      credentials: 'MSc Counseling Psychology',
      availability: 'Available Tomorrow'
    },
    {
      name: 'Dr. Amara Fernando',
      specialty: 'Stress & Trauma',
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Sinhala'],
      credentials: 'PhD Trauma Psychology',
      availability: 'Available Today'
    },
    {
      name: 'Dr. Kavitha Raj',
      specialty: 'Family Therapy',
      image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400',
      languages: ['English', 'Tamil'],
      credentials: 'MSc Family Therapy',
      availability: 'Available This Week'
    }
  ];

  return (
    <section id="therapists" className="py-8 lg:py-12 bg-neutral-900 relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Meet Our Therapists
          </h2>
          <p className="text-base lg:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Our team of licensed, experienced therapists are here to support your mental wellness journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {therapists.map((therapist, index) => (
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
                  <span className="text-xs text-accent-green font-medium">{therapist.availability}</span>
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
                    <p className="text-xs text-neutral-400 mb-2 font-bold">Languages:</p>
                    <div className="flex flex-wrap gap-1">
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
                  <div>
                    <p className="text-xs text-neutral-400 mb-2 font-bold">Credentials:</p>
                    <p className="text-xs text-neutral-300">{therapist.credentials}</p>
                  </div>
                </div>

                <button className="w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>Book Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto text-sm">
            <span>View All Therapists</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Therapists;