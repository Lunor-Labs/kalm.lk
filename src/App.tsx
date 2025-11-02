import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TherapistLayout from './layouts/TherapistLayout';
import ClientLayout from './layouts/ClientLayout';

// Auth Components
import UnauthorizedPage from './components/auth/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Landing Page Components
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
import TherapistSchedule from './pages/therapist/TherapistSchedule';
import TherapistSessions from './pages/therapist/TherapistSessions';
import TherapistAvailability from './pages/therapist/TherapistAvailability';
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
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AnonymousSignup from './pages/auth/AnonymousSignup';

// Landing Page Component
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
			<TherapistListing onBack={backToHome} initialFilter={serviceFilter} onOpenAuth={openAuthModal} />
		);
	}

	return (
		<div className="min-h-screen bg-[#0e100b] overflow-x-hidden">
			<Header onOpenAuth={openAuthModal} className="relative z-50 bg-transparent text-white" />
			
			{/* Hero Section - Black background */}
			<section className="relative bg-[#0e100b] min-h-screen flex items-center justify-center overflow-visible pt-20">
				<div className="absolute inset-0 bg-gradient-to-b from-[#0e100b]/90 to-[#0e100b] z-0" />
				<div className="relative z-20 w-full max-w-[80%] mx-auto px-4 flex flex-col justify-center gap-8">
					<div className="flex-1 flex flex-col md:flex-row items-center gap-8 w-full">
						<Hero onOpenAuth={openAuthModal} className="flex-1" />
					</div>
				</div>
			</section>

			{/* About Section - Green card that overlaps with Hero */}
			<section className="relative bg-[#0e100b] min-h-[90vh] flex items-center justify-center overflow-hidden -mt-[25vh]">
				<div className="w-full min-h-[130vh] bg-[#bbdcad] rounded-t-3xl rounded-b-3xl shadow-2xl relative z-10">
					<div className="max-w-[80%] mx-auto px-4 pt-72 py-10 h-full flex flex-col justify-center gap-8">
						<About className="text-black" />
					</div>
				</div>
			</section>

			{/* Features Section - Full-width green card on black with rounded shape like hero */}
			<section className="relative bg-[#0e100b] min-h-screen flex items-start justify-center overflow-visible pt-0">
				<div className="absolute inset-0 bg-gradient-to-b from-[#0e100b]/90 to-[#0e100b] z-0" />
				<div className="relative z-20 w-full max-w-[80%] mx-auto px-4 flex flex-col justify-center gap-8 -mt-20">
					<Features className="text-black" />
				</div>
			</section>

			{/* HowItWorks Section - Full-width green card on black with rounded shape like hero */}
		<section className="relative bg-[#0e100b]  min-h-[90vh] flex items-start justify-center overflow-visible pt-20 -mt-[440px]">
			<div className="w-full   min-h-[130vh] bg-[#bbdcad] rounded-3xl shadow-2xl">
				<div className="max-w-[81%] mx-auto px-6 py-10 h-full flex flex-col justify-center gap-8 mt-40">
					<HowItWorks className="text-black" />
				</div>
			</div>
		</section>

			{/* Services Section - Full-width green card on black with rounded shape like hero */}
			<section className="relative bg-[#0e100b] min-h-screen flex items-start justify-center overflow-visible pt-20">
			<div className="relative z-20 w-full max-w-[81%] mx-auto px-6 flex flex-col justify-center gap-8 -mt-[390px]">
				<Services onViewAllTherapists={openTherapistListing} className="text-black" />
			</div>
			</section>

			{/* Comparison Section - Full-width green card on black with rounded shape like hero */}
		<section className="relative bg-[#0e100b]  min-h-[90vh] flex items-start justify-center overflow-visible pt-20 -mt-[700px]">
				<div className="w-full  min-h-[150vh] bg-[#bbdcad] rounded-3xl shadow-2xl">
					<div className="max-w-[81%] mx-auto px-6 py-10 h-full flex flex-col justify-center gap-8 mt-40">
						<Comparison className="text-black" />
					</div>
				</div>
			</section>

			{/* Therapists Section - Full-width green card on black with rounded shape like hero */}
		<section className="relative bg-[#0e100b] min-h-screen flex items-start justify-center overflow-visible pt-20">
			<div className="relative z-20 w-full max-w-[81%] mx-auto px-6 flex flex-col justify-center gap-8 -mt-[225px]">
				<Therapists onViewAllTherapists={openTherapistListing} onOpenAuth={openAuthModal} className="text-black" />
			</div>
		</section>

			{/* Testimonials Section - Full-width green card on black with rounded shape like hero */}
		<section className="relative bg-[#0e100b] min-h-[90vh] flex items-center justify-center overflow-hidden -mt-[300px]">
			<div className="w-full bg-[#bbdcad] min-h-[130vh] rounded-3xl shadow-2xl">
				<div className="max-w-[81%] mx-auto px-6 py-10 h-full flex flex-col justify-center gap-8 mt-60">
					<Testimonials className="text-black" />
				</div>
			</div>
		</section>

			{/* FAQ Section - Full-width green card on black with rounded shape like hero */}
			<section className="relative bg-[#0e100b] min-h-[90vh] flex items-center justify-center  overflow-visible pt-20">
				{/* <div className="w-full bg-[#bbdcad] rounded-3xl shadow-2xl"> */}
				<div className="relative z-20 w-full max-w-[81%] mx-auto px-6 py-10 h-full flex flex-col justify-center gap-8 -mt-[420px]">
						<FAQ className="text-black" />
					</div>
				{/* </div> */}
			</section>

			{/* Instagram Strip - Full-width green on black with rounded shape like hero */}
			<section className="relative bg-[#0e100b] overflow-visible pt-20 -mt-[390px]">
			<div className="w-full bg-[#bbdcad] min-h-[80vh] rounded-3xl shadow-2xl">
				<div className="max-w-[81%] mx-auto px-6 py-6 pt-60">
					<InstagramStrip />
				</div>
			</div>
		</section>

			{/* Footer - Black */}
			<footer className="relative bg-[#0e100b] text-white py-12 overflow-hidden">
				
				
				<div className="relative z-10 max-w-[81%] mx-auto px-6 pt-8 border-t border-white/10">
					<Footer />
					
				</div>
			</footer>

			<WhatsAppFloat />
		</div>
	);
};

function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="App">
					<Routes>
						<Route path="/" element={<LandingPage />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/signup/anonymous" element={<AnonymousSignup />} />
						<Route path="/unauthorized" element={<UnauthorizedPage />} />
						<Route path="/terms-of-service" element={<TermsOfService />} />
						<Route path="/privacy-policy" element={<PrivacyPolicy />} />
						<Route path="/refund-policy" element={<RefundPolicy />} />
						
						<Route path="/admin/*" element={
							<ProtectedRoute requiredRole="admin">
								<AdminLayout />
							</ProtectedRoute>
						}>
							<Route path="dashboard" element={<AdminDashboard />} />
							<Route path="users" element={<UserManagement />} />
							<Route path="therapists" element={<TherapistManagement />} />
							<Route path="bookings" element={<div className="text-white">Bookings Management</div>} />
							<Route path="payments" element={<div className="text-white">Payments Management</div>} />
							<Route path="notifications" element={<div className="text-white">Notifications</div>} />
							<Route path="settings" element={<div className="text-white">Settings</div>} />
							<Route index element={<Navigate to="dashboard" replace />} />
						</Route>
						
						<Route path="/therapist/*" element={
							<ProtectedRoute requiredRole="therapist">
								<TherapistLayout />
							</ProtectedRoute>
						}>
							<Route path="schedule" element={<TherapistSchedule />} />
							<Route path="sessions" element={<TherapistSessions />} />
							<Route path="session/:sessionId" element={<SessionRoom />} />
							<Route path="availability" element={<TherapistAvailability />} />
							<Route path="clients" element={<div className="text-white">Clients</div>} />
							<Route path="earnings" element={<div className="text-white">Earnings</div>} />
							<Route path="settings" element={<div className="text-white">Settings</div>} />
							<Route index element={<Navigate to="schedule" replace />} />
						</Route>
						
						<Route path="/client/*" element={
							<ProtectedRoute requiredRole="client" allowAnonymous={true}>
								<ClientLayout />
							</ProtectedRoute>
						}>
							<Route path="home" element={<ClientHome />} />
							<Route path="book" element={<BookingFlow />} />
							<Route path="sessions" element={<ClientSessions />} />
							<Route path="session/:sessionId" element={<SessionRoom />} />
							<Route path="therapists" element={<TherapistListing onBack={() => window.history.back()} onOpenAuth={() => {}} />} />
							<Route path="messages" element={<div className="text-white">Messages</div>} />
							<Route path="payments" element={<div className="text-white">Payment History</div>} />
							<Route path="profile" element={<div className="text-white">Profile</div>} />
							<Route path="settings" element={<div className="text-white">Settings</div>} />
							<Route index element={<Navigate to="home" replace />} />
						</Route>
						
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
					
					<Toaster
						position="top-center"
						containerStyle={{ top: '0rem' }}
						toastOptions={{
							duration: 4000,
							style: {
								background: '#1f2937',
								color: '#fff',
								border: '1px solid #374151',
							},
						}}
					/>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;