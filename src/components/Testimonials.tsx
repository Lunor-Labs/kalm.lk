import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah M.',
      age: 28,
      location: 'Colombo',
      rating: 5,
      text: 'Kalm helped me through my anxiety during a really difficult time. The therapist was so understanding and the platform made it easy to get help without anyone knowing.',
      image: 'https://images.pexels.com/photos/3807758/pexels-photo-3807758.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      name: 'Rajesh K.',
      age: 35,
      location: 'Kandy',
      rating: 5,
      text: 'As someone who travels a lot for work, having access to therapy sessions online has been a game-changer. The quality of care is excellent.',
      image: 'https://images.pexels.com/photos/3807733/pexels-photo-3807733.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      name: 'Nisha P.',
      age: 24,
      location: 'Galle',
      rating: 5,
      text: 'I was hesitant about online therapy, but Kalm made me feel so comfortable. My therapist really gets me and has helped me build confidence.',
      image: 'https://images.pexels.com/photos/3807742/pexels-photo-3807742.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      name: 'Amal S.',
      age: 42,
      location: 'Negombo',
      rating: 5,
      text: 'The convenience and privacy of Kalm allowed me to finally seek help for my depression. The support has been incredible.',
      image: 'https://images.pexels.com/photos/3807715/pexels-photo-3807715.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
            What Our Clients Say
          </h2>
          <p className="text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Real stories from people who found support and healing through Kalm.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-cream-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 relative"
            >
              <div className="absolute top-6 right-6 opacity-20">
                <Quote className="w-12 h-12 text-primary-500" />
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                  <h4 className="font-semibold text-neutral-800">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Age {testimonial.age}, {testimonial.location}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent-yellow fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-neutral-700 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-cream-50 px-8 py-4 rounded-full">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent-yellow fill-current" />
              ))}
            </div>
            <div className="text-neutral-800">
              <span className="font-bold text-lg">4.9/5</span>
              <span className="text-neutral-600 ml-2">from 500+ reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;