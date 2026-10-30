import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Paperclip,
  SlidersHorizontal,
  Plus,
  FileText,
  File,
  Trash2,
  Download,
  MessageSquare,
  Clock,
  ArrowRight,
  Sparkles,
  Check,
  Edit2,
  X,
  ShieldAlert,
  Search,
} from 'lucide-react';
import ClauseCiteLogo from '../common/ClauseCiteLogo.tsx';
import { CaseItem, CaseFile, CaseChat } from '../../data/testUserData.ts';
import { api } from '../../api/client.ts';

interface CaseWorkspaceProps {
  currentCase: CaseItem;
  onUpdateCase: (updated: CaseItem) => void;
  onDeleteCase: (caseId: string) => void;
  onOpenChat: (chatId?: string, caseName?: string) => void;
  onSummarizeFile?: (fileName: string) => void;
}

export default function CaseWorkspace({
  currentCase,
  onUpdateCase,
  onDeleteCase,
  onOpenChat,
  onSummarizeFile,
}: CaseWorkspaceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newChatPromptOpen, setNewChatPromptOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(currentCase.name);

  // Settings edit states
  const [settingsName, setSettingsName] = useState(currentCase.name);
  const [settingsType, setSettingsType] = useState<'default' | 'custom'>(currentCase.instructionType);
  const [settingsCustomText, setSettingsCustomText] = useState(currentCase.customInstructions || '');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const uploadRes = await api.uploadDocument(f, currentCase.id);
        const newFile: CaseFile = {
          id: uploadRes.document_id,
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          type: f.type || 'document',
          uploadedAt: 'Just now',
        };
        onUpdateCase({
          ...currentCase,
          files: [...currentCase.files, newFile],
          updatedAt: 'Just now',
        });
      } catch (err) {
        console.warn('Case document upload error:', err);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDeleteFile = (fileId: string) => {
    api.deleteDocument(fileId).catch(() => {});
    const updated: CaseItem = {
      ...currentCase,
      files: currentCase.files.filter((f) => f.id !== fileId),
      updatedAt: 'Just now',
    };
    onUpdateCase(updated);
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newChatTitle.trim() || `New consultation for ${currentCase.name}`;
    try {
      const serverChat = await api.createChat(title, currentCase.id);
      const newChat: CaseChat = {
        id: serverChat.id,
        title: serverChat.title || title,
        updatedAt: 'Just now',
        messagesCount: 1,
        preview: `Consultation started using case context: ${currentCase.name}`,
      };
      const updated: CaseItem = {
        ...currentCase,
        chats: [newChat, ...currentCase.chats],
        updatedAt: 'Just now',
      };
      onUpdateCase(updated);
      setNewChatTitle('');
      setNewChatPromptOpen(false);
      onOpenChat(newChat.id, currentCase.name);
    } catch (err) {
      console.warn('Backend create chat error:', err);
      const newChat: CaseChat = {
        id: `case-chat-${Date.now()}`,
        title,
        updatedAt: 'Just now',
        messagesCount: 1,
        preview: `Consultation started using case context: ${currentCase.name}`,
      };
      onUpdateCase({
        ...currentCase,
        chats: [newChat, ...currentCase.chats],
        updatedAt: 'Just now',
      });
      setNewChatTitle('');
      setNewChatPromptOpen(false);
      onOpenChat(newChat.id, currentCase.name);
    }
  };

  const handleSaveSettings = () => {
    const finalName = settingsName.trim() || currentCase.name;
    const finalInst = settingsType === 'custom' ? settingsCustomText : undefined;
    api.updateCase(currentCase.id, {
      title: finalName,
      custom_instructions: finalInst,
    }).catch(() => {});

    const updated: CaseItem = {
      ...currentCase,
      name: finalName,
      instructionType: settingsType,
      customInstructions: finalInst,
      updatedAt: 'Just now',
    };
    onUpdateCase(updated);
    setSettingsOpen(false);
  };

  const handleSaveInlineTitle = () => {
    if (tempTitle.trim()) {
      onUpdateCase({
        ...currentCase,
        name: tempTitle.trim(),
        updatedAt: 'Just now',
      });
    }
    setEditingTitle(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-gray-900 overflow-y-auto font-sans">
      {/* =========================================================================
          TOP CASE BAR (Matching image_8fcfe06c.png)
          ========================================================================= */}
      <header className="h-14 border-b border-gray-200 px-6 sm:px-8 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-black">
            <ClauseCiteLogo size="sm" showText={false} />
          </div>

          {editingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineTitle()}
                className="text-base sm:text-lg font-bold text-gray-900 border-b border-black focus:outline-none bg-transparent"
              />
              <button
                onClick={handleSaveInlineTitle}
                className="p-1 text-black hover:bg-gray-100 rounded cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight truncate">
                {currentCase.name}
              </h1>
              <button
                onClick={() => {
                  setTempTitle(currentCase.name);
                  setEditingTitle(true);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black p-1 transition cursor-pointer"
                title="Rename Case"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Instruction Pill */}
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              currentCase.instructionType === 'custom'
                ? 'bg-blue-50 text-[#0066FF] border-blue-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            {currentCase.instructionType === 'custom' ? 'Custom Rules' : 'Default Mode'}
          </span>
        </div>

        {/* Top Right: Tune / Settings Button (matching image_8fcfe06c.png) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSettingsName(currentCase.name);
              setSettingsType(currentCase.instructionType);
              setSettingsCustomText(currentCase.customInstructions || '');
              setSettingsOpen(true);
            }}
            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition cursor-pointer"
            title="Case Settings & Custom Rules"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN CASE WORKSPACE BODY
          ========================================================================= */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* 1. CENTRAL DRAG & DROP UPLOAD BOX (Matching image_8fcfe06c.png) */}
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-14 px-6 rounded-3xl border transition flex flex-col items-center justify-center text-center cursor-pointer select-none group ${
              isDragging
                ? 'border-[#0066FF] bg-blue-50/50 ring-2 ring-[#0066FF]/20 scale-[0.99]'
                : 'border-gray-200 bg-[#F9FAFB] hover:bg-gray-100/70 hover:border-gray-300'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Paperclip Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center text-gray-700 group-hover:text-black group-hover:scale-105 transition mb-3.5">
              <Paperclip className="w-5 h-5 rotate-45" />
            </div>

            {/* Main Upload Text */}
            <div className="text-sm sm:text-base font-bold text-gray-900">
              Drag &amp; Drop files
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              or browse files on your device
            </div>
          </div>

          {/* Formats Supported Disclaimer */}
          <p className="text-center text-[11px] text-gray-400">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV (max 50MB per file)
          </p>
        </div>

        {/* 2. CASE ATTACHED FILES (If Any) */}
        {currentCase.files.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
              <span>Attached case documents ({currentCase.files.length})</span>
              <span className="text-gray-400 font-normal">Available across all chats in this case</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCase.files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-gray-300 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#0066FF] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onSummarizeFile && (
                      <button
                        onClick={() => onSummarizeFile(file.name)}
                        className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-[10px] font-semibold text-gray-700 hover:text-black transition cursor-pointer"
                        title="Summarize in Agreement Workspace"
                      >
                        Summarize
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                      title="Remove file from case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CHATS IN THIS CASE SECTION (Matching image_8fcfe06c.png) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <span className="text-sm font-bold text-gray-900">
              Chats in this case
            </span>

            <button
              onClick={() => setNewChatPromptOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-[#0066FF] transition cursor-pointer px-2.5 py-1 rounded-lg hover:bg-gray-50"
            >
              <span>Create Chat</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of Chats */}
          {currentCase.chats.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-gray-700">
                No chats in this case yet
              </div>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                Click "Create Chat +" above to start a legal analysis using this case's files and custom instructions.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentCase.chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onOpenChat(chat.id, currentCase.name)}
                  className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 transition cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:text-black shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#0066FF] transition truncate">
                        {chat.title}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {chat.preview}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {chat.updatedAt}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                      {chat.messagesCount} msgs
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: CREATE CHAT IN THIS CASE
          ========================================================================= */}
      <AnimatePresence>
        {newChatPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNewChatPromptOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="text-sm font-bold text-gray-900">
                  New Chat in "{currentCase.name}"
                </h3>
                <button
                  onClick={() => setNewChatPromptOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateChat} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    What is this consultation regarding?
                  </label>
                  <input
                    type="text"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    placeholder="e.g., Tenant eviction rights or renewal clause"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#0066FF] text-xs text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 space-y-1">
                  <div className="font-semibold text-gray-800">Case Context Active:</div>
                  <div>• {currentCase.files.length} attached case documents will be accessible to AI.</div>
                  <div>• Instructions mode: <strong>{currentCase.instructionType}</strong></div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewChatPromptOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition"
                  >
                    Start Consultation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL / SLIDEOVER: CASE SETTINGS & CUSTOM INSTRUCTIONS
          ========================================================================= */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Case Settings &amp; Rules
                  </h3>
                  <p className="text-xs text-gray-500">
                    Configure instructions and settings for "{currentCase.name}"
                  </p>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Case Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Case Name
                  </label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Instruction Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Case AI Behavior
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettingsType('default')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        settingsType === 'default'
                          ? 'border-[#0066FF] bg-blue-50/40 ring-1 ring-[#0066FF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-gray-900">Default</div>
                      <div className="text-[11px] text-gray-500">Fast replies, no setup.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsType('custom')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        settingsType === 'custom'
                          ? 'border-[#0066FF] bg-blue-50/40 ring-1 ring-[#0066FF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-gray-900">Custom</div>
                      <div className="text-[11px] text-gray-500">Your rules, full control.</div>
                    </button>
                  </div>

                  {settingsType === 'custom' && (
                    <div className="mt-3">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Custom AI Rules for This Case
                      </label>
                      <textarea
                        rows={3}
                        value={settingsCustomText}
                        onChange={(e) => setSettingsCustomText(e.target.value)}
                        placeholder="E.g., Prioritize Delaware Chancery precedent and enforce mutual confidentiality covenants..."
                        className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                  )}
                </div>

                {/* Danger Zone: Delete Case */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-red-600">Delete Case</div>
                    <div className="text-[10px] text-gray-400">Permanently removes all chats and files</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete case "${currentCase.name}"?`)) {
                        onDeleteCase(currentCase.id);
                        setSettingsOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
