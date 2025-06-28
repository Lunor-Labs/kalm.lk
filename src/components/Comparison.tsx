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
    <section className="py-8 lg:py-12 bg-cream-50 relative">
       <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
      {/* Subtle grain texture overlay for cream background */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            Kalm.lk vs Traditional Therapy
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-2xl mx-auto">
            See how our platform offers advantages over traditional in-person therapy.
          </p>
        </div>

        {/* Table-like structure with adjusted spacing */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg overflow-hidden border border-cream-200 max-w-4xl mx-auto">
          {/* Column Headers */}
          <div className="grid grid-cols-[2fr_1.5fr_1.5fr] text-center items-center mb-6 gap-6">
            <div></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-2">
                <img
                  src="/kalm.lk/logo.jpg"
                  alt="Kalm"
                  className="w-6 h-6 rounded-lg"
                />
              </div>
              <h3 className="font-bold text-primary-500 text-sm">Kalm.lk</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-neutral-400 rounded-xl flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-white" />
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
                  className="grid grid-cols-[2fr_1.5fr_1.5fr] items-center gap-6 py-3 border-t border-cream-200 first:border-t-0"
                >
                  {/* Feature */}
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="font-medium text-neutral-800 text-sm">{item.feature}</span>
                  </div>

                  {/* Kalm */}
                  <div className="flex items-center justify-center text-center flex-col gap-1">
                    {item.kalmPositive ? (
                      <Check className="w-4 h-4 text-accent-green" />
                    ) : (
                      <X className="w-4 h-4 text-accent-orange" />
                    )}
                    <span className="text-neutral-600 text-sm">{item.kalm}</span>
                  </div>

                  {/* Traditional */}
                  <div className="flex items-center justify-center text-center flex-col gap-1">
                    {item.traditionalPositive ? (
                      <Check className="w-4 h-4 text-accent-green" />
                    ) : (
                      <X className="w-4 h-4 text-accent-orange" />
                    )}
                    <span className="text-neutral-600 text-sm">{item.traditional}</span>
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