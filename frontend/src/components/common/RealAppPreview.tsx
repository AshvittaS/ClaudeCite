import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Sparkles,
  Scale,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Search,
  BookOpen,
  Check,
} from 'lucide-react';

interface RealAppPreviewProps {
  initialTab?: 'generator' | 'rag' | 'redline';
  interactive?: boolean;
}

export default function RealAppPreview({
  initialTab = 'generator',
  interactive = true,
}: RealAppPreviewProps) {
  const [activeTab, setActiveTab] = useState<'generator' | 'rag' | 'redline'>(initialTab);

  // Auto-cycle tabs if in demo / video mode
  useEffect(() => {
    if (interactive) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === 'generator' ? 'rag' : prev === 'rag' ? 'redline' : 'generator'));
    }, 4000);
    return () => clearInterval(interval);
  }, [interactive]);

  return (
    <div className="w-full bg-[#121316] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col font-sans select-none">
      {/* Top Application Bar */}
      <div className="px-4 py-3 bg-[#17191C] border-b border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <div className="h-4 w-px bg-white/20 mx-1"></div>
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[9px] font-black">
              C
            </div>
            <span className="text-gray-200">ClauseCite</span>
            <span className="text-[10px] text-blue-400 font-normal">v2.4 Pro</span>
          </div>
        </div>

        {/* Workspace Mode Switcher Tabs */}
        <div className="inline-flex p-0.5 bg-black/50 rounded-xl border border-white/5 text-[11px]">
          <button
            onClick={() => interactive && setActiveTab('generator')}
            className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Agreement Creator</span>
          </button>
          <button
            onClick={() => interactive && setActiveTab('rag')}
            className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rag'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Ask ClauseCite</span>
          </button>
          <button
            onClick={() => interactive && setActiveTab('redline')}
            className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'redline'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scale className="w-3 h-3" />
            <span>AI Redline</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>India · Tamil Nadu</span>
        </div>
      </div>

      {/* Main App Workspace Canvas */}
      <div className="relative min-h-[380px] sm:min-h-[440px] bg-[#0E0F12] flex overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'generator' ? (
            /* 1. REAL AGREEMENT CREATOR VIEW */
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col md:flex-row h-full"
            >
              {/* Left sidebar: Template categories */}
              <div className="w-full md:w-56 bg-[#15171B] border-r border-white/5 p-3 space-y-2 shrink-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">
                  Legal Library (295+)
                </span>
                <div className="space-y-1">
                  <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-between">
                    <span>Financial Agreements</span>
                    <span className="text-[9px] bg-blue-500/30 px-1.5 py-0.5 rounded-full">9</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-medium flex items-center justify-between transition">
                    <span>Commercial & B2B</span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">60</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-medium flex items-center justify-between transition">
                    <span>NDA & Confidentiality</span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">10</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-medium flex items-center justify-between transition">
                    <span>Power of Attorney</span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">10</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-medium flex items-center justify-between transition">
                    <span>Lease & Tenancy</span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">187</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold px-1 mb-1.5">
                    Active Variables
                  </span>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                      <span className="text-gray-500 block">Principal:</span>
                      <span className="text-emerald-400 font-mono font-bold">₹5,00,000 INR</span>
                    </div>
                    <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                      <span className="text-gray-500 block">Interest Rate:</span>
                      <span className="text-blue-300 font-mono font-bold">18% p.a. (Reducing)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right document canvas: Actual paper legal preview */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-[#131518] to-[#0A0B0D] flex justify-center">
                <div className="w-full max-w-xl bg-white text-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 font-serif text-[11px] leading-relaxed relative">
                  {/* Stamp Paper Seal Header */}
                  <div className="border-b-2 border-amber-900/30 pb-3 mb-4 text-center">
                    <span className="text-[9px] font-sans font-bold tracking-widest text-amber-900 uppercase block">
                      Government of Tamil Nadu · Non-Judicial Stamp Duty
                    </span>
                    <h2 className="text-sm font-sans font-black tracking-tight text-gray-900 mt-1 uppercase">
                      Loan & Lending Agreement
                    </h2>
                    <p className="text-[9px] font-sans text-gray-500 mt-0.5">
                      Executed in Chennai, Tamil Nadu under Tamil Nadu Money Lenders Act, 1957
                    </p>
                  </div>

                  <p className="font-sans text-[10px] text-gray-600 mb-2">
                    <strong className="text-gray-900">THIS AGREEMENT</strong> is made on this 30th day of October, 2026, by and between:
                  </p>

                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 font-sans text-[10px] space-y-1 mb-3">
                    <p>
                      <strong>1. LENDER:</strong> Apex Capital Solutions Pvt. Ltd., Mount Road, Chennai - 600002.
                    </p>
                    <p>
                      <strong>2. BORROWER:</strong> Horizon Logistics LLP, Guindy Industrial Estate, Chennai.
                    </p>
                  </div>

                  <div className="space-y-2 font-sans text-[10px] text-gray-800">
                    <p>
                      <strong>1. PRINCIPAL SUM & DISBURSEMENT:</strong> The Lender hereby extends a commercial credit facility of <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1 rounded">₹5,00,000.00 INR</span> to the Borrower via RTGS.
                    </p>
                    <p>
                      <strong>2. INTEREST & REPAYMENT:</strong> Interest shall accrue at <span className="bg-blue-100 text-blue-800 font-mono font-bold px-1 rounded">18.00% per annum</span> on reducing balance, repayable in 24 monthly EMIs.
                    </p>
                    <p>
                      <strong>3. DISPUTE RESOLUTION & VENUE:</strong> All disputes shall be submitted to sole arbitration in Chennai under the Indian Arbitration and Conciliation Act, 1996.
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-gray-200 flex justify-between font-sans text-[9px] text-gray-500">
                    <div>
                      <span>Lender Signature:</span>
                      <div className="w-24 h-4 border-b border-gray-400 mt-1"></div>
                    </div>
                    <div>
                      <span>Borrower Signature:</span>
                      <div className="w-24 h-4 border-b border-gray-400 mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'rag' ? (
            /* 2. REAL ASK CLAUSECITE RAG VIEW */
            <motion.div
              key="rag"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full p-4 sm:p-6 space-y-4 overflow-y-auto"
            >
              {/* User question bubble */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs max-w-lg shadow-md">
                  Can an employer enforce a post-employment non-compete clause in India?
                </div>
              </div>

              {/* ClauseCite AI response */}
              <div className="bg-[#17191D] border border-white/10 rounded-2xl rounded-tl-sm p-5 max-w-2xl text-xs space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-[10px] font-bold">
                      C
                    </div>
                    <span className="font-bold text-white">ClauseCite Legal AI Assistant</span>
                  </div>
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                    High Risk · Void Covenant
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  Under Indian jurisprudence, post-employment restrictive covenants are declared <strong className="text-white">void ab initio</strong> under <span className="text-blue-400 underline font-semibold">Section 27 of the Indian Contract Act, 1872</span>.
                </p>

                <p className="text-gray-300 leading-relaxed">
                  The Supreme Court of India in <em className="text-amber-300">Percept D'Mark (India) (P) Ltd. v. Zaheer Khan (2006)</em> held that any restraint extending beyond the term of the agreement is wholly impermissible. However, non-solicitation of clients and confidentiality protection remain enforceable.
                </p>

                {/* Cited authorities cards */}
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Cited Legal Authorities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-white/10">
                      Indian Contract Act 1872 § 27
                    </span>
                    <span className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-white/10">
                      Percept D'Mark v. Zaheer Khan (2006) 4 SCC 227
                    </span>
                    <span className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-white/10">
                      Information Technology Act 2000 § 72A
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* 3. REAL REDLINE COMPARISON VIEW */
            <motion.div
              key="redline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full p-4 sm:p-6 space-y-4 overflow-y-auto"
            >
              {/* Header metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Exposure Alert</span>
                  <span className="text-sm font-black text-red-400">UNLIMITED</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Venue Shift</span>
                  <span className="text-sm font-black text-amber-400">London Court</span>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Recommendation</span>
                  <span className="text-sm font-black text-emerald-400">Do Not Sign</span>
                </div>
              </div>

              {/* Side-by-Side redline diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Left: Original */}
                <div className="bg-[#17191C] p-3.5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-300">Baseline · Master Agreement</span>
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-gray-400">Section 4.1</span>
                  </div>
                  <p className="text-gray-400 font-mono text-[11px] leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                    "Neither party shall be liable for indirect damages. Total cumulative liability shall be capped at the aggregate amount paid in the preceding twelve (12) months."
                  </p>
                </div>

                {/* Right: Counterparty modification */}
                <div className="bg-red-950/30 p-3.5 rounded-2xl border border-red-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300">Counterparty Draft (High Risk)</span>
                    <span className="text-[9px] bg-red-500/30 text-red-300 px-2 py-0.5 rounded font-bold">
                      Critical Change
                    </span>
                  </div>
                  <p className="text-gray-200 font-mono text-[11px] leading-relaxed bg-black/40 p-2.5 rounded-xl border border-red-500/30">
                    "Party B shall not be liable. However, <span className="bg-red-500/40 text-red-200 px-1 font-bold">Party A's liability shall remain UNCAPPED without mutual indemnification</span>."
                  </p>
                  <p className="text-[10px] text-red-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Unilateral cap removal detected. Action: Reinstate 12-month cap.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-2 bg-[#17191C] border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Check className="w-3.5 h-3.5" /> 295 Tamil Nadu Legal Templates Loaded
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="hidden sm:inline">SHA-256 Audit Seal: #CC-89410</span>
        </div>
        <span className="text-[10px] text-blue-400 font-bold">Interactive Live Preview</span>
      </div>
    </div>
  );
}
