import React, { useState, useEffect } from 'react';

// store only filenames (public/ is served at the app base URL)
const images = [
  'ig.png',
];

const InstagramStrip: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slide change every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[250px] sm:h-[200px] lg:h-[250px] overflow-hidden">
      {/* Background Slideshow */}
      {images.map((src, idx) => (
        <img
          key={idx}
          src={`${import.meta.env.BASE_URL}${encodeURIComponent(src)}`}
          alt={`kalm-instagram-${idx}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col justify-center items-center text-center px-4">
        <p className="text-white font-poppins font-semibold text-[20px] mb-2">
          @kalm_lk
        </p>
        <p className="text-white font-poppins font-light text-[16px] mb-4">
          Follow Us On Instagram
        </p>
        <a
          href="https://www.instagram.com/kalm_lk"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black text-white font-poppins font-normal text-sm px-6 py-2 rounded-full shadow hover:opacity-80 transition-opacity duration-200"
        >
          Follow Now
        </a>
      </div>
    </section> 
  );
};

export default InstagramStrip;
