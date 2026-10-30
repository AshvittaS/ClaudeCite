import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

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
            <i className="fa-solid fa-play text-xs"></i> Learn
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            How to use ClauseCite
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
            The tutorial walkthrough shows you how easy it is to integrate our AI legal research and clause citation engine into your workflow.
          </p>

          <button
            onClick={onOpenVideo}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-3 rounded-full w-fit transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch 4-Min Demo
          </button>
        </motion.div>

        {/* Right: Video Player Mockup with Outcrowd Hover & Modal Trigger */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={onOpenVideo}
          className="lg:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-black shadow-xl group cursor-pointer border border-gray-800 min-h-[340px]"
          data-cursor="Play"
        >
          <img
            alt="ClauseCite product workflow walkthrough"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            src="/assets/aistudio/image_8fcfe06c.png"
          />

          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow-2xl pl-1 group-hover:bg-white transition-colors"
            >
              <i className="fa-solid fa-play text-xl sm:text-2xl text-black"></i>
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/90 text-xs font-semibold backdrop-blur-md bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 pointer-events-none">
            <span>ClauseCite Engine Overview · Discovery & Citation</span>
            <span className="font-mono">4:15</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
