import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: 'What is ClauseCite?',
      a: 'ClauseCite is an advanced legal artificial intelligence platform providing instant legal analysis, document generation, agreement comparison, and simplified legal explanations for consumers, law students, solo lawyers, and legal teams worldwide.',
    },
    {
      q: 'Who is your platform for?',
      a: 'It is built for anyone in need of fast, clear legal insights: individuals reviewing contracts, entrepreneurs launching companies, students analyzing case law, and law practices wanting to automate document review.',
    },
    {
      q: 'What countries/languages does it work for?',
      a: 'ClauseCite supports jurisdiction-aware analysis across the US (all 50 states and federal circuits), UK, Canada, Australia, EU nations, and over 100+ languages globally with local statutory citations.',
    },
    {
      q: 'How to start using ClauseCite?',
      a: 'Simply click "Try for Free", sign up in seconds with your email or Google account, and start chatting or uploading legal files immediately. No credit card required for standard trials.',
    },
    {
      q: 'How to get "Students & teachers" discount?',
      a: 'Register with an active .edu or academic institution email address to automatically unlock special student and faculty pricing tiers with 50% discount on pro memberships.',
    },
    {
      q: 'Can I receive a refund if I am not satisfied?',
      a: 'Yes, we offer an unconditional money-back guarantee within the initial trial period if our tools do not satisfy your expectations.',
    },
  ];

  const filteredFaqs = searchQuery.trim()
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" id="faq">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FAQ Title Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-2">
            <i className="fa-regular fa-circle-question text-xs"></i> FAQ
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Have a question?
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Browse through our frequently asked topics or reach out to our team anytime.
          </p>

          {/* Search Filter input */}
          <div className="pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. pricing, refund, states)..."
                className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion List with Outcrowd Smooth Height Expansion */}
        <div className="lg:col-span-7 space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.q}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-gray-900 cursor-pointer text-base sm:text-lg select-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100/60">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
