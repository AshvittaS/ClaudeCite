import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Check } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenChat: (initialPrompt?: string) => void;
  selectedAudience: 'consumers' | 'lawyers';
  onAudienceChange: (audience: 'consumers' | 'lawyers') => void;
}

export default function Hero({
  onOpenAuth,
  onOpenChat,
  selectedAudience,
  onAudienceChange,
}: HeroProps) {
  // Outcrowd 3D tilt physics for the right hero image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    damping: 25,
    stiffness: 200,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    damping: 25,
    stiffness: 200,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const audienceSubtitles = {
    consumers:
      'Say goodbye to expensive legal consultation, long waits for appointments, and confusing legal texts.',
    lawyers:
      'Automate discovery, instant statutory citations, and multi-document redlining for your practice.',
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 lg:pt-10 lg:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Hero Left Column: Dark Card Style with Outcrowd Liquid Aesthetics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 bg-[#121316] text-white p-8 sm:p-12 rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[520px] border border-white/5"
        >
          {/* Outcrowd Radial Glow Accent */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Product of the Day badge */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-gray-200 border border-white/10 backdrop-blur-sm shadow-xs cursor-default"
            >
              <span className="text-amber-400">
                <i className="fa-solid fa-trophy"></i>
              </span>
              <span>#1 Product of the Day</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.14]">
              ClauseCite: your personal legal AI assistant
            </h1>

            {/* Primary Action Button with Outcrowd Magnetic Spring */}
            <div className="pt-2">
              <motion.button
                onClick={() => onOpenAuth('signup')}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[#0066FF] hover:bg-blue-600 rounded-full transition-colors shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 cursor-pointer"
                data-cursor="Try"
              >
                Try for Free
              </motion.button>
            </div>

            {/* Outcrowd Animated Audience Toggle Pill */}
            <div className="pt-4">
              <div className="inline-flex items-center bg-[#212429] p-1.5 rounded-full border border-gray-800 relative">
                <button
                  type="button"
                  onClick={() => onAudienceChange('consumers')}
                  className={`relative z-10 px-5 py-2 text-xs font-bold rounded-full transition-colors ${
                    selectedAudience === 'consumers' ? 'text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {selectedAudience === 'consumers' && (
                    <motion.div
                      layoutId="audience-active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">For consumers</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAudienceChange('lawyers')}
                  className={`relative z-10 px-5 py-2 text-xs font-bold rounded-full transition-colors ${
                    selectedAudience === 'lawyers' ? 'text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {selectedAudience === 'lawyers' && (
                    <motion.div
                      layoutId="audience-active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">For lawyers</span>
                </button>
              </div>
            </div>

            {/* Dynamic Audience Subtitle with Smooth Crossfade */}
            <motion.p
              key={selectedAudience}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 text-sm leading-relaxed max-w-sm pt-2"
            >
              {audienceSubtitles[selectedAudience]}
            </motion.p>
          </div>
        </motion.div>

        {/* Hero Right Column: Mockup Image with 3D Parallax Tilt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex justify-center items-center relative perspective-[1000px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full max-w-[620px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200/70 bg-white group"
            data-cursor="Explore"
          >
            <img
              alt="ClauseCite web and mobile dashboard interface on devices"
              className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              src="/assets/aistudio/image_92bc8b8b.png"
            />

            {/* Floating Live Citation Verification Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, -6, 0], opacity: 1 }}
              transition={{
                y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                opacity: { duration: 0.6, delay: 0.4 },
              }}
              className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-gray-200/80 flex items-center gap-2.5"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-gray-900 leading-none">12+ Citations Verified</p>
                <p className="text-[9px] text-gray-500 mt-0.5">50 States + Federal Court</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
