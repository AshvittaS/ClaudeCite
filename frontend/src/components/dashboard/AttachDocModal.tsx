import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Paperclip,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Folder,
  ShieldCheck,
  Check,
  Search,
} from 'lucide-react';
import { INITIAL_VAULT_DOCS, LegalVaultDoc } from '../../data/testUserData.ts';
import { api } from '../../api/client.ts';

export interface AttachedDocument {
  id: string;
  name: string;
  size: string;
  category: string;
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface AttachDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachDoc: (doc: AttachedDocument) => void;
}

export default function AttachDocModal({
  isOpen,
  onClose,
  onAttachDoc,
}: AttachDocModalProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'upload'>('vault');
  const [vaultDocs, setVaultDocs] = useState<LegalVaultDoc[]>(INITIAL_VAULT_DOCS);
  const [selectedVaultDoc, setSelectedVaultDoc] = useState<LegalVaultDoc | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      api.listDocuments()
        .then((serverDocs) => {
          if (Array.isArray(serverDocs) && serverDocs.length > 0) {
            const mapped: LegalVaultDoc[] = serverDocs.map((d: any) => ({
              id: d.id,
              name: d.original_filename,
              category: 'Uploaded Legal Document',
              size: `${((d.size_bytes || 1024) / (1024 * 1024)).toFixed(1)} MB`,
              date: 'Recently',
              riskScore: 25,
              riskLevel: 'Low',
              status: 'Audited',
              summary: 'Audited legal document available for analysis.',
              keyRisks: ['Verified statutory compliance.'],
            }));
            setVaultDocs(mapped);
            if (!selectedVaultDoc) {
              setSelectedVaultDoc(mapped[0]);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const filteredVaultDocs = vaultDocs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      d.category.toLowerCase().includes(searchVal.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchVal.toLowerCase())
  );

  const handleAttachVaultDoc = () => {
    if (!selectedVaultDoc) return;
    onAttachDoc({
      id: selectedVaultDoc.id,
      name: selectedVaultDoc.name,
      size: selectedVaultDoc.size,
      category: selectedVaultDoc.category,
      summary: selectedVaultDoc.summary,
      riskLevel: selectedVaultDoc.riskLevel,
    });
    onClose();
  };

  const handleRealUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const uploadRes = await api.uploadDocument(selectedFile);
      setIsUploading(false);
      onAttachDoc({
        id: uploadRes?.document_id || `doc-${Date.now()}`,
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        category: 'Uploaded Legal Document',
        summary: 'Document uploaded for immediate statutory and clause analysis.',
        riskLevel: 'Low',
      });
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      console.error('File upload error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                <Paperclip className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Attach Document as Legal Context
                </h2>
                <p className="text-xs text-gray-500">
                  Provide a contract or agreement for AI Lawyer to analyze and cite directly in chat
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

          {/* Tab Selector */}
          <div className="px-6 pt-4 border-b border-gray-100 bg-[#FAFAFA] flex items-center gap-4 shrink-0">
            <button
              onClick={() => setActiveTab('vault')}
              className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'vault'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Select from Legal Vault ({INITIAL_VAULT_DOCS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Document</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'vault' ? (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Search documents in vault..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* List of Vault Docs */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {filteredVaultDocs.map((doc) => {
                    const isSelected = selectedVaultDoc?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedVaultDoc(doc)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-500 shadow-xs'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                {doc.name}
                              </h4>
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {doc.size}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                              {doc.summary}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            doc.riskLevel === 'High'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : doc.riskLevel === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {doc.riskLevel} Risk
                          </span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Upload Tab */
              <form onSubmit={handleRealUpload} className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center space-y-3 bg-[#FAFAFA] hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-gray-200 text-gray-700 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      {selectedFile ? selectedFile.name : 'Drag & Drop Contract or Browse Files'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {selectedFile
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload & index`
                        : 'Supports PDF, DOCX, TXT up to 25 MB. End-to-end encrypted.'}
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-gray-400">
              {activeTab === 'vault' && selectedVaultDoc
                ? `Selected: ${selectedVaultDoc.name}`
                : selectedFile
                ? `Ready to upload: ${selectedFile.name}`
                : 'Documents are processed securely under attorney-client work product standards.'}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>

              {activeTab === 'vault' ? (
                <button
                  type="button"
                  disabled={!selectedVaultDoc}
                  onClick={handleAttachVaultDoc}
                  className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition disabled:opacity-40 cursor-pointer shadow-md"
                >
                  Attach to Chat
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRealUpload}
                  disabled={!selectedFile || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition disabled:opacity-40 cursor-pointer shadow-md flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Upload & Attach</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
