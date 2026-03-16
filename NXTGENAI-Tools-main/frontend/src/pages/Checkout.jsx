import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/PaymentForm';
import { getPlanById } from '../config/plansConfig';

// Initialize Stripe (Replace with your actual publishable key)
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

const Checkout = () => {
  const location = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null);
  
  // Get plan info from navigation state
  const selectedPlan = location.state?.plan || getPlanById('premium');
  const planId = location.state?.planId || 'premium';
  
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        items: [{ id: planId }],
        amount: selectedPlan.price * 100 // Amount in cents
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => setError("Failed to initialize payment. Please try again."));
  }, [planId, selectedPlan.price]);

  const appearance = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center mb-8">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Complete your Upgrade
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Upgrade to {selectedPlan.name} for ${selectedPlan.price}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
          )}
          
          {clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <PaymentForm />
            </Elements>
          ) : (
            !error && <div className="text-center">Loading payment details...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
