import React from 'react';
import { Heart, Users, UserCheck, Sparkles } from 'lucide-react';

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
      color: 'from-primary-500 to-primary-600',
      price: 'From LKR 3,500'
    },
    {
      id: 'INDIVIDUALS',
      title: 'Individual Therapy',
      subtitle: '(18+ years)',
      description: 'Personal therapy for adults dealing with anxiety, depression, and life challenges.',
      icon: Users,
      color: 'from-accent-green to-primary-500',
      price: 'From LKR 4,500'
    },
    {
      id: 'FAMILY_COUPLES',
      title: 'Family & Couples',
      subtitle: 'Relationship Support',
      description: 'Relationship counseling and family therapy to strengthen bonds and communication.',
      icon: UserCheck,
      color: 'from-accent-pink to-accent-orange',
      price: 'From LKR 6,000'
    },
    {
      id: 'LGBTQIA',
      title: 'LGBTQIA+ Support',
      subtitle: 'Inclusive Therapy',
      description: 'Affirming and inclusive therapy for LGBTQIA+ individuals and couples.',
      icon: Sparkles,
      color: 'from-accent-yellow to-accent-orange',
      price: 'From LKR 4,500'
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Choose Your Service</h2>
        <p className="text-neutral-300">Select the type of therapy that best fits your needs</p>
      </div>

      {/* services Desktop */}
      <div className="hidden md:block">
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;
          
          return (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service.id)}
              className={`group relative bg-black/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 text-left ${
                isSelected 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10`}></div>
              
              <div className="relative p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${service.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {service.title}
                  </h3>
                  <p className="text-primary-500 font-medium text-sm mb-3">
                    {service.subtitle}
                  </p>
                  <p className="text-neutral-300 leading-relaxed text-sm mb-4">
                    {service.description}
                  </p>
                </div>

                {/* Price */}
                {/* <div className="flex items-center justify-between">
                  <span className="text-accent-green font-semibold">
                    {service.price}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div> */}
              </div>
            </button>
          );
        })}
      </div>
      </div>

      {/* services Mobile */}
      <div className="block md:hidden">
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;
          
          return (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service.id)}
              className={`group relative bg-black/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 text-center ${
                isSelected 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10`}></div>
              
              <div className="relative p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto bg-gradient-to-br ${service.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {service.title}
                  </h3>
                  <p className="text-primary-500 font-medium text-sm mb-3">
                    {service.subtitle}
                  </p>
                  <p className="text-neutral-300 leading-relaxed text-sm mb-4">
                    {service.description}
                  </p>
                </div>

                {/* Price */}
                {/* <div className="flex items-center justify-between">
                  <span className="text-accent-green font-semibold">
                    {service.price}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div> */}
              </div>
            </button>
          );
        })}
      </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-neutral-400 text-sm">
          All sessions are conducted by licensed mental health professionals
        </p>
      </div>
    </div>
  );
};



export default ServiceSelection;