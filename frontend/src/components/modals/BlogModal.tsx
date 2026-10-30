import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, BookOpen, Share2 } from 'lucide-react';

export interface ArticleData {
  id: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  summary: string;
  paragraphs: string[];
}

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleData | null;
}

export default function BlogModal({ isOpen, onClose, article }: BlogModalProps) {
  if (!isOpen || !article) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Image */}
          <div className="relative h-60 w-full overflow-hidden bg-gray-100">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-6">
              <span className="bg-[#0066FF] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                {article.category}
              </span>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8 overflow-y-auto space-y-6 flex-1">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {article.date}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                {article.title}
              </h2>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl text-xs sm:text-sm text-blue-900 font-medium leading-relaxed">
              {article.summary}
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
              {article.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Author / Citation Footer */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-xs">
                  CC
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">ClauseCite Legal Research Desk</p>
                  <p className="text-[10px] text-gray-400">Reviewed by Licensed Attorneys</p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
