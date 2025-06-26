import React from 'react';
import { Check, X, Clock, MapPin, CreditCard, Shield } from 'lucide-react';

const Comparison: React.FC = () => {
  const comparisons = [
    {
      feature: 'Availability',
      kalm: '24/7 online access',
      traditional: 'Limited office hours',
      kalmIcon: Clock,
    },
    {
      feature: 'Location',
      kalm: 'Anywhere with internet',
      traditional: 'Must travel to office',
      kalmIcon: MapPin,
    },
    {
      feature: 'Privacy',
      kalm: 'Complete anonymity',
      traditional: 'Public waiting rooms',
      kalmIcon: Shield,
    },
    {
      feature: 'Cost',
      kalm: 'Affordable pricing',
      traditional: 'Higher consultation fees',
      kalmIcon: CreditCard,
    },
    {
      feature: 'Therapist Choice',
      kalm: 'Wide selection available',
      traditional: 'Limited local options',
      kalmIcon: Check,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            Kalm.lk vs Traditional Therapy
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            See how our platform offers advantages over traditional in-person therapy.
          </p>
        </div>

        {/* Table-like structure even on mobile */}
        <div className="bg-cream-50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 text-center items-center mb-6 gap-2 sm:gap-4 text-xs sm:text-base">
            <div></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary-500 rounded-xl flex items-center justify-center mb-2">
                <img
                  src="/kalm.lk/logo icon (1).jpg"
                  alt="Kalm"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg"
                />
              </div>
              <h3 className="font-bold text-primary-500">Kalm.lk</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-neutral-200 rounded-xl flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600" />
              </div>
              <h3 className="font-bold text-neutral-600">Traditional</h3>
            </div>
          </div>

          {/* Comparisons */}
          <div className="space-y-4">
            {comparisons.map((item, index) => {
              const Icon = item.kalmIcon;
              return (
                <div
                  key={index}
                  className="grid grid-cols-3 items-center text-center gap-2 sm:gap-4 py-4 border-t first:border-t-0 text-xs sm:text-base"
                >
                  {/* Feature */}
                  <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                    <span className="font-medium text-neutral-800">{item.feature}</span>
                  </div>

                  {/* Kalm */}
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green" />
                    <span className="text-neutral-700">{item.kalm}</span>
                  </div>

                  {/* Traditional */}
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-accent-orange" />
                    <span className="text-neutral-700">{item.traditional}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <button className="bg-primary-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-primary-600 transition-all duration-300 font-semibold text-sm sm:text-lg shadow-md hover:shadow-lg hover:scale-105">
              Experience the Difference
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
