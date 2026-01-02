import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const About: React.FC = () => {
  const [isMuted, setIsMuted] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  // Force autoplay on mount for mobile support
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // Autoplay was prevented
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <section id="about" className="bg-fixes-bg-white relative font-body">
      {/* About stripe */}
      <div className="w-full bg-fixes-bg-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[260px]">
            <div className="flex items-center justify-center lg:justify-start">
              <h2
                className="
                    font-display
                    text-6xl
                    font-medium
                    text-fixes-heading-dark
                    text-center
                    lg:text-left
                  "
                style={{ fontFamily: 'Reem Kufi' }}
              >
                About Us
              </h2>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <p
                className="
                    max-w-xl
                    text-sm
                    lg:text-lg
                    font-light
                    text-black
                    text-center
                    lg:text-right
                    leading-relaxed
                  "
                style={{ fontFamily: 'Poppins' }}
              >
                We're on a mission to make mental health support accessible, affordable,
                and stigma-free for everyone in Sri Lanka. Your wellbeing matters,
                and we're here to help you thrive.
              </p>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          <div className="space-y-8">

            <div className="border border-black p-6 flex gap-6">
              <div
                className="text-black text-7xl leading-none"
                style={{ fontFamily: 'Poppins' }}
              >
                1
              </div>
              <div className='flex flex-col gap-2' style={{ fontFamily: 'Poppins' }}>
                <h3 className="text-2xl font-normal text-black">
                  Compassionate Care
                </h3>
                <p className="text-sm font-light text-black leading-relaxed" style={{ fontFamily: 'Poppins' }}>
                  Our licensed therapists provide empathetic, culturally-sensitive support
                  tailored to the Sri Lankan context and your unique needs.
                </p>
              </div>
            </div>

            <div className="border border-black p-6 flex gap-6">
              <div
                className="text-black text-7xl leading-none"
                style={{ fontFamily: 'Poppins' }}
              >
                2
              </div>
              <div className='flex flex-col gap-2' style={{ fontFamily: 'Poppins' }}>
                <h3 className="text-2xl font-normal text-black">
                  Complete Privacy
                </h3>
                <p className="text-sm font-light text-black leading-relaxed" style={{ fontFamily: 'Poppins' }}>
                  Your conversations are completely confidential and secure.
                  We use end-to-end encryption to protect your privacy.
                </p>
              </div>
            </div>

            <div className="border border-black p-6 flex gap-6">
              <div
                className="text-black text-7xl leading-none"
                style={{ fontFamily: 'Poppins' }}
              >
                3
              </div>
              <div className='flex flex-col gap-2' style={{ fontFamily: 'Poppins' }}>
                <h3 className="text-2xl font-normal text-black">
                  Community Focus
                </h3>
                <p className="text-sm font-light text-black leading-relaxed" style={{ fontFamily: 'Poppins' }}>
                  Built specifically for Sri Lankans, understanding our culture,
                  languages, and the unique challenges we face.
                </p>
              </div>
            </div>
          </div>

          {/* Replace this image with the promo video */}
          <div className="relative animate-fade-in h-full">
            <div className="relative z-10 w-full h-full overflow-hidden group">
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source
                  src="https://firebasestorage.googleapis.com/v0/b/kalm-dev-907c9.firebasestorage.app/o/public%2FKALM-FInal.mp4?alt=media&token=dea5f137-d6b4-4ea0-b600-a0f99aafc77a"
                  type="video/mp4"
                />
                <img
                  src="https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Mental wellness consultation"
                  className="w-full h-full object-cover"
                />
              </video>

              {/* Sound Toggle Button */}
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;