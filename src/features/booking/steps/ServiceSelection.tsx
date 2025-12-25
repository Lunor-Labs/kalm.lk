import React from 'react';
import { Heart, Users, UserCheck, Sparkles, Check } from 'lucide-react';

interface ServiceSelectionProps {
  selectedService?: string;
  onServiceSelect: (serviceType: string) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ selectedService, onServiceSelect }) => {
  const services = [
    {
      id: 'TEENS',
      title: 'Teen Therapy',
      subtitle: '(13-17 years)',
      description: 'Specialized support for teenagers navigating adolescence, school stress, and identity.',
      icon: Heart,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      price: 'From LKR 3,500'
    },
    {
      id: 'INDIVIDUALS',
      title: 'Individual Therapy',
      subtitle: '(18+ years)',
      description: 'Personal therapy for adults dealing with anxiety, depression, and life challenges.',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      price: 'From LKR 4,500'
    },
    {
      id: 'FAMILY_COUPLES',
      title: 'Family & Couples',
      subtitle: 'Relationship Support',
      description: 'Relationship counseling and family therapy to strengthen bonds and communication.',
      icon: UserCheck,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      price: 'From LKR 6,000'
    },
    {
      id: 'LGBTQIA',
      title: 'LGBTQIA+ Support',
      subtitle: 'Inclusive Therapy',
      description: 'Affirming and inclusive therapy for LGBTQIA+ individuals and couples.',
      icon: Sparkles,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      price: 'From LKR 4,500'
    }
  ];

  return (
    <div className="p-6 md:p-10 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Service</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select the type of therapy that best fits your needs. All services are tailored to support your mental wellness journey.
        </p>
      </div>

      {/* Service Grid - rectangular cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service.id)}
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left h-full border-2
                ${isSelected
                  ? `border-blue-600 ${service.bgColor} shadow-lg`
                  : `border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg`
                }`}
            >
              {/* Thin gradient top bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${service.color}`}></div>

              <div className="p-6 flex flex-col h-full">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br ${service.color}`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="mb-6 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-3">{service.subtitle}</p>
                  <p className="text-gray-600 leading-relaxed text-sm">{service.description}</p>
                </div>

                {/* Price + Selection indicator */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-gray-800 font-bold text-lg">{service.price}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-600 scale-100'
                        : 'bg-gray-200 scale-90 group-hover:scale-100 group-hover:bg-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-5 h-5 text-white" />}
                  </div>
                </div>
              </div>

              {/* Subtle hover overlay */}
              {!isSelected && (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          ✓ Licensed Mental Health Professionals  •  ✓ Confidential & Secure  •  ✓ Flexible Scheduling
        </p>
      </div>
    </div>
  );
};

export default ServiceSelection;