import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-8 lg:py-12 bg-cream-50 relative">
       <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
      {/* Subtle grain texture overlay for cream background */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-base lg:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Real stories from people who found support and healing through Kalm.
          </p>
        </div>

        {/* Google Reviews Style Layout */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-cream-200">
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
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-cream-100">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent-yellow fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 leading-relaxed mb-4 text-sm">
                  Exceptional Care And Outstanding Service! The Team At Kalm Made Me Feel Completely At Ease During My 
                  Therapy Sessions. Their Expertise And Attention To Detail Were Evident From Start To Finish. I'm So Grateful To Have 
                  Found Such A Professional And Compassionate Practice. Highly Recommend To Anyone In Need Of Mental Health Support!
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