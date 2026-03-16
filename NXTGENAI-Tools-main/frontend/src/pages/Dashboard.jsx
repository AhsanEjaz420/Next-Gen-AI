import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Home from './Home';
import History from './History';
import Settings from './Settings';
import Insights from './Insights';
import ErrorBoundary from '../components/ErrorBoundary';
import { TOOLS_CONFIG } from '../config/toolsConfig';
import { getPlanById } from '../config/plansConfig';
import { Menu, LogOut, CreditCard, Zap } from 'lucide-react';
import { removeToken, removeRole } from '../api/client';
import { logoutUser, getCurrentUser } from '../api/auth';
import CreditDisplay from '../components/CreditDisplay';

const Dashboard = () => {
  const [selectedTool, setSelectedTool] = useState('caption');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userCredits, setUserCredits] = useState(null); // null means loading
  const [userPlan, setUserPlan] = useState('free');
  const [loadingCredits, setLoadingCredits] = useState(true);
  const navigate = useNavigate();

  const currentTool = TOOLS_CONFIG[selectedTool];
  const Icon = currentTool.icon;
  const planInfo = getPlanById(userPlan);

  // Fetch user credits on mount
  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      setLoadingCredits(true);
      console.log('Fetching user data from /auth/me...');
      
      // Call /auth/me to get user data including remaining credits
      const userData = await getCurrentUser();
      
      console.log('User Data Response:', JSON.stringify(userData, null, 2));
      
      if (userData) {
        // Set plan from subscription_plan field
        if (userData.subscription_plan) {
          setUserPlan(userData.subscription_plan);
          console.log('User Plan:', userData.subscription_plan);
        }
        
        // Set remaining credits directly from API response
        if (userData.remaining !== undefined) {
          // Handle -1 for unlimited or numeric value
          const remainingValue = userData.remaining === -1 
            ? "unlimited" 
            : parseInt(userData.remaining);
          
          setUserCredits(remainingValue);
          console.log('Remaining Credits:', remainingValue);
        } else {
          console.warn('remaining field missing in response');
          setUserCredits(10); // Default fallback
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserCredits(10);
      setUserPlan('free');
    } finally {
      setLoadingCredits(false);
    }
  };

  // Update credits directly from API response (used by tools)
  const updateCredits = (remaining) => {
    if (remaining !== undefined) {
      setUserCredits(remaining === -1 ? "unlimited" : remaining);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  const handleLogout = async () => {
    try {
      // Call logout API to deactivate session
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Remove token and role, then redirect to login
      removeToken();
      removeRole();
      navigate('/login', { replace: true });
    }
  };

  // Auto-close sidebar on mobile when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Sidebar */}
      <Sidebar
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userPlanName={planInfo.name}
        userCredits={userCredits}
        userPlan={userPlan}
      />

      {/* Main Content - full width on mobile, flex-1 on desktop */}
      <main className="w-full lg:flex-1 flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-4">

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Tool Header */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-indigo-100 p-1.5 sm:p-2 flex-shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 truncate">
                    {currentTool.title}
                  </h2>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 truncate">
                    {currentTool.description}
                  </p>
                </div>
              </div>

              {/* Plan Button - Shows Current Plan */}
              <button
                onClick={() => navigate('/pricing')}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  userPlan === 'premium' 
                    ? 'text-purple-700 bg-purple-100 hover:bg-purple-200' 
                    : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                title={`Current Plan: ${planInfo.name}`}
              >
                {userPlan === 'premium' ? '✨' : '📦'} {planInfo.name}
              </button>

              {/* Credits Badge / Upgrade Button */}
              <button
                onClick={() => navigate('/pricing')}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                title={userPlan === 'free' ? 'Upgrade to Premium' : 'View Credits'}
              >
                {userPlan === 'free' ? (
                  <>
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">Upgrade To Premium</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {userCredits !== null && (
                      <span className="hidden sm:inline">
                        {userCredits === 'unlimited' || userCredits === '∞' ? '∞' : userCredits} Credits
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>

            </div>
          </div>
        </header>

        {/* Tool UI */}
        <div className="flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            
            {/* Credit Display Card - Always visible, even while loading */}
            <CreditDisplay 
              credits={loadingCredits ? null : (userCredits || 0)}
              plan={userPlan}
              onUpgradeClick={handleUpgradeClick}
            />

            {/* Main Tool Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 lg:p-6">
              <ErrorBoundary>
                {selectedTool === 'history' ? (
                  <History />
                ) : selectedTool === 'settings' ? (
                  <Settings />
                ) : selectedTool === 'insights' ? (
                  <Insights />
                ) : (
                  <Home
                    selectedTool={selectedTool} 
                    userCredits={userCredits}
                    onCreditsUpdate={updateCredits}
                    userPlan={userPlan}
                  />
                )}
              </ErrorBoundary>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;

