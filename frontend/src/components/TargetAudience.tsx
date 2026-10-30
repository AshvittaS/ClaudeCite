import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface TargetAudienceProps {
  onOpenAuth: (mode: 'signup') => void;
  onOpenChat: (prompt: string) => void;
}

export default function TargetAudience({ onOpenAuth, onOpenChat }: TargetAudienceProps) {
  const [selectedAudience, setSelectedAudience] = useState<number>(0);

  const audiences = [
    {
      title: 'AI for Legal Consumers',
      icon: 'fa-regular fa-user',
      desc: 'From deciphering complex terms to understanding rights, we have got you covered.',
      features: [
        'Plain-English contract explanations',
        'Apartment lease & deposit checks',
        'Debt collector response letters',
        'Consumer warranty claim disputes',
      ],
      samplePrompt: 'Review my apartment lease for hidden move-out penalty clauses',
    },
    {
      title: 'AI for Lawyers',
      icon: 'fa-solid fa-gavel',
      desc: 'Accelerate legal research, automate discovery synthesis, and verify statutory citations.',
      features: [
        'Shepardizing citation verification',
        'Drafting motion in limine briefs',
        'Deposition transcript indexing',
        'Automated redlining and diff reports',
      ],
      samplePrompt: 'Find Second Circuit precedent on implied covenant of good faith in licensing',
    },
    {
      title: 'AI for Law Firms',
      icon: 'fa-solid fa-building-columns',
      desc: 'Firm-wide institutional knowledge base, enterprise security, and team collaboration.',
      features: [
        'SOC2 & HIPAA compliant encryption',
        'Bespoke precedent document indexing',
        'Multi-associate revision workspaces',
        'Real-time matter billing estimation',
      ],
      samplePrompt: 'Audit master services agreement template against current Delaware Chancery standards',
    },
    {
      title: 'AI for Law Students',
      icon: 'fa-solid fa-graduation-cap',
      desc: 'Master case briefs, outline complex doctrines, and prepare for bar examinations.',
      features: [
        'IRAC / CREAC brief structuring',
        'Bluebook citation formatting',
        'Bar exam MBE hypothetical quizzes',
        'Moot court oral argument rebuttals',
      ],
      samplePrompt: 'Generate an IRAC case brief for Palsgraf v. Long Island Railroad Co.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="users">
      <div className="bg-[#121316] text-white rounded-[2.5rem] p-8 sm:p-14 lg:p-16 shadow-2xl relative overflow-hidden border border-white/5">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-14 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <i className="fa-solid fa-users text-xs"></i> Users
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Who is ClauseCite for?
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Whether you are a consumer, a student, a solo lawyer, or a full law firm — ClauseCite adapts to your legal needs and boosts your productivity.
          </p>
        </div>

        {/* 4 Audience Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {audiences.map((aud, index) => {
            const isSelected = selectedAudience === index;
            return (
              <motion.div
                key={aud.title}
                onClick={() => setSelectedAudience(index)}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
                className={`p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#22262E] border-blue-500 shadow-xl shadow-blue-500/10'
                    : 'bg-[#1B1E23] border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                      isSelected ? 'bg-[#0066FF] text-white shadow-md' : 'bg-white/10 text-white'
                    }`}
                  >
                    <i className={aud.icon}></i>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{aud.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">{aud.desc}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                    <span>{isSelected ? 'Active Profile' : 'Click to View Workflows'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Detail Drawer for Selected Audience */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAudience}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#1B1E23] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10"
          >
            <div className="space-y-3 flex-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Tailored Capabilities for {audiences[selectedAudience].title.replace('AI for ', '')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {audiences[selectedAudience].features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenChat(audiences[selectedAudience].samplePrompt)}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>Try Sample Prompt</span>
                <i className="fa-solid fa-terminal text-blue-400"></i>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold transition shadow-md shadow-blue-500/25"
              >
                Get Started Free
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
