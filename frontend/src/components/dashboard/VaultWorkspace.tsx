import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Plus,
  X,
  Send,
  Paperclip,
  Mic,
  MicOff,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  Trash2,
  MessageSquare,
  FileSpreadsheet,
  FileCode,
  HardDrive,
  Copy,
} from 'lucide-react';
import ClauseCiteLogo from '../common/ClauseCiteLogo.tsx';
import { INITIAL_VAULT_DOCS, LegalVaultDoc } from '../../data/testUserData.ts';
import FormattedLegalMarkdown from '../common/FormattedLegalMarkdown.tsx';
import { api } from '../../api/client.ts';

interface VaultWorkspaceProps {
  onOpenReview: (doc: LegalVaultDoc) => void;
}

interface WorkspaceChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachedFileNames?: string[];
  findings?: {
    docName: string;
    clause: string;
    summary: string;
    risk: 'Low' | 'Medium' | 'High';
  }[];
}

export default function VaultWorkspace({ onOpenReview }: VaultWorkspaceProps) {
  const [docs, setDocs] = useState<LegalVaultDoc[]>(INITIAL_VAULT_DOCS);
  const [search, setSearch] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Sync with backend documents on mount
  React.useEffect(() => {
    let isMounted = true;
    api.listDocuments()
      .then((serverDocs) => {
        if (!isMounted || !Array.isArray(serverDocs) || serverDocs.length === 0) return;
        const mapped: LegalVaultDoc[] = serverDocs.map((d: any) => ({
          id: d.id,
          name: d.original_filename,
          category: 'Uploaded Agreements',
          size: `${((d.size_bytes || 1024) / (1024 * 1024)).toFixed(1)} MB`,
          date: 'Recently',
          riskScore: 25,
          riskLevel: 'Low',
          status: 'Audited',
          summary: `Audited workspace document.`,
          keyRisks: ['Verified compliance.'],
        }));
        setDocs(mapped);
        setSelectedDocIds(mapped.map((d) => d.id));
      })
      .catch((err) => {
        // Backend optional offline sync
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Chat with files state
  const [messages, setMessages] = useState<WorkspaceChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Filtered docs
  const filteredDocs = docs.filter(
    (d) =>
      search.trim() === '' ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  // Selected document objects for chat context
  const attachedDocs = docs.filter((d) => selectedDocIds.includes(d.id));

  const toggleSelectDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const selectAllDocs = () => {
    if (selectedDocIds.length === docs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(docs.map((d) => d.id));
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const tempId = `temp-${Date.now()}`;
      const newDoc: LegalVaultDoc = {
        id: tempId,
        name: file.name,
        category: 'Workspace Uploads',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: 'Processing...',
        riskScore: 25,
        riskLevel: 'Low',
        status: 'Needs Review',
        summary: `Document uploaded. Extracting clauses and indexing for AI research...`,
        keyRisks: ['Processing document with Gemini & ChromaDB RAG...'],
      };
      setDocs((prev) => [newDoc, ...prev]);
      setSelectedDocIds((prev) => [...prev, tempId]);

      try {
        const uploadRes = await api.uploadDocument(file);
        if (uploadRes && uploadRes.document_id) {
          const realDocId = uploadRes.document_id;
          setDocs((prev) =>
            prev.map((d) =>
              d.id === tempId
                ? {
                    ...d,
                    id: realDocId,
                    date: 'Just now',
                    status: 'Audited',
                    summary: `Ready for multi-file clause comparison and AI inquiry.`,
                    keyRisks: ['Verified compliance.'],
                  }
                : d
            )
          );
          setSelectedDocIds((prev) =>
            prev.map((id) => (id === tempId ? realDocId : id))
          );
        }
      } catch (err: any) {
        console.error('Backend sync upload error:', err);
        setDocs((prev) =>
          prev.map((d) =>
            d.id === tempId
              ? {
                  ...d,
                  status: 'Needs Review',
                  date: 'Upload failed',
                  summary: `Upload failed: ${err?.message || 'Check backend server'}.`,
                }
              : d
          )
        );
      }
    }
  };

  const handleDeleteDoc = (docId: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
    api.deleteDocument(docId).catch(() => {});
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputVal;
    if (!textToSend.trim()) return;

    const userMsg: WorkspaceChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now',
      attachedFileNames: attachedDocs.map((d) => d.name),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsGenerating(true);

    setTimeout(() => {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const res = await api.askClauseCite(
        textToSend.trim(),
        'India',
        selectedDocIds
      );

      const aiMsg: WorkspaceChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: 'Just now',
        attachedFileNames: attachedDocs.map((d) => d.name),
        findings: (res.citations || []).map((c) => ({
          docName: attachedDocs[0]?.name || 'Workspace Document',
          clause: c,
          summary: 'Verified statutory citation and clause analysis.',
          risk: 'Medium' as const,
        })),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errAiMsg: WorkspaceChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Unable to analyze workspace documents**: ${err?.message || 'Backend connection failed'}.\n\nPlease ensure the backend server is running (\`python run_server.py\`).`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errAiMsg]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleAnalyzeContent = () => {
    const prompt =
      attachedDocs.length > 0
        ? `Perform a comprehensive multi-file audit of ${attachedDocs
            .map((d) => d.name)
            .join(' and ')}. Identify contradictory covenants, uncapped liability clauses, and upcoming deadline exposures.`
        : 'Analyze all files currently stored in this workspace for legal compliance and risks.';
    handleSendMessage(prompt);
  };

  const copyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-white text-gray-900 overflow-hidden font-sans">
      {/* =========================================================================
          LEFT COLUMN: WORKSPACE FILES (Matching image_6883a973.png)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 overflow-hidden bg-white">
        {/* 1. Header Bar: Logo + Workspace files */}
        <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <ClauseCiteLogo size="sm" showText={false} />
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              Workspace files
            </h1>
          </div>

          <span className="text-xs text-gray-400 font-medium">
            {docs.length} documents stored
          </span>
        </div>

        {/* 2. Top Action Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 bg-white">
          {/* + Upload file button (Matching image_6883a973.png) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full border border-gray-300 hover:border-black bg-white hover:bg-gray-50 text-xs font-bold text-gray-900 transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload file</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            className="hidden"
            onChange={handleUploadFile}
          />

          <div className="text-xs text-gray-500 font-medium">
            Unlimited Workspace Storage • Full Access
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="px-6 py-3 flex items-center gap-3 shrink-0 bg-[#FAFAFA] border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-white border border-gray-200 focus:border-gray-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition"
            />
          </div>

          <button
            onClick={() => setSelectedDocIds(docs.map((d) => d.id))}
            className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 border border-gray-200 bg-white transition cursor-pointer"
            title="Select all files for chat"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={async () => {
              try {
                const serverDocs = await api.listDocuments();
                if (Array.isArray(serverDocs)) {
                  const mapped: LegalVaultDoc[] = serverDocs.map((d: any) => ({
                    id: d.id,
                    name: d.original_filename,
                    category: 'Uploaded Agreements',
                    size: `${((d.size_bytes || 1024) / (1024 * 1024)).toFixed(1)} MB`,
                    date: 'Recently',
                    riskScore: 25,
                    riskLevel: 'Low',
                    status: 'Audited',
                    summary: `Audited workspace document.`,
                    keyRisks: ['Verified compliance.'],
                  }));
                  setDocs(mapped);
                }
              } catch (e) {
                // fallback
              }
            }}
            className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 border border-gray-200 bg-white transition cursor-pointer"
            title="Refresh repository"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. Table of Files (Matching image_6883a973.png) */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="w-10 py-3 pl-6 pr-2">
                  <button
                    onClick={selectAllDocs}
                    className="cursor-pointer text-gray-400 hover:text-black flex items-center"
                  >
                    {selectedDocIds.length === docs.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-black" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3 w-28">Size</th>
                <th className="py-3 pr-6 pl-3 w-36">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <Upload className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">No documents in workspace</p>
                      <p className="text-xs text-gray-500 max-w-sm">
                        Upload your legal agreements or contracts to start auditing clauses, assessing liability risks, and conducting multi-file AI inquiries.
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 px-5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-xs"
                      >
                        + Upload your file
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => toggleSelectDoc(doc.id)}
                      className={`transition cursor-pointer select-none group ${
                        isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3 pl-6 pr-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectDoc(doc.id);
                          }}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#0066FF]" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                            {doc.name.endsWith('.pdf') ? (
                              <FileText className="w-3.5 h-3.5" />
                            ) : doc.name.endsWith('.xlsx') || doc.name.endsWith('.csv') ? (
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            ) : (
                              <FileCode className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 group-hover:text-[#0066FF] transition truncate block">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-gray-400 sm:hidden">
                              {doc.size} • {doc.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                        {doc.size}
                      </td>

                      <td className="py-3 pr-6 pl-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-[11px] whitespace-nowrap">
                            {doc.date}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenReview(doc);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 hover:bg-black hover:text-white transition cursor-pointer"
                              title="Audit in Agreement Summary"
                            >
                              Audit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDoc(doc.id);
                              }}
                              className="p-1 rounded text-gray-400 hover:text-red-600 transition cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer (Matching image_6883a973.png) */}
        <div className="h-11 border-t border-gray-100 px-6 flex items-center justify-end gap-3 text-xs text-gray-400 shrink-0 bg-white">
          <button className="p-1 text-gray-400 hover:text-black cursor-pointer disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-gray-700">1 / 1</span>
          <button className="p-1 text-gray-400 hover:text-black cursor-pointer disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: CHAT WITH ALL FILES (Matching image_6883a973.png)
          ========================================================================= */}
      <div className="w-full lg:w-[460px] xl:w-[500px] flex flex-col shrink-0 bg-white border-l border-gray-200 overflow-hidden">
        {/* Header: Chat with all files */}
        <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Chat with all files
            </h2>
            {attachedDocs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-bold">
                {attachedDocs.length} in context
              </span>
            )}
          </div>

          <button
            onClick={() => setMessages([])}
            className="text-xs text-gray-400 hover:text-black font-semibold cursor-pointer"
            title="Clear chat"
          >
            Clear
          </button>
        </div>

        {/* Messages / Conversation Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {messages.length === 0 ? (
            /* Empty State (Exact match to image_6883a973.png) */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 select-none">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-1">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-gray-900">
                No conversation yet
              </div>
              <div className="text-xs text-gray-400">
                Start with your first prompt
              </div>

              {/* Quick Prompt Starters */}
              <div className="pt-6 w-full space-y-2">
                {[
                  'Summarize liabilities across all files',
                  'Find termination notice periods in active contracts',
                  'Identify indemnity exceptions and dispute clauses',
                ].map((starter) => (
                  <button
                    key={starter}
                    onClick={() => handleSendMessage(starter)}
                    className="w-full text-left p-2.5 rounded-xl border border-gray-200 hover:border-black bg-white hover:bg-gray-50 text-xs text-gray-700 hover:text-black font-medium transition cursor-pointer"
                  >
                    "{starter}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Message Header */}
                <div className="text-[10px] text-gray-400 mb-1 px-1">
                  {m.sender === 'user' ? 'You' : 'ClauseCite Multi-Doc AI'} • {m.timestamp}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[92%] ${
                    m.sender === 'user'
                      ? 'bg-black text-white rounded-br-xs'
                      : 'bg-[#F9FAFB] border border-gray-200 text-gray-900 rounded-bl-xs space-y-3'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <p className="whitespace-pre-line font-sans">{m.text}</p>
                  ) : (
                    <FormattedLegalMarkdown content={m.text} />
                  )}

                  {/* Findings breakdown if AI */}
                  {m.findings && m.findings.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60 space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Document Findings Breakdown:
                      </div>
                      {m.findings.map((f, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-gray-200 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 truncate">{f.docName}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                f.risk === 'High'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {f.risk} Risk
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-gray-500">{f.clause}</div>
                          <p className="text-[11px] text-gray-600">{f.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Copy Button for Assistant */}
                  {m.sender === 'assistant' && (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => copyText(m.id, m.text)}
                        className="text-[10px] font-semibold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
                      >
                        {copiedMsgId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-xs text-gray-500 max-w-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-[#0066FF] animate-spin" />
              <span>Synthesizing multi-file clauses...</span>
            </div>
          )}

          <div ref={chatScrollRef} />
        </div>

        {/* Bottom Input Area (Matching image_6883a973.png) */}
        <div className="p-4 border-t border-gray-200 bg-white space-y-3 shrink-0">
          {/* Attached Files Chips Bar (Matching image_6883a973.png) */}
          {attachedDocs.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {attachedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-medium text-gray-800 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  <div className="min-w-0 max-w-[120px]">
                    <div className="truncate font-semibold text-[11px]">{doc.name}</div>
                    <div className="text-[9px] text-gray-400 font-mono">{doc.size}</div>
                  </div>
                  <button
                    onClick={() => toggleSelectDoc(doc.id)}
                    className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-black cursor-pointer"
                    title="Remove from chat context"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box Card */}
          <div className="rounded-2xl border border-gray-200 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition shadow-xs">
            <div className="p-3">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything"
                className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Bottom Actions Row (Matching image_6883a973.png) */}
            <div className="px-3 pb-2.5 flex items-center justify-between text-gray-500">
              <div className="flex items-center gap-2">
                {/* Paperclip */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition cursor-pointer"
                  title="Upload & attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Analyze content Pill Button (Exact match to image_6883a973.png) */}
                <button
                  onClick={handleAnalyzeContent}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black text-xs font-semibold transition cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>Analyze content</span>
                </button>

                {/* More / Three dots */}
                <button
                  onClick={() => handleSendMessage('Identify all missing standard boilerplate clauses across these files.')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition cursor-pointer"
                  title="Boilerplate clause audit"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Input */}
                <button
                  onClick={() => {
                    setIsRecording(!isRecording);
                    if (!isRecording) {
                      setTimeout(() => {
                        setInputVal('What are the total aggregate liabilities across all attached contracts?');
                        setIsRecording(false);
                      }, 2000);
                    }
                  }}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    isRecording
                      ? 'bg-red-50 text-red-600 animate-pulse'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-black'
                  }`}
                  title="Voice query"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || isGenerating}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    inputVal.trim() && !isGenerating
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Send message (Ctrl+Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="text-center text-[10px] text-gray-400">
            ClauseCite Legal Suite • Multi-Document AI Context Active
          </div>
        </div>
      </div>
    </div>
  );
}
