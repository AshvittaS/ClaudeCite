import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Globe } from 'lucide-react';

interface FooterProps {
  onOpenAuth: (mode: 'signup') => void;
  onOpenTemplate: (key: string) => void;
  onOpenUseCase: (key: string) => void;
}

export default function Footer({ onOpenAuth, onOpenTemplate, onOpenUseCase }: FooterProps) {
  const [currentLang, setCurrentLang] = useState('English');
  const [showLangs, setShowLangs] = useState(false);

  const languages = ['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', '日本語'];

  return (
    <>
      {/* Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#121316] text-white rounded-[2.5rem] py-20 px-8 sm:px-16 text-center relative overflow-hidden shadow-2xl border border-white/5"
        >
          {/* Outcrowd Background Radial Blur Accent */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              ClauseCite protects your rights and wallet
            </h2>

            <div className="pt-2">
              <motion.button
                onClick={() => onOpenAuth('signup')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="inline-flex items-center justify-center px-9 py-4 text-base font-bold text-white bg-[#0066FF] hover:bg-blue-600 rounded-full transition-colors shadow-xl shadow-blue-500/25 cursor-pointer"
                data-cursor="Start"
              >
                Try for Free
              </motion.button>
            </div>

            {/* Trust Checkmarks */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium pt-4">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-check text-emerald-400"></i> Money back guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-check text-emerald-400"></i> Free Trial
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-check text-emerald-400"></i> Cancel anytime
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-sm text-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-gray-200">
          {/* Col 1: Brand (spans 2 cols) */}
          <div className="col-span-2 space-y-4">
            <a aria-label="ClauseCite Home" className="flex items-center gap-2 group" href="#">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                C
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Clause<span className="text-gray-400 font-medium">Cite</span>
              </span>
            </a>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              The next-generation LegalTech platform delivering automated legal research, draft agreements, statutory citations, and consumer contract guidance instantly.
            </p>
          </div>

          {/* Col 2: Company */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>
                <a className="hover:text-black transition" href="#about">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-black transition" href="#faq">
                  Contact
                </a>
              </li>
              <li>
                <a className="hover:text-black transition" href="#blog">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Learn */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Learn</h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>
                <button onClick={() => onOpenTemplate('immigration')} className="hover:text-black transition text-left">
                  Templates
                </button>
              </li>
              <li>
                <a className="hover:text-black transition" href="#features">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-black transition" href="#faq">
                  FAQ
                </a>
              </li>
              <li>
                <button onClick={() => onOpenUseCase('caselaw')} className="hover:text-black transition text-left">
                  Case Law Research
                </button>
              </li>
              <li>
                <button onClick={() => onOpenUseCase('compliance')} className="hover:text-black transition text-left">
                  Compliance
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Terms */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Terms</h4>
            <ul className="space-y-2.5 text-xs text-gray-500">
              <li>
                <a className="hover:text-black transition" href="#terms">
                  Terms of Use
                </a>
              </li>
              <li>
                <a className="hover:text-black transition" href="#privacy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-black transition" href="#license">
                  CC BY-SA 4.0 License
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Subfooter */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 ClauseCite AI Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            {/* Social Icons with subtle hover scale */}
            <div className="flex items-center gap-4 text-gray-400">
              <a
                aria-label="X / Twitter"
                className="hover:text-black transition transform hover:scale-110"
                href="#"
              >
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a
                aria-label="YouTube"
                className="hover:text-black transition transform hover:scale-110"
                href="#"
              >
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a
                aria-label="Instagram"
                className="hover:text-black transition transform hover:scale-110"
                href="#"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                aria-label="Medium"
                className="hover:text-black transition transform hover:scale-110"
                href="#"
              >
                <i className="fa-brands fa-medium"></i>
              </a>
            </div>

            {/* Language Picker Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangs(!showLangs)}
                className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-black transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang}</span>
              </button>

              {showLangs && (
                <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 w-32 z-50">
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setCurrentLang(l);
                        setShowLangs(false);
                      }}
                      className="w-full text-left px-3 py-1 text-xs hover:bg-gray-100 font-medium text-gray-700 transition"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
