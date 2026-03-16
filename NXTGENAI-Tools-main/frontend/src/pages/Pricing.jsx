/**
 * Pricing Page Component
 * Shows all available subscription plans with upgrade options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { getAllPlans, getPlanById } from '../config/plansConfig';
import { getPlans } from '../api/payments';

const Pricing = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [currentCredits, setCurrentCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const plans = getAllPlans();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const plans = await getPlans();
      const currentPlanData = plans.find(p => p.is_current);
      
      if (currentPlanData) {
        setCurrentPlan(currentPlanData.plan || 'free');
        
        if (currentPlanData.plan === 'premium') {
          setCurrentCredits('unlimited');
        } else {
          const remaining = currentPlanData.usage_limit - (currentPlanData.usage_count || 0);
          setCurrentCredits(remaining);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId) => {
    if (planId === 'free') {
      alert('You are already on the free plan!');
      return;
    }

    // Navigate to checkout with selected plan
    navigate('/checkout', { 
      state: { 
        planId,
        plan: getPlanById(planId)
      } 
    });
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free':
        return <Zap className="w-8 h-8" />;
      case 'medium':
        return <Star className="w-8 h-8" />;
      case 'premium':
        return <Crown className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  const getButtonText = (planId) => {
    if (currentPlan === planId) {
      return 'Current Plan';
    }
    if (planId === 'free') {
      return 'Free Plan';
    }
    return 'Upgrade Now';
  };

  const isCurrentPlan = (planId) => currentPlan === planId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No subscriptions, pay once and use forever.
          </p>
          
          {/* Current Status */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm">
                {currentCredits === 'unlimited' ? '∞' : currentCredits} Credits
              </span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-xs text-gray-600">
              Current Plan: <span className="font-bold text-purple-600">{getPlanById(currentPlan).name}</span>
            </div>
          </div>
        </div>

        {/* Plans Grid - Only 2 Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? 'ring-2 ring-purple-500 md:scale-105' : 'ring-1 ring-gray-200'
              } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 text-xs font-bold rounded-bl-xl shadow-lg">
                  POPULAR
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan(plan.id) && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 text-xs font-bold rounded-br-xl shadow-lg">
                  ACTIVE
                </div>
              )}

              <div className="p-6">
                {/* Icon */}
                <div className={`inline-flex p-2.5 rounded-xl mb-4 shadow-md ${
                  plan.id === 'free' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' :
                  'bg-gradient-to-br from-purple-100 to-pink-200 text-purple-600'
                }`}>
                  {getPlanIcon(plan.id)}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-5">
                  {plan.price === 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-gray-900">$0</span>
                      <span className="text-gray-500 text-sm">forever</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${plan.price}</span>
                      <span className="text-gray-500 text-sm">one-time</span>
                    </div>
                  )}
                </div>

                {/* Credits - More Prominent */}
                <div className={`mb-5 p-4 rounded-xl shadow-inner ${
                  plan.id === 'free' 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200' 
                    : 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200'
                }`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Zap className={`w-5 h-5 ${plan.id === 'free' ? 'text-blue-600' : 'text-purple-600'}`} />
                      <span className="text-3xl font-extrabold text-gray-900">{plan.credits}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600">AI Generation Credits</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className={`p-0.5 rounded-full mt-0.5 ${
                        plan.id === 'free' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <Check className={`w-3.5 h-3.5 ${plan.id === 'free' ? 'text-blue-600' : 'text-purple-600'}`} />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan(plan.id)}
                  className={`w-full py-3 px-5 rounded-lg font-bold text-base transition-all duration-200 shadow-md ${
                    isCurrentPlan(plan.id)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                      : plan.id === 'free'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
                  }`}
                >
                  {getButtonText(plan.id)}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-10 text-center space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Why Choose Us?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">🚀</div>
                <h4 className="font-bold text-gray-900 text-sm mb-0.5">Fast & Reliable</h4>
                <p className="text-xs text-gray-600">Lightning-fast AI generation</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🔒</div>
                <h4 className="font-bold text-gray-900 text-sm mb-0.5">Secure & Private</h4>
                <p className="text-xs text-gray-600">Your data is always protected</p>
              </div>
              <div>
                <div className="text-2xl mb-1">💎</div>
                <h4 className="font-bold text-gray-900 text-sm mb-0.5">No Subscription</h4>
                <p className="text-xs text-gray-600">Pay once, use forever</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
