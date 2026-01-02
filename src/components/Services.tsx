import React from "react";

interface ServicesProps {
  onViewAllTherapists: (serviceCategory?: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onViewAllTherapists }) => {
  const services = [
    {
      image: "Teen.png",
      imageAlt: "Teenager in a thoughtful pose",
      title: "Teens",
      subtitle: "(13-17)",
      description:
        "Specialized support for teenagers navigating adolescence, school stress, and identity.",
      color: "from-primary-500 to-primary-600",
      bg: "#F68BA2",
      category: "TEENS"
    },
    {
      image: "Individual.png",
      imageAlt: "Adult in a calm, reflective setting",
      title: "Individuals",
      subtitle: "(18+)",
      description:
        "Personal therapy for adults dealing with anxiety, depression, and life challenges.",
      color: "from-accent-green to-primary-500",
      bg: "#77EAEA",
      category: "INDIVIDUALS"
    },
    {
      image: "Family.png",
      imageAlt: "Family or couple sharing a warm moment",
      title: "Family & Couples",
      subtitle: "(FOR US)",
      description:
        "Relationship counseling and family therapy to strengthen bonds and communication.",
      color: "from-accent-pink to-accent-orange",
      bg: "#FADE78",
      category: "FAMILY & COUPLES"
    },
    {
      image: "LGBTQ.png",
      imageAlt: "Inclusive scene with rainbow elements",
      title: "LGBTQIA+",
      subtitle: "",
      description:
        "Affirming and inclusive therapy for LGBTQIA+ individuals and couples.",
      color: "from-accent-yellow to-accent-orange",
      bg: "#5DF8B8",
      category: "LGBTQIA+"
    },
  ];

  return (
    <section id="services" className="py-16 lg:py-30 bg-fixes-bg-white relative font-body">
      {/* Grain texture overlay */}
      {/* <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-medium text-5xl lg:text-6xl text-fixes-heading-dark mb-6">
            Key Services
          </h2>
          <p className="mt-6 text-lg font-light text-fixes-heading-dark">
            We provide specialized support for a wide range of mental health
            concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 lg:mt-0">
          {services.map((service, index) => (
            <div
              key={index}
              style={{ backgroundColor: service.bg }}
              className={`flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1
                        ${index % 2 === 0 ? 'lg:-translate-y-3' : 'lg:translate-y-3'}`}
            >
              {/* Increased image height from h-32 to h-48 (75% of card) */}
              <div className="relative h-55 w-full overflow-hidden">
                <img
                  src={service.image}
                  alt={service.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Reduced text area padding from p-6 to p-4 (25% of card) */}
              <div className="flex flex-col items-center justify-center text-center p-6 flex-1">
                <h3 className="text-center  font-body font-normal text-xl text-black">
                  {service.title}
                </h3>
                {service.subtitle && (
                  <p className="font-body text-sm text-black mt-1 mb-4 text-fixes-heading-dark font-normal text-center">
                    {service.subtitle}
                  </p>
                )}
                <p className="font-body font-normal text-sm mt-4 leading-relaxed text-fixes-heading-dark text-center flex-1">
                  {service.description}
                </p>

                {/* Button always at the bottom */}
                <button 
                  onClick={() => onViewAllTherapists(service.category)}
                  className="text-fixes-bg-white font-medium hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2 group text-sm mx-auto mt-2"
                >
                  <span>Get Started</span>
                  <svg
                    className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
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