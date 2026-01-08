import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import TherapistLayout from './layouts/TherapistLayout';
import ClientLayout from './layouts/ClientLayout';

// Auth Components
import UnauthorizedPage from './components/auth/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Landing Page Components (unchanged)
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import Comparison from './components/Comparison';
import Therapists from './components/Therapists';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import InstagramStrip from './components/InstagramStrip';
import WhatsAppFloat from './components/WhatsAppFloat';
import TherapistListing from './components/TherapistListing';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TherapistManagement from './pages/admin/TherapistManagement';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import ErrorLogsDashboard from './pages/admin/ErrorLogsDashboard';
import SessionConfigManagement from './pages/admin/SessionConfigManagement';

// Dynamic Admin Layout Selector
const AdminLayoutSelector: React.FC = () => {
	const { user } = useAuth();

	if (user?.role === 'superadmin') {
		return <SuperAdminLayout />;
	}

	return <AdminLayout />;
};

import TherapistSchedule from './pages/therapist/TherapistSchedule';
import TherapistSessions from './pages/therapist/TherapistSessions';
import TherapistAvailability from './pages/therapist/TherapistAvailability';
import TherapistProfile from './pages/therapist/TherapistProfile';
import ClientHome from './pages/client/ClientHome';
import ClientSessions from './pages/client/ClientSessions';

// Session Components
import SessionRoom from './components/session/SessionRoom';

// Booking Flow
import BookingFlow from './features/booking/BookingFlow';

// Legal Pages
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';
// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AnonymousSignup from './pages/auth/AnonymousSignup';

// Landing Page Component (unchanged)
const LandingPage: React.FC = () => {
	const [currentView, setCurrentView] = React.useState<'home' | 'therapists'>('home');
	const [serviceFilter, setServiceFilter] = React.useState<string | undefined>(undefined);
	const navigate = useNavigate();

	const openAuthModal = (mode: 'login' | 'signup' | 'anonymous') => {
		if (mode === 'login') navigate('/login');
		else if (mode === 'signup') navigate('/signup');
		else navigate('/signup/anonymous');
	};

	const openTherapistListing = (serviceCategory?: string) => {
		setServiceFilter(serviceCategory);
		setCurrentView('therapists');
	};

	const backToHome = () => {
		setCurrentView('home');
		setServiceFilter(undefined);
	};

	if (currentView === 'therapists') {
		return (
			<>
				<TherapistListing onBack={backToHome} initialFilter={serviceFilter} onOpenAuth={openAuthModal} />
			</>
		);
	}

	return (
		<div className="min-h-screen bg-cream-50 select-none">
			<Header onOpenAuth={openAuthModal} />
			<Hero onOpenAuth={openAuthModal} />
			<About />
			<Features />
			<HowItWorks />
			<Services onViewAllTherapists={openTherapistListing} />
			<Comparison />
			<Therapists onViewAllTherapists={openTherapistListing} onOpenAuth={openAuthModal} />
			<Testimonials />
			<FAQ />
			{/* Instagram strip inserted above footer */}
			<InstagramStrip />
			<Footer />
			<WhatsAppFloat />
		</div>
	);
};

// Premium Coming Soon Page
import ComingSoon from './pages/ComingSoon';

function App() {
	return <ComingSoon />;
}


export default App;