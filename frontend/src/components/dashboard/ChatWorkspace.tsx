import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Paperclip,
  Sparkles,
  Mic,
  MicOff,
  ArrowUp,
  Star,
  Share2,
  MoreHorizontal,
  Copy,
  Volume2,
  VolumeX,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Check,
  FileText,
  Rocket,
  Scale,
  Megaphone,
  BarChart2,
  Shield,
  X,
  Globe,
  ExternalLink,
  ChevronDown,
  Plus,
  Clock,
  Printer,
  Download,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import PromptsLibraryModal, { LegalPrompt } from './PromptsLibraryModal.tsx';
import AttachDocModal, { AttachedDocument } from './AttachDocModal.tsx';
import CitationDrawer from './CitationDrawer.tsx';
import ExportChatModal from './ExportChatModal.tsx';
import SurveyModal from './SurveyModal.tsx';
import FormattedLegalMarkdown from '../common/FormattedLegalMarkdown.tsx';
import { api } from '../../api/client.ts';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  title?: string;
  tag?: string;
  generationTime?: string;
  attachedDocName?: string;
  citations?: string[];
  followUps?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  statuteTag: string;
  jurisdiction: string;
  messages: Message[];
}

export interface InitialCaseContext {
  caseName: string;
  filesCount: number;
  defaultTitle?: string;
}

interface ChatWorkspaceProps {
  initialCaseContext?: InitialCaseContext;
}

export default function ChatWorkspace({ initialCaseContext }: ChatWorkspaceProps = {}) {
  // Active query and statutory badge in the subheader
  const [currentQueryTitle, setCurrentQueryTitle] = useState(
    initialCaseContext?.defaultTitle || (initialCaseContext ? `Legal consultation for ${initialCaseContext.caseName}` : 'Legal Research & Contract Analysis')
  );
  const [currentStatuteTag, setCurrentStatuteTag] = useState(
    initialCaseContext?.caseName.includes('Rental') ? 'Model Tenancy Act' : 'Indian Jurisprudence'
  );
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('India (National)');
  const [jurisdictionDropdownOpen, setJurisdictionDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialCaseContext) {
      if (initialCaseContext.defaultTitle) {
        setCurrentQueryTitle(initialCaseContext.defaultTitle);
      } else {
        setCurrentQueryTitle(`Legal consultation for ${initialCaseContext.caseName}`);
      }
    }
  }, [initialCaseContext]);

  // States for header actions
  const [isFavorite, setIsFavorite] = useState(false);
  const [webResearchEnabled, setWebResearchEnabled] = useState(true);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Modals
  const [promptsModalOpen, setPromptsModalOpen] = useState(false);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [citationDrawerOpen, setCitationDrawerOpen] = useState(false);
  const [activeCitationKey, setActiveCitationKey] = useState('Indian Statutory Framework');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);

  // Attached context document
  const [attachedDoc, setAttachedDoc] = useState<AttachedDocument | null>(null);

  // Audio / Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive message states
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedMsgIds, setSavedMsgIds] = useState<Record<string, boolean>>({});
  const [feedbackStates, setFeedbackStates] = useState<Record<string, 'up' | 'down' | undefined>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Input & Generation
  const [inputVal, setInputVal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Chat scroll anchor
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  // Prompt Pills
  const promptPills = [
    {
      id: 'rental',
      label: 'Rental agreement',
      icon: '📄',
      query: 'What are standard tenant rights and deposit return limits in NYC?',
      tag: 'NY Real Property Law § 238-a',
      jurisdiction: 'New York (NYC)',
    },
    {
      id: 'startup',
      label: 'Start a business',
      icon: '🚀',
      query: 'What filings and operating agreements are required to form a Delaware LLC?',
      tag: '6 Del. C. § 18-201',
      jurisdiction: 'Delaware',
    },
    {
      id: 'property',
      label: 'Property legal tips',
      icon: '⚖️',
      query: 'How does quiet enjoyment and commercial lease eviction notice work?',
      tag: 'URLTA § 4.201 / NY RPAPL § 711',
      jurisdiction: 'United States',
    },
    {
      id: 'consumer',
      label: 'Consumer complaint',
      icon: '📢',
      query: 'How to file a formal breach of warranty or deceptive trade practices complaint?',
      tag: '15 U.S.C. § 2301 (Magnuson-Moss)',
      jurisdiction: 'Federal US',
    },
    {
      id: 'accountant',
      label: 'Accountant duties',
      icon: '📊',
      query: 'What fiduciary and audit disclosure duties apply to certified public accountants?',
      tag: 'AICPA Professional Code / SEC Reg S-X',
      jurisdiction: 'Federal US',
    },
    {
      id: 'privacy',
      label: 'Protect data online',
      icon: '🛡️',
      query: 'What are enterprise compliance obligations under GDPR and California CCPA/CPRA?',
      tag: 'Cal. Civ. Code § 1798.100',
      jurisdiction: 'California',
    },
  ];

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Voice recording simulation
  const handleStartVoice = () => {
    setIsRecordingVoice(true);
    setVoiceSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setVoiceSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopVoice = (sendImmediately = false) => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    const mockSpeech = 'Can an employer legally deduct wages or uniform costs in New York?';
    if (sendImmediately) {
      handleSend(mockSpeech);
    } else {
      setInputVal(mockSpeech);
    }
  };

  const handleCancelVoice = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setVoiceSeconds(0);
  };

  const handleSelectPill = (pill: (typeof promptPills)[0]) => {
    setCurrentQueryTitle(pill.query);
    setCurrentStatuteTag(pill.tag);
    setSelectedJurisdiction(pill.jurisdiction);
    handleSend(pill.query, pill.tag, pill.jurisdiction);
  };

  const handleSelectPromptFromModal = (prompt: LegalPrompt) => {
    setCurrentQueryTitle(prompt.title);
    setCurrentStatuteTag(prompt.statuteTag);
    handleSend(prompt.query, prompt.statuteTag);
  };

  const handleSend = async (text: string, customTag?: string, customJurisdiction?: string) => {
    if (!text.trim()) return;

    const userText = text.trim();
    setCurrentQueryTitle(userText);
    const effectiveTag = customTag || currentStatuteTag;
    const docContextName = attachedDoc?.name;

    // Append user message
    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: 'Just now',
        text: userText,
        attachedDocName: docContextName,
      },
    ];
    setMessages(newMessages);

    setInputVal('');
    setIsGenerating(true);

    // Scroll down
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      // Query backend with live Hybrid RAG + Google Gemini LLM
      const res = await api.askClauseCite(
        userText,
        selectedJurisdiction || 'India',
        attachedDoc ? [attachedDoc.id] : []
      );

      if (res && res.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            timestamp: 'Just now',
            generationTime: 'Grounded by Gemini & ChromaDB',
            text: res.answer,
            tag: res.tag || effectiveTag,
            citations: res.citations && res.citations.length > 0 ? res.citations : [effectiveTag],
            followUps: res.follow_ups && res.follow_ups.length > 0 ? res.follow_ups : [
              'Draft formal legal notice',
              'Check statutory penalties and enforcement',
              'Explain in simpler non-legal terms',
            ],
          },
        ]);
        setIsGenerating(false);
        setTimeout(() => {
          chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
    } catch (err: any) {
      console.error('Live ClauseCite Ask API error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          generationTime: 'Error',
          text: `⚠️ **Unable to fetch live AI legal analysis**:\n\n${err?.message || 'Network connection failed'}\n\nPlease verify that the backend server is running (\`python run_server.py\`) and your \`GEMINI_API_KEY\` in \`backend/.env\` is active.`,
          tag: 'API Connection Error',
          citations: [],
          followUps: ['Retry inquiry', 'Check backend logs'],
        },
      ]);
      setIsGenerating(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    showToast('Copied legal memorandum to clipboard!');
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const handleListen = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis audio is not supported in this browser.');
      return;
    }

    if (isSpeaking && currentlySpeakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingMsgId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingMsgId(null);
      };
      setIsSpeaking(true);
      setCurrentlySpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveToVault = (msgId: string) => {
    const isNowSaved = !savedMsgIds[msgId];
    setSavedMsgIds((prev) => ({ ...prev, [msgId]: isNowSaved }));
    showToast(isNowSaved ? 'Saved to Legal Vault!' : 'Removed from saved items');
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackStates((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined : type,
    }));
    showToast(type === 'up' ? 'Feedback recorded: Highly helpful! 👍' : 'Feedback logged: Flagged for review 👎');
  };

  const handleOpenCitation = (codeStr: string) => {
    setActiveCitationKey(codeStr);
    setCitationDrawerOpen(true);
  };

  const handleStartNewChat = () => {
    setMessages([]);
    setCurrentQueryTitle('New Legal Consultation');
    setCurrentStatuteTag('Statutory Research Active');
    setAttachedDoc(null);
    showToast('Started a fresh legal consultation session');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] overflow-hidden font-sans relative">
      {/* Toast notification pill */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#121316] text-white px-4 py-2 rounded-full shadow-2xl border border-white/10 text-xs font-semibold flex items-center gap-2 pointer-events-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBHEADER BAR (Exact match to image_92bc8b8b.png) */}
      <div className="px-6 py-3.5 bg-white border-b border-gray-200/80 flex items-center justify-between shrink-0 relative z-20">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
            {currentQueryTitle}
          </h2>

          {/* Clickable Statutory Badge (opens CitationDrawer) */}
          <button
            onClick={() => handleOpenCitation(currentStatuteTag)}
            className="shrink-0 text-xs font-semibold text-gray-700 bg-[#F1F2F6] hover:bg-gray-200 hover:text-black px-3 py-1 rounded-full border border-gray-200/60 transition cursor-pointer flex items-center gap-1.5"
            title="Inspect statutory text and court precedents"
          >
            <Scale className="w-3 h-3 text-blue-600" />
            <span>{currentStatuteTag}</span>
          </button>

          {initialCaseContext && (
            <span className="hidden sm:inline-flex shrink-0 text-[11px] font-bold text-[#0066FF] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full items-center gap-1">
              <span>Case: {initialCaseContext.caseName}</span>
              {initialCaseContext.filesCount > 0 && (
                <span className="text-[10px] text-blue-500 font-medium">({initialCaseContext.filesCount} files)</span>
              )}
            </span>
          )}

          {/* Jurisdiction Dropdown Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setJurisdictionDropdownOpen(!jurisdictionDropdownOpen)}
              className="text-[11px] font-bold text-gray-500 hover:text-black bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1 transition cursor-pointer"
            >
              <Globe className="w-3 h-3 text-gray-400" />
              <span>{selectedJurisdiction}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {jurisdictionDropdownOpen && (
              <div className="absolute top-8 left-0 w-44 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 z-40 text-xs space-y-0.5">
                {[
                  'India (National)',
                  'New York (NYC)',
                  'California',
                  'Delaware',
                  'Texas',
                  'Federal US',
                  'United Kingdom',
                ].map((jur) => (
                  <button
                    key={jur}
                    onClick={() => {
                      setSelectedJurisdiction(jur);
                      setJurisdictionDropdownOpen(false);
                      showToast(`Switched statutory bias to ${jur}`);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
                      selectedJurisdiction === jur
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {jur}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Icons (Star, Share, More) */}
        <div className="flex items-center gap-2 text-gray-500 shrink-0">
          {/* Live Web Research Toggle */}
          <button
            onClick={() => {
              setWebResearchEnabled(!webResearchEnabled);
              showToast(webResearchEnabled ? 'Web Research: OFF' : 'Live Web Statutory Research: ACTIVATED');
            }}
            className={`hidden sm:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
              webResearchEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-100 border-gray-200 text-gray-400'
            }`}
            title="Toggle live statutory internet research"
          >
            <Globe className="w-3 h-3" />
            <span>{webResearchEnabled ? 'Web Research ON' : 'Web Research OFF'}</span>
          </button>

          {/* Star Query */}
          <button
            onClick={() => {
              setIsFavorite(!isFavorite);
              showToast(isFavorite ? 'Removed from favorites' : 'Saved to favorite consultations ⭐');
            }}
            className="p-1.5 rounded-lg hover:text-black hover:bg-gray-100 transition cursor-pointer"
            title="Star query"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Direct consultation link copied to clipboard!');
            }}
            className="p-1.5 rounded-lg hover:text-black hover:bg-gray-100 transition cursor-pointer"
            title="Share consultation link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-1.5 rounded-lg hover:text-black hover:bg-gray-100 transition cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 top-9 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 z-40 text-xs space-y-0.5">
                <button
                  onClick={() => {
                    setExportModalOpen(true);
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Export Memorandum</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenCitation(currentStatuteTag);
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bluebook Citations</span>
                </button>

                <button
                  onClick={() => {
                    window.print();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-500" />
                  <span>Print Consultation</span>
                </button>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={() => {
                    handleStartNewChat();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 max-w-4xl mx-auto w-full">
        {/* Top Centered Greeting & Prompt Pills (Exact match to image_92bc8b8b.png) */}
        <div className="text-center space-y-5 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
              <span>Hello, Chris</span>
              <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Pick a prompt below or ask statutory queries.
            </p>
          </div>

          {/* 6 Prompt Pills (2 rows of 3 on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
            {promptPills.map((pill) => (
              <motion.button
                key={pill.id}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectPill(pill)}
                className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-full bg-white border border-gray-200/90 text-xs font-semibold text-gray-700 hover:text-black hover:border-gray-400 shadow-xs hover:shadow-sm transition cursor-pointer"
              >
                <span className="text-xs">{pill.icon}</span>
                <span className="truncate">{pill.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Session History Centered Divider (Exact match to image_92bc8b8b.png) */}
        <div className="relative flex items-center justify-center pt-2">
          <div className="w-full border-t border-gray-200"></div>
          <span className="absolute bg-[#FAFAFA] px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Session History
          </span>
        </div>

        {/* Message Thread List */}
        <div className="space-y-6">
          {messages.map((m) => {
            if (m.sender === 'user') {
              return (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-end gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-400">{m.timestamp}</span>
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs shadow-xs">
                      <i className="fa-solid fa-user text-[11px]"></i>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-xl bg-white border border-gray-200/90 text-gray-900 rounded-2xl rounded-tr-xs px-5 py-3.5 shadow-xs text-xs sm:text-sm font-medium space-y-2">
                      <p>{m.text}</p>
                      {m.attachedDocName && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          <Paperclip className="w-3 h-3" />
                          <span>Context: {m.attachedDocName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // AI Lawyer Message Card (Exact match to image_92bc8b8b.png)
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900 tracking-tight">
                      ClauseCite AI
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      ClauseCite Engine v3.2
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {m.generationTime || 'Generated in 1.4s'}
                  </span>
                </div>

                {/* Body Text with Statutory Formatting */}
                <FormattedLegalMarkdown content={m.text} />

                {/* Interactive Statutory Citation Chips */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                      Cited Statutory Authorities & Precedents (Click to Inspect)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {m.citations.map((cite) => (
                        <button
                          key={cite}
                          onClick={() => handleOpenCitation(cite)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition cursor-pointer"
                        >
                          <Scale className="w-3 h-3 text-blue-600" />
                          <span>{cite}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Follow-up Action Chips */}
                {m.followUps && m.followUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                      Next Step:
                    </span>
                    {m.followUps.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleSend(action)}
                        className="px-3 py-1 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 hover:text-black transition cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Audio Playback Bar when Listen is active */}
                {isSpeaking && currentlySpeakingMsgId === m.id && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 h-4">
                        <span className="w-1 h-3 bg-blue-600 rounded-full animate-bounce" />
                        <span className="w-1 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="w-1 h-5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.45s]" />
                      </div>
                      <span className="text-xs font-semibold text-blue-800">
                        Synthesizing statutory audio narration...
                      </span>
                    </div>

                    <button
                      onClick={() => handleListen(m.id, m.text)}
                      className="px-3 py-1 rounded-lg bg-white border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                )}

                {/* Bottom Card Action Bar (Matches image_92bc8b8b.png) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  {/* Left: Copy, Listen, Save */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      className="flex items-center gap-1.5 hover:text-black transition cursor-pointer"
                    >
                      {copiedMsgId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedMsgId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleListen(m.id, m.text)}
                      className={`flex items-center gap-1.5 transition cursor-pointer ${
                        isSpeaking && currentlySpeakingMsgId === m.id
                          ? 'text-blue-600 font-bold'
                          : 'hover:text-black'
                      }`}
                    >
                      {isSpeaking && currentlySpeakingMsgId === m.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isSpeaking && currentlySpeakingMsgId === m.id ? 'Stop' : 'Listen'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSaveToVault(m.id)}
                      className={`flex items-center gap-1.5 transition cursor-pointer ${
                        savedMsgIds[m.id] ? 'text-blue-600 font-bold' : 'hover:text-black'
                      }`}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${savedMsgIds[m.id] ? 'fill-current' : ''}`}
                      />
                      <span>{savedMsgIds[m.id] ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  {/* Right: Thumbs up, Thumbs down, Regenerate */}
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      onClick={() => handleFeedback(m.id, 'up')}
                      className={`p-1.5 rounded-md hover:bg-gray-100 transition cursor-pointer ${
                        feedbackStates[m.id] === 'up'
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'hover:text-black'
                      }`}
                      title="Helpful response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(m.id, 'down')}
                      className={`p-1.5 rounded-md hover:bg-gray-100 transition cursor-pointer ${
                        feedbackStates[m.id] === 'down'
                          ? 'text-red-600 bg-red-50'
                          : 'hover:text-black'
                      }`}
                      title="Needs improvement"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSend(currentQueryTitle)}
                      className="p-1.5 rounded-md hover:text-black hover:bg-gray-100 transition cursor-pointer"
                      title="Regenerate with current statutes"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Generating Indicator */}
          {isGenerating && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-xs text-gray-500 font-medium">
                ClauseCite AI is researching {selectedJurisdiction} statutory codes and precedent holdings...
              </span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* FLOATING BOTTOM INPUT PILL BAR (Exact match to image_92bc8b8b.png) */}
      <div className="p-4 sm:p-6 bg-transparent shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Active Attached Document Banner */}
          {attachedDoc && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200/90 rounded-2xl px-4 py-2 text-xs">
              <div className="flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-bold text-blue-900">{attachedDoc.name}</span>
                <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  {attachedDoc.size} • Active Context
                </span>
              </div>
              <button
                onClick={() => setAttachedDoc(null)}
                className="text-blue-500 hover:text-blue-800 p-1 cursor-pointer"
                title="Remove attached document"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Voice Recording Overlay when mic active */}
          {isRecordingVoice ? (
            <div className="bg-white rounded-full border-2 border-red-500 shadow-xl px-5 py-2.5 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-bold text-gray-900">
                  Listening for legal query... ({String(Math.floor(voiceSeconds / 60)).padStart(2, '0')}:{String(voiceSeconds % 60).padStart(2, '0')})
                </span>
              </div>

              {/* Pulsing audio bars */}
              <div className="flex items-center gap-1 h-5">
                <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce" />
                <span className="w-1 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelVoice}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStopVoice(true)}
                  className="px-4 py-1 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer shadow-xs"
                >
                  Send Query
                </button>
              </div>
            </div>
          ) : (
            /* Main Rounded Full Pill Container */
            <div className="bg-white rounded-full border border-gray-200/90 shadow-md px-4 py-2 flex items-center gap-3">
              {/* Paperclip Button */}
              <button
                onClick={() => setAttachModalOpen(true)}
                className="text-gray-400 hover:text-black transition p-1 cursor-pointer shrink-0"
                title="Attach PDF or contract as context"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Input field */}
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(inputVal);
                }}
                placeholder="Ask anything or request legal draft..."
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 p-0"
              />

              {/* Prompts button */}
              <button
                onClick={() => setPromptsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Prompts</span>
              </button>

              {/* Microphone */}
              <button
                onClick={handleStartVoice}
                className="text-gray-400 hover:text-black transition p-1 cursor-pointer shrink-0"
                title="Voice query input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send circular black button with white upward arrow */}
              <button
                onClick={() => handleSend(inputVal)}
                disabled={!inputVal.trim()}
                className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Footnote & Survey */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 px-3 gap-1">
            <span>AI may produce inaccuracies. Confirm with accredited legal counsel.</span>
            <button
              onClick={() => setSurveyModalOpen(true)}
              className="text-gray-700 hover:text-black font-medium transition cursor-pointer flex items-center gap-1"
            >
              <span>Feedback Survey</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <PromptsLibraryModal
        isOpen={promptsModalOpen}
        onClose={() => setPromptsModalOpen(false)}
        onSelectPrompt={handleSelectPromptFromModal}
      />

      <AttachDocModal
        isOpen={attachModalOpen}
        onClose={() => setAttachModalOpen(false)}
        onAttachDoc={(doc) => {
          setAttachedDoc(doc);
          showToast(`Attached "${doc.name}" as legal context`);
        }}
      />

      <CitationDrawer
        isOpen={citationDrawerOpen}
        citationKey={activeCitationKey}
        onClose={() => setCitationDrawerOpen(false)}
      />

      <ExportChatModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={currentQueryTitle}
        statuteTag={currentStatuteTag}
        conversationText={messages
          .map((m) => `[${m.sender === 'user' ? 'USER' : 'AI LAWYER'} - ${m.timestamp}]\n${m.text}`)
          .join('\n\n------------------------\n\n')}
      />

      <SurveyModal
        isOpen={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
      />
    </div>
  );
}
