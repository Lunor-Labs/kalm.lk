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
    <div className="min-h-screen bg-fixes-bg-offwhite">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-fixes-bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
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
              className="flex items-center space-x-3 flex-shrink-0 cursor-pointer focus:outline-none"
              aria-label="Go to homepage"
            >
              <img
                src="logo.jpg"
                alt="Kalm Logo"
                className="w-10 h-10 lg:w-8 lg:h-8"
              />
              <span className="text-lg lg:text-xl font-body font-medium text-black">kalm.lk</span>
            </button>
            {/* <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button> */}
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
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors duration-200 ${
                        isActive
                          ? 'text-base text-black bg-fixes-accent-purple hover:bg-fixes-accent-blue'
                          : 'text-fixes-heading-dark hover:bg-neutral-100 hover:text-black'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-body font-medium">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Sign Out */}
          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-fixes-accent-purple rounded-full flex items-center justify-center">
                <span className="text-black font-body font-semibold">
                  {user?.displayName?.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <p className="text-black text-xs font-body">{user?.displayName || 'Therapist'}</p>
                <p className="text-neutral-800 text-xs font-body">
                  {user?.isAnonymous ? 'Anonymous User' : user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-fixes-heading-dark hover:bg-neutral-100 hover:text-black transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-body font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-fixes-bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-fixes-heading-dark hover:text-black"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* <div className="flex items-center space-x-4">
              <div className="text-black">
                <h1 className="text-xl font-body font-semibold">
                 Welcome back, {user?.displayName || 'Therapist'}
                </h1>
                {user?.isAnonymous && (
                  <p className="text-sm text-accent-green">Anonymous Account</p>
                )}
              </div>
            </div> */}
          </div>
          <div style={{ borderBottom: '1px solid var(--neutral-200)', marginTop: '2.95rem' }}></div>
          </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TherapistLayout;