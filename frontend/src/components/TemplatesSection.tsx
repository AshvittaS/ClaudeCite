import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Download, ChevronRight } from 'lucide-react';

interface TemplatesSectionProps {
  onSelectTemplate: (templateKey: string) => void;
  onOpenDashboard?: () => void;
}

const CATEGORY_TABS = [
  { key: 'all', label: 'All Templates' },
  { key: 'financial', label: 'Financial Agreements' },
  { key: 'commercial', label: 'Commercial & General' },
];

const ALL_TEMPLATES = [
  // Financial Agreements (India - Tamil Nadu)
  {
    key: 'loan-lending',
    category: 'financial',
    badge: 'Financial Agreements',
    title: 'Loan & Lending Agreement — India',
    rating: '4.9',
    downloads: '6,212 Downloads',
    heading: 'LOAN & LENDING AGREEMENT',
    snippet: 'Compliant with Indian Contract Act § 10 & FEMA 1999. Covers disbursement, repayment & collateral...',
    jurisdiction: 'India - Tamil Nadu',
  },
  {
    key: 'promissory-note',
    category: 'financial',
    badge: 'Financial Agreements',
    title: 'Promissory Note & IOU — India',
    rating: '4.8',
    downloads: '5,890 Downloads',
    heading: 'PROMISSORY NOTE',
    snippet: 'Enforceable under NI Act, 1881. Specifies principal, interest rate, and repayment schedule...',
    jurisdiction: 'India - Tamil Nadu',
  },
  {
    key: 'payment-plan',
    category: 'financial',
    badge: 'Financial Agreements',
    title: 'Payment Plan & Instalment Agreement',
    rating: '4.7',
    downloads: '4,560 Downloads',
    heading: 'PAYMENT PLAN AGREEMENT',
    snippet: 'Structured EMI schedule, default clauses, penal interest & Tamil Nadu stamp duty compliance...',
    jurisdiction: 'India - Tamil Nadu',
  },
  {
    key: 'debt-settlement',
    category: 'financial',
    badge: 'Financial Agreements',
    title: 'Debt Settlement & Credit Agreement',
    rating: '4.8',
    downloads: '3,901 Downloads',
    heading: 'DEBT SETTLEMENT AGREEMENT',
    snippet: 'Full and final settlement clauses, discharge of debt, and no-objection certificate terms...',
    jurisdiction: 'India - Tamil Nadu',
  },
  {
    key: 'guarantee-guarantor',
    category: 'financial',
    badge: 'Financial Agreements',
    title: 'Guarantee & Guarantor Agreement',
    rating: '4.9',
    downloads: '4,211 Downloads',
    heading: 'GUARANTEE AGREEMENT',
    snippet: 'Personal or corporate guarantee with surety covenants under Indian Contract Act §§ 126–147...',
    jurisdiction: 'India - Tamil Nadu',
  },
  {
    key: 'escrow-collateral',
    category: 'financial',
    badge: 'Financial Agreements',
    title: 'Escrow, Security & Collateral Agreement',
    rating: '4.9',
    downloads: '3,804 Downloads',
    heading: 'ESCROW AGREEMENT',
    snippet: 'Third-party escrow arrangement, pledge of movable/immovable collateral under SARFAESI Act...',
    jurisdiction: 'India - Tamil Nadu',
  },
  {
    key: 'investment-equity',
    category: 'financial',
    badge: 'Financial Agreements',
    title: 'Investment & Equity Agreement',
    rating: '4.8',
    downloads: '5,123 Downloads',
    heading: 'INVESTMENT & EQUITY AGREEMENT',
    snippet: 'Term sheet, cap table mechanics, equity subscription, anti-dilution & drag-along rights...',
    jurisdiction: 'India - Tamil Nadu',
  },
  // Commercial & General
  {
    key: 'immigration',
    category: 'commercial',
    badge: 'Letters and Notices',
    title: 'Immigration Support Letter Template',
    rating: '4.8',
    downloads: '4,091 Downloads',
    heading: 'IMMIGRATION SUPPORT LETTER',
    snippet: 'I am writing this letter in official support of the applicant declaring moral character...',
    jurisdiction: 'USA / India',
  },
  {
    key: 'rental',
    category: 'commercial',
    badge: 'Lease Agreement',
    title: 'Car Rental Agreement Template',
    rating: '4.9',
    downloads: '4,304 Downloads',
    heading: 'CAR RENTAL AGREEMENT',
    snippet: 'This agreement defines standard vehicle rental terms, liabilities, insurance & bailment...',
    jurisdiction: 'India',
  },
  {
    key: 'loi',
    category: 'commercial',
    badge: 'Letters and Notices',
    title: 'Letter of Intent (LOI) Template',
    rating: '4.9',
    downloads: '5,307 Downloads',
    heading: 'LETTER OF INTENT (LOI)',
    snippet: 'This document establishes mutual commitment regarding future transactions & exclusivity...',
    jurisdiction: 'India / USA',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  financial: '#0066FF',
  commercial: '#111315',
};

export default function TemplatesSection({ onSelectTemplate, onOpenDashboard }: TemplatesSectionProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const visible = activeCategory === 'all'
    ? ALL_TEMPLATES.slice(0, 6)
    : ALL_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" id="templates">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-4">
          <i className="fa-regular fa-star text-xs"></i> Most popular
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Free Legal Templates
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          Ready-to-use agreements for every need — financial, commercial, NDA, leases, and more. All India/Tamil Nadu compliant.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              activeCategory === tab.key
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {visible.map((tpl) => (
            <motion.div
              key={tpl.key}
              onClick={() => onSelectTemplate(tpl.key)}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-xl transition-shadow cursor-pointer group"
              data-cursor="Open"
            >
              {/* Visual Document Card Header */}
              <div
                className="rounded-2xl p-5 mb-5 text-white relative min-h-[160px] flex flex-col justify-between overflow-hidden shadow-inner group-hover:opacity-90 transition-opacity"
                style={{ backgroundColor: CATEGORY_COLORS[tpl.category] || '#111315' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded w-fit">
                    Template
                  </span>
                  {tpl.jurisdiction && (
                    <span className="text-[9px] font-semibold bg-white/10 text-white/80 px-2 py-0.5 rounded">
                      {tpl.jurisdiction}
                    </span>
                  )}
                </div>
                <div className="bg-white/95 text-gray-800 p-3 rounded-xl text-[11px] font-mono leading-tight shadow-sm">
                  <span className="font-bold text-xs block mb-1 text-gray-900">{tpl.heading}</span>
                  {tpl.snippet}
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide block">
                  {tpl.badge}
                </span>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {tpl.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {tpl.rating} Rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {tpl.downloads}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onSelectTemplate('loan-lending')}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition cursor-pointer"
        >
          Browse all Financial Templates
          <ChevronRight className="w-4 h-4" />
        </button>

        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#0066FF] hover:bg-blue-600 transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Open Agreement Creator
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
