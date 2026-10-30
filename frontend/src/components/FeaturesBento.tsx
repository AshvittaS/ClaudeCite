import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Check, Sparkles, Scale, FileText, ArrowRight, ShieldCheck, Globe, UserCheck } from 'lucide-react';

interface FeaturesBentoProps {
  onOpenCompare: () => void;
  onOpenChat: (initialPrompt?: string) => void;
}

export default function FeaturesBento({ onOpenCompare, onOpenChat }: FeaturesBentoProps) {
  const [chatPrompt, setChatPrompt] = useState('What are my rights as an employer in NYC?');
  const [activePersonaTag, setActivePersonaTag] = useState('Privacy');
  const [radarScanning, setRadarScanning] = useState(true);

  const personaTags = [
    { label: 'Contracts', icon: 'fa-solid fa-signature' },
    { label: 'Privacy', icon: 'fa-solid fa-shield-halved' },
    { label: 'Corporate', icon: 'fa-solid fa-briefcase' },
    { label: 'Multi-lingual', icon: 'fa-solid fa-language' },
    { label: 'Student', icon: 'fa-solid fa-user-graduate' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" id="features">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-4"
        >
          <i className="fa-solid fa-wand-magic-sparkles text-xs"></i> Features
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4"
        >
          Features of legal AI
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-base sm:text-lg text-gray-600"
        >
          Explore features that boost your productivity. From document automation to advanced research, we've got the hard work covered.
        </motion.p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Internet Powered with Interactive Radar */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow group"
          data-cursor="Live"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Internet-powered</h3>
            <p className="text-sm text-gray-500 mb-8">
              Rapid web research, completing hours of analysis in seconds.
            </p>
          </div>

          {/* Radar graphic visual with animated rotating scanner */}
          <div
            onClick={() => setRadarScanning(!radarScanning)}
            className="h-44 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden cursor-pointer"
          >
            {/* Concentric circles */}
            <div className="w-36 h-36 rounded-full border border-gray-200 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm shadow-md">
                  <i className="fa-solid fa-scale-balanced"></i>
                </div>
              </div>
            </div>

            {/* Rotating radar sweep */}
            {radarScanning && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent pointer-events-none"
              />
            )}

            {/* Pulsing signal pin */}
            <div className="absolute right-6 top-8 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
            <div className="absolute right-6 top-8 w-2.5 h-2.5 rounded-full bg-blue-600"></div>

            <span className="absolute bottom-2 left-3 text-[10px] font-mono text-gray-400">
              Live Westlaw/Lexis Citation Prober
            </span>
          </div>
        </motion.div>

        {/* Card 2: Ask ClauseCite (AI Lawyer) (Takes 2 cols on md) */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ask ClauseCite</h3>
              <button
                onClick={() => onOpenChat(chatPrompt)}
                className="text-xs font-bold text-[#0066FF] hover:text-blue-700 flex items-center gap-1 transition"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Legal research has never been easier. Have a conversation with your virtual assistant and get simple answers to complex questions in real-time.
            </p>
          </div>

          {/* Interactive Chat UI Preview */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200/70 space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs max-w-md">
              <p className="text-xs font-semibold text-gray-800">Hello, Chris! 👋</p>
              <p className="text-xs text-gray-500 mt-1">
                Select a question from the Prompts library below, or write your own. You can also add context from any of the already existing chat from history.
              </p>
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => onOpenChat(chatPrompt)}
                className="bg-black text-white px-4 py-2.5 rounded-xl text-xs font-medium max-w-sm shadow-xs text-left cursor-pointer hover:bg-gray-900 transition"
              >
                {chatPrompt}
              </motion.button>
            </div>

            {/* Input field that launches Chat modal */}
            <div
              onClick={() => onOpenChat(chatPrompt)}
              className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-400 flex items-center justify-between cursor-pointer hover:border-blue-400 transition"
            >
              <span>Click to ask or type your legal question...</span>
              <i className="fa-solid fa-paper-plane text-blue-600"></i>
            </div>
          </div>
        </motion.div>

        {/* Card 3: AI document handling */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI document handling</h3>
            <p className="text-sm text-gray-500 mb-6">
              The fastest way to summarize agreements, convert images to text, translate documents, and more.
            </p>
          </div>

          {/* Document comparison list with real action button */}
          <div className="space-y-2.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
              <div className="flex items-center gap-2.5">
                <i className="fa-regular fa-file-pdf text-red-500 text-base"></i>
                <div>
                  <p className="font-semibold text-gray-800">Legal_claim.pdf</p>
                  <p className="text-[10px] text-gray-400">1,045 KB</p>
                </div>
              </div>
              <i className="fa-solid fa-check text-green-500 text-xs"></i>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
              <div className="flex items-center gap-2.5">
                <i className="fa-regular fa-file-pdf text-red-500 text-base"></i>
                <div>
                  <p className="font-semibold text-gray-800">Legal_claim2.pdf</p>
                  <p className="text-[10px] text-gray-400">854 KB</p>
                </div>
              </div>
              <i className="fa-solid fa-check text-green-500 text-xs"></i>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenCompare}
              className="w-full mt-2 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              data-cursor="Compare"
            >
              <i className="fa-solid fa-code-compare"></i> Compare with AI
            </motion.button>
          </div>
        </motion.div>

        {/* Card 4: Multi-platform with Hotlinked Assets */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-platform</h3>
            <p className="text-sm text-gray-500 mb-4">
              Access our platform with a simple tap — on the web, iOS, or Android.
            </p>
          </div>

          <div className="relative pt-2 flex items-center justify-center">
            <img
              alt="Multi-platform interface on web"
              className="w-full max-w-[280px] rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300"
              src="/assets/aistudio/image_41aa24fc.png"
            />
            <img
              alt="Mobile interface"
              className="w-20 absolute -bottom-2 right-4 shadow-xl rounded-xl border-2 border-white transform hover:scale-110 transition-transform duration-300"
              src="/assets/aistudio/image_a0bc4085.png"
            />
          </div>
        </motion.div>

        {/* Card 5: Personalized for you with Interactive Filter Tabs */}
        <motion.div
          whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
          className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized for you</h3>
            <p className="text-sm text-gray-500 mb-6">
              Customize and educate it to match your unique preferences.
            </p>
          </div>

          {/* Interactive filter pills with Outcrowd spring response */}
          <div className="h-44 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-center gap-2.5 p-4">
            {personaTags.map((tag) => {
              const isSelected = activePersonaTag === tag.label;
              return (
                <motion.button
                  key={tag.label}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActivePersonaTag(tag.label)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <i className={`${tag.icon} mr-1.5 ${isSelected ? 'text-white' : 'text-gray-400'}`}></i>
                  {tag.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
