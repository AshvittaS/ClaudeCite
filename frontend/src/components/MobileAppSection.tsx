import React from 'react';
import { motion } from 'motion/react';
import { Apple, Smartphone, Sparkles, Scale, BookOpen, Check, Shield, FileText } from 'lucide-react';

export default function MobileAppSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-[#111315] text-white rounded-[2.5rem] p-8 sm:p-14 lg:p-16 border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Actual ClauseCite Mobile Application Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 flex justify-center items-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-full max-w-[310px] sm:max-w-[340px] bg-black p-3 rounded-[3rem] border-4 border-gray-800 shadow-2xl relative"
            >
              {/* Phone speaker notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-900 ml-2"></div>
              </div>

              {/* Phone screen */}
              <div className="bg-[#15171C] rounded-[2.5rem] overflow-hidden border border-white/10 text-xs flex flex-col h-[560px]">
                {/* Phone Top Bar */}
                <div className="pt-8 px-5 pb-3 bg-[#1A1C22] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-[10px]">
                      C
                    </div>
                    <div>
                      <span className="font-extrabold text-white text-[11px] block">ClauseCite AI</span>
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Tamil Nadu Live RAG
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                    Pro
                  </span>
                </div>

                {/* Chat Stream */}
                <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col justify-end">
                  <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-xs text-[11px] self-end max-w-[85%] shadow-sm">
                    Is stamp duty mandatory for private car rental lease in Chennai?
                  </div>

                  <div className="bg-[#1D2027] border border-white/10 p-3 rounded-2xl rounded-tl-xs text-[11px] text-gray-300 space-y-2 max-w-[95%] shadow-sm">
                    <p className="leading-relaxed">
                      Yes. Under <strong className="text-white">Article 35 of the Tamil Nadu Stamp Act, 2023</strong>, all vehicle hire and commercial lease agreements must be executed on appropriate non-judicial stamp paper.
                    </p>
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center gap-2 text-[10px] text-blue-400 font-semibold">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span>TN Stamp Act 2023 · Article 35</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Template Available
                    </span>
                    <span className="text-gray-400 font-mono">CC-LEASE-068</span>
                  </div>
                </div>

                {/* Bottom App Navigation */}
                <div className="p-3 bg-[#1A1C22] border-t border-white/5 flex items-center justify-around text-[10px] text-gray-400">
                  <div className="flex flex-col items-center gap-1 text-blue-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Ask AI</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Templates</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Scale className="w-4 h-4" />
                    <span>Redline</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* App Details & Download Buttons */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider border border-white/10">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Mobile Legal Companion</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              ClauseCite on your phone
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md">
              Access 295+ Tamil Nadu legal agreements, scan counterparty contracts with camera OCR, and receive instant clause citations on the go.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-gray-300 font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                  ✓
                </div>
                <span>Full access to 295+ Financial, B2B, NDA & Lease templates</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                  ✓
                </div>
                <span>Live Indian statutory citations (BNSS, Indian Contract Act)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                  ✓
                </div>
                <span>Offline document signing & PDF/DOCX preview</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => alert('ClauseCite iOS app is available on the Apple App Store.')}
                className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-900 px-6 py-3.5 rounded-full text-xs font-bold transition shadow-lg cursor-pointer"
              >
                <Apple className="w-4 h-4 fill-current" />
                <div className="text-left leading-tight">
                  <span className="text-[10px] block opacity-70">Download on the</span>
                  <span>Apple App Store</span>
                </div>
              </button>

              <button
                onClick={() => alert('ClauseCite Android app is available on Google Play.')}
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-full text-xs font-bold transition shadow-lg cursor-pointer"
              >
                <i className="fa-brands fa-google-play text-base text-emerald-400"></i>
                <div className="text-left leading-tight">
                  <span className="text-[10px] block opacity-70">Get it on</span>
                  <span>Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
