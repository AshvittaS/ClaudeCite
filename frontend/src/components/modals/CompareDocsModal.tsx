import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  Download,
  Copy,
  RefreshCw,
  FileText,
  Upload,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface CompareDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkspace?: () => void;
}

interface ClauseItem {
  id: string;
  title: string;
  text: string;
  status?: 'standard' | 'high-risk' | 'medium-risk';
  riskNote?: string;
}

export default function CompareDocsModal({ isOpen, onClose, onOpenWorkspace }: CompareDocsModalProps) {
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'risk-summary' | 'custom-compare'>('side-by-side');
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Custom text comparison state
  const [customDoc1Text, setCustomDoc1Text] = useState(
    `SECTION 4.1 - LIMITATION OF LIABILITY
Neither party shall be liable to the other for indirect, special, or consequential damages. Total cumulative liability under this Agreement shall not exceed the aggregate fees paid in the preceding twelve (12) months.

SECTION 7.3 - GOVERNING LAW & ARBITRATION
This Agreement shall be governed by the laws of India. Any controversy or claim arising out of this Agreement shall be settled by binding arbitration in Chennai, Tamil Nadu pursuant to the Arbitration and Conciliation Act, 1996.`
  );

  const [customDoc2Text, setCustomDoc2Text] = useState(
    `SECTION 4.1 - LIMITATION OF LIABILITY
Party B shall not be liable for indirect damages. However, Party A's liability for data breach, IP infringement, and service delays shall remain UNCAPPED without limitation of liability or mutual indemnification.

SECTION 7.3 - GOVERNING LAW & ARBITRATION
This Agreement shall be governed exclusively by the laws of England and Wales. The High Court of Justice in London shall have exclusive jurisdiction over all disputes.`
  );

  const [doc1Name, setDoc1Name] = useState('Loan_Facility_Standard_v1.pdf');
  const [doc2Name, setDoc2Name] = useState('Counterparty_Marked_Draft_v2.pdf');

  const defaultDoc1Clauses: ClauseItem[] = [
    {
      id: 'c1',
      title: 'Section 4.1 — Limitation of Liability',
      text: 'Neither party shall be liable to the other for indirect, incidental, or consequential damages. Total cumulative liability under this Agreement shall be capped at the aggregate amount paid in the preceding twelve (12) months.',
      status: 'standard',
    },
    {
      id: 'c2',
      title: 'Section 7.3 — Governing Law & Dispute Resolution',
      text: 'This Agreement shall be governed by the laws of India. Any controversy or dispute shall be settled by binding arbitration in Chennai, Tamil Nadu under the Arbitration and Conciliation Act, 1996.',
      status: 'standard',
    },
    {
      id: 'c3',
      title: 'Section 11.2 — Termination for Convenience',
      text: 'Either party may terminate this Agreement without cause upon sixty (60) days prior written notice to the other party.',
      status: 'standard',
    },
  ];

  const defaultDoc2Clauses: ClauseItem[] = [
    {
      id: 'c1',
      title: 'Section 4.1 — Limitation of Liability',
      text: 'Party B shall not be liable for indirect damages. However, Party A’s liability for intellectual property infringement and gross negligence shall remain UNCAPPED without limitation or mutual indemnity.',
      status: 'high-risk',
      riskNote: 'CRITICAL: Counter-party removed mutual liability cap and made Party A’s liability strictly uncapped.',
    },
    {
      id: 'c2',
      title: 'Section 7.3 — Governing Law & Dispute Resolution',
      text: 'This Agreement shall be governed exclusively by the laws of England and Wales. The High Court of Justice in London shall have exclusive jurisdiction over all disputes.',
      status: 'medium-risk',
      riskNote: 'MODERATE: Jurisdiction changed from Chennai Arbitration to London High Court (significant expense shift).',
    },
    {
      id: 'c3',
      title: 'Section 11.2 — Termination for Convenience',
      text: 'Only Party B may terminate this Agreement for convenience upon fifteen (15) days written notice. Party A may only terminate upon non-curable material breach.',
      status: 'high-risk',
      riskNote: 'UNBALANCED: Unilateral termination right granted solely to counter-party.',
    },
  ];

  const [clauses1, setClauses1] = useState<ClauseItem[]>(defaultDoc1Clauses);
  const [clauses2, setClauses2] = useState<ClauseItem[]>(defaultDoc2Clauses);

  const handleCopy = () => {
    navigator.clipboard.writeText(`ClauseCite Redline Comparison Summary:
Baseline Document: ${doc1Name}
Revised Document: ${doc2Name}
Risk Score: High Risk (Counterparty introduced unilateral uncapped liability and shifted dispute jurisdiction).
Recommendation: Revert Section 4.1 to mutual 12-month trailing cap and restore local arbitration venue.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReanalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 900);
  };

  const handleRunCustomCompare = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Split by SECTION or headings
      const paras1 = customDoc1Text.split('\n\n').filter((p) => p.trim());
      const paras2 = customDoc2Text.split('\n\n').filter((p) => p.trim());

      const newC1: ClauseItem[] = paras1.map((p, i) => {
        const firstLine = p.split('\n')[0].replace(/#+/g, '').trim();
        return {
          id: `cust1_${i}`,
          title: firstLine.length > 50 ? `Clause ${i + 1}` : firstLine,
          text: p,
          status: 'standard',
        };
      });

      const newC2: ClauseItem[] = paras2.map((p, i) => {
        const firstLine = p.split('\n')[0].replace(/#+/g, '').trim();
        const isRisky =
          p.toLowerCase().includes('uncapped') ||
          p.toLowerCase().includes('solely') ||
          p.toLowerCase().includes('england');
        return {
          id: `cust2_${i}`,
          title: firstLine.length > 50 ? `Clause ${i + 1}` : firstLine,
          text: p,
          status: isRisky ? 'high-risk' : 'standard',
          riskNote: isRisky
            ? 'ATTENTION: Material alteration detected affecting liability cap or venue.'
            : undefined,
        };
      });

      setClauses1(newC1);
      setClauses2(newC2);
      setDoc1Name('Custom_Baseline.txt');
      setDoc2Name('Custom_Revised.txt');
      setActiveTab('side-by-side');
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleDownload = () => {
    const textData = `CLAUSECITE REDLINE COMPARISON REPORT
Generated: ${new Date().toLocaleString()}
Document A: ${doc1Name}
Document B: ${doc2Name}

--------------------------------------------------
SIDE-BY-SIDE AUDIT
--------------------------------------------------
${clauses1
  .map((c, i) => {
    const c2 = clauses2[i] || { title: '', text: '', riskNote: '' };
    return `[${c.title}]
ORIGINAL:
${c.text}

REVISED:
${c2.text}
${c2.riskNote ? `WARNING: ${c2.riskNote}\n` : ''}
--------------------------------------------------`;
  })
  .join('\n\n')}`;

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redline-comparison-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <i className="fa-solid fa-code-compare"></i>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  ClauseCite Document Comparison
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    AI Redline Engine v2.4
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Comparing <span className="font-semibold text-gray-700">{doc1Name}</span> against{' '}
                  <span className="font-semibold text-gray-700">{doc2Name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenWorkspace && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWorkspace();
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                  title="Open full redline workbench"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Workspace</span>
                </button>
              )}
              <button
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-blue-600' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Re-run AI'}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar & Tab Switcher */}
          <div className="px-6 py-3 bg-[#111315] text-white flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-gray-300">2 Critical Risks Detected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-gray-300">1 Jurisdiction Shift</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-gray-300">14 Clauses Unchanged</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="inline-flex p-1 bg-gray-800 rounded-lg">
              <button
                onClick={() => setActiveTab('side-by-side')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'side-by-side'
                    ? 'bg-[#0066FF] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActiveTab('risk-summary')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'risk-summary'
                    ? 'bg-[#0066FF] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Risk Analysis
              </button>
              <button
                onClick={() => setActiveTab('custom-compare')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'custom-compare'
                    ? 'bg-[#0066FF] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Paste Custom</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'side-by-side' ? (
              <div className="space-y-4">
                {/* Column Headers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100/80 p-3 rounded-2xl flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-bold text-xs text-gray-800">{doc1Name}</p>
                        <p className="text-[10px] text-gray-400">Baseline Master</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">
                      Baseline
                    </span>
                  </div>

                  <div className="bg-red-50/80 p-3 rounded-2xl flex items-center justify-between border border-red-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="font-bold text-xs text-red-900">{doc2Name}</p>
                        <p className="text-[10px] text-red-500">Revised Counterparty</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                      Modifications
                    </span>
                  </div>
                </div>

                {/* Clause Rows */}
                {clauses1.map((clause1, idx) => {
                  const clause2 = clauses2[idx] || {
                    id: `empty_${idx}`,
                    title: clause1.title,
                    text: '[Clause omitted by counterparty]',
                    status: 'high-risk',
                    riskNote: 'CRITICAL: Provision completely omitted by counterparty.',
                  };

                  return (
                    <div
                      key={clause1.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-gray-300 transition"
                    >
                      {/* Left: Original */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-gray-700 block">{clause1.title}</span>
                        <p className="text-xs text-gray-600 leading-relaxed font-mono bg-gray-50 p-3 rounded-xl border border-gray-200/60 whitespace-pre-line">
                          {clause1.text}
                        </p>
                      </div>

                      {/* Right: Counter-Draft with highlighted changes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-900">{clause2.title}</span>
                          {clause2.status === 'high-risk' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> High Risk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                              Jurisdiction Shift
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed font-mono bg-red-50/50 p-3 rounded-xl border border-red-200 whitespace-pre-line">
                          {clause2.text}
                        </p>
                        {clause2.riskNote && (
                          <div className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-start gap-2">
                            <i className="fa-solid fa-triangle-exclamation text-red-600 mt-0.5 text-xs"></i>
                            <span>{clause2.riskNote}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'risk-summary' ? (
              /* Risk Summary Tab */
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Key ClauseCite Recommendation: Do Not Execute Without Counsel Revision
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Counter-party has removed mutual liability shields and converted key covenants into unilateral provisions favoring themselves. Furthermore, moving dispute resolution to foreign jurisdiction introduces significant litigation expense and cross-border enforcement hurdles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Exposure Increase</p>
                    <p className="text-2xl font-black text-red-600 mt-1">Unlimited</p>
                    <p className="text-[11px] text-gray-500 mt-1">Uncapped IP indemnity added</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Notice Period</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">15 Days</p>
                    <p className="text-[11px] text-gray-500 mt-1">Decreased from standard 60 days</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Arbitration Venue</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">London</p>
                    <p className="text-[11px] text-gray-500 mt-1">Shifted from domestic seat</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                  <span className="font-bold block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Suggested Counsel Action
                  </span>
                  <p>
                    1. Issue counter-mark proposing mutual liability cap equal to 12 months fees paid.<br />
                    2. Re-assert Section 7.3 dispute resolution seated in Chennai under the Indian Arbitration and Conciliation Act, 1996.<br />
                    3. Maintain mutual 60-day notice for convenience termination.
                  </p>
                </div>
              </div>
            ) : (
              /* Custom Compare Tab */
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                  <h4 className="text-sm font-bold text-gray-900">Paste Your Own Documents to Compare</h4>
                  <p className="text-xs text-gray-500">
                    Paste baseline terms in Box A and the revised counter-proposal in Box B to run instant redline analysis.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">Document A (Original Baseline)</label>
                    <textarea
                      rows={10}
                      value={customDoc1Text}
                      onChange={(e) => setCustomDoc1Text(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 font-mono text-xs text-gray-900 leading-relaxed focus:bg-white focus:outline-none focus:border-blue-500 transition"
                      placeholder="Paste Document A clauses here..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-red-800 block">Document B (Revised / Counterparty)</label>
                    <textarea
                      rows={10}
                      value={customDoc2Text}
                      onChange={(e) => setCustomDoc2Text(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3 font-mono text-xs text-gray-900 leading-relaxed focus:bg-white focus:outline-none focus:border-red-400 transition"
                      placeholder="Paste Document B clauses here..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunCustomCompare}
                    disabled={isAnalyzing || !customDoc1Text.trim() || !customDoc2Text.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition shadow cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Running Comparison...' : 'Analyze Custom Redline'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Audit log verified with hash #CC-89410</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied to Clipboard!' : 'Copy Redline Summary'}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0066FF] hover:bg-blue-600 rounded-full transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Comparison File
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
