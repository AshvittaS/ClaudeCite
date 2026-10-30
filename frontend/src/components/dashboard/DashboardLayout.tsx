import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SquarePen,
  Folder,
  FileText,
  GitCompare,
  FilePlus2,
  Scale,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  Upload,
  Share2,
  MoreVertical,
  Search,
  User,
  LogOut,
  ArrowLeft,
  X,
  Menu,
  Sparkles,
  Plus,
  Briefcase,
  Layers,
} from 'lucide-react';
import ClauseCiteLogo from '../common/ClauseCiteLogo.tsx';
import ChatWorkspace, { InitialCaseContext } from './ChatWorkspace.tsx';
import DocReviewWorkspace from './DocReviewWorkspace.tsx';
import DocCompareWorkspace from './DocCompareWorkspace.tsx';
import DocGeneratorWorkspace from './DocGeneratorWorkspace.tsx';
import CaseWorkspace from './CaseWorkspace.tsx';
import VaultWorkspace from './VaultWorkspace.tsx';
import SettingsWorkspace from './SettingsWorkspace.tsx';
import CreateCaseModal from './CreateCaseModal.tsx';
import { INITIAL_CASES, CaseItem, LegalVaultDoc } from '../../data/testUserData.ts';
import { api } from '../../api/client.ts';

interface DashboardLayoutProps {
  onExitToPublic: () => void;
}

export type DashboardWorkspaceTab =
  | 'chat'
  | 'files'
  | 'summary'
  | 'compare'
  | 'create'
  | 'cases'
  | 'settings';

export default function DashboardLayout({ onExitToPublic }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<DashboardWorkspaceTab>('chat');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [casesExpanded, setCasesExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [createCaseModalOpen, setCreateCaseModalOpen] = useState(false);

  // Cases state
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(INITIAL_CASES[0]?.id || 'case-rental');
  const [activeCaseContext, setActiveCaseContext] = useState<InitialCaseContext | undefined>(undefined);

  // Recent chat threads list
  const [chatThreads, setChatThreads] = useState<{ id: string; title: string }[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    api.listCases()
      .then((serverCases) => {
        if (!isMounted || !Array.isArray(serverCases) || serverCases.length === 0) return;
        const mapped: CaseItem[] = serverCases.map((c: any) => ({
          id: c.id,
          name: c.title,
          instructionType: c.custom_instructions ? 'custom' : 'default',
          customInstructions: c.custom_instructions,
          createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recently',
          updatedAt: c.updated_at ? new Date(c.updated_at).toLocaleDateString() : 'Recently',
          files: [],
          chats: [],
        }));
        setCases(mapped);
        setSelectedCaseId(mapped[0].id);
      })
      .catch(() => {});

    api.listChats()
      .then((serverChats) => {
        if (!isMounted || !Array.isArray(serverChats) || serverChats.length === 0) return;
        setChatThreads(
          serverChats.map((ch: any) => ({
            id: ch.id,
            title: ch.title || 'Untitled Consultation',
          }))
        );
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDocInReview = (doc: LegalVaultDoc) => {
    setActiveTab('summary');
  };

  const handleNewChat = () => {
    setActiveTab('chat');
    setSidebarMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden font-sans">
      {/* =========================================================================
          CLAUSECITE SIDEBAR (Adapted to ClauseCite brand in White BG & Black Text)
          ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* 1. TOP CLAUSECITE BRAND & WORKSPACE SELECTOR */}
          <div className="relative">
            <div className="p-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition flex items-center justify-between cursor-pointer">
              <ClauseCiteLogo size="sm" showText={true} />

              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {workspaceMenuOpen && (
              <div className="absolute top-12 left-2 right-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 text-xs space-y-1">
                <button
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    alert('Switched to ClauseCite Corporate Workspace');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 font-semibold text-gray-800"
                >
                  ClauseCite Primary Workspace
                </button>
                <button
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    alert('Create New Legal Team Workspace');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. SEARCH BAR (With Ctrl+K) */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search clauses or files"
              className="w-full bg-[#F6F7F9] hover:bg-gray-100 border border-transparent focus:border-gray-300 focus:bg-white rounded-xl pl-9 pr-14 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
              Ctrl+K
            </span>
          </div>

          {/* 3. PRIMARY CLAUSECITE NAVIGATION LINKS */}
          <div className="space-y-1 pt-1">
            {/* New chat (Ctrl+/) */}
            <button
              onClick={handleNewChat}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SquarePen className="w-4 h-4 text-gray-600" />
                <span>New chat</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Ctrl+/</span>
            </button>

            {/* Workspace files (Storage) */}
            <button
              onClick={() => {
                setActiveTab('files');
                setSidebarMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <Folder className="w-4 h-4 text-gray-600" />
              <span>Workspace files</span>
            </button>

            {/* Agreement summary */}
            <button
              onClick={() => {
                setActiveTab('summary');
                setSidebarMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <span>Agreement summary</span>
            </button>

            {/* Compare agreements */}
            <button
              onClick={() => {
                setActiveTab('compare');
                setSidebarMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <GitCompare className="w-4 h-4 text-gray-600" />
              <span>Compare agreements</span>
            </button>

            {/* Create agreement */}
            <button
              onClick={() => {
                setActiveTab('create');
                setSidebarMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <FilePlus2 className="w-4 h-4 text-gray-600" />
              <span>Create agreement</span>
            </button>
          </div>

          {/* 4. COLLAPSIBLE SECTION: CASES (Matching image_8fcfe06c.png) */}
          <div className="space-y-1 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 py-1 px-1">
              <button
                onClick={() => setCasesExpanded(!casesExpanded)}
                className="flex items-center gap-1 hover:text-black cursor-pointer"
              >
                <span>Cases</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${casesExpanded ? '' : '-rotate-90'}`}
                />
              </button>
              <button
                onClick={() => setCreateCaseModalOpen(true)}
                className="text-gray-400 hover:text-black p-0.5 cursor-pointer"
                title="Create Case"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {casesExpanded && (
              <div className="space-y-0.5 pt-0.5">
                {cases.map((c) => {
                  const isSelected = activeTab === 'cases' && selectedCaseId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        setActiveTab('cases');
                        setSidebarMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                        isSelected
                          ? 'bg-gray-100 text-black font-bold'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Folder
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-black' : 'text-gray-400 group-hover:text-black'
                          }`}
                        />
                        <span className="truncate">{c.name}</span>
                      </div>
                      {isSelected && (
                        <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCreateCaseModalOpen(true)}
                  className="w-full py-1.5 px-3 rounded-xl border border-dashed border-gray-200 text-xs font-medium text-gray-500 hover:border-gray-400 hover:text-black hover:bg-gray-50 transition cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New case</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. COLLAPSIBLE SECTION: CHATS */}
          <div className="space-y-1 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 py-1 px-1">
              <button
                onClick={() => setChatsExpanded(!chatsExpanded)}
                className="flex items-center gap-1 hover:text-black cursor-pointer"
              >
                <span>Chats</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${chatsExpanded ? '' : '-rotate-90'}`}
                />
              </button>
              <button
                onClick={handleNewChat}
                className="text-gray-400 hover:text-black p-0.5 cursor-pointer"
                title="New Chat"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {chatsExpanded && (
              <div className="space-y-0.5 pt-0.5">
                {chatThreads.length === 0 ? (
                  <p className="px-3 py-1.5 text-[11px] text-gray-400">No active chat sessions</p>
                ) : (
                  chatThreads.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        setActiveTab('chat');
                        setSidebarMobileOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition cursor-pointer truncate"
                    >
                      {th.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 6. BOTTOM ACTIONS: USER PROFILE */}
        <div className="p-3 border-t border-gray-200 shrink-0 bg-white">
          {/* User Profile Pill */}
          <div className="p-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition flex items-center justify-between relative">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                A
              </div>
              <div className="min-w-0 text-left">
                <span className="block text-xs font-bold text-gray-900 truncate leading-none">
                  Ashmee
                </span>
                <span className="block text-[10px] text-gray-400 font-medium mt-0.5">
                  Legal Workspace
                </span>
              </div>
            </div>

            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="text-gray-400 hover:text-black p-1 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* User Popover Menu */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-14 left-2 right-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 text-xs space-y-1"
                >
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 flex items-center gap-2 text-gray-700 cursor-pointer font-medium"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>ClauseCite Account Settings</span>
                  </button>

                  <button
                    onClick={onExitToPublic}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 flex items-center gap-2 text-gray-700 cursor-pointer font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Public Site</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CLAUSECITE VIEWPORT (ALL IN WHITE BG & BLACK TEXT)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Mobile Header Bar */}
        <div className="lg:hidden h-14 border-b border-gray-200 px-4 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarMobileOpen(true)}
              className="p-1.5 text-gray-700 hover:text-black"
            >
              <Menu className="w-5 h-5" />
            </button>
            <ClauseCiteLogo size="sm" showText={false} />
            <span className="text-xs font-extrabold text-gray-900 capitalize">
              {activeTab === 'chat'
                ? 'Ask ClauseCite'
                : activeTab === 'summary'
                ? 'Agreement Summary'
                : activeTab === 'compare'
                ? 'Compare Agreements'
                : activeTab === 'create'
                ? 'Create Agreement'
                : activeTab === 'files'
                ? 'Workspace Files'
                : 'Cases'}
            </span>
          </div>
        </div>

        {/* Viewport Content */}
        <main className="flex-1 overflow-hidden bg-white">
          {activeTab === 'chat' && <ChatWorkspace initialCaseContext={activeCaseContext} />}
          {activeTab === 'summary' && <DocReviewWorkspace />}
          {activeTab === 'compare' && <DocCompareWorkspace />}
          {activeTab === 'create' && <DocGeneratorWorkspace />}
          {activeTab === 'files' && <VaultWorkspace onOpenReview={handleOpenDocInReview} />}
          {activeTab === 'cases' && (
            <CaseWorkspace
              currentCase={cases.find((c) => c.id === selectedCaseId) || cases[0]}
              onUpdateCase={(updated) => {
                setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
              }}
              onDeleteCase={(id) => {
                const remaining = cases.filter((c) => c.id !== id);
                setCases(remaining);
                api.deleteCase(id).catch(() => {});
                if (remaining.length > 0) {
                  setSelectedCaseId(remaining[0].id);
                } else {
                  setActiveTab('chat');
                }
              }}
              onOpenChat={(chatId, caseName) => {
                const c = cases.find((c) => c.id === selectedCaseId);
                setActiveCaseContext({
                  caseName: caseName || c?.name || 'Case Matter',
                  filesCount: c?.files.length || 0,
                  defaultTitle: c?.chats.find((ch) => ch.id === chatId)?.title,
                });
                setActiveTab('chat');
              }}
              onSummarizeFile={() => {
                setActiveTab('summary');
              }}
            />
          )}
          {activeTab === 'settings' && <SettingsWorkspace />}
        </main>
      </div>

      {/* Create Case Modal (Matching image_41aa24fc.png) */}
      <CreateCaseModal
        isOpen={createCaseModalOpen}
        onClose={() => setCreateCaseModalOpen(false)}
        onCreateCase={(newCase) => {
          setCases((prev) => [newCase, ...prev]);
          setSelectedCaseId(newCase.id);
          setActiveTab('cases');
        }}
      />
    </div>
  );
}
