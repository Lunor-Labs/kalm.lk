import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreVertical, Shield, UserCheck, Crown } from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { updateUserRole } from '../../lib/auth';
import { UserManagement, UserRole } from '../../types/auth';
import toast from 'react-hot-toast';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

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
    
    return matchesSearch && matchesRole;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-neutral-300 text-sm sm:text-base">Manage user roles and permissions</p>
      </div>

      {/* Stats - Stack on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-primary-500" />
            <span className="text-neutral-300 text-xs sm:text-sm">Total Users</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">{users.length}</p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-primary-500" />
            <span className="text-neutral-300 text-xs sm:text-sm">Clients</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {users.filter(u => u.role === 'client').length}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <UserCheck className="w-4 sm:w-5 h-4 sm:h-5 text-accent-green" />
            <span className="text-neutral-300 text-xs sm:text-sm">Therapists</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {users.filter(u => u.role === 'therapist').length}
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
          <div className="flex items-center gap-2 sm:space-x-3 mb-1 sm:mb-2">
            <Crown className="w-4 sm:w-5 h-4 sm:h-5 text-accent-yellow" />
            <span className="text-neutral-300 text-xs sm:text-sm">Admins</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Filters - Stack on mobile */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-neutral-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-neutral-800 text-white text-sm sm:text-base"
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="therapist">Therapists</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - Cards on mobile */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-neutral-800">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Users ({filteredUsers.length})
          </h2>
        </div>

        {/* Desktop Table */}
        {!isMobile ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800/50">
                <tr>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">User</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Role</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Type</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Joined</th>
                  <th className="text-left p-4 text-neutral-300 font-medium text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="border-t border-neutral-800 hover:bg-neutral-800/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                          <span className="text-primary-500 font-semibold text-sm sm:text-base">
                            {user.displayName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">
                            {user.displayName || 'Unknown User'}
                          </p>
                          <p className="text-neutral-400 text-xs sm:text-sm">
                            {user.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                        user.isAnonymous 
                          ? 'bg-accent-green/20 text-accent-green' 
                          : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{user.isAnonymous ? 'Anonymous' : 'Regular'}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-neutral-300 text-xs sm:text-sm">
                        {user.createdAt.toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedUser(selectedUser === user.uid ? null : user.uid)}
                          className="p-2 text-neutral-400 hover:text-white transition-colors duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {selectedUser === user.uid && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-xl sm:rounded-2xl shadow-xl z-10">
                            <div className="p-2">
                              <p className="text-neutral-400 text-xs px-3 py-2">Change Role</p>
                              {(['client', 'therapist', 'admin'] as UserRole[]).map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(user.uid, role)}
                                  disabled={user.role === role}
                                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg sm:rounded-xl text-left transition-colors duration-200 ${
                                    user.role === role
                                      ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                                      : 'hover:bg-neutral-700 text-white'
                                  }`}
                                >
                                  {getRoleIcon(role)}
                                  <span className="capitalize text-sm">{role}</span>
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
        ) : (
          /* Mobile Cards */
          <div className="p-4 space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.uid} className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
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
                  <button
                    onClick={() => setSelectedUser(selectedUser === user.uid ? null : user.uid)}
                    className="p-2 text-neutral-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-neutral-400 text-xs">Role</p>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-xs">Type</p>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                      user.isAnonymous 
                        ? 'bg-accent-green/20 text-accent-green' 
                        : 'bg-neutral-700 text-neutral-300'
                    }`}>
                      <Shield className="w-3 h-3" />
                      <span>{user.isAnonymous ? 'Anonymous' : 'Regular'}</span>
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-neutral-400 text-xs">Joined</p>
                    <p className="text-neutral-300 text-sm">
                      {user.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {selectedUser === user.uid && (
                  <div className="mt-3 pt-3 border-t border-neutral-700">
                    <p className="text-neutral-400 text-xs mb-2">Change Role</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['client', 'therapist', 'admin'] as UserRole[]).map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(user.uid, role)}
                          disabled={user.role === role}
                          className={`flex items-center justify-center space-x-1 px-2 py-2 rounded-lg text-xs ${
                            user.role === role
                              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                              : 'hover:bg-neutral-700 text-white'
                          }`}
                        >
                          {getRoleIcon(role)}
                          <span className="capitalize">{role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-16">
            <Users className="w-12 sm:w-16 h-12 sm:h-16 text-neutral-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-neutral-300 mb-1 sm:mb-2 text-sm sm:text-base">No users found</p>
            <p className="text-neutral-400 text-xs sm:text-sm">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Users will appear here once they sign up'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;