import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, CheckCircle } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    { title: '01. Uploading Legal Claims', time: '0:00' },
    { title: '02. Real-Time Clause Redlining', time: '1:15' },
    { title: '03. Statute Citation Verification', time: '2:40' },
    { title: '04. Exporting Client-Ready Advice', time: '3:50' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-4xl bg-[#111315] text-white rounded-3xl shadow-2xl border border-gray-800 overflow-hidden my-4 z-10 flex flex-col"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                ClauseCite Walkthrough · Interactive Tour
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video Player Display Container */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
            <img
              src="/assets/aistudio/image_6883a973.png"
              alt="ClauseCite product walkthrough"
              className="w-full h-full object-cover opacity-80"
            />

            {/* Simulated Live Scan Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none flex flex-col justify-between p-6">
              <div className="self-end bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-blue-400 font-mono">
                ClauseCite Engine 4.0 Active · NYC / CA Jurisdiction
              </div>

              <div className="max-w-md bg-[#181B1E]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Live Redline Annotation
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  "Section 4.1 liability cap successfully modified to mutual standard. Saved 3.5 billable hours of manual review."
                </p>
              </div>
            </div>

            {/* Play / Pause Center Floating Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition"
            >
              <div className="w-20 h-20 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow-2xl pl-1 hover:bg-white transition">
                {isPlaying ? <Pause className="w-7 h-7 text-black" /> : <Play className="w-7 h-7 text-black" />}
              </div>
            </button>
          </div>

          {/* Chapter Bar & Timeline */}
          <div className="p-6 bg-[#16181C] space-y-4">
            {/* Timeline scrubber */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden cursor-pointer relative">
              <div
                className="bg-[#0066FF] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(activeChapter + 1) * 25}%` }}
              ></div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-xs font-bold text-white hover:text-blue-400 transition flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-xs font-medium text-gray-400 hover:text-white transition flex items-center gap-1"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs font-mono text-gray-400">1:45 / 4:15</span>
              </div>

              {/* Chapters Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveChapter(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                      activeChapter === idx
                        ? 'bg-[#0066FF] text-white shadow-sm'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
