import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TherapistLayout from './layouts/TherapistLayout';
import ClientLayout from './layouts/ClientLayout';

// Auth Components
import UnauthorizedPage from './components/auth/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
import WhatsAppFloat from './components/WhatsAppFloat';
import AuthModal from './components/AuthModal';
import TherapistListing from './components/TherapistListing';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TherapistSchedule from './pages/therapist/TherapistSchedule';
import ClientHome from './pages/client/ClientHome';

// Booking Flow
import BookingFlow from './features/booking/BookingFlow';

// Landing Page Component (unchanged)
const LandingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup' | 'anonymous'>('login');
  const [currentView, setCurrentView] = React.useState<'home' | 'therapists'>('home');
  const [serviceFilter, setServiceFilter] = React.useState<string | undefined>(undefined);

  const openAuthModal = (mode: 'login' | 'signup' | 'anonymous') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
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
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          mode={authMode}
          onSwitchMode={setAuthMode}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header onOpenAuth={openAuthModal} />
      <Hero onOpenAuth={openAuthModal} />
      <About />
      <Features />
      <HowItWorks />
      <Services onViewAllTherapists={openTherapistListing} onOpenAuth={openAuthModal} />
      <Comparison />
      <Therapists onViewAllTherapists={openTherapistListing} onOpenAuth={openAuthModal} />
      <Testimonials />
      <FAQ />
      <Footer />
      <WhatsAppFloat />
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router basename="/kalm.lk">
        <div className="App">
          <Routes>
            {/* Landing Page - unchanged */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="therapists" element={<div className="text-white">Therapists Management</div>} />
              <Route path="bookings" element={<div className="text-white">Bookings Management</div>} />
              <Route path="payments" element={<div className="text-white">Payments Management</div>} />
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
              <Route path="availability" element={<div className="text-white">Availability Management</div>} />
              <Route path="sessions" element={<div className="text-white">Sessions</div>} />
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
              <Route path="therapists" element={<div className="text-white">Find Therapists</div>} />
              <Route path="sessions" element={<div className="text-white">My Sessions</div>} />
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
            position="top-right"
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