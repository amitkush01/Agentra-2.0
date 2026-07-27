'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function LoginModal({ isOpen, onClose, isDarkMode }: LoginModalProps) {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'admin'>('user'); // User Panel vs Admin/Employee Panel
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login, signup } = useAuth();

  const textClass = isDarkMode ? 'text-white' : 'text-slate-900';

  const validateForm = () => {
    if (loginMethod === 'phone') {
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        setError('Please enter a valid 10-digit mobile phone number');
        return false;
      }
      if (otpSent && (!otpCode.trim() || otpCode.length < 4)) {
        setError('Please enter the 4-digit OTP sent to your phone');
        return false;
      }
      return true;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        setError('Name is required');
        return false;
      }
      
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return false;
      }
    }
    
    return true;
  };

  const handleSendOtp = () => {
    setError('');
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setInfoMessage('OTP sent! Use test code: 1234');
    }, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (loginMethod === 'phone') {
        if (!otpSent) {
          handleSendOtp();
          return;
        }
        // OTP login simulation
        if (otpCode === '1234') {
          onClose();
          resetForm();
          router.push(role === 'admin' ? '/admin' : '/profile');
        } else {
          setError('Invalid OTP code. Use test code 1234');
        }
        setLoading(false);
        return;
      }

      let result;
      
      if (isSignUp) {
        result = await signup(
          formData.name.trim(), 
          formData.email.trim(), 
          formData.password, 
          formData.company.trim() || undefined
        );
      } else {
        result = await login(formData.email, formData.password);
      }
      
      if (result.success) {
        onClose();
        resetForm();
        if (role === 'admin' || formData.email === 'admin@agentra.ai') {
          router.push('/admin');
        } else {
          router.push('/profile');
        }
      } else {
        const errorMessage = result.error || `${isSignUp ? 'Signup' : 'Login'} failed`;
        const details = (result as any)?.details ? ` (${(result as any).details})` : '';
        setError(errorMessage + details);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'Gmail / Google' | 'LinkedIn') => {
    setError('');
    setInfoMessage(`Signing in with ${provider}... Redirecting to ${role === 'admin' ? 'Admin Panel' : 'User Panel'}`);
    setTimeout(() => {
      onClose();
      resetForm();
      router.push(role === 'admin' ? '/admin' : '/profile');
    }, 150);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: ''
    });
    setPhoneNumber('');
    setOtpCode('');
    setOtpSent(false);
    setError('');
    setInfoMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`${
              isDarkMode 
                ? 'bg-slate-900/95 border-yellow-500/40 shadow-[0_0_80px_rgba(245,158,11,0.25)]' 
                : 'bg-white/95 border-slate-200 shadow-2xl'
            } backdrop-blur-3xl rounded-3xl max-w-xl sm:max-w-2xl w-full overflow-hidden border-2 my-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/30">
                  🤖
                </div>
                <div>
                  <h1 className={`text-2xl font-black ${textClass}`}>Agentra AI Access Portal</h1>
                  <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Authentication & Access Hub</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold transition ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Portal Switch (User Panel vs Admin Panel) */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setRole('user');
                    setError('');
                  }}
                  className={`py-3 px-4 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 ${
                    role === 'user'
                      ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg">👤</span> User Panel Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('admin');
                    setError('');
                    setFormData(prev => ({
                      ...prev,
                      email: prev.email || 'admin@agentra.ai'
                    }));
                  }}
                  className={`py-3 px-4 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 ${
                    role === 'admin'
                      ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg">⚡</span> Admin / Employee
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 sm:p-10 space-y-6">
              {/* Social Login Buttons (Google & LinkedIn) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin('Gmail / Google')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border font-bold text-sm transition shadow-sm ${
                    isDarkMode ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-750 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Gmail / Google
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin('LinkedIn')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border font-bold text-sm transition shadow-sm ${
                    isDarkMode ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-750 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </motion.button>
              </div>

              {/* Login Method Toggle (Email vs Mobile Phone) */}
              <div className="flex border-b border-slate-800 pb-3 justify-center space-x-8 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setError('');
                  }}
                  className={`${loginMethod === 'email' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400'} pb-1 transition`}
                >
                  ✉️ Email Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    setError('');
                  }}
                  className={`${loginMethod === 'phone' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400'} pb-1 transition`}
                >
                  📱 Phone Number Login
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {loginMethod === 'phone' ? (
                  <>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${textClass}`}>Mobile Phone Number</label>
                      <div className="flex gap-3">
                        <span className="px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-sm text-slate-300 flex items-center font-black">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className={`flex-1 px-5 py-3.5 rounded-2xl border text-base transition ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900'
                          } outline-none`}
                          placeholder="9876543210"
                          required
                        />
                      </div>
                    </div>

                    {otpSent && (
                      <div>
                        <label className={`block text-sm font-bold mb-2 ${textClass}`}>Enter 4-Digit OTP Code</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className={`w-full px-5 py-3.5 rounded-2xl border text-lg font-black text-center tracking-widest transition ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900'
                          } outline-none`}
                          placeholder="1234"
                          required
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {isSignUp && role === 'user' && (
                      <div>
                        <label className={`block text-sm font-bold mb-2 ${textClass}`}>Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className={`w-full px-5 py-3.5 rounded-2xl border text-base transition ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900'
                          } outline-none`}
                          placeholder="Enter your full name"
                          required={isSignUp}
                        />
                      </div>
                    )}

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${textClass}`}>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full px-5 py-3.5 rounded-2xl border text-base transition ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900'
                        } outline-none`}
                        placeholder={role === 'admin' ? "admin@agentra.ai" : "Enter your email"}
                        required
                      />
                    </div>

                    {isSignUp && role === 'user' && (
                      <div>
                        <label className={`block text-sm font-bold mb-2 ${textClass}`}>Company (Optional)</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className={`w-full px-5 py-3.5 rounded-2xl border text-base transition ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900'
                          } outline-none`}
                          placeholder="Enter your company name"
                        />
                      </div>
                    )}

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${textClass}`}>Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className={`w-full px-5 py-3.5 pr-12 rounded-2xl border text-base transition ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900'
                          } outline-none`}
                          placeholder="Enter password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {isSignUp && role === 'user' && (
                      <div>
                        <label className={`block text-sm font-bold mb-2 ${textClass}`}>Confirm Password</label>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className={`w-full px-5 py-3.5 rounded-2xl border text-base transition ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-yellow-500' : 'bg-white border-slate-300 text-slate-900'
                          } outline-none`}
                          placeholder="Confirm password"
                          required={isSignUp}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Quick Hint for Admin Panel */}
                {role === 'admin' && (
                  <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-semibold">
                    ⚡ Admin Hint: <b>admin@agentra.ai</b> / <b>admin123</b>
                  </div>
                )}

                {/* Messages */}
                {infoMessage && (
                  <div className="p-3.5 rounded-2xl bg-green-950/60 border border-green-500/50 text-green-300 text-xs font-semibold">
                    {infoMessage}
                  </div>
                )}

                {error && (
                  <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-black py-4 px-6 rounded-2xl text-slate-950 text-base transition shadow-xl cursor-pointer ${
                    role === 'admin'
                      ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white shadow-red-500/30'
                      : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 shadow-orange-500/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading
                    ? 'Authenticating...'
                    : loginMethod === 'phone'
                    ? otpSent
                      ? 'Verify OTP & Login 📱'
                      : 'Send OTP Code 📱'
                    : role === 'admin'
                    ? 'Login to Admin Panel ⚡'
                    : isSignUp
                    ? 'Create User Account 🚀'
                    : 'Login to User Panel 👤'}
                </motion.button>
              </form>

              {/* Toggle Signup for User */}
              {role === 'user' && loginMethod === 'email' && (
                <p className="text-center mt-4 text-xs text-slate-400">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-yellow-400 font-black hover:underline ml-1"
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}