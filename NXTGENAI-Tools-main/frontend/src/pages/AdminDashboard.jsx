import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Users, BarChart3, Settings, RefreshCw, AlertTriangle, Crown, Check, Zap } from 'lucide-react';
import { removeToken, removeRole, getUserId, removeUserId } from '../api/client';
import { logoutUser } from '../api/auth';
import { getAllUsersWithPlans } from '../api/admin';

const AdminDashboard = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const role = localStorage.getItem('user_role');
      
      console.log('Admin Fetch:', { token: !!token, role });
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }
      
      if (role !== 'admin') {
        setError('You do not have admin privileges. Access denied.');
        return;
      }
      
      const data = await getAllUsersWithPlans();
      console.log('Users fetched:', data);
      setUsers(Array.isArray(data) ? data : data?.users || []);
    } catch (err) {
      const message = err?.message || 'Failed to load users';
      console.error('Error fetching users:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      removeRole();
      removeUserId();
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Calculate statistics
  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.plan === 'premium' || u.subscription?.plan === 'premium').length;
  const freeUsers = totalUsers - premiumUsers;
  const totalCreditsUsed = users.reduce((sum, u) => {
    const usage = u.subscription?.usage_count || u.usage_count || 0;
    return sum + usage;
  }, 0);

  // Filter out current admin from the user list
  const currentUserId = getUserId();
  const displayUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-900 to-purple-800 transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-purple-700">
            <h1 className="text-2xl font-bold text-white">NXTGENAI</h1>
            <p className="text-purple-200 text-sm mt-1">Admin Control Panel</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'text-purple-100 hover:bg-purple-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-purple-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-purple-100 hover:bg-purple-700 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="w-full flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h2>
              <div className="w-10" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">Dashboard Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { 
                    label: 'Total Users', 
                    value: totalUsers, 
                    icon: Users,
                    color: 'bg-blue-100 text-blue-600',
                    bg: 'bg-blue-50'
                  },
                  { 
                    label: 'Premium Users', 
                    value: premiumUsers, 
                    icon: Crown,
                    color: 'bg-purple-100 text-purple-600',
                    bg: 'bg-purple-50'
                  },
                  { 
                    label: 'Free Users', 
                    value: freeUsers, 
                    icon: Users,
                    color: 'bg-emerald-100 text-emerald-600',
                    bg: 'bg-emerald-50'
                  },
                  { 
                    label: 'Total Usage', 
                    value: totalCreditsUsed, 
                    icon: Zap,
                    color: 'bg-amber-100 text-amber-600',
                    bg: 'bg-amber-50'
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className={`${stat.bg} rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-600 text-sm font-medium mb-2">{stat.label}</p>
                          <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`${stat.color} p-3 rounded-xl`}>
                          <Icon className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Premium Breakdown
                  </h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{premiumUsers} Users</div>
                  <p className="text-sm text-slate-600">Users with premium subscription at $9.99</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    Free Breakdown
                  </h4>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{freeUsers} Users</div>
                  <p className="text-sm text-slate-600">Users on free plan with 10 credits</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-slate-900">User Management</h3>
                <button
                  onClick={fetchUsers}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2.5 font-medium hover:bg-purple-700 transition-all shadow-md"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {error && (
                <div className="mb-6 inline-flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-700 border border-red-200">
                  <AlertTriangle className="h-5 w-5" />
                  {error}
                </div>
              )}

              {/* Users Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading && (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading users...</p>
                  </div>
                )}

                {!isLoading && users.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No users found</p>
                  </div>
                )}

                {!isLoading && displayUsers.length === 0 && users.length > 0 && (
                  <div className="col-span-full text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No other users. Only you (admin) are registered.</p>
                  </div>
                )}

                {!isLoading && displayUsers.map((user) => {
                  const subscription = user.subscription || user;
                  const plan = subscription.plan || 'free';
                  const isPremium = plan === 'premium';
                  const usageLimit = subscription.usage_limit || (plan === 'premium' ? 1000 : 10);
                  const usageCount = subscription.usage_count || 0;
                  const usagePercentage = (usageCount / usageLimit) * 100;

                  return (
                    <div
                      key={user.id || user.email}
                      className={`rounded-xl p-6 border-2 shadow-sm hover:shadow-md transition-all ${
                        isPremium
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Plan Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {isPremium ? (
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                              <Crown className="w-3.5 h-3.5" />
                              PREMIUM
                            </div>
                          ) : (
                            <div className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">
                              FREE
                            </div>
                          )}
                        </div>
                        {subscription.is_active !== false && (
                          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Active
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="mb-4">
                        <h4 className="font-bold text-slate-900 text-lg">{user.username || 'Unknown'}</h4>
                        <p className="text-sm text-slate-600 truncate">{user.email}</p>
                        {user.role && (
                          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{user.role}</p>
                        )}
                      </div>

                      {/* Credits/Usage */}
                      <div className="mb-4 p-3 rounded-lg bg-white/50 backdrop-blur">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Usage</span>
                          <span className="text-sm font-bold text-slate-900">{usageCount} / {usageLimit}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isPremium ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Remaining Credits */}
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Remaining</span>
                        <span className={`text-lg font-bold ${
                          isPremium ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {usageLimit - usageCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-8">System Settings</h3>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 max-w-2xl shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      System Name
                    </label>
                    <input
                      type="text"
                      defaultValue="NXTGENAI Tools"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Free Plan Credits
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Premium Plan Credits
                    </label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md mt-2">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
