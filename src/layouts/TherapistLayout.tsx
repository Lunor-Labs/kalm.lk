import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  LogOut,
  Menu,
  X,
  Video,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import toast from 'react-hot-toast';

const TherapistLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Schedule', href: '/therapist/schedule', icon: Calendar },
    { name: 'Sessions', href: '/therapist/sessions', icon: Video },
    { name: 'Availability', href: '/therapist/availability', icon: Clock },
    { name: 'Profile', href: '/therapist/profile', icon: User },
    /*
    { name: 'Clients', href: '/therapist/clients', icon: Users },
    { name: 'Earnings', href: '/therapist/earnings', icon: CreditCard },
    { name: 'Settings', href: '/therapist/settings', icon: Settings },
*/   
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      // toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to sign out. Please try refreshing the page.');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page-light)' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(30, 30, 30, 0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ 
        backgroundColor: 'var(--bg-card-light)',
        borderRight: '1px solid var(--neutral-200)'
      }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--neutral-200)' }}>
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setSidebarOpen(false);
                } else {
                  navigate('/');
                  setSidebarOpen(false);
                }
              }}
              className="flex items-center space-x-2 cursor-pointer focus:outline-none"
              aria-label="Go to homepage"
            >
              <img
                src="logo.jpg"
                alt="Kalm Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold" style={{ color: 'black' }}>
                Therapist
              </span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ color: 'var(--neutral-500)' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors duration-200"
                      style={{
                        backgroundColor: isActive ? 'var(--primary-300)' : 'transparent',
                        color: isActive ? '#0C4A6E' : 'var(--neutral-600)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Sign Out */}
          <div className="px-6 py-5"
            style={{ borderTop: '1px solid var(--neutral-200)' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: 'var(--primary-300)', color: '#0C4A6E' }}>
                {user?.displayName?.charAt(0) || 'T'}
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--fixes-heading-dark)' }}>
                  {user?.displayName || 'Therapist'}
                </p>
                <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors duration-200"
              style={{ color: 'var(--neutral-600)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 backdrop-blur-sm"
          style={{ backgroundColor: 'hsla(0, 0%, 100%, 1.00)' }}>
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              style={{ color: 'var(--neutral-500)' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4 w-full">
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--fixes-heading-dark)' }}>
                  {(() => {
                    if (location.pathname.startsWith('/therapist/profile')) return 'My Profile';
                    if (location.pathname.startsWith('/therapist/sessions')) return 'My Sessions';
                    if (location.pathname.startsWith('/therapist/availability')) return 'Availability';
                    if (location.pathname.startsWith('/therapist/schedule')) return 'Schedule';
                    return 'Therapist Portal';
                  })()}
                </h1>
              </div>
            </div>
          </div>
          <div style={{ borderBottom: '1px solid var(--neutral-200)', marginTop: '0.25rem' }}></div>
        </div>

        {/* Page content */}
        <main className="p-6 flex-1" style={{ backgroundColor: 'var(--primary-300)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TherapistLayout;