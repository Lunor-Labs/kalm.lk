import React from "react";

interface ServicesProps {
  onViewAllTherapists: (serviceCategory?: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onViewAllTherapists }) => {
  const services = [
    {
      image: "Teen.jpg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Teenager in a thoughtful pose",
      title: "TEENS",
      subtitle: "(13-17)",
      description:
        "Specialized support for teenagers navigating adolescence, school stress, and identity.",
      color: "from-primary-500 to-primary-600",
      category: "TEENS"
    },
    {
      image: "Individual.jpg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Adult in a calm, reflective setting",
      title: "INDIVIDUALS",
      subtitle: "(18+)",
      description:
        "Personal therapy for adults dealing with anxiety, depression, and life challenges.",
      color: "from-accent-green to-primary-500",
      category: "INDIVIDUALS"
    },
    {
      image: "Family.jpg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Family or couple sharing a warm moment",
      title: "FAMILY & COUPLES",
      subtitle: "(FOR US)",
      description:
        "Relationship counseling and family therapy to strengthen bonds and communication.",
      color: "from-accent-pink to-accent-orange",
      category: "FAMILY & COUPLES"
    },
    {
      image: "LGBTQ.jpg?auto=compress&cs=tinysrgb&w=800",
      imageAlt: "Inclusive scene with rainbow elements",
      title: "LGBTQIA+",
      subtitle: "",
      description:
        "Affirming and inclusive therapy for LGBTQIA+ individuals and couples.",
      color: "from-accent-yellow to-accent-orange",
      category: "LGBTQIA+"
    },
  ];

  return (
    <section id="services" className="py-8 lg:py-12 bg-neutral-900 relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2227%22 r=%221%22/%3E%3Ccircle cx=%227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2227%22 cy=%2247%22 r=%221%22/%3E%3Ccircle cx=%2247%22 cy=%2247%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Key Services
          </h2>
          <p className="text-base lg:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            We provide specialized support for a wide range of mental health
            concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-black/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-cream-200/100 flex flex-col"
            >
              {/* Increased image height from h-32 to h-48 (75% of card) */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.imageAlt}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-50`}
                ></div>
              </div>

              {/* Reduced text area padding from p-6 to p-4 (25% of card) */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-white mb-1 text-center whitespace-nowrap">
                  {service.title}
                </h3>
                {service.subtitle && (
                  <p className="text-sm text-primary-500 font-medium mb-3 text-center">
                    {service.subtitle}
                  </p>
                )}
                <p className="text-neutral-300 leading-relaxed text-sm text-center flex-1">
                  {service.description}
                </p>

                {/* Button always at the bottom */}
                <button 
                  onClick={() => onViewAllTherapists(service.category)}
                  className="text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2 group text-sm mx-auto mt-2"
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