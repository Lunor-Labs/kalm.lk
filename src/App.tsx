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

function App() {
	return (
		<ErrorBoundary>
			<AuthProvider>
				<Router>
					<div className="App">
					<Routes>
						{/* Landing Page - unchanged */}
						<Route path="/" element={<LandingPage />} />

						{/* New Auth Pages */}
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/signup/anonymous" element={<AnonymousSignup />} />
						
						{/* Auth Routes */}
						<Route path="/unauthorized" element={<UnauthorizedPage />} />

						{/* Legal Pages */}
						<Route path="/terms-of-service" element={<TermsOfService />} />
						<Route path="/privacy-policy" element={<PrivacyPolicy />} />
						<Route path="/refund-policy" element={<RefundPolicy />} />
						
						{/* Admin Routes */}
						<Route path="/admin/*" element={
							<ProtectedRoute requiredRole={['admin', 'superadmin']}>
								<AdminLayoutSelector />
							</ProtectedRoute>
						}>
							<Route path="dashboard" element={<AdminDashboard />} />
							<Route path="users" element={<UserManagement />} />
							<Route path="therapists" element={<TherapistManagement />} />
							<Route path="bookings" element={<div className="text-white">Bookings Management</div>} />
							<Route path="payments" element={<PaymentsManagement />} />
							<Route path="session-config" element={<SessionConfigManagement />} />
							<Route path="error-logs" element={<ErrorLogsDashboard />} />
							<Route path="notifications" element={<div className="text-white">Notifications</div>} />
							<Route path="settings" element={<div className="text-white">Settings</div>} />
							<Route index element={<Navigate to="dashboard" replace />} />
						</Route>
						
						{/* Therapist Routes */}
						<Route path="/therapist/*" element={
							<ProtectedRoute requiredRole="therapist">
								<TherapistLayout />
							</ProtectedRoute>
						}>
						<Route path="schedule" element={<TherapistSchedule />} />
						<Route path="sessions" element={<TherapistSessions />} />
						<Route path="session/:sessionId" element={<SessionRoom />} />
						<Route path="availability" element={<TherapistAvailability />} />
						<Route path="profile" element={<TherapistProfile />} />
						<Route path="clients" element={<div className="text-white">Clients</div>} />
						<Route path="earnings" element={<div className="text-white">Earnings</div>} />
						<Route path="settings" element={<div className="text-white">Settings</div>} />
							<Route index element={<Navigate to="schedule" replace />} />
						</Route>
						
						{/* Client Routes */}
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
						
						{/* Catch all route */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
					
					{/* Toast Notifications */}
					<Toaster
						position="top-center"
						// move the toast container down so messages appear below the fixed header
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
		</ErrorBoundary>
	);
}

export default App;