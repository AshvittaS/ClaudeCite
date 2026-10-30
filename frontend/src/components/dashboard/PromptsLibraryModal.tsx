import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Sparkles,
  ArrowRight,
  Plus,
  Bookmark,
  Check,
  Scale,
  Building2,
  Briefcase,
  Home,
  Shield,
  FileText,
  UserCheck,
} from 'lucide-react';

export interface LegalPrompt {
  id: string;
  title: string;
  category: string;
  icon: string;
  query: string;
  description: string;
  statuteTag: string;
}

const DEFAULT_PROMPTS: LegalPrompt[] = [
  // Employment
  {
    id: 'p-emp-1',
    title: 'Employee Rights in NYC',
    category: 'Employment & HR',
    icon: '💼',
    query: 'What are my rights as an employee in NYC regarding overtime, sick leave, and discrimination?',
    description: 'Comprehensive breakdown of NYCHRL § 8-107 and NY Labor Law overtime mandates.',
    statuteTag: 'NYC Employment Code § 8-107',
  },
  {
    id: 'p-emp-2',
    title: 'Severance Agreement Review',
    category: 'Employment & HR',
    icon: '📝',
    query: 'Review standard severance agreement release of claims, OWBPA 21-day consideration, and non-disparagement clauses.',
    description: 'Audit severance terms, Older Workers Benefit Protection Act compliance, and revocation periods.',
    statuteTag: '29 U.S.C. § 626(f) (OWBPA)',
  },
  {
    id: 'p-emp-3',
    title: 'Non-Compete Enforceability',
    category: 'Employment & HR',
    icon: '🚫',
    query: 'Is a post-employment non-compete clause enforceable against an employee moving to California or New York?',
    description: 'Examines California SB 699 / AB 1076 bans and New York reasonableness tests.',
    statuteTag: 'Cal. Bus. & Prof. Code § 16600',
  },

  // Real Estate & Housing
  {
    id: 'p-re-1',
    title: 'Rental Agreement & Tenant Rights',
    category: 'Real Estate',
    icon: '📄',
    query: 'What are standard tenant rights, security deposit caps, and return timelines for residential leases?',
    description: 'Statutory limits on deposit caps (1 month max) and 14-day itemized refund mandates.',
    statuteTag: 'NY Real Property Law § 238-a',
  },
  {
    id: 'p-re-2',
    title: 'Commercial Lease Eviction & Notice',
    category: 'Real Estate',
    icon: '⚖️',
    query: 'How does quiet enjoyment and commercial lease default / cure notice work under standard lease terms?',
    description: 'Proper procedural notice to cure, default triggers, and good guy guaranty terms.',
    statuteTag: 'URLTA § 4.201 / NY RPAPL § 711',
  },
  {
    id: 'p-re-3',
    title: 'Sublease & Assignment Rights',
    category: 'Real Estate',
    icon: '🏢',
    query: 'Can a landlord unreasonably withhold consent to sublease or assign a residential apartment lease?',
    description: 'Landlord obligations under statutory consent standards and 30-day response deadlines.',
    statuteTag: 'NY Real Property Law § 226-b',
  },

  // Corporate & Startups
  {
    id: 'p-corp-1',
    title: 'Start a Delaware LLC',
    category: 'Corporate & Startups',
    icon: '🚀',
    query: 'What filings, registered agent mandates, and operating agreements are required to form a Delaware LLC?',
    description: 'Step-by-step formation checklist under Delaware Limited Liability Company Act.',
    statuteTag: '6 Del. C. § 18-201',
  },
  {
    id: 'p-corp-2',
    title: 'SAFE & Convertible Note Terms',
    category: 'Corporate & Startups',
    icon: '📈',
    query: 'What are standard post-money SAFE conversion triggers, valuation caps, and pro-rata rights for angel funding?',
    description: 'YC post-money SAFE terms, liquidation preferences, and discount rates comparison.',
    statuteTag: 'Del. Gen. Corp. Law § 151',
  },
  {
    id: 'p-corp-3',
    title: 'Founder Vesting & 83(b) Election',
    category: 'Corporate & Startups',
    icon: '⏱️',
    query: 'How do 4-year vesting with a 1-year cliff and mandatory IRS Section 83(b) 30-day elections work?',
    description: 'Tax acceleration risks and reverse vesting agreements for founders.',
    statuteTag: '26 U.S.C. § 83(b)',
  },

  // Contracts & Commercial
  {
    id: 'p-ct-1',
    title: 'Draft Mutual NDA',
    category: 'Contracts & Drafting',
    icon: '🔒',
    query: 'Draft a robust bilateral Mutual Non-Disclosure Agreement with 3-year term and standard subpoena carve-outs.',
    description: 'Confidentiality obligations, marked materials, and return/destruction mandates.',
    statuteTag: '18 U.S.C. § 1836 (DTSA)',
  },
  {
    id: 'p-ct-2',
    title: 'SaaS Limitation of Liability & Caps',
    category: 'Contracts & Drafting',
    icon: '🛡️',
    query: 'What is the market standard limitation of liability cap and consequential damages waiver for enterprise B2B SaaS?',
    description: '1x-2x trailing annual fees, uncapped breach exceptions, and super-cap definitions.',
    statuteTag: 'UCC § 2-719',
  },
  {
    id: 'p-ct-3',
    title: 'Independent Contractor Agreement',
    category: 'Contracts & Drafting',
    icon: '📑',
    query: 'Draft an independent contractor agreement with clear IP assignment, work-for-hire clause, and indemnity.',
    description: 'Avoid worker misclassification under the ABC test while securing proprietary work product.',
    statuteTag: 'Cal. Labor Code § 2775',
  },

  // Privacy & IP
  {
    id: 'p-priv-1',
    title: 'Protect Data Online (GDPR & CCPA)',
    category: 'Privacy & Data',
    icon: '🛡️',
    query: 'What are enterprise compliance obligations under GDPR and California CCPA/CPRA for data handling and privacy policies?',
    description: 'Consumer rights to delete, opt-out of sale, 72-hour breach notices, and DPAs.',
    statuteTag: 'Cal. Civ. Code § 1798.100',
  },
  {
    id: 'p-priv-2',
    title: 'Cease & Desist Trademark Infringement',
    category: 'Privacy & Data',
    icon: '⚖️',
    query: 'Draft a formal Cease and Desist demand letter for trademark infringement and deceptive brand imitation.',
    description: 'Lanham Act likelihood of confusion analysis and preliminary injunction notice.',
    statuteTag: '15 U.S.C. § 1114 (Lanham Act)',
  },

  // Consumer Protection
  {
    id: 'p-cons-1',
    title: 'Consumer Complaint & Breach of Warranty',
    category: 'Consumer Rights',
    icon: '📢',
    query: 'How to file a formal breach of warranty or deceptive trade practices complaint against a deceptive merchant?',
    description: 'Remedies under Magnuson-Moss Warranty Act and state deceptive business practices laws.',
    statuteTag: '15 U.S.C. § 2301 (Magnuson-Moss)',
  },
  {
    id: 'p-cons-2',
    title: 'Credit Report Dispute & FCRA',
    category: 'Consumer Rights',
    icon: '💳',
    query: 'How to formally dispute erroneous collections and reporting inaccuracies under the Fair Credit Reporting Act?',
    description: '30-day investigation deadlines, bureau obligations, and statutory damages.',
    statuteTag: '15 U.S.C. § 1681i (FCRA)',
  },
];

interface PromptsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: LegalPrompt) => void;
}

export default function PromptsLibraryModal({
  isOpen,
  onClose,
  onSelectPrompt,
}: PromptsLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customPrompts, setCustomPrompts] = useState<LegalPrompt[]>([]);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Contracts & Drafting');
  const [newQuery, setNewQuery] = useState('');
  const [newStatute, setNewStatute] = useState('');

  const categories = [
    'All',
    'Employment & HR',
    'Real Estate',
    'Corporate & Startups',
    'Contracts & Drafting',
    'Privacy & Data',
    'Consumer Rights',
    'My Custom Prompts',
  ];

  const allPrompts = [...DEFAULT_PROMPTS, ...customPrompts];

  const filteredPrompts = allPrompts.filter((p) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'My Custom Prompts'
        ? customPrompts.some((cp) => cp.id === p.id)
        : p.category === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.statuteTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuery.trim()) return;

    const newP: LegalPrompt = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      icon: '✨',
      query: newQuery.trim(),
      description: 'User-created custom prompt for repeated legal drafting and analysis.',
      statuteTag: newStatute.trim() || 'General Commercial Code',
    };

    setCustomPrompts([newP, ...customPrompts]);
    setNewTitle('');
    setNewQuery('');
    setNewStatute('');
    setIsCreatingCustom(false);
    setActiveTab('My Custom Prompts');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Legal Prompts Library
                </h2>
                <p className="text-xs text-gray-500">
                  Select a curated legal research prompt or build your own custom workflow
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreatingCustom(!isCreatingCustom)}
                className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingCustom ? 'View Library' : 'Create Custom'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Category Pills */}
          {!isCreatingCustom && (
            <div className="p-6 border-b border-gray-100 bg-[#FAFAFA] space-y-4 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts by keyword, topic, or statute (e.g. non-compete, NYC, lease, safe)..."
                  className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      activeTab === cat
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isCreatingCustom ? (
              /* Create Custom Prompt Form */
              <form onSubmit={handleCreatePrompt} className="max-w-2xl mx-auto space-y-5 py-4">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-base font-bold text-gray-900">Create New Legal Prompt</h3>
                  <p className="text-xs text-gray-500">
                    Save reusable instructions with statutory references to speed up your analysis.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Prompt Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Audit Employee Severance for 409A Violations"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                    >
                      <option>Employment & HR</option>
                      <option>Real Estate</option>
                      <option>Corporate & Startups</option>
                      <option>Contracts & Drafting</option>
                      <option>Privacy & Data</option>
                      <option>Consumer Rights</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Statutory Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. 26 U.S.C. § 409A"
                      value={newStatute}
                      onChange={(e) => setNewStatute(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Prompt Query / Instructions</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide the exact query or instructions for the AI Lawyer..."
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Save & Add to Library
                  </button>
                </div>
              </form>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No prompts found</p>
                <p className="text-xs text-gray-400">Try adjusting your search terms or create a custom prompt.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrompts.map((prompt) => (
                  <motion.div
                    key={prompt.id}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
                    onClick={() => {
                      onSelectPrompt(prompt);
                      onClose();
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{prompt.icon}</span>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                            {prompt.title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {prompt.category}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {prompt.description}
                      </p>

                      <div className="text-[11px] font-mono text-blue-700 bg-blue-50/70 border border-blue-100 rounded-lg px-2.5 py-1 inline-block truncate max-w-full">
                        {prompt.statuteTag}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600 group-hover:text-black">
                      <span className="text-[11px] text-gray-400 truncate max-w-[220px]">
                        "{prompt.query.slice(0, 45)}..."
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                        Use Prompt <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
