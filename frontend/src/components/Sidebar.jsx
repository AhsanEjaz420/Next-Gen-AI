import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, ChevronLeft, Menu, Crown, Zap, Sparkles, Bot } from 'lucide-react';
import { TOOLS_CONFIG } from '../config/toolsConfig';

const Sidebar = ({ selectedTool, onSelectTool, isMobileOpen, onCloseMobile, userPlanName = 'Free', userCredits = 0, userPlan = 'free' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('free'); // 'free', 'premium', 'agents'
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const prevSelectedToolRef = useRef(selectedTool);
  const isInitialMount = useRef(true);

  // Auto-close sidebar on mobile when tool is selected (only when tool actually changes)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevSelectedToolRef.current = selectedTool;
      return;
    }

    // Only close if tool actually changed and we're on mobile with sidebar open
    if (window.innerWidth < 1024 && isMobileOpen && prevSelectedToolRef.current !== selectedTool) {
      // Tool was selected, close sidebar after a brief delay
      const timer = setTimeout(() => {
        onCloseMobile();
      }, 200);
      prevSelectedToolRef.current = selectedTool;
      return () => clearTimeout(timer);
    }
    
    prevSelectedToolRef.current = selectedTool;
  }, [selectedTool, isMobileOpen, onCloseMobile]);

  // Get categorized tools (excluding history, settings, and insights from the tabs)
  const freeTools = Object.values(TOOLS_CONFIG).filter(tool => !tool.isPremium && !['history', 'settings', 'insights'].includes(tool.id));
  const premiumTools = Object.values(TOOLS_CONFIG).filter(tool => tool.isPremium && !['history', 'settings', 'insights'].includes(tool.id));

  // Dummy AI Agents
  const aiAgents = [
    { id: 'agent-1', title: 'Content Strategy Agent', icon: Sparkles, description: 'Coming soon' },
    { id: 'agent-2', title: 'SEO Agent', icon: Sparkles, description: 'Coming soon' },
    { id: 'agent-3', title: 'Social Analytics Agent', icon: Sparkles, description: 'Coming soon' },
  ];

  // Handle tool selection with access check
  const handleToolClick = (toolId, isPremium = false) => {
    if (isPremium && userPlan === 'free') {
      setShowUpgradePopup(true);
      return;
    }
    onSelectTool(toolId);
    onCloseMobile();
  };

  // Render tools based on active tab
  const renderToolsList = () => {
    let tools = [];
    
    if (activeTab === 'free') {
      tools = freeTools;
    } else if (activeTab === 'premium') {
      tools = premiumTools;
    } else if (activeTab === 'agents') {
      return aiAgents.map((agent) => (
        <div
          key={agent.id}
          className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-dashed border-slate-300 bg-slate-50 opacity-60"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="inline-flex items-center justify-center rounded-lg bg-blue-100 p-1.5 sm:p-2 text-blue-600 flex-shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs sm:text-sm text-slate-900">
                  {agent.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-1 mt-0.5">
                  {agent.description}
                </p>
              </div>
            )}
          </div>
        </div>
      ));
    }

    return tools.map((tool) => {
      const Icon = tool.icon;
      const isActive = selectedTool === tool.id;
      const isPremiumTool = tool.isPremium === true;
      const hasAccess = !isPremiumTool || userPlan === 'premium';

      return (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id, isPremiumTool)}
          className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-xs sm:text-sm transition-all touch-manipulation relative
            ${
              isActive
                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                : hasAccess
                ? 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 active:bg-slate-100'
                : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
            }`}
          disabled={!hasAccess}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div
              className={`inline-flex items-center justify-center rounded-lg p-1.5 sm:p-2 flex-shrink-0
              ${isActive ? 'bg-indigo-600 text-white' : isPremiumTool ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}
            `}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3
                    className={`font-medium mb-0.5 text-xs sm:text-sm ${
                      isActive ? 'text-slate-900' : 'text-slate-800'
                    }`}
                  >
                    {tool.title}
                  </h3>
                  {isPremiumTool && (
                    <Crown className="w-3 h-3 text-purple-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2">
                  {tool.description}
                </p>
                {isPremiumTool && userPlan !== 'premium' && (
                  <p className="text-[10px] text-purple-600 font-medium mt-1">
                    Premium Only
                  </p>
                )}
              </div>
            )}
          </div>
        </button>
      );
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar - fixed on mobile (no space), sticky on desktop */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200
          flex flex-col z-50 transition-all duration-300 ease-in-out
          w-72 ${collapsed ? 'lg:w-20' : 'lg:w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="inline-flex items-center justify-center bg-indigo-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white shadow-sm flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div
                className={`transition-all duration-200 origin-left min-w-0 ${
                  collapsed ? 'lg:opacity-0 lg:scale-95 lg:w-0 lg:hidden' : 'opacity-100'
                }`}
              >
                <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">NXTGENAI Tools</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">AI content toolkit</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCloseMobile}
                className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tools Navigation with Tabs */}
        <nav className="flex-1 overflow-y-auto p-2 sm:p-3 flex flex-col">
          {/* Tab Navigation */}
          {!collapsed && (
            <div className="flex gap-1 mb-3 rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab('free')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-[10px] sm:text-xs font-semibold transition-all ${
                  activeTab === 'free'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Free Tools"
              >
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">Free</span>
              </button>
              <button
                onClick={() => setActiveTab('premium')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-[10px] sm:text-xs font-semibold transition-all ${
                  activeTab === 'premium'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Premium Tools"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Premium</span>
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-[10px] sm:text-xs font-semibold transition-all ${
                  activeTab === 'agents'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="AI Agents"
              >
                <Bot className="w-3 h-3" />
                <span className="hidden sm:inline">Agents</span>
              </button>
            </div>
          )}

          {/* Tools List */}
          <div className="space-y-1.5 sm:space-y-2">
            {/* History Link (Top level, always visible) */}
            <button
              onClick={() => handleToolClick('history')}
              className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-xs sm:text-sm transition-all touch-manipulation relative mb-1.5
                ${
                  selectedTool === 'history'
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`inline-flex items-center justify-center rounded-lg p-1.5 sm:p-2 flex-shrink-0 ${selectedTool === 'history' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <TOOLS_CONFIG.history.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium mb-0.5 text-xs sm:text-sm ${selectedTool === 'history' ? 'text-slate-900' : 'text-slate-800'}`}>
                      {TOOLS_CONFIG.history.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-1">
                      {TOOLS_CONFIG.history.description}
                    </p>
                  </div>
                )}
              </div>
            </button>

            {/* Settings Link */}
            <button
              onClick={() => handleToolClick('settings')}
              className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-xs sm:text-sm transition-all touch-manipulation relative mb-1.5
                ${
                  selectedTool === 'settings'
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`inline-flex items-center justify-center rounded-lg p-1.5 sm:p-2 flex-shrink-0 ${selectedTool === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <TOOLS_CONFIG.settings.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium mb-0.5 text-xs sm:text-sm ${selectedTool === 'settings' ? 'text-slate-900' : 'text-slate-800'}`}>
                      {TOOLS_CONFIG.settings.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-1">
                      {TOOLS_CONFIG.settings.description}
                    </p>
                  </div>
                )}
              </div>
            </button>

            {/* Insights Link */}
            <button
              onClick={() => handleToolClick('insights')}
              className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-xs sm:text-sm transition-all touch-manipulation relative mb-2
                ${
                  selectedTool === 'insights'
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`inline-flex items-center justify-center rounded-lg p-1.5 sm:p-2 flex-shrink-0 ${selectedTool === 'insights' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <TOOLS_CONFIG.insights.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium mb-0.5 text-xs sm:text-sm ${selectedTool === 'insights' ? 'text-slate-900' : 'text-slate-800'}`}>
                      {TOOLS_CONFIG.insights.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-1">
                      {TOOLS_CONFIG.insights.description}
                    </p>
                  </div>
                )}
              </div>
            </button>

            {renderToolsList()}
          </div>
        </nav>

        {/* Footer (only when expanded on desktop or always on mobile) */}
        {!collapsed && (
          <div className="p-3 sm:p-4 border-t border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-slate-900 text-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg shadow-black/20">
              <div className="min-w-0">
                <h2 className="text-[10px] sm:text-xs font-semibold">{userPlanName}</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-200 line-clamp-1">
                  {userCredits} Credits Remaining.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop collapse toggle - floating on the edge near the top */}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-16 h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Floating promo pill when collapsed on desktop - above sidebar */}
      {collapsed && (
        <div className="hidden lg:flex fixed bottom-5 left-5 z-[60]">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900 text-slate-50 px-4 py-3 shadow-lg shadow-black/20">
            <div>
              <h4 className="text-xs font-semibold">{userPlanName}</h4>
              <p className="text-[11px] text-slate-200">
                {userCredits} Credits Remaining.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Popup Modal */}
      {showUpgradePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Unlock Premium Tools</h2>
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="inline-flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Upgrade to Premium</h3>
                <p className="text-sm text-slate-600">
                  This tool is only available for premium members. Upgrade now to unlock unlimited access.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">Premium Benefits:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>Access to all premium tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>Unlimited AI Agents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>Advanced customization options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 space-y-3">
              <button
                onClick={() => {
                  window.location.href = '/pricing';
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                <Zap className="w-4 h-4" />
                Upgrade Now
              </button>
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
