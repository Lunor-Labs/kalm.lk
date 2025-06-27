import React from 'react';
import { Users, User, Heart, Rainbow } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: Users,
      title: 'TEENS',
      subtitle: '(13-17)',
      description: 'Specialized support for teenagers navigating adolescence, school stress, and identity.',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: User,
      title: 'INDIVIDUALS',
      subtitle: '(18+)',
      description: 'Personal therapy for adults dealing with anxiety, depression, and life challenges.',
      color: 'from-accent-green to-primary-500'
    },
    {
      icon: Heart,
      title: 'FAMILY & COUPLES',
      subtitle: '(FOR US)',
      description: 'Relationship counseling and family therapy to strengthen bonds and communication.',
      color: 'from-accent-pink to-accent-orange'
    },
    {
      icon: Rainbow,
      title: 'LGBTQIA+',
      subtitle: '',
      description: 'Affirming and inclusive therapy for LGBTQIA+ individuals and couples.',
      color: 'from-accent-yellow to-accent-orange'
    }
  ];

  return (
    <section id="services" className="py-12 lg:py-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            Key Services
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We provide specialized support for a wide range of mental health concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-32 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-90`}></div>
                <div className="absolute top-4 left-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                  {service.title}
                </h3>
                {service.subtitle && (
                  <p className="text-sm text-primary-500 font-medium mb-3">
                    {service.subtitle}
                  </p>
                )}
                <p className="text-neutral-600 leading-relaxed text-sm mb-4">
                  {service.description}
                </p>
                <button className="text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2 group text-sm">
                  <span>Get Started</span>
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;