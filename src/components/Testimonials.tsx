import React from 'react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-fixes-bg-white relative font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-medium text-5xl lg:text-6xl text-fixes-heading-dark mb-6">
            What Our Clients Say
          </h2>
          <p className="mt-6 text-lg font-light text-fixes-heading-dark">
            Real stories from people who found support and healing through Kalm.
          </p>
        </div>

        {/* Google Reviews Style Layout */}
        <div className="flex flex-col items-center max-w-7xl justify-center bg-fixes-accent-purple px-6 py-10 text-center">
  
          {/* Review Heading */}
          <h3 className="font-body font-medium text-lg text-black mb-10">
            "Kalm.lk changed my life"
          </h3>

          {/* Review Description */}
          <p className="font-body font-light text-base text-black max-w-5xl mb-10 leading-relaxed">
            The Kalm team provided exceptional care, making me feel truly supported.
            Their expertise and empathy transformed my therapy experience.
            I highly recommend Kalm to anyone seeking mental health support.
          </p>

          {/* Stars */}
          <div className="flex items-center justify-center space-x-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>

          {/* Google Review Info */}
          <div className="flex items-center justify-center space-x-2 text-black font-body">
            <span className="text-sm font-medium">Google Reviews</span>
            <span className="text-sm font-light">4.9 / 5</span>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <div className="w-2 h-2 bg-black/30 rounded-full"></div>
          <div className="w-2 h-2 bg-black/30 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;