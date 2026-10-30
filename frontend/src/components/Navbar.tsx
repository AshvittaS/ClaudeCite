import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenChat: () => void;
  onOpenDashboard?: () => void;
}

export default function Navbar({ onOpenAuth, onOpenChat, onOpenDashboard }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Templates', href: '#templates' },
    { label: 'Tools', href: '#features' },
    { label: 'Users', href: '#users' },
    { label: 'Advantages', href: '#advantages' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Blog', href: '#blog' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-gray-200/80 shadow-xs py-3.5'
          : 'bg-white/60 backdrop-blur-md border-b border-gray-100 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-10">
          {/* Logo with Outcrowd spring hover */}
          <motion.a
            href="#"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 group whitespace-nowrap shrink-0"
            data-cursor="Cite"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <span className="text-white font-black text-lg tracking-tighter">C</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-black transition-colors">
              Clause<span className="text-gray-400 font-semibold">Cite</span>
            </span>
          </motion.a>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-black transition-colors relative py-1 text-sm whitespace-nowrap shrink-0 group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0066FF] transition-all duration-200 group-hover:w-full rounded-full" />
              </a>
            ))}
          </nav>
        </div>

        {/* Right: Clean Action Buttons */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-full transition whitespace-nowrap cursor-pointer"
            >
              Open Workspace
            </button>
          )}

          <button
            onClick={() => onOpenAuth('signin')}
            className="text-sm font-semibold text-gray-700 hover:text-black px-3.5 py-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            Sign in
          </button>

          <motion.button
            onClick={() => onOpenAuth('signup')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group relative inline-flex items-center gap-2 text-sm font-bold text-white bg-black hover:bg-gray-800 px-5 py-2.5 rounded-full transition shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
            data-cursor="Join"
          >
            <span>Try for free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => onOpenAuth('signup')}
            className="text-xs font-bold text-white bg-black px-3.5 py-1.5 rounded-full"
          >
            Try free
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-black focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg px-6 py-4 space-y-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-1"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {onOpenDashboard && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full text-center py-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  Open Workspace →
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signin');
                }}
                className="w-full text-center py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signup');
                }}
                className="w-full text-center py-2 text-sm font-bold text-white bg-[#0066FF] rounded-xl shadow-md"
              >
                Try ClauseCite Free →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
