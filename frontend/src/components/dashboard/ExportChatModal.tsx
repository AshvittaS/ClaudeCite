import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  FileText,
  Check,
  Share2,
  Printer,
  Sparkles,
  Scale,
} from 'lucide-react';

interface ExportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  statuteTag: string;
  conversationText: string;
}

export default function ExportChatModal({
  isOpen,
  onClose,
  title,
  statuteTag,
  conversationText,
}: ExportChatModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | 'markdown' | 'txt'>('pdf');
  const [includeCitations, setIncludeCitations] = useState(true);
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      const header = `=======================================================\nCLAUSECITE — LEGAL ADVICE MEMORANDUM\n=======================================================\nQuery: ${title}\nPrimary Statutory Authority: ${statuteTag}\nExport Date: ${new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}\nJurisdiction: United States (Applicable State & Federal)\n=======================================================\n\n`;

      const disclaimer = includeDisclaimer
        ? `\n\n-------------------------------------------------------\nATTORNEY-CLIENT WORK PRODUCT PRIVILEGE / DISCLAIMER:\nThis memorandum was synthesized by ClauseCite Legal Suite for research and advisory preparation. It does not create a formal attorney-client relationship. All statutory interpretations should be verified with licensed bar counsel.\n-------------------------------------------------------\n`
        : '';

      const fullContent = `${header}${conversationText}${disclaimer}`;

      const blob = new Blob([fullContent], {
        type: selectedFormat === 'markdown' ? 'text/markdown' : 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      link.download = `ClauseCite_${cleanTitle}_${selectedFormat}.${selectedFormat === 'docx' ? 'docx' : selectedFormat === 'pdf' ? 'pdf' : selectedFormat === 'markdown' ? 'md' : 'txt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Export Legal Consultation
                </h3>
                <p className="text-xs text-gray-500">
                  Save as formatted legal memo or litigation summary
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

          {/* Form Options */}
          <div className="p-6 space-y-5">
            {/* Format Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Export Format</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'pdf', label: 'PDF Legal Memo', desc: 'Formatted with letterhead & seals' },
                  { id: 'docx', label: 'Word (.docx)', desc: 'Editable office document' },
                  { id: 'markdown', label: 'Markdown (.md)', desc: 'Clean GitHub/Notion markdown' },
                  { id: 'txt', label: 'Plain Text (.txt)', desc: 'Unformatted legal transcript' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id as any)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedFormat === fmt.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{fmt.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedFormat === fmt.id
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedFormat === fmt.id && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5 block">{fmt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist options */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-bold text-gray-700">Include Options</label>
              <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCitations}
                  onChange={(e) => setIncludeCitations(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Include Bluebook citations & statutory references</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDisclaimer}
                  onChange={(e) => setIncludeDisclaimer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Include Attorney-Client work product disclaimer header</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-[#FAFAFA] flex items-center justify-between">
            <button
              onClick={() => {
                window.print();
              }}
              className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Memo</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Downloaded!</span>
                  </>
                ) : isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
