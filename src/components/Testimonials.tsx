import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Real stories from people who found support and healing through Kalm.
          </p>
        </div>

        {/* Google Reviews Style Layout */}
        <div className="bg-cream-50 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Left side - Rating */}
            <div className="flex-shrink-0">
              <div className="text-left">
                <h3 className="text-lg font-medium text-neutral-500 mb-2">GOOGLE REVIEWS</h3>
                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="text-5xl font-light text-accent-green">4.9</span>
                  <span className="text-2xl text-neutral-400">/5</span>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent-yellow fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Review */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent-yellow fill-current" />
                  ))}
                </div>
                <p className="text-neutral-700 leading-relaxed mb-4 text-sm">
                  Exceptional Care And Outstanding Service! The Team At Athena Dental Health Made Me Feel Completely At Ease During My 
                  Root Canal Procedure. Their Expertise And Attention To Detail Were Evident From Start To Finish. I'm So Grateful To Have 
                  Found Such A Professional And Compassionate Practice. Highly Recommend To Anyone In Need Of Endodontic Care!
                </p>
                <p className="text-neutral-500 text-sm font-medium">Ben R.</p>
              </div>
              
              {/* Pagination dots */}
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;