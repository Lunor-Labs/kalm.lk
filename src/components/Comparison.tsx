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
    <section className="py-20 lg:py-24 bg-fixes-bg-purple relative font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-medium text-5xl lg:text-6xl text-fixes-heading-dark mb-6">
            Kalm.lk vs Traditional Therapy
          </h2>
          <p className="mt-6 text-lg font-light text-fixes-heading-dark">
            See how our platform offers advantages over traditional in-person therapy.
          </p>
        </div>

        {/* Table-like structure with adjusted spacing */}
        <div className="max-w-4xl mx-auto">
          {/* Header Row */}
          <div className="grid grid-cols-3 text-center font-body lg:text-base text-sm font-normal text-black">
            <div className="pl-7 py-10 font-medium"></div>
            <div className="bg-white py-14 font-medium rounded-t-md flex items-center justify-center  gap-2">
              <img
                src="logo.jpg"
                alt="Kalm"
                className="w-7 h-7"
              />
              <span>Kalm.lk</span>
            </div>
            <div className="py-14 font-medium">Traditional</div>
          </div>

          {/* Rows */}
          {comparisons.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-3 lg:text-base text-xs font-normal text-black border-b border-black/30"
            >
              <div className="lg:pl-10 md:pl-5 py-8 font-medium">{item.feature}</div>

              <div className="bg-white lg:pl-10 md:pl-5 py-8 flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{item.kalm}</span>
              </div>

              <div className="lg:pl-10 md:pl-5 py-8 flex items-start gap-2">
                <X className="w-4 h-4 text-red-500" />
                <span>{item.traditional}</span>
              </div>
            </div>
          ))}

          {/* Bottom empty row for rounded highlight */}
          <div className="grid grid-cols-3 text-base font-normal text-black">
            <div className="pl-10 py-6"></div>
            <div className="bg-white py-6 rounded-b-md"></div>
            <div className="pl-10 py-6"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;