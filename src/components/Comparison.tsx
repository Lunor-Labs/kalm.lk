import React from 'react';
import { Check, X, Clock, MapPin, CreditCard, Shield } from 'lucide-react';

const Comparison: React.FC = () => {
  const comparisons = [
    {
      feature: 'Availability',
      kalm: '24/7 online access',
      traditional: 'Limited office hours',
      kalmIcon: Clock,
      kalmHas: true,
      traditionalHas: false
    },
    {
      feature: 'Location',
      kalm: 'Anywhere with internet',
      traditional: 'Must travel to office',
      kalmIcon: MapPin,
      kalmHas: true,
      traditionalHas: false
    },
    {
      feature: 'Privacy',
      kalm: 'Complete anonymity',
      traditional: 'Public waiting rooms',
      kalmIcon: Shield,
      kalmHas: true,
      traditionalHas: false
    },
    {
      feature: 'Cost',
      kalm: 'Affordable pricing',
      traditional: 'Higher consultation fees',
      kalmIcon: CreditCard,
      kalmHas: true,
      traditionalHas: false
    },
    {
      feature: 'Therapist Choice',
      kalm: 'Wide selection available',
      traditional: 'Limited local options',
      kalmIcon: Check,
      kalmHas: true,
      traditionalHas: false
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
            Kalm.lk vs Traditional Therapy
          </h2>
          <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            See how our platform offers advantages over traditional in-person therapy.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-cream-50 rounded-3xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Headers */}
              <div className="hidden lg:block"></div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <img src="/logo icon (1).jpg" alt="Kalm" className="w-8 h-8 rounded-lg" />
                </div>
                <h3 className="text-xl font-bold text-primary-500">Kalm.lk</h3>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-600">Traditional Therapy</h3>
              </div>

              {/* Comparisons */}
              {comparisons.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="lg:col-span-1 flex items-center">
                    <div className="flex items-center space-x-3">
                      <item.kalmIcon className="w-5 h-5 text-primary-500" />
                      <span className="font-semibold text-neutral-800">{item.feature}</span>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <Check className="w-5 h-5 text-accent-green" />
                      <span className="text-neutral-700">{item.kalm}</span>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <X className="w-5 h-5 text-accent-orange" />
                      <span className="text-neutral-700">{item.traditional}</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="bg-primary-500 text-white px-8 py-4 rounded-full hover:bg-primary-600 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105">
                Experience the Difference
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;