import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Check, AlertCircle, Crown, Zap, Infinity, Gift } from 'lucide-react';

const LicenseModal = ({ isOpen, onClose, user, onLicenseUpdate }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userLicenses, setUserLicenses] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserLicenses();
      fetchLicenseTypes();
    }
  }, [isOpen, user]);

  const fetchUserLicenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/user-licenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserLicenses(data.licenses || []);
      }
    } catch (err) {
      console.error('Failed to fetch user licenses:', err);
    }
  };

  const fetchLicenseTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/license-types');
      if (response.ok) {
        const data = await response.json();
        setLicenseTypes(data.licenseTypes || []);
      }
    } catch (err) {
      console.error('Failed to fetch license types:', err);
    }
  };

  const handleActivateLicense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/activate-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ licenseKey })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'License activation failed');
      }

      setSuccess('License activated successfully!');
      setLicenseKey('');
      fetchUserLicenses();
      onLicenseUpdate && onLicenseUpdate(data.license);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseIcon = (type) => {
    switch (type) {
      case 'Free': return <Gift className="text-gray-400" size={20} />;
      case 'Basic': return <Key className="text-blue-400" size={20} />;
      case 'Pro': return <Crown className="text-purple-400" size={20} />;
      case 'Unlimited': return <Infinity className="text-gold-400" size={20} />;
      default: return <Key className="text-gray-400" size={20} />;
    }
  };

  const getLicenseColor = (type) => {
    switch (type) {
      case 'Free': return 'from-gray-600 to-gray-700';
      case 'Basic': return 'from-blue-600 to-blue-700';
      case 'Pro': return 'from-purple-600 to-purple-700';
      case 'Unlimited': return 'from-yellow-600 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
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
                <h2 className="text-2xl font-bold text-white mb-2">
                  License Management
                </h2>
                <p className="text-white/70">
                  Activate new licenses or manage your existing ones
                </p>
              </motion.div>
            </div>

            {/* License Activation Form */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Key size={20} />
                Activate License Key
              </h3>
              
              <form onSubmit={handleActivateLicense} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your license key (e.g., FL-XXXX-XXXX-XXXX-XXXX)"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all font-mono"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm flex items-center gap-2"
                  >
                    <Check size={16} />
                    {success}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || !licenseKey.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap size={20} />
                      Activate License
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Current Licenses */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Your Licenses
              </h3>
              
              {userLicenses.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <Key size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No licenses found. Activate your first license above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userLicenses.map((license, index) => (
                    <motion.div
                      key={license.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 bg-gradient-to-r ${getLicenseColor(license.type)} rounded-xl border border-white/20`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getLicenseIcon(license.type)}
                          <div>
                            <h4 className="font-semibold text-white">{license.type} License</h4>
                            <p className="text-white/70 text-sm font-mono">{license.key}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            license.status === 'active' 
                              ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                              : license.status === 'expired'
                              ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                          }`}>
                            {license.status.toUpperCase()}
                          </div>
                          {license.expiresAt && (
                            <p className="text-white/50 text-xs mt-1">
                              Expires: {formatDate(license.expiresAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {license.features && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                            <div>Downloads/day: {license.features.maxDownloadsPerDay}</div>
                            <div>Max quality: {license.features.maxQuality}</div>
                            <div>Batch downloads: {license.features.batchDownloads ? 'Yes' : 'No'}</div>
                            <div>Priority support: {license.features.prioritySupport ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Available License Types */}
            {licenseTypes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Available License Types
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {licenseTypes.map((type, index) => (
                    <motion.div
                      key={type.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getLicenseIcon(type.name)}
                        <h4 className="font-semibold text-white">{type.name}</h4>
                        <span className="text-white/70 text-sm">${type.price}</span>
                      </div>
                      <ul className="text-sm text-white/60 space-y-1">
                        <li>• {type.features.maxDownloadsPerDay} downloads/day</li>
                        <li>• Max quality: {type.features.maxQuality}</li>
                        <li>• Batch downloads: {type.features.batchDownloads ? 'Yes' : 'No'}</li>
                        <li>• Priority support: {type.features.prioritySupport ? 'Yes' : 'No'}</li>
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LicenseModal;