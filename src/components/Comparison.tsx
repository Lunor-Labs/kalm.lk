import React from 'react';
import { Check, X, Clock, MapPin, CreditCard, Shield } from 'lucide-react';

const Comparison: React.FC = () => {
  const comparisons = [
    {
      feature: 'Availability',
      kalm: '24/7 online access',
      traditional: 'Limited office hours',
      kalmIcon: Clock,
      kalmPositive: true,
      traditionalPositive: false,
    },
    {
      feature: 'Location',
      kalm: 'Anywhere with internet',
      traditional: 'Must travel to office',
      kalmIcon: MapPin,
      kalmPositive: true,
      traditionalPositive: false,
    },
    {
      feature: 'Privacy',
      kalm: 'Complete anonymity',
      traditional: 'Public waiting rooms',
      kalmIcon: Shield,
      kalmPositive: true,
      traditionalPositive: false,
    },
    {
      feature: 'Cost',
      kalm: 'Affordable pricing',
      traditional: 'Higher consultation fees',
      kalmIcon: CreditCard,
      kalmPositive: true,
      traditionalPositive: false,
    },
    {
      feature: 'Therapist Choice',
      kalm: 'Wide selection available',
      traditional: 'Limited local options',
      kalmIcon: Check,
      kalmPositive: true,
      traditionalPositive: false,
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            Kalm.lk vs Traditional Therapy
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-2xl mx-auto">
            See how our platform offers advantages over traditional in-person therapy.
          </p>
        </div>

        {/* Table-like structure */}
        <div className="bg-cream-50 rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-3 text-center items-center mb-6 gap-4">
            <div></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-2">
                <img
                  src="/kalm.lk/logo icon (1).jpg"
                  alt="Kalm"
                  className="w-6 h-6 rounded-lg"
                />
              </div>
              <h3 className="font-bold text-primary-500 text-sm">Kalm.lk</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-neutral-200 rounded-xl flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-neutral-600" />
              </div>
              <h3 className="font-bold text-neutral-600 text-sm">Traditional</h3>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-4">
            {comparisons.map((item, index) => {
              const Icon = item.kalmIcon;
              return (
                <div
                  key={index}
                  className="grid grid-cols-3 items-center gap-4 py-3 border-t first:border-t-0"
                >
                  {/* Feature */}
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-primary-500" />
                    <span className="font-medium text-neutral-800 text-sm">{item.feature}</span>
                  </div>

                  {/* Kalm */}
                  <div className="flex items-center justify-center text-center flex-col gap-1">
                    {item.kalmPositive ? (
                      <Check className="w-4 h-4 text-accent-green" />
                    ) : (
                      <X className="w-4 h-4 text-accent-orange" />
                    )}
                    <span className="text-neutral-700 text-sm">{item.kalm}</span>
                  </div>

                  {/* Traditional */}
                  <div className="flex items-center justify-center text-center flex-col gap-1">
                    {item.traditionalPositive ? (
                      <Check className="w-4 h-4 text-accent-green" />
                    ) : (
                      <X className="w-4 h-4 text-accent-orange" />
                    )}
                    <span className="text-neutral-700 text-sm">{item.traditional}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
