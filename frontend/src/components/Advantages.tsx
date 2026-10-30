import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, Zap, Headphones, DollarSign, RefreshCw } from 'lucide-react';

interface AdvantagesProps {
  onOpenCompare: () => void;
  onOpenChat: () => void;
}

export default function Advantages({ onOpenCompare, onOpenChat }: AdvantagesProps) {
  const [summarizeProgress, setSummarizeProgress] = useState(85);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(350);

  const restartSummarize = () => {
    setIsSummarizing(true);
    setSummarizeProgress(10);
    const interval = setInterval(() => {
      setSummarizeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSummarizing(false);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const privacyTags = [
    { label: 'Messages', icon: 'fa-regular fa-message', color: 'text-blue-500' },
    { label: 'Prompts', icon: 'fa-solid fa-terminal', color: 'text-indigo-500' },
    { label: 'Chats', icon: 'fa-regular fa-comments', color: 'text-emerald-500' },
    { label: 'End-to-end encrypted', icon: 'fa-solid fa-lock', dark: true },
    { label: 'Zero Retention', icon: 'fa-solid fa-key', color: 'text-amber-500' },
    { label: 'Location', icon: 'fa-solid fa-location-dot', color: 'text-red-500' },
    { label: 'Settings', icon: 'fa-solid fa-gear', color: 'text-gray-500' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" id="advantages">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-4"
        >
          <i className="fa-solid fa-bolt text-xs"></i> Advantages
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4"
        >
          Why our AI in law is better?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-base sm:text-lg text-gray-600"
        >
          In contrast to others, our LegalTech software is quick, easy, and wallet-friendly.
        </motion.p>
      </div>

      {/* Advantages Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Private card (2 cols) */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Private & Confidential</h3>
            <p className="text-sm text-gray-500 max-w-md">
              We stand firm on privacy, ensuring that users' conversations and legal documents remain strictly secure, anonymous, and unshared with public models.
            </p>
          </div>

          {/* Privacy Cloud Visual */}
          <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-wrap items-center justify-center gap-3">
            {privacyTags.map((tag, i) => (
              <motion.span
                key={tag.label}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full text-xs font-medium shadow-xs transition ${
                  tag.dark
                    ? 'bg-black text-white font-bold shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                <i className={`${tag.icon} mr-2 ${tag.color || 'text-white'}`}></i>
                {tag.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* 75% Time saved */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">75% Time saved</h3>
            <p className="text-xs text-gray-500">On routine legal review & drafting tasks</p>
          </div>

          {/* Bar Graph Comparison with Outcrowd animated spring */}
          <div className="my-6 flex items-end justify-center gap-8 h-40">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-gray-600 mb-2">100%</span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: '7rem' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-14 bg-gray-900 rounded-t-xl"
              />
              <span className="text-[10px] text-gray-400 mt-2 text-center">
                Without<br />ClauseCite
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-emerald-600 mb-2">25%</span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: '2.5rem' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="w-14 bg-emerald-500 rounded-t-xl shadow-md shadow-emerald-500/20"
              />
              <span className="text-[10px] text-gray-900 font-semibold mt-2 text-center">
                With<br />ClauseCite
              </span>
            </div>
          </div>
        </motion.div>

        {/* Fast (5 Seconds) */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast</h3>
              <button
                onClick={restartSummarize}
                disabled={isSummarizing}
                className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                title="Re-run speed test"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                <span>Test</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              The fastest online lawyer service, ideal for avoiding expenses and appointments.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 my-4">
            <div className="flex items-center justify-between text-xs text-gray-700 mb-2">
              <span className="font-bold">Legal_claim2.pdf</span>
              <span className="text-gray-400 font-mono">
                {summarizeProgress >= 100 ? 'Completed' : 'Remaining 1s'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${summarizeProgress}%` }}
              ></div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-gray-900">5 Seconds</p>
            <p className="text-xs text-gray-400">To summarize any complex legal document.</p>
          </div>
        </motion.div>

        {/* 24/7 Support */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
          onClick={onOpenChat}
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-xs text-gray-500">
              Our customer support and legal engineering teams are always available to assist with your research inquiries.
            </p>
          </div>

          <div className="my-6 flex items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-xs">
              ES
            </motion.div>
            <motion.div whileHover={{ scale: 1.15 }} className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 border-2 border-white shadow-md flex items-center justify-center font-bold text-sm">
              JD
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shadow-xs">
              AL
            </motion.div>
          </div>

          <p className="text-xs text-center font-semibold text-[#0066FF] hover:underline">
            Click to chat live with ClauseCite
          </p>
        </motion.div>

        {/* 90% Cost reduction */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">90% Cost reduction</h3>
            <p className="text-xs text-gray-500">
              In legal services compared to traditional billable hour retainers ($350–$650/hr).
            </p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative w-28 h-28 rounded-full border-8 border-gray-100 border-t-blue-600 border-r-blue-600 flex items-center justify-center shadow-inner">
              <div className="text-center">
                <span className="text-xl font-extrabold text-gray-900">-90%</span>
                <span className="block text-[9px] text-gray-400 uppercase font-semibold">Saved</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center font-medium">
            Save $4,800+ annually on review
          </p>
        </motion.div>
      </div>
    </section>
  );
}
