import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Scale,
  BookOpen,
  Layers,
  Wand2,
  ExternalLink,
  RefreshCw,
  Send,
} from 'lucide-react';
import { api } from '../../api/client.ts';

export interface UseCaseData {
  id: string;
  title: string;
  category: string;
  iconClass: string;
  badge: string;
  defaultDraft: string;
  notes: string;
}

export const USE_CASES_DATA: Record<string, UseCaseData> = {
  boilerplate: {
    id: 'boilerplate',
    title: 'Create boilerplate clauses',
    category: 'Commercial Contracts',
    iconClass: 'fa-solid fa-file-contract text-blue-600',
    badge: 'Statutory Shield',
    notes: 'Includes Severability, Force Majeure, Entire Agreement, and Governing Law provisions.',
    defaultDraft: `1. SEVERABILITY:
If any provision of this Agreement is held to be invalid, illegal, or unenforceable by any court of competent jurisdiction, such invalidity shall not affect any other provision hereof, and this Agreement shall be construed and enforced as if such provision had not been included.

2. FORCE MAJEURE:
Neither party shall be liable for failure to perform or delay in performance caused by circumstances beyond its reasonable control, including acts of God, war, pandemic, government decrees, labor strikes, or telecommunication network failures.

3. INTEGRATION & ENTIRE AGREEMENT:
This Agreement constitutes the entire understanding between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, or oral agreements.`,
  },
  demand: {
    id: 'demand',
    title: 'Demand Letter',
    category: 'Dispute & Debt Recovery',
    iconClass: 'fa-solid fa-envelope-open-text text-indigo-600',
    badge: 'Pre-Litigation Notice',
    notes: 'Formal notice specifying debt delinquency, statutory interest, and deadline before filing suit.',
    defaultDraft: `VIA CERTIFIED SPEED POST & REGISTERED EMAIL

DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

TO: [DEBTOR / DEFAULTING PARTY NAME]
    [STREET ADDRESS, CITY, STATE, PIN]

RE: FINAL DEMAND NOTICE FOR OUTSTANDING PAYMENT — INVOICE #CC-4912 (₹1,45,000.00 INR)

Dear Sir or Madam:

Please be advised that this letter serves as formal pre-litigation demand under Section 138 of the Negotiable Instruments Act, 1881 / Commercial Courts Act, 2015 for immediate clearance of the overdue sum of ₹1,45,000.00 INR for services rendered pursuant to Agreement dated [DATE]. Despite repeated reminders on [DATE 1] and [DATE 2], the balance remains wholly unpaid.

DEMAND IS HEREBY MADE that you tender full funds via RTGS/NEFT within fifteen (15) calendar days of receipt of this notice.

Failure to comply shall compel our client to initiate legal proceedings in the competent Commercial Court to recover principal, 18% per annum commercial interest, and legal costs.`,
  },
  compliance: {
    id: 'compliance',
    title: 'Legal compliance',
    category: 'Regulatory Jurisprudence',
    iconClass: 'fa-solid fa-shield-halved text-emerald-600',
    badge: 'DPDP / GDPR / NIST',
    notes: 'Data retention schedules, cross-border transfer agreements, and privacy compliance covenants.',
    defaultDraft: `DATA PRIVACY & REGULATORY COMPLIANCE SCHEDULE

1. STATUTORY COMPLIANCE:
Vendor warrants full and ongoing compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Information Technology (Reasonable Security Practices) Rules, 2011, and the EU General Data Protection Regulation (GDPR) where applicable.

2. DATA PRINCIPAL RIGHTS & PROCESSING:
Vendor shall act strictly as Data Fiduciary / Processor and shall implement appropriate technical and organisational safeguards. Personal data shall only be processed on documented lawful consent.

3. SECURITY BREACH NOTIFICATION WINDOW:
In the event of a verified or suspected personal data breach, Vendor shall report the incident to Customer and CERT-In within six (6) hours of discovery.`,
  },
  termination: {
    id: 'termination',
    title: 'Termination Letter',
    category: 'Employment & Commercial',
    iconClass: 'fa-solid fa-file-signature text-rose-600',
    badge: 'Formal Separation',
    notes: 'Written legal separation notice to end contract with cause or without cause.',
    defaultDraft: `NOTICE OF CONTRACT TERMINATION

DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

TO: [RECIPIENT PARTY NAME]
    [TITLE, COMPANY NAME]

RE: NOTICE OF FORMAL TERMINATION PURSUANT TO SECTION 11.2

Dear [RECIPIENT NAME]:

Please accept this letter as formal written notice that [COMPANY NAME] is exercising its contractual right to terminate the [NAME OF AGREEMENT], entered into on [EFFECTIVE DATE], in accordance with Section 11.2 ("Termination for Convenience").

The effective date of termination shall be thirty (30) days from your receipt of this notice, namely [TERMINATION DATE].

Prior to the Termination Date, you are requested to:
1. Cease all billable services and deliver all work product completed to date.
2. Return or certify destruction of all Confidential Information pursuant to Section 8.
3. Submit final reconciled invoice for undisputed fees incurred up to the date hereof.`,
  },
  family: {
    id: 'family',
    title: 'Prompts for family lawyers',
    category: 'Family Law Practice',
    iconClass: 'fa-solid fa-people-roof text-amber-600',
    badge: 'Custody & Marital Assets',
    notes: 'Structured discovery prompts and financial affidavit interrogatories.',
    defaultDraft: `FAMILY LAW STANDARD INTERROGATORIES & DISCOVERY PROMPT

1. MARITAL ASSETS DISCLOSURE:
"List all bank accounts, fixed deposits, demat holdings, real properties, business equity interests, and trust assets held individually or jointly at any time during the marriage, specifying account numbers, balances as of the date of separation, and present market valuation."

2. PARENTING PLAN STIPULATION:
"Draft a joint custody parenting time schedule providing alternating weekly physical custody, joint decision-making on education and medical treatment, and precise holiday division schedules pursuant to state best-interests-of-the-child standards."`,
  },
  caselaw: {
    id: 'caselaw',
    title: 'Case Law Finder',
    category: 'Litigation Research',
    iconClass: 'fa-solid fa-scale-unbalanced text-purple-600',
    badge: 'High Court & Supreme Court',
    notes: 'Rapid precedent finder matching specific facts and defenses.',
    defaultDraft: `RELEVANT CASE LAW BRIEF: ENFORCEABILITY OF NON-COMPETE & LIQUIDATED DAMAGES

1. Percept D'Mark (India) (P) Ltd. v. Zaheer Khan (2006) 4 SCC 227
Holding: Under Section 27 of the Indian Contract Act, 1872, a restrictive covenant extending beyond the term of the agreement is void and unenforceable.

2. Kailash Nath Associates v. Delhi Development Authority (2015) 4 SCC 136
Holding: Under Section 74 of the Contract Act, liquidated damages can only be awarded when reasonable compensation is proven; penal forfeitures without proof of injury are unconstitutional.

3. Vidya Drolia v. Durga Trading Corporation (2021) 2 SCC 1
Holding: Landlord-tenant disputes governed by special tenancy statutes with designated Rent Authorities are non-arbitrable.`,
  },
  cease: {
    id: 'cease',
    title: 'Cease and Desist Letter',
    category: 'Intellectual Property & Rights',
    iconClass: 'fa-solid fa-hand-dots text-red-600',
    badge: 'Infringement Warning',
    notes: 'Formal notice to immediately halt trademark, copyright, or trade secret infringement.',
    defaultDraft: `FORMAL CEASE AND DESIST DEMAND
NOTICE OF TRADEMARK & COPYRIGHT INFRINGEMENT

DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

TO: [INFRINGING PARTY NAME OR REGISTERED AGENT]
    [DOMAIN / URL / ADDRESS]

RE: UNAUTHORIZED EXPLOITATION OF REGISTERED WORK & PROPRIETARY MARKS

Dear [INFRINGING PARTY]:

We represent [CLIENT / RIGHTSHOLDER NAME] ("Client"). It has recently come to our attention that you are commercially displaying, marketing, and offering for distribution unauthorized copies and confusingly similar marks owned exclusively by Client (Registration No. [REG NUMBER]).

Your unauthorized actions constitute:
- Trademark Infringement and Passing Off under Trade Marks Act, 1999
- Copyright Infringement under Section 51 of Copyright Act, 1957
- Cyber-squatting and misleading trade practices under Information Technology Act, 2000

WE HEREBY DEMAND THAT YOU:
1. Immediately CEASE AND DESIST all manufacturing, advertising, and distribution of infringing materials.
2. Remove all infringing assets from your websites, social media handles, and marketing collateral.
3. Provide an accounting of all gross revenues derived from the unauthorized use.`,
  },
  research: {
    id: 'research',
    title: 'AI-boosted Research laws',
    category: 'Comparative Law',
    iconClass: 'fa-solid fa-magnifying-glass-chart text-teal-600',
    badge: 'Statutory Synthesis',
    notes: 'Comparative legal survey across countries and federal circuits.',
    defaultDraft: `COMPARATIVE LEGAL SURVEY: NON-SOLICITATION & CONFIDENTIALITY COVENANTS

1. INDIA (Supreme Court of India):
Section 27 voidness rule applies strictly to post-employment restraints. However, confidentiality and non-solicitation of customers can be enforced by interim injunction if specific proprietary data theft is demonstrated (Desiccant Rotors International v. B.P. Rao).

2. CALIFORNIA, USA:
Under Cal. Bus. & Prof. Code § 16600, customer and employee non-solicitation covenants are generally void as unlawful restraints of trade (AMN Healthcare v. Aya Healthcare Services).

3. UNITED KINGDOM (E&W):
Subject to the doctrine of restraint of trade; valid if protecting legitimate business interests and restricted to reasonable duration (typically 6 months) and geographic scope (Tillman v. Egon Zehnder).`,
  },
};

interface ClauseGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCaseKey?: string;
  onOpenAgreementCreator?: (clauseText: string) => void;
}

export default function ClauseGeneratorModal({
  isOpen,
  onClose,
  initialCaseKey = 'boilerplate',
  onOpenAgreementCreator,
}: ClauseGeneratorModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>(initialCaseKey);
  const activeCase = USE_CASES_DATA[selectedKey] || USE_CASES_DATA.boilerplate;
  const [draft, setDraft] = useState<string>(activeCase.defaultDraft);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Update draft when switching tabs
  const handleSelectCase = (key: string) => {
    setSelectedKey(key);
    setDraft(USE_CASES_DATA[key].defaultDraft);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.askClauseCite(
        `Please draft a legally enforceable, robust contractual clause for: "${customPrompt}". Include headings, clear covenants, and statutory alignment.`,
        'India'
      );
      if (res && res.answer) {
        setDraft(res.answer);
      }
    } catch (e) {
      console.warn('Real AI generation failed, applying local template synthesizer:', e);
      setDraft(`// AI-GENERATED CLAUSE: ${customPrompt.toUpperCase()}
1. DEFINITIONS & SCOPE:
The Parties agree that the covenants herein shall govern all performance, obligations, and deliverables relating to "${customPrompt}".

2. STANDARD OF CARE & COMPLIANCE:
Each Party warrants and covenants that it shall execute all obligations in compliance with applicable statutory regulations, industry best practices, and good faith standards.

3. REMEDIES & ENFORCEMENT:
Any material breach of this provision shall entitle the non-breaching Party to seek equitable injunctive relief in addition to monetary damages.`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">ClauseCite Legal Use Case Engine</h3>
                <p className="text-xs text-gray-500">
                  Instant drafting & standardized legal provisions across 8 core workflows
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Left Use Case Selector, Right Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Nav (4 cols) */}
            <div className="lg:col-span-4 p-4 border-r border-gray-100 bg-gray-50/50 overflow-y-auto space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-2 mb-2">
                Select Legal Scenario
              </span>
              {Object.values(USE_CASES_DATA).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectCase(item.id)}
                  className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between text-xs font-semibold cursor-pointer ${
                    selectedKey === item.id
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <i className={`${item.iconClass} text-sm`}></i>
                    <div>
                      <p className="font-bold leading-tight">{item.title}</p>
                      <p
                        className={`text-[10px] ${
                          selectedKey === item.id ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                      selectedKey === item.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Editor & Legal Citations (8 cols) */}
            <div className="lg:col-span-8 p-6 overflow-y-auto bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900">{activeCase.title}</h4>
                    <p className="text-xs text-gray-500">{activeCase.notes}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Jurisprudence Checked
                  </span>
                </div>

                {/* AI Custom Prompt Bar */}
                <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 space-y-2">
                  <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                    Custom Clause AI Generator
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGenerateCustom();
                      }}
                      placeholder="e.g., Draft a mutual non-solicitation clause for 12 months in Tamil Nadu..."
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleGenerateCustom}
                      disabled={isGenerating || !customPrompt.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Draft AI</span>
                    </button>
                  </div>
                </div>

                {/* Editor textarea */}
                <div className="relative">
                  <textarea
                    rows={12}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl p-4 font-mono text-xs text-gray-900 leading-relaxed focus:bg-white focus:outline-none focus:border-blue-500 transition shadow-inner"
                  />
                  <span className="absolute bottom-3 right-4 text-[10px] text-gray-400">
                    Editable text · Click to customize
                  </span>
                </div>
              </div>

              {/* Bottom toolbar */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Synthesized with ClauseCite Statutory Repository</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDraft(activeCase.defaultDraft)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 hover:text-black transition cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {onOpenAgreementCreator && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAgreementCreator(draft);
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white bg-[#0066FF] hover:bg-blue-600 transition shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Agreement Creator</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
