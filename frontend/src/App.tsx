import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import FeaturesBento from './components/FeaturesBento.tsx';
import TargetAudience from './components/TargetAudience.tsx';
import Advantages from './components/Advantages.tsx';
import VideoSection from './components/VideoSection.tsx';
import MobileAppSection from './components/MobileAppSection.tsx';
import BlogSection from './components/BlogSection.tsx';
import TemplatesSection from './components/TemplatesSection.tsx';
import FAQSection from './components/FAQSection.tsx';
import UseCasesSection from './components/UseCasesSection.tsx';
import Footer from './components/Footer.tsx';

// Full AI Lawyer Pro Dashboard
import DashboardLayout from './components/dashboard/DashboardLayout.tsx';

// Modals
import CompareDocsModal from './components/modals/CompareDocsModal.tsx';
import ChatStudioModal from './components/modals/ChatStudioModal.tsx';
import TemplateModal from './components/modals/TemplateModal.tsx';
import ClauseGeneratorModal from './components/modals/ClauseGeneratorModal.tsx';
import VideoModal from './components/modals/VideoModal.tsx';
import AuthModal from './components/modals/AuthModal.tsx';
import BlogModal, { ArticleData } from './components/modals/BlogModal.tsx';

import { Sparkles, FileText, Scale, Globe, ArrowLeft } from 'lucide-react';

// Map landing-page template keys to TemplateModal keys (financial templates use same id)
const TEMPLATE_KEY_MAP: Record<string, string> = {
  'loan-lending': 'loan-lending',
  'promissory-note': 'promissory-note',
  'payment-plan': 'payment-plan',
  'revenue-profit-sharing': 'revenue-profit-sharing',
  'debt-settlement': 'debt-settlement',
  'guarantee-guarantor': 'guarantee-guarantor',
  'ach-payment-authorization': 'ach-payment-authorization',
  'escrow-collateral': 'escrow-collateral',
  'investment-equity': 'investment-equity',
  // Legacy general templates
  immigration: 'immigration',
  rental: 'rental',
  loi: 'loi',
};

export default function App() {
  // View mode: 'landing' for public marketing presentation, 'dashboard' for SaaS legal workspace
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // Modal states
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin',
  });
  const [chatModal, setChatModal] = useState<{ isOpen: boolean; prompt?: string }>({
    isOpen: false,
  });
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [templateModal, setTemplateModal] = useState<{ isOpen: boolean; key: string }>({
    isOpen: false,
    key: 'immigration',
  });
  const [useCaseModal, setUseCaseModal] = useState<{ isOpen: boolean; key: string }>({
    isOpen: false,
    key: 'boilerplate',
  });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [blogModal, setBlogModal] = useState<{ isOpen: boolean; article: ArticleData | null }>({
    isOpen: false,
    article: null,
  });

  // Audience toggle
  const [selectedAudience, setSelectedAudience] = useState<'consumers' | 'lawyers'>('consumers');

  const openTemplate = (key: string) => {
    const resolvedKey = TEMPLATE_KEY_MAP[key] || key;
    setTemplateModal({ isOpen: true, key: resolvedKey });
  };

  // If in dashboard mode, render the full ClauseCite / AI Lawyer Pro SaaS application
  if (viewMode === 'dashboard') {
    return (
      <div className="relative min-h-screen bg-white">
        <DashboardLayout onExitToPublic={() => setViewMode('landing')} />

        {/* Floating Quick Return to Landing Pill */}
        <div className="fixed bottom-5 right-5 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-2 bg-[#121316] text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/10 text-xs font-bold hover:bg-black transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Back to Home</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1C1E] relative selection:bg-[#0066FF] selection:text-white overflow-x-hidden">
      {/* Navigation (clean public top bar) */}
      <Navbar
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onOpenChat={() => setChatModal({ isOpen: true })}
        onOpenDashboard={() => setViewMode('dashboard')}
      />

      {/* Main Content */}
      <main className="space-y-6">
        <Hero
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
          onOpenChat={(prompt) => setChatModal({ isOpen: true, prompt })}
          selectedAudience={selectedAudience}
          onAudienceChange={setSelectedAudience}
        />

        <FeaturesBento
          onOpenCompare={() => setCompareModalOpen(true)}
          onOpenChat={(prompt) => setChatModal({ isOpen: true, prompt })}
        />

        <TargetAudience
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
          onOpenChat={(prompt) => setChatModal({ isOpen: true, prompt })}
        />

        <Advantages
          onOpenCompare={() => setCompareModalOpen(true)}
          onOpenChat={() => setChatModal({ isOpen: true })}
        />

        <VideoSection onOpenVideo={() => setVideoModalOpen(true)} />

        <MobileAppSection />

        <BlogSection
          onSelectArticle={(article) => setBlogModal({ isOpen: true, article })}
        />

        <TemplatesSection
          onSelectTemplate={openTemplate}
          onOpenDashboard={() => setViewMode('dashboard')}
        />

        <FAQSection />

        <UseCasesSection
          onSelectUseCase={(key) => setUseCaseModal({ isOpen: true, key })}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onOpenTemplate={(key) => openTemplate(key)}
        onOpenUseCase={(key) => setUseCaseModal({ isOpen: true, key })}
      />

      {/* Outcrowd Floating Quick Access Pill Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:flex items-center gap-1.5 p-1.5 bg-[#121316]/90 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatModal({ isOpen: true })}
          className="px-4 py-2 rounded-full text-xs font-bold text-white hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer"
          data-cursor="AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Ask ClauseCite</span>
        </motion.button>

        <span className="w-px h-4 bg-white/20" />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCompareModalOpen(true)}
          className="px-4 py-2 rounded-full text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer"
          data-cursor="Diff"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Compare Docs</span>
        </motion.button>

        <span className="w-px h-4 bg-white/20" />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode('dashboard')}
          className="px-4 py-2 rounded-full text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer"
          data-cursor="Draft"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>Create Agreement</span>
        </motion.button>
      </div>

      {/* Modals with Outcrowd smooth transition */}
      <CompareDocsModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onOpenWorkspace={() => {
          setCompareModalOpen(false);
          setViewMode('dashboard');
        }}
      />

      <ChatStudioModal
        isOpen={chatModal.isOpen}
        initialPrompt={chatModal.prompt}
        onClose={() => setChatModal({ isOpen: false })}
        onOpenWorkspace={(prompt) => {
          setChatModal({ isOpen: false });
          setViewMode('dashboard');
        }}
      />

      <TemplateModal
        isOpen={templateModal.isOpen}
        templateKey={templateModal.key}
        onClose={() => setTemplateModal({ isOpen: false, key: 'immigration' })}
      />

      <ClauseGeneratorModal
        isOpen={useCaseModal.isOpen}
        initialCaseKey={useCaseModal.key}
        onClose={() => setUseCaseModal({ isOpen: false, key: 'boilerplate' })}
        onOpenAgreementCreator={(clauseText) => {
          setUseCaseModal({ isOpen: false, key: 'boilerplate' });
          setViewMode('dashboard');
        }}
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
        onLoginAsTestUser={() => setViewMode('dashboard')}
      />

      <BlogModal
        isOpen={blogModal.isOpen}
        article={blogModal.article}
        onClose={() => setBlogModal({ isOpen: false, article: null })}
      />
    </div>
  );
}
