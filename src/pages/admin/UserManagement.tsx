import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Users, Search, Filter, MoreVertical, Shield, UserCheck, Crown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { updateUserRole } from '../../lib/auth';
import { UserManagement, UserRole } from '../../types/auth';
import toast from 'react-hot-toast';
import { isWithinInterval, parseISO } from 'date-fns';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  // Custom role select state
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement | null>(null);
  const roleOptions: (UserRole | 'all')[] = ['all', 'client', 'therapist', 'admin'];
  const roleButtonRef = useRef<HTMLButtonElement | null>(null);
  const portalElRef = useRef<HTMLDivElement | null>(null);
  const portalContentRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyles, setDropdownStyles] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideRole = roleRef.current && roleRef.current.contains(target);
      const clickedInsidePortal = portalContentRef.current && portalContentRef.current.contains(target);
      if (!clickedInsideRole && !clickedInsidePortal) {
        setRoleOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Create portal element on mount
  useEffect(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    portalElRef.current = el;
    return () => {
      if (portalElRef.current) document.body.removeChild(portalElRef.current);
      portalElRef.current = null;
    };
  }, []);

  // Position dropdown when opened and on resize/scroll
  useEffect(() => {
    const updatePosition = () => {
      const btn = roleButtonRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setDropdownStyles({ top: rect.bottom + 8 + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      }
    };
    if (roleOpen) updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [roleOpen]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchQuery, roleFilter, dateFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as UserManagement[];
      
      console.log('Fetched users:', usersData); // Debug log
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      setUsers(users.map(user => 
        user.uid === uid 
          ? { ...user, role: newRole, updatedAt: new Date() }
          : user
      ));
      toast.success(`User role updated to ${newRole}`);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    let matchesDate = true;
    if (dateFilter.startDate && dateFilter.endDate) {
      try {
        const userJoinDate = user.createdAt;
        const startDate = parseISO(dateFilter.startDate);
        const endDate = parseISO(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = isWithinInterval(userJoinDate, { start: startDate, end: endDate });
      } catch (error) {
        console.error('Date filter error:', error);
        matchesDate = true;
      }
    }
    
    return matchesSearch && matchesRole && matchesDate;
  });

  // Calculate paginated users
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Generate visible page numbers (current page ±2, with ellipses)
  const getVisiblePages = () => {
    const maxPagesToShow = 5;
    const pages: (number | string)[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  useEffect(() => {
    // Debug pagination
    console.log('Filtered users:', filteredUsers.length, 'Total pages:', totalPages, 'Current page:', currentPage);
  }, [filteredUsers, currentPage]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-accent-yellow" />;
      case 'therapist': return <UserCheck className="w-4 h-4 text-accent-green" />;
      case 'client': return <Users className="w-4 h-4 text-primary-500" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30';
      case 'therapist': return 'bg-accent-green/20 text-accent-green border-accent-green/30';
      case 'client': return 'bg-primary-500/20 text-primary-500 border-primary-500/30';
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-base">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">User Management</h1>
        <p className="text-neutral-300 text-sm">Manage user roles and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary-500" />
            <span className="text-neutral-300 text-sm">Total Users</span>
          </div>
          <p className="text-lg font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary-500" />
            <span className="text-neutral-300 text-sm">Clients</span>
          </div>
          <p className="text-lg font-bold text-white">{users.filter(u => u.role === 'client').length}</p>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-accent-green" />
            <span className="text-neutral-300 text-sm">Therapists</span>
          </div>
          <p className="text-lg font-bold text-white">{users.filter(u => u.role === 'therapist').length}</p>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-primary-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-accent-yellow" />
            <span className="text-neutral-300 text-sm">Admins</span>
          </div>
          <p className="text-lg font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-primary-500/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm"
            />
          </div>
          <div className="relative" ref={roleRef}>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <button
              ref={roleButtonRef}
              type="button"
              onClick={() => setRoleOpen(prev => !prev)}
              className="w-full text-left pl-10 pr-4 py-2.5 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white text-sm flex items-center justify-between"
              aria-haspopup="listbox"
              aria-expanded={roleOpen}
            >
              <span className="truncate">{roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}</span>
              <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown options with a small gap to avoid overlap */}
            {roleOpen && portalElRef.current && dropdownStyles && createPortal(
              <div
                ref={portalContentRef}
                style={{ position: 'absolute', top: dropdownStyles.top, left: dropdownStyles.left, width: dropdownStyles.width }}
              >
                <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 py-1" role="listbox">
                  {roleOptions.map((opt) => (
                    <button
                      key={String(opt)}
                      onClick={() => { setRoleFilter(opt); setRoleOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm ${roleFilter === opt ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}
                      role="option"
                      aria-selected={roleFilter === opt}
                    >
                      {opt === 'all' ? 'All Roles' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>,
              portalElRef.current
            )}
          </div>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            {/* Masked overlay label to cover native date input hint and avoid overlap */}
            {!dateFilter.startDate && (
              <span className="absolute left-10 right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm pointer-events-none bg-neutral-800 px-2 py-0.5 transition-opacity duration-150 group-focus-within:opacity-0 truncate">
                Start Date
              </span>
            )}
            <input
              type="date"
              aria-label="Start Date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm"
            />
          </div>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            {!dateFilter.endDate && (
              <span className="absolute left-10 right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm pointer-events-none bg-neutral-800 px-2 py-0.5 transition-opacity duration-150 group-focus-within:opacity-0 truncate">
                End Date
              </span>
            )}
            <input
              type="date"
              aria-label="End Date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm"
            />
          </div>
        </div>
        {(searchQuery || roleFilter !== 'all' || dateFilter.startDate || dateFilter.endDate) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setDateFilter({ startDate: '', endDate: '' });
              }}
              className="bg-primary-500 text-white px-3 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 min-h-[40px] text-sm"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {paginatedUsers.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block bg-black/50 backdrop-blur-sm rounded-xl border border-primary-500/20 overflow-hidden">
              <div className="p-4 border-b border-neutral-800">
                <h2 className="text-lg font-semibold text-white">Users ({filteredUsers.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-800/50">
                    <tr>
                      <th className="text-left p-4 text-neutral-300 font-medium">User</th>
                      <th className="text-left p-4 text-neutral-300 font-medium">Role</th>
                      <th className="text-left p-4 text-neutral-300 font-medium">Type</th>
                      <th className="text-left p-4 text-neutral-300 font-medium">Joined</th>
                      <th className="text-left p-4 text-neutral-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.uid} className="border-t border-neutral-800 hover:bg-neutral-800/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                              <span className="text-primary-500 font-semibold">
                                {user.displayName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.displayName || 'Unknown User'}</p>
                              <p className="text-neutral-400 text-sm">{user.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            user.isAnonymous ? 'bg-accent-green/20 text-accent-green' : 'bg-neutral-700 text-neutral-300'
                          }`}>
                            <Shield className="w-3 h-3" />
                            <span>{user.isAnonymous ? 'Anonymous' : 'Regular'}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-neutral-300 text-sm">{user.createdAt.toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <div className="relative">
                            <button
                              onClick={() => setSelectedUser(selectedUser === user.uid ? null : user.uid)}
                              className="p-2 text-neutral-400 hover:text-white transition-colors duration-200"
                              aria-label={`Manage actions for ${user.displayName || 'user'}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {selectedUser === user.uid && (
                              <div className="absolute right-0 top-full mt-2 w-40 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-10">
                                <div className="p-2">
                                  <p className="text-neutral-400 text-xs px-3 py-2 ml-3">Change Role</p>
                                  {(['client', 'therapist', 'admin'] as UserRole[]).map((role) => (
                                    <button
                                      key={role}
                                      onClick={() => handleRoleChange(user.uid, role)}
                                      disabled={user.role === role}
                                      className={`w-full flex items-center gap-2 px-6 py-2 rounded-lg text-sm text-left transition-colors duration-200 min-h-[40px] ${
                                        user.role === role
                                          ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                          : 'hover:bg-neutral-700 text-white'
                                      }`}
                                      aria-label={`Change role to ${role} for ${user.displayName || 'user'}`}
                                    >
                                      <span className="ml-1">{getRoleIcon(role)}</span>
                                      <span className="capitalize">{role}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {paginatedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-primary-500/20 hover:border-primary-500/40 transition-colors duration-200"
                  aria-label={`User card for ${user.displayName || 'user'}`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <span className="text-primary-500 font-semibold">
                          {user.displayName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-base truncate">
                          {user.displayName || 'Unknown User'}
                        </p>
                        <p className="text-neutral-400 text-sm truncate">{user.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-300">
                      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        user.isAnonymous ? 'bg-accent-green/20 text-accent-green' : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{user.isAnonymous ? 'Anonymous' : 'Regular'}</span>
                      </span>
                      <span>{user.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(selectedUser === user.uid ? null : user.uid)}
                        className="bg-primary-500 text-white px-3 py-2 rounded-xl hover:bg-primary-600 transition-colors duration-200 flex items-center gap-1.5 min-h-[40px] text-sm"
                        aria-label={`Manage actions for ${user.displayName || 'user'}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                        <span>Actions</span>
                      </button>
                      {selectedUser === user.uid && (
                        <div className="w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl">
                          <div className="p-2">
                            <p className="text-neutral-400 text-xs px-3 py-2">Change Role</p>
                            {(['client', 'therapist', 'admin'] as UserRole[]).map((role) => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(user.uid, role)}
                                disabled={user.role === role}
                                className={`w-full flex items-center gap-2 px-6 py-2 rounded-lg text-sm text-left transition-colors duration-200 min-h-[40px] ${
                                  user.role === role
                                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                    : 'hover:bg-neutral-700 text-white'
                                }`}
                                aria-label={`Change role to ${role} for ${user.displayName || 'user'}`}
                              >
                                {getRoleIcon(role)}
                                <span className="capitalize">{role}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-center border border-primary-500/20">
            <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-300 text-base font-semibold mb-2">No users found</p>
            <p className="text-neutral-400 text-sm">
              {searchQuery || roleFilter !== 'all' ? 'Try adjusting your search or filters' : 'Users will appear here once they sign up'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 mt-4 overflow-x-auto">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-sm min-h-[40px] ${
            currentPage === 1
              ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          } transition-colors duration-200`}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <div className="flex items-center gap-0.5">
          {getVisiblePages().map((page, index) => (
            <button
              key={`${page}-${index}`}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              className={`px-2 py-1 rounded-lg text-sm min-w-[36px] min-h-[36px] text-center ${
                page === currentPage
                  ? 'bg-primary-500 text-white'
                  : typeof page === 'string'
                  ? 'text-neutral-400 cursor-default'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              } transition-colors duration-200`}
              aria-label={typeof page === 'number' ? `Go to page ${page}` : 'Page ellipsis'}
              disabled={typeof page === 'string'}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-sm min-h-[40px] ${
            currentPage === totalPages
              ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          } transition-colors duration-200`}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UserManagementPage;