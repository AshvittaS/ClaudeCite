import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import RealAppPreview from './common/RealAppPreview.tsx';

interface VideoSectionProps {
  onOpenVideo: () => void;
}

export default function VideoSection({ onOpenVideo }: VideoSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Text Callout */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-4 bg-[#121316] text-white p-8 sm:p-12 rounded-[2.5rem] flex flex-col justify-center border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider mb-6 w-fit border border-white/10">
            <i className="fa-solid fa-play text-xs"></i> Interactive Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            See ClauseCite in Action
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
            Watch our interactive tutorial showcasing the AI Agreement Creator, live RAG Indian statute citation, and real-time redline risk analysis.
          </p>

          <button
            onClick={onOpenVideo}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-full w-fit transition shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch 4-Min Product Tour
          </button>
        </motion.div>

        {/* Right: Actual Product Screen Preview with Interactive Play Overlay */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={onOpenVideo}
          className="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-black shadow-2xl group cursor-pointer border border-gray-800 min-h-[360px] flex items-center justify-center p-2 sm:p-4"
          data-cursor="Play"
        >
          {/* Actual Live ClauseCite Product Screen */}
          <div className="w-full pointer-events-none transform group-hover:scale-[1.01] transition-transform duration-500">
            <RealAppPreview initialTab="generator" interactive={false} />
          </div>

          {/* Dark gradient vignette & Play button overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center group-hover:bg-black/25 transition-all">
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-2xl pl-1 group-hover:bg-blue-600 group-hover:text-white transition-all"
            >
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/90 text-xs font-semibold backdrop-blur-md bg-black/60 px-4 py-2.5 rounded-2xl border border-white/10 pointer-events-none">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              ClauseCite Product Tour · 295+ Legal Templates & RAG Walkthrough
            </span>
            <span className="font-mono text-gray-300">4:00</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
