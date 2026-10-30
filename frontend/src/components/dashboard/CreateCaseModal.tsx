import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Monitor, Pencil, Sparkles, Check } from 'lucide-react';
import { CaseItem } from '../../data/testUserData.ts';
import { api } from '../../api/client.ts';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCase: (newCase: CaseItem) => void;
}

export default function CreateCaseModal({
  isOpen,
  onClose,
  onCreateCase,
}: CreateCaseModalProps) {
  const [caseName, setCaseName] = useState('');
  const [instructionType, setInstructionType] = useState<'default' | 'custom'>('default');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = caseName.trim() || 'New Legal Matter';
    setIsSubmitting(true);
    try {
      const res = await api.createCase(
        finalName,
        'General Commercial',
        instructionType === 'custom' ? customInstructions : undefined
      );
      const newCase: CaseItem = {
        id: res.id,
        name: res.title || finalName,
        instructionType,
        customInstructions: instructionType === 'custom' ? customInstructions : undefined,
        createdAt: 'Just now',
        updatedAt: 'Just now',
        files: [],
        chats: [],
      };
      onCreateCase(newCase);
    } catch (err) {
      console.warn('Backend case creation error, fallback:', err);
      const newCase: CaseItem = {
        id: `case-${Date.now()}`,
        name: finalName,
        instructionType,
        customInstructions: instructionType === 'custom' ? customInstructions : undefined,
        createdAt: 'Just now',
        updatedAt: 'Just now',
        files: [],
        chats: [],
      };
      onCreateCase(newCase);
    } finally {
      setIsSubmitting(false);
      setCaseName('');
      setInstructionType('default');
      setCustomInstructions('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden text-gray-900 z-10"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Create case
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Create a new case to start working on it
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
            {/* Case Name Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Case name
              </label>
              <input
                type="text"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="NDA Templates"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 text-xs sm:text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none"
              />
            </div>

            {/* Instructions Cards */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Instructions
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Default Card */}
                <button
                  type="button"
                  onClick={() => setInstructionType('default')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between ${
                    instructionType === 'default'
                      ? 'border-[#0066FF] bg-blue-50/40 ring-1 ring-[#0066FF]'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div>
                    <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 mb-2.5">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-gray-900">Default</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Fast replies, no setup.
                    </div>
                  </div>
                  {instructionType === 'default' && (
                    <div className="absolute top-3 right-3 text-[#0066FF]">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {/* Custom Card */}
                <button
                  type="button"
                  onClick={() => setInstructionType('custom')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between ${
                    instructionType === 'custom'
                      ? 'border-[#0066FF] bg-blue-50/40 ring-1 ring-[#0066FF]'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div>
                    <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 mb-2.5">
                      <Pencil className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-gray-900">Custom</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Your rules, full control.
                    </div>
                  </div>
                  {instructionType === 'custom' && (
                    <div className="absolute top-3 right-3 text-[#0066FF]">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </div>

              {/* Custom Instructions Textarea */}
              {instructionType === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-2"
                >
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Custom Legal Instructions & Guidelines
                  </label>
                  <textarea
                    rows={3}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="E.g., You are senior litigation counsel adhering strictly to Delaware Chancery rules and Bluebook citations. Prioritize tenant protections..."
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition"
                  />
                </motion.div>
              )}
            </div>

            {/* Bottom Create Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-gray-800 active:scale-[0.99] text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
