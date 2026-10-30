import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight, ShieldCheck, Mail, Lock, UserCheck } from 'lucide-react';
import { TEST_USER } from '../../data/testUserData.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
  onLoginAsTestUser?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode = 'signin',
  onLoginAsTestUser,
}: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onLoginAsTestUser) onLoginAsTestUser();
    }, 1200);
  };

  const handleTestUserLogin = () => {
    setEmail(TEST_USER.email);
    setPassword('••••••••••••');
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onLoginAsTestUser) onLoginAsTestUser();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 z-10 p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo & Headline */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg mx-auto">
              C
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {currentMode === 'signup' ? 'Start your free trial' : 'Sign in to ClauseCite'}
            </h3>
            <p className="text-xs text-gray-500">
              Personal Legal AI Assistant & Automated Contract Redline Suite
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl shadow-md">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">
                Signing in as {TEST_USER.name}
              </h4>
              <p className="text-xs text-gray-500">Launching your workspace...</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Option to sign in with Test User Account */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTestUserLogin}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs">Sign in as Test User</span>
                    </div>
                    <p className="text-[10px] text-blue-100">Pre-configured counsel account with full workspace</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Or with email</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Standard Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Work or Personal Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <span>{currentMode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Mode switch */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentMode(currentMode === 'signup' ? 'signin' : 'signup')}
                  className="text-xs text-gray-500 hover:text-black font-semibold transition cursor-pointer"
                >
                  {currentMode === 'signup'
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up for free"}
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL
                </span>
                <span>·</span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
