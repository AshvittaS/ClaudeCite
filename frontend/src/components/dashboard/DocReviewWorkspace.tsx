import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Upload,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  Check,
  RefreshCw,
  X,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Scale,
  ShieldCheck,
  AlertOctagon,
  ChevronRight,
  Filter,
} from 'lucide-react';
import ClauseCiteLogo from '../common/ClauseCiteLogo.tsx';
import FormattedLegalMarkdown from '../common/FormattedLegalMarkdown.tsx';
import { api } from '../../api/client.ts';

interface ClauseFinding {
  clause_type: string;
  severity: 'high' | 'medium' | 'low' | string;
  original_text: string;
  explanation: string;
  suggested_revision?: string;
  source_locations?: Array<{ page?: number; section?: string }>;
  legal_sources?: string[];
  confidence?: string;
}

interface SummaryResult {
  document_id: string;
  document_name: string;
  risk_score: number;
  risk_label: string;
  rubric_version?: string;
  executive_summary: string;
  answer?: string;
  parties?: string[];
  effective_date?: string;
  governing_law?: string;
  citations?: string[];
  findings?: ClauseFinding[];
  limitations?: string[];
}

export default function DocReviewWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string>('');
  const [workspaceDocs, setWorkspaceDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryStage, setSummaryStage] = useState<string>('');
  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedRevisionIdx, setCopiedRevisionIdx] = useState<number | null>(null);

  // Fetch real workspace documents on mount
  useEffect(() => {
    setIsLoadingDocs(true);
    api.listDocuments()
      .then((docs) => {
        setWorkspaceDocs(docs || []);
      })
      .catch((err) => {
        console.error('Failed to load workspace documents:', err);
      })
      .finally(() => {
        setIsLoadingDocs(false);
      });
  }, []);

  const activeDocName = selectedFile?.name || selectedDocName || 'Uploaded_Agreement.pdf';

  const handleStartSummarize = async () => {
    if (!selectedFile && !selectedDocId) return;
    setIsSummarizing(true);
    setSummaryError(null);
    setSummaryStage('Extracting text & mapping contract sections...');

    try {
      let docId = selectedDocId;

      if (selectedFile) {
        setSummaryStage('Uploading agreement to secure workspace...');
        const uploadRes = await api.uploadDocument(selectedFile);
        docId = uploadRes.document_id || uploadRes.id;
        setSelectedDocId(docId);
        setSelectedDocName(selectedFile.name);
      }

      if (!docId) {
        throw new Error('Unable to determine document ID for summary pipeline.');
      }

      setSummaryStage('Retrieving controlling Indian statutes from legal corpus & auditing clauses...');
      const res = await api.summarizeDocument(
        docId,
        ['indemnity', 'liability_cap', 'termination', 'non_compete', 'governing_law', 'ip', 'payment'],
        'India'
      );

      setSummaryData(res);
    } catch (err: any) {
      console.error('Doc review error:', err);
      setSummaryError(err?.message || 'Failed to analyze agreement. Please ensure backend is running.');
    } finally {
      setIsSummarizing(false);
      setSummaryStage('');
    }
  };

  const handleSelectWorkspaceDoc = (doc: any) => {
    setSelectedDocId(doc.id);
    setSelectedDocName(doc.original_filename);
    setSelectedFile(null);
    setSummaryError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSelectedDocId(null);
      setSelectedDocName(e.target.files[0].name);
      setSummaryError(null);
    }
  };

  const handleCopySummary = () => {
    const textToCopy = summaryData?.executive_summary || summaryData?.answer || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const handleCopyRevision = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedRevisionIdx(idx);
    setTimeout(() => setCopiedRevisionIdx(null), 2000);
  };

  // Color helpers
  const getRiskScoreColor = (score: number) => {
    if (score >= 65) return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', fill: 'bg-red-500' };
    if (score >= 35) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', fill: 'bg-amber-500' };
    return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', fill: 'bg-emerald-500' };
  };

  const findingsList = summaryData?.findings || [];
  const filteredFindings = findingsList.filter((f) => {
    if (filterSeverity === 'all') return true;
    return f.severity.toLowerCase() === filterSeverity;
  });

  const highSeverityCount = findingsList.filter((f) => f.severity.toLowerCase() === 'high').length;
  const medSeverityCount = findingsList.filter((f) => f.severity.toLowerCase() === 'medium').length;
  const lowSeverityCount = findingsList.filter((f) => f.severity.toLowerCase() === 'low').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-gray-900 overflow-y-auto font-sans relative">
      {/* Top Left ClauseCite Brand Header */}
      <div className="p-6 pb-2 flex items-center justify-between border-b border-gray-100">
        <ClauseCiteLogo size="sm" showText={true} />

        {summaryData && (
          <button
            onClick={() => {
              setSummaryData(null);
              setSelectedFile(null);
              setSelectedDocId(null);
              setSelectedDocName('');
            }}
            className="text-xs font-semibold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Audit Another Agreement</span>
          </button>
        )}
      </div>

      {!summaryData ? (
        /* SCREEN 1: Agreement Summary Upload Dropzone */
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-4xl mx-auto w-full my-auto space-y-8">
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Indian Contract Act 1872 & Statutory Audit</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Agreement summary & risk audit
            </h1>
            <p className="text-sm text-gray-500 font-normal">
              Execute a rigorous clause-by-clause legal review, exposure scoring, and statutory compliance analysis using the real ClauseCite AI pipeline.
            </p>
          </div>

          {/* Large Drag & Drop Box */}
          <div className="w-full">
            <label
              htmlFor="agreement-file-input"
              className="relative w-full min-h-[240px] sm:min-h-[260px] bg-white rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer flex flex-col items-center justify-center p-8 text-center space-y-3 group shadow-2xs"
            >
              <input
                id="agreement-file-input"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={handleFileUpload}
              />

              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center text-gray-700 transition">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <p className="text-base font-extrabold text-gray-900">
                  {selectedFile ? selectedFile.name : selectedDocName ? selectedDocName : 'Drag & Drop contract or agreement'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  or browse files on your device (PDF, DOCX, TXT)
                </p>
              </div>

              {(selectedFile || selectedDocId) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mt-2">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Ready for Real AI Statutory Review</span>
                </div>
              )}
            </label>

            {/* Supported Formats */}
            <p className="text-[11px] text-gray-400 text-center mt-3 font-normal">
              Supported formats: PDF, DOCX, TXT, CSV (max 50MB per file) • Air-gapped confidentiality guaranteed
            </p>
          </div>

          {/* Pick from existing workspace documents */}
          {workspaceDocs.length > 0 && (
            <div className="w-full max-w-xl text-center space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Or pick an agreement from your active workspace:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {workspaceDocs.slice(0, 5).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectWorkspaceDoc(doc)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1.5 ${
                      selectedDocId === doc.id
                        ? 'bg-black text-white border-black font-semibold shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>{doc.original_filename}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {summaryError && (
            <div className="w-full max-w-xl p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Summary Pipeline Error</p>
                <p className="mt-0.5">{summaryError}</p>
              </div>
            </div>
          )}

          {/* Summarize Action Button */}
          <div className="w-full max-w-xl">
            <button
              onClick={handleStartSummarize}
              disabled={isSummarizing || (!selectedFile && !selectedDocId)}
              className="w-full py-3.5 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold text-sm shadow-md transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSummarizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{summaryStage || 'Running ClauseCite Statutory Pipeline...'}</span>
                </>
              ) : (
                <span>{selectedFile || selectedDocId ? 'Run Agreement Summary & Risk Audit' : 'Upload an Agreement to Summarize'}</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* SCREEN 2: Live Summary Results Dashboard */
        <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ClauseCite Audit Complete</span>
                </span>
                <span className="text-xs text-gray-500 font-mono">Rubric: {summaryData.rubric_version || 'contract-risk-v1'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {summaryData.document_name || activeDocName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-0.5">
                {summaryData.governing_law && (
                  <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                    Governing Law: <strong className="text-gray-900">{summaryData.governing_law}</strong>
                  </span>
                )}
                {summaryData.effective_date && (
                  <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                    Effective: <strong className="text-gray-900">{summaryData.effective_date}</strong>
                  </span>
                )}
                {summaryData.parties && summaryData.parties.length > 0 && (
                  <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                    Parties: <strong className="text-gray-900">{summaryData.parties.join(', ')}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleCopySummary}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMemo ? 'Copied' : 'Copy Memo'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit</span>
              </button>
            </div>
          </div>

          {/* Risk Scorecard & Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Score Metric */}
            {(() => {
              const score = summaryData.risk_score ?? 35;
              const colors = getRiskScoreColor(score);
              return (
                <div className={`p-5 rounded-2xl border ${colors.border} ${colors.bg} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Contract Risk Score</span>
                    <AlertTriangle className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-3xl font-black ${colors.text}`}>{score}</span>
                    <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {summaryData.risk_label || (score >= 65 ? 'High Risk' : score >= 35 ? 'Moderate Risk' : 'Low Risk')}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* High Severity Triggers */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">High Risk Triggers</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-red-600">{highSeverityCount}</span>
                <span className="text-xs text-gray-500 ml-1.5">critical items</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-2">Uncapped indemnity / restraint of trade</span>
            </div>

            {/* Medium Severity Triggers */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Medium Risk Triggers</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-amber-600">{medSeverityCount}</span>
                <span className="text-xs text-gray-500 ml-1.5">clauses to review</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-2">Notice periods / termination cure</span>
            </div>

            {/* Low Risk Boilerplate */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Low Risk Clauses</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-emerald-600">{lowSeverityCount}</span>
                <span className="text-xs text-gray-500 ml-1.5">standard terms</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-2">Standard boilerplate & severability</span>
            </div>
          </div>

          {/* Statutory Grounding & Authorities Chips */}
          {summaryData.citations && summaryData.citations.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 shrink-0">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Controlling Statutory Authorities:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.citations.map((cit, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-blue-800 border border-blue-200 shadow-2xs"
                  >
                    {cit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clause-by-Clause Risk Review & Redlines */}
          {findingsList.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-gray-900" />
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Clause-by-Clause Risk Findings & Recommended Redlines
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                    {findingsList.length} items
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFilterSeverity('all')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterSeverity === 'all' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All ({findingsList.length})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('high')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterSeverity === 'high' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    High ({highSeverityCount})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('medium')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterSeverity === 'medium' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    Medium ({medSeverityCount})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('low')}
                    className={`px-3 py-1 rounded-full transition font-semibold cursor-pointer ${
                      filterSeverity === 'low' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    Low ({lowSeverityCount})
                  </button>
                </div>
              </div>

              {/* Findings Cards */}
              <div className="space-y-4">
                {filteredFindings.map((finding, idx) => {
                  const isHigh = finding.severity.toLowerCase() === 'high';
                  const isMed = finding.severity.toLowerCase() === 'medium';
                  const badgeColor = isHigh
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : isMed
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  const pageRef = finding.source_locations?.[0]?.page
                    ? `Page ${finding.source_locations[0].page}`
                    : null;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3 transition hover:border-gray-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                            {finding.clause_type.replace('_', ' ')}
                          </span>
                          <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {finding.severity} Risk
                          </span>
                          {pageRef && (
                            <span className="text-xs text-gray-500 font-mono">
                              {pageRef}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Verbatim quote from contract */}
                      {finding.original_text && (
                        <div className="bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                            Verbatim Contract Clause:
                          </span>
                          <p className="text-xs text-gray-800 font-mono italic">
                            "{finding.original_text}"
                          </p>
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="text-xs text-gray-700 space-y-1">
                        <span className="font-bold text-gray-900 block">Legal Risk & Statutory Exposure:</span>
                        <p className="leading-relaxed">{finding.explanation}</p>
                      </div>

                      {/* Suggested Revision Redline */}
                      {finding.suggested_revision && (
                        <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>Proposed Protective Redline Revision:</span>
                            </span>
                            <button
                              onClick={() => handleCopyRevision(finding.suggested_revision!, idx)}
                              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-md border border-blue-200 shadow-2xs"
                            >
                              {copiedRevisionIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedRevisionIdx === idx ? 'Copied' : 'Copy Redline'}</span>
                            </button>
                          </div>
                          <p className="text-xs text-blue-950 font-serif leading-relaxed bg-white p-2.5 rounded-lg border border-blue-100">
                            {finding.suggested_revision}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live AI Analysis Presentation */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  ClauseCite Executive Legal Memorandum
                </h3>
              </div>

              <FormattedLegalMarkdown content={summaryData.executive_summary || summaryData.answer || ''} />
            </div>
          </div>

          {/* Audit Verification Footer */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded in Indian Contract Act 1872, Arbitration & Conciliation Act 1996, and Specific Relief Act 1963.</span>
            </div>
            <span className="font-semibold text-gray-600">ClauseCite Multi-Doc Legal Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
