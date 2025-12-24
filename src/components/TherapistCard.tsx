import React from 'react';
import { Clock, MessageCircle, Video, Phone } from 'lucide-react';
import { TherapistData } from '../data/therapists';

interface TherapistCardProps {
  therapist: TherapistData;
  onBookNow: (therapist: TherapistData) => void;
}

const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'audio': return <Phone className="w-3 h-3" />;
      case 'chat': return <MessageCircle className="w-3 h-3" />;
      default: return null;
    }
  };

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onBookNow }) => {
  return (
    <div
      className="relative h-[420px] overflow-hidden group"
      style={{
        backgroundImage: `url(${therapist.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-[#100] to-white/0" />
      <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white font-[Poppins]">
  
        <div className="mt-auto flex gap-3">
                 
          <div className="flex-1 flex flex-col justify-between">
            
            <div>
              <h3 className="text-lg font-semibold">
                {therapist.name}
              </h3>
              <p className="text-xs font-light">
                {therapist.credentials}
              </p>
              <p className="text-xs font-light">
                {therapist.specialty}
              </p>
            </div>

            <p className="text-xs font-light mt-3">
              Languages: {therapist.languages.join(' | ')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {therapist.sessionFormats.map((format, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
              >
                {getSessionFormatIcon(format)}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onBookNow(therapist)}
          className="mt-4 w-full bg-white/15 text-white text-xs font-normal py-3 rounded-xl font-[Poppins]"
        >
          Book Session
        </button>
      </div>
    </div>
    // <div className="group bg-black/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-cream-200/100  flex flex-col">
    //   {/* Large Image Section */}
    //   <div className="relative h-48 overflow-hidden">
    //     <img
    //       src={therapist.image}
    //       alt={therapist.name}
    //       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    //     />
    //     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

    //     {/* Availability Badge */}
    //     {/* <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
    //       <Clock className="w-3 h-3 text-accent-green" />
    //       <span className={`text-xs font-medium ${
    //         therapist.availability.toLowerCase().includes('today') ? 'text-accent-green' : 'text-neutral-300'
    //       }`}>
    //         {therapist.availability}
    //       </span>
    //     </div> */}
    //   </div>

    //   {/* Content Section */}
    //   <div className="p-6  flex flex-col flex-1">
    //     <div className="text-center mb-4">
    //       <h3 className="text-lg font-semibold text-white mb-1">
    //         {therapist.name}
    //       </h3>
    //       <p className="text-primary-500 font-medium text-sm">
    //         {therapist.specialty}
    //       </p>
    //     </div>

    //     <div className="space-y-3 mb-6">
    //       <div>
    //         <p className="text-xs text-neutral-300 mb-2 font-bold">Languages:</p>
    //         <div className="flex flex-wrap gap-1">
    //           {therapist.languages.map((lang, langIndex) => (
    //             <span
    //               key={langIndex}
    //               className="px-2 py-1 bg-neutral-500 text-neutral-300 text-xs rounded-full"
    //             >
    //               {lang}
    //             </span>
    //           ))}
    //         </div>
    //       </div>
    //       <div>
    //         <p className="text-xs text-neutral-400 mb-2 font-bold">Accreditations:</p>
    //         <p className="text-xs text-neutral-300">{therapist.credentials}</p>
    //       </div>
    //       <div>
    //       <p className="text-xs text-neutral-400 mb-1 font-bold">Session Formats:</p>
    //                   <div className="flex items-center space-x-3">
    //                     {therapist.sessionFormats.map((format, index) => (
    //                       <div key={index} className="flex items-center space-x-1 text-neutral-300">
    //                         {getSessionFormatIcon(format)}
    //                         <span className="text-xs capitalize">{format}</span>
    //                       </div>
    //                     ))}
    //                   </div>
    //                 </div>
    //                 </div>

    //     <button 
    //       onClick={() => onBookNow(therapist)}
    //       className="mt-auto w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm"
    //     >
    //       <MessageCircle className="w-4 h-4" />
    //       <span>Book Session</span>
    //     </button>
    //   </div>
    // </div>
  );
};

export default TherapistCard;

