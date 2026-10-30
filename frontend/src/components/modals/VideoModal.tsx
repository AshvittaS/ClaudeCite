import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  CheckCircle,
  Sparkles,
  FileText,
  Scale,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import RealAppPreview from '../common/RealAppPreview.tsx';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkspace?: () => void;
}

export default function VideoModal({ isOpen, onClose, onOpenWorkspace }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [progress, setProgress] = useState(15);

  const chapters = [
    { title: '01. Agreement Creator & 295+ Templates', tab: 'generator' as const, duration: '1:00' },
    { title: '02. Live RAG Statute & Citation Verification', tab: 'rag' as const, duration: '1:15' },
    { title: '03. Real-Time Redline & Liability Analysis', tab: 'redline' as const, duration: '1:00' },
    { title: '04. Legal Audit Seal & Instant Export', tab: 'generator' as const, duration: '0:45' },
  ];

  // Auto-advance progress when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveChapter((c) => (c + 1) % chapters.length);
          return 0;
        }
        return prev + 1.5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying, chapters.length]);

  if (!isOpen) return null;

  const currentTab = chapters[activeChapter].tab;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-5xl bg-[#111315] text-white rounded-3xl shadow-2xl border border-gray-800 overflow-hidden my-4 z-10 flex flex-col"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                ClauseCite Live Product Demo Video · Tamil Nadu & Central Legal Suite
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenWorkspace && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWorkspace();
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Workspace</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real Video / Live App Player Showcase */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
            {/* Embedded Live Screen Rendering of ClauseCite */}
            <div className="w-full h-full p-2 sm:p-4 bg-gradient-to-b from-[#0A0B0D] to-[#121316] flex items-center justify-center">
              <RealAppPreview initialTab={currentTab} interactive={false} />
            </div>

            {/* Simulated Live Scan Floating Tag */}
            <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-blue-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Recording: ClauseCite v2.4 Live Session</span>
            </div>

            {/* Play / Pause Floating Controls */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition opacity-0 group-hover:opacity-100 z-30 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-2xl pl-1 hover:scale-110 transition">
                {isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black" />}
              </div>
            </button>
          </div>

          {/* Chapter Bar & Timeline Controls */}
          <div className="p-5 sm:p-6 bg-[#16181C] space-y-4 border-t border-gray-800">
            {/* Timeline scrubber */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = (clickX / rect.width) * 100;
                setProgress(pct);
              }}
              className="w-full bg-gray-800 rounded-full h-2 overflow-hidden cursor-pointer relative"
            >
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Controls & Chapters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-xs font-bold text-white hover:text-blue-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-xs font-medium text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs font-mono text-gray-400">
                  {Math.floor((progress / 100) * 4)}:
                  {String(Math.floor(((progress / 100) * 240) % 60)).padStart(2, '0')}{' '}
                  / 4:00
                </span>
              </div>

              {/* Chapters Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                {chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveChapter(idx);
                      setProgress(idx * 25);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      activeChapter === idx
                        ? 'bg-[#0066FF] text-white shadow-md'
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
