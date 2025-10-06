import React from 'react';

// store only filenames (public/ is served at the app base URL)
const images = [
  'About Calm.jpg',
  'Family.jpg',
  'Individual.jpg',
  'LGBTQ.jpg',
  'Teen.jpg',
  'logo.jpg',
];

const InstagramStrip: React.FC = () => {
  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-sm uppercase tracking-widest text-neutral-500">Instagram</p>
          <a
            href="https://www.instagram.com/kalm_lk"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-lg font-serif text-neutral-900 mt-1 hover:underline"
          >
            Follow Us @kalm_lk
          </a>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {images.map((src, idx) => (
            <a
              key={idx}
              href="https://www.instagram.com/kalm_lk"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden shadow-sm transform hover:scale-105 transition-transform duration-200"
            >
              <img
                src={`${import.meta.env.BASE_URL}${encodeURIComponent(src)}`}
                alt={`kalm-instagram-${idx}`}
                className="w-full h-24 sm:h-28 md:h-32 object-cover block"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramStrip;
