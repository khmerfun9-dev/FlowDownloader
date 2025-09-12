import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, DollarSign, Check, AlertCircle, Crown, Zap, Infinity, Gift, ShoppingCart } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, user, onPaymentSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLicenseTypes();
    }
  }, [isOpen]);

  const fetchLicenseTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/license-types');
      if (response.ok) {
        const data = await response.json();
        setLicenseTypes(data.licenseTypes.filter(type => type.name !== 'Free') || []);
      }
    } catch (err) {
      console.error('Failed to fetch license types:', err);
    }
  };

  const handleStripePayment = async () => {
    setProcessingPayment(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Create payment intent
      const response = await fetch('http://localhost:3001/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          licenseType: selectedPlan.name,
          amount: selectedPlan.price * 100 // Convert to cents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // In a real implementation, you would use Stripe Elements here
      // For demo purposes, we'll simulate a successful payment
      setTimeout(async () => {
        try {
          // Confirm payment
          const confirmResponse = await fetch('http://localhost:3001/api/payments/stripe/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              paymentIntentId: data.paymentIntent.id,
              licenseType: selectedPlan.name
            })
          });

          const confirmData = await confirmResponse.json();

          if (!confirmResponse.ok) {
            throw new Error(confirmData.error || 'Payment confirmation failed');
          }

          onPaymentSuccess && onPaymentSuccess(confirmData.license);
          onClose();
        } catch (err) {
          setError(err.message);
        } finally {
          setProcessingPayment(false);
        }
      }, 2000);

    } catch (err) {
      setError(err.message);
      setProcessingPayment(false);
    }
  };

  const handlePayPalPayment = async () => {
    setProcessingPayment(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Create PayPal payment
      const response = await fetch('http://localhost:3001/api/payments/paypal/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          licenseType: selectedPlan.name,
          amount: selectedPlan.price
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PayPal payment creation failed');
      }

      // In a real implementation, you would redirect to PayPal
      // For demo purposes, we'll simulate a successful payment
      setTimeout(async () => {
        try {
          // Execute payment
          const executeResponse = await fetch('http://localhost:3001/api/payments/paypal/execute-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              paymentId: data.payment.id,
              payerId: 'demo-payer-id', // In real implementation, this comes from PayPal
              licenseType: selectedPlan.name
            })
          });

          const executeData = await executeResponse.json();

          if (!executeResponse.ok) {
            throw new Error(executeData.error || 'PayPal payment execution failed');
          }

          onPaymentSuccess && onPaymentSuccess(executeData.license);
          onClose();
        } catch (err) {
          setError(err.message);
        } finally {
          setProcessingPayment(false);
        }
      }, 2000);

    } catch (err) {
      setError(err.message);
      setProcessingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    
    if (paymentMethod === 'stripe') {
      await handleStripePayment();
    } else {
      await handlePayPalPayment();
    }
    
    setLoading(false);
  };

  const getLicenseIcon = (type) => {
    switch (type) {
      case 'Basic': return <Zap className="text-blue-400" size={24} />;
      case 'Pro': return <Crown className="text-purple-400" size={24} />;
      case 'Unlimited': return <Infinity className="text-yellow-400" size={24} />;
      default: return <Gift className="text-gray-400" size={24} />;
    }
  };

  const getLicenseColor = (type) => {
    switch (type) {
      case 'Basic': return 'from-blue-600 to-blue-700';
      case 'Pro': return 'from-purple-600 to-purple-700';
      case 'Unlimited': return 'from-yellow-600 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getPopularBadge = (type) => {
    return type === 'Pro' ? (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      </div>
    ) : null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  Choose Your Plan
                </h2>
                <p className="text-white/70">
                  Unlock premium features and boost your download experience
                </p>
              </motion.div>
            </div>

            {/* License Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {licenseTypes.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedPlan?.name === plan.name
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {getPopularBadge(plan.name)}
                  
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {getLicenseIcon(plan.name)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                      ${plan.price}
                      <span className="text-lg text-white/60 font-normal">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-white/80">
                      <Check size={16} className="text-green-400" />
                      <span>{plan.features.maxDownloadsPerDay} downloads/day</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/80">
                      <Check size={16} className="text-green-400" />
                      <span>Max quality: {plan.features.maxQuality}</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/80">
                      <Check size={16} className="text-green-400" />
                      <span>Batch downloads: {plan.features.batchDownloads ? 'Yes' : 'No'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/80">
                      <Check size={16} className="text-green-400" />
                      <span>Priority support: {plan.features.prioritySupport ? 'Yes' : 'No'}</span>
                    </li>
                  </ul>

                  {selectedPlan?.name === plan.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Check size={16} className="text-white" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Payment Method Selection */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Choose Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <CreditCard size={24} className="text-white" />
                    <span className="text-white font-semibold">Credit Card (Stripe)</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                      paymentMethod === 'paypal'
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <DollarSign size={24} className="text-white" />
                    <span className="text-white font-semibold">PayPal</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm flex items-center gap-2"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Payment Processing */}
            {processingPayment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-blue-200 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  <span>Processing your payment...</span>
                </div>
                <p className="text-sm text-blue-300">Please wait while we process your transaction.</p>
              </motion.div>
            )}

            {/* Purchase Button */}
            <motion.button
              onClick={handlePayment}
              disabled={!selectedPlan || loading || processingPayment}
              whileHover={{ scale: selectedPlan && !loading && !processingPayment ? 1.02 : 1 }}
              whileTap={{ scale: selectedPlan && !loading && !processingPayment ? 0.98 : 1 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || processingPayment ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={24} />
                  {selectedPlan ? `Purchase ${selectedPlan.name} - $${selectedPlan.price}/month` : 'Select a Plan'}
                </>
              )}
            </motion.button>

            {/* Security Notice */}
            <div className="mt-6 text-center text-white/50 text-sm">
              <p>🔒 Your payment information is secure and encrypted</p>
              <p>Cancel anytime • 30-day money-back guarantee</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;