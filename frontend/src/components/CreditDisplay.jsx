/**
 * CreditDisplay Component
 * Shows user's current credits and plan information
 */

import React from 'react';
import { Coins, Zap, TrendingUp } from 'lucide-react';
import { getPlanById } from '../config/plansConfig';

const CreditDisplay = ({ credits, plan, onUpgradeClick }) => {
  const planInfo = getPlanById(plan);
  
  // Check if loading (null credits)
  const isLoading = credits === null;
  
  // Check if unlimited (for premium plans)
  const isUnlimited = credits === 'unlimited' || credits === '∞';
  
  // Determine credit level for color coding
  const getCreditStatus = () => {
    if (isLoading) return 'high'; // Default while loading
    if (isUnlimited) return 'unlimited';
    if (credits <= 0) return 'empty';
    if (credits <= 5) return 'low';
    if (credits <= 10) return 'medium';
    return 'high';
  };

  const creditStatus = getCreditStatus();

  const statusColors = {
    unlimited: 'bg-purple-50 border-purple-200 text-purple-700',
    empty: 'bg-red-50 border-red-200 text-red-700',
    low: 'bg-orange-50 border-orange-200 text-orange-700',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    high: 'bg-green-50 border-green-200 text-green-700'
  };

  const badgeColors = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-gray-900">Your Credits</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColors[planInfo.color]}`}>
          {planInfo.name}
        </span>
      </div>

      <div className={`flex items-baseline justify-between p-4 rounded-lg border ${statusColors[creditStatus]}`}>
        <div>
          <div className="text-3xl font-bold">
            {isLoading ? (
              <div className="animate-pulse bg-gray-300 h-10 w-16 rounded"></div>
            ) : isUnlimited ? '∞' : credits}
          </div>
          <div className="text-sm mt-1">
            {isLoading ? 'Loading...' : isUnlimited ? 'Unlimited credits' : 'Credits remaining'}
          </div>
        </div>
        <Zap className="w-8 h-8 opacity-50" />
      </div>

      {!isLoading && !isUnlimited && credits <= 5 && plan === 'free' && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">Running low on credits?</p>
              <p className="text-xs text-blue-700 mt-1">Upgrade to get more credits!</p>
              <button
                onClick={onUpgradeClick}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                View Plans →
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !isUnlimited && credits === 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm text-red-900 font-semibold">No credits remaining!</p>
          <button
            onClick={onUpgradeClick}
            className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;
