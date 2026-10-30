import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  ArrowRight,
  Check,
  Copy,
  Download,
  RefreshCw,
  GitCompare,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowUpDown,
  Filter,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import ClauseCiteLogo from '../common/ClauseCiteLogo.tsx';
import FormattedLegalMarkdown from '../common/FormattedLegalMarkdown.tsx';
import { api } from '../../api/client.ts';

interface DiffOp {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

interface ClauseDiffItem {
  clause_id: string;
  heading: string;
  change_type: 'modified' | 'added' | 'deleted' | 'unchanged' | string;
  original_text?: string;
  revised_text?: string;
  diff?: DiffOp[];
  change_summary?: string;
  impact_explanation?: string;
  potentially_benefits?: string;
  risk_level?: 'high' | 'medium' | 'low' | string;
  practical_implication?: string;
  suggested_counsel_action?: string;
}

interface ComparisonResult {
  baseline_document_id: string;
  revised_document_id: string;
  baseline_name: string;
  revised_name: string;
  overall_risk_shift: string;
  executive_summary: string;
  answer?: string;
  key_deal_points?: string[];
  summary: {
    total_clauses: number;
    modified: number;
    added: number;
    deleted: number;
    unchanged: number;
  };
  differences: ClauseDiffItem[];
  citations?: string[];
  limitations?: string[];
}

export default function DocCompareWorkspace() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [doc1Id, setDoc1Id] = useState<string | null>(null);
  const [doc2Id, setDoc2Id] = useState<string | null>(null);
  const [doc1Name, setDoc1Name] = useState<string | null>(null);
  const [doc2Name, setDoc2Name] = useState<string | null>(null);

  const [workspaceDocs, setWorkspaceDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const [isComparing, setIsComparing] = useState(false);
  const [compareStage, setCompareStage] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'modified' | 'added' | 'deleted'>('all');
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Load real workspace documents on mount
  useEffect(() => {
    setIsLoadingDocs(true);
    api.listDocuments()
      .then((docs) => setWorkspaceDocs(docs || []))
      .catch((err) => console.error('Failed to load workspace documents:', err))
      .finally(() => setIsLoadingDocs(false));
  }, []);

  const handleSelectWorkspaceDoc = (slot: 1 | 2, doc: any) => {
    if (slot === 1) {
      setDoc1Id(doc.id);
      setDoc1Name(doc.original_filename);
      setFile1(null);
    } else {
      setDoc2Id(doc.id);
      setDoc2Name(doc.original_filename);
      setFile2(null);
    }
    setCompareError(null);
  };

  const handleFileUpload = (slot: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (slot === 1) {
        setFile1(file);
        setDoc1Id(null);
        setDoc1Name(file.name);
      } else {
        setFile2(file);
        setDoc2Id(null);
        setDoc2Name(file.name);
      }
      setCompareError(null);
    }
  };

  const handleStartCompare = async () => {
    if ((!file1 && !doc1Id) || (!file2 && !doc2Id)) return;
    setIsComparing(true);
    setCompareError(null);
    setCompareStage('Uploading and preparing agreements...');

    try {
      let bId = doc1Id;
      let rId = doc2Id;

      if (file1) {
        setCompareStage('Uploading baseline contract (Version 1)...');
        const u1 = await api.uploadDocument(file1);
        bId = u1.document_id || u1.id;
        setDoc1Id(bId);
      }

      if (file2) {
        setCompareStage('Uploading revised counter-proposal (Version 2)...');
        const u2 = await api.uploadDocument(file2);
        rId = u2.document_id || u2.id;
        setDoc2Id(rId);
      }

      if (!bId || !rId) {
        throw new Error('Could not resolve IDs for both agreements.');
      }

      setCompareStage('Running deterministic clause segmentation & Myers diff engine...');
      const res = await api.compareDocuments(bId, rId, 'India');
      setComparisonResult(res);
    } catch (err: any) {
      console.error('Compare error:', err);
      setCompareError(err?.message || 'Failed to compare documents. Please verify backend is running.');
    } finally {
      setIsComparing(false);
      setCompareStage('');
    }
  };

  const handleCopyDiff = () => {
    const textToCopy = comparisonResult?.executive_summary || comparisonResult?.answer || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const differences = comparisonResult?.differences || [];
  const filteredDiffs = differences.filter((d) => {
    if (d.change_type === 'unchanged') return false;
    if (filterType === 'all') return true;
    return d.change_type.toLowerCase() === filterType;
  });

  const modifiedCount = comparisonResult?.summary.modified ?? 0;
  const addedCount = comparisonResult?.summary.added ?? 0;
  const deletedCount = comparisonResult?.summary.deleted ?? 0;
  const changedTotal = modifiedCount + addedCount + deletedCount;

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-gray-900 overflow-y-auto font-sans relative">
      {/* Top Left ClauseCite Brand Header */}
      <div className="p-6 pb-2 flex items-center justify-between border-b border-gray-100">
        <ClauseCiteLogo size="sm" showText={true} />

        {comparisonResult && (
          <button
            onClick={() => {
              setComparisonResult(null);
              setDoc1Id(null);
              setDoc2Id(null);
              setDoc1Name(null);
              setDoc2Name(null);
              setFile1(null);
              setFile2(null);
            }}
            className="text-xs font-semibold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Compare New Documents</span>
          </button>
        )}
      </div>

      {!comparisonResult ? (
        /* SCREEN 1: Dual Dropzone Upload View */
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-4xl mx-auto w-full my-auto space-y-8">
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-1">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Clause-by-Clause Contract Redline & Risk-Shift</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Compare agreements
            </h1>
            <p className="text-sm text-gray-500 font-normal">
              Detect every contractual insertion, deletion, and modification with deterministic word diffs and AI risk-shift analysis.
            </p>
          </div>

          {/* Dual Side-by-Side Drag & Drop Box */}
          <div className="w-full">
            <div className="w-full min-h-[260px] sm:min-h-[280px] bg-white rounded-3xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 shadow-2xs overflow-hidden">
              {/* Left Zone: Baseline Agreement */}
              <label
                htmlFor="compare-doc-1"
                className="relative p-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-gray-50/60 transition group"
              >
                <input
                  id="compare-doc-1"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(1, e)}
                />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  Original Agreement (v1)
                </span>
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center text-gray-600 transition">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 max-w-[220px] truncate">
                    {doc1Name || 'Drag & Drop Version 1'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">or click to browse baseline file</p>
                </div>
                {doc1Name && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <FileCheck className="w-3 h-3" /> Baseline Staged
                  </span>
                )}
              </label>

              {/* Right Zone: Revised Agreement */}
              <label
                htmlFor="compare-doc-2"
                className="relative p-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-gray-50/60 transition group"
              >
                <input
                  id="compare-doc-2"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(2, e)}
                />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  Revised Counter-Proposal (v2)
                </span>
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-amber-100 group-hover:text-amber-600 flex items-center justify-center text-gray-600 transition">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 max-w-[220px] truncate">
                    {doc2Name || 'Drag & Drop Version 2'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">or click to browse revised draft</p>
                </div>
                {doc2Name && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <FileCheck className="w-3 h-3" /> Counter-Proposal Staged
                  </span>
                )}
              </label>
            </div>

            {/* Quick Picker from Workspace Documents */}
            {workspaceDocs.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block text-center">
                  Or pick documents from active workspace:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {workspaceDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-2xs text-xs">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="max-w-[120px] truncate font-medium text-gray-700">{doc.original_filename}</span>
                      <button
                        onClick={() => handleSelectWorkspaceDoc(1, doc)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                          doc1Id === doc.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Set as v1
                      </button>
                      <button
                        onClick={() => handleSelectWorkspaceDoc(2, doc)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                          doc2Id === doc.id ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Set as v2
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {compareError && (
            <div className="w-full max-w-xl p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Comparison Pipeline Error</p>
                <p className="mt-0.5">{compareError}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="w-full max-w-xl">
            <button
              onClick={handleStartCompare}
              disabled={isComparing || (!file1 && !doc1Id) || (!file2 && !doc2Id)}
              className="w-full py-3.5 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold text-sm shadow-md transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              {isComparing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{compareStage || 'Executing ClauseCite redline pipeline...'}</span>
                </>
              ) : (
                <span>{doc1Name && doc2Name ? 'Compare Both Agreements' : 'Select Two Agreements to Compare'}</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* SCREEN 2: Comparison & Redline Dashboard */
        <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ClauseCite Redline Complete</span>
                </span>
                <span className="text-xs text-gray-500 font-mono">Myers Deterministic Diff</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {comparisonResult.baseline_name} <span className="text-gray-400 font-normal">vs.</span> {comparisonResult.revised_name}
              </h2>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-gray-600">Overall Risk Shift:</span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  {comparisonResult.overall_risk_shift}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleCopyDiff}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMemo ? 'Copied' : 'Copy Memorandum'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Redline</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Clauses</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{comparisonResult.summary.total_clauses}</p>
              <span className="text-[11px] text-gray-400">Screened & aligned</span>
            </div>
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Modified Clauses</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{modifiedCount}</p>
              <span className="text-[11px] text-amber-700/80">Text alterations</span>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Added Clauses</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{addedCount}</p>
              <span className="text-[11px] text-emerald-700/80">New obligations</span>
            </div>
            <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">Deleted Clauses</span>
              <p className="text-2xl font-black text-red-700 mt-1">{deletedCount}</p>
              <span className="text-[11px] text-red-700/80">Removed protections</span>
            </div>
          </div>

          {/* Key Deal Points Callout */}
          {comparisonResult.key_deal_points && comparisonResult.key_deal_points.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Critical Deal Points & Commercial Deviations:</span>
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {comparisonResult.key_deal_points.map((pt, i) => (
                  <li key={i} className="text-xs text-blue-950 flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clause Redlines List */}
          {differences.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-gray-900" />
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Clause-by-Clause Redline Inspector
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                    {changedTotal} substantive changes
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterType === 'all' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Deviations ({changedTotal})
                  </button>
                  <button
                    onClick={() => setFilterType('modified')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterType === 'modified' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    Modified ({modifiedCount})
                  </button>
                  <button
                    onClick={() => setFilterType('added')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterType === 'added' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    Added ({addedCount})
                  </button>
                  <button
                    onClick={() => setFilterType('deleted')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterType === 'deleted' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    Deleted ({deletedCount})
                  </button>
                </div>
              </div>

              {/* Redline Cards */}
              <div className="space-y-4">
                {filteredDiffs.map((diffItem, idx) => {
                  const isMod = diffItem.change_type === 'modified';
                  const isAdd = diffItem.change_type === 'added';
                  const isDel = diffItem.change_type === 'deleted';

                  const badgeClass = isMod
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : isAdd
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3 transition hover:border-gray-300"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                            {diffItem.heading || diffItem.clause_id}
                          </span>
                          <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}>
                            {diffItem.change_type.toUpperCase()}
                          </span>
                          {diffItem.risk_level && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                              {diffItem.risk_level} Risk
                            </span>
                          )}
                        </div>

                        {diffItem.potentially_benefits && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            Favors: {diffItem.potentially_benefits}
                          </span>
                        )}
                      </div>

                      {/* Legal Analysis */}
                      {diffItem.impact_explanation && (
                        <div className="text-xs text-gray-700 space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                          <span className="font-bold text-gray-900 block">Legal & Statutory Exposure:</span>
                          <p className="leading-relaxed">{diffItem.impact_explanation}</p>
                          {diffItem.suggested_counsel_action && (
                            <p className="mt-1.5 text-blue-900 font-medium">
                              <strong>Recommended Action:</strong> {diffItem.suggested_counsel_action}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Visual Word-Level Redline Diff */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-mono leading-relaxed space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center justify-between">
                          <span>Word-Level Redline:</span>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Inserted
                            </span>
                            <span className="inline-flex items-center gap-1 text-red-700">
                              <span className="w-2 h-2 rounded-full bg-red-500" /> Deleted
                            </span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                          {diffItem.diff && diffItem.diff.length > 0 ? (
                            diffItem.diff.map((op, opIdx) => {
                              if (op.type === 'insert') {
                                return (
                                  <ins key={opIdx} className="bg-emerald-100 text-emerald-900 no-underline font-semibold px-1 py-0.5 rounded mr-1">
                                    {op.text}
                                  </ins>
                                );
                              }
                              if (op.type === 'delete') {
                                return (
                                  <del key={opIdx} className="bg-red-100 text-red-800 line-through px-1 py-0.5 rounded mr-1">
                                    {op.text}
                                  </del>
                                );
                              }
                              return <span key={opIdx} className="text-gray-800 mr-1">{op.text} </span>;
                            })
                          ) : (
                            <p className="text-gray-600 italic">
                              {isDel ? `Deleted original: ${diffItem.original_text}` : isAdd ? `Added text: ${diffItem.revised_text}` : 'No visual diff ops available.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Executive Memorandum */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                ClauseCite Executive Comparison Memorandum
              </h3>
            </div>
            <FormattedLegalMarkdown content={comparisonResult.executive_summary || comparisonResult.answer || ''} />
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Grounded in Indian Contract Act 1872 & Arbitration and Conciliation Act 1996.</span>
            </div>
            <span className="font-semibold text-gray-600">ClauseCite Differential Legal Intelligence</span>
          </div>
        </div>
      )}
    </div>
  );
}
