import React from 'react';

const ComingSoon: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-center font-sans">
            <div className="max-w-2xl w-full animate-slide-up">
                {/* Logo Area */}
                <div className="mb-12 flex justify-center">
                    <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden">
                        <img src="/logo.jpg" alt="Kalm Logo" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Main Content */}
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight font-display">
                    We're <span className="text-[#6B9080]">Coming Soon</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-lg mx-auto">
                    We are crafting a safe space for your thoughts.
                    <br className="hidden md:block" />
                    Mental wellness, reimagined for you.
                </p>

                {/* Decorative Divider */}
                <div className="w-16 h-1 bg-[#A4C3B2] mx-auto rounded-full mb-12"></div>

                {/* Footer/Contact */}
                <div className="text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Kalm. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
