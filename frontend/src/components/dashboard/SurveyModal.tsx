import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Star, CheckCircle, Check, Sparkles, Trophy } from 'lucide-react';
import { api } from '../../api/client.ts';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurveyModal({ isOpen, onClose }: SurveyModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [featureVote, setFeatureVote] = useState<string>('Contract Redlining');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitFeedback(featureVote, `Rating: ${rating}/5 - ${feedbackText}`);
    } catch (err) {
      console.error('Feedback submit error:', err);
    }
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Product Feedback Survey
                </h3>
                <p className="text-xs text-gray-500">
                  Help improve ClauseCite Legal Suite
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-gray-900">Thank You!</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Your feedback has been logged. Thank you for helping shape ClauseCite.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-md"
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Question 1: Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  How accurate are the statutory legal citations?
                </label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setRating(val)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          val <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Favorite feature */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Which upcoming feature would benefit your legal workflow most?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Contract Redlining',
                    'State Court Search',
                    'Voice Consultation',
                    'Automated Filing',
                  ].map((feat) => (
                    <button
                      type="button"
                      key={feat}
                      onClick={() => setFeatureVote(feat)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                        featureVote === feat
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {feat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Any suggestions or specific statutes you'd like added?
                </label>
                <textarea
                  rows={2}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Add more Delaware Chancery Court corporate law precedents..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
