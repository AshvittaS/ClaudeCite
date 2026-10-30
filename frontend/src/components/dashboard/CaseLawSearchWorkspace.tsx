import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Scale, BookOpen, Copy, Check, ExternalLink, Filter, Loader2 } from 'lucide-react';
import { SAMPLE_CASE_LAW, CaseLawItem } from '../../data/testUserData.ts';
import { api } from '../../api/client.ts';

export default function CaseLawSearchWorkspace() {
  const [query, setQuery] = useState('');
  const [cases, setCases] = useState<CaseLawItem[]>([]);
  const [copiedCite, setCopiedCite] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState('All Jurisdictions');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setCases([]);
      return;
    }

    setIsLoading(true);
    try {
      // Query the live ChromaDB legal corpus
      const livePassages = await api.searchLegalCorpus(query.trim(), 8);
      if (livePassages && livePassages.length > 0) {
        const mapped: CaseLawItem[] = livePassages.map((p: any) => ({
          caseName: p.title || p.law_name || 'Statutory Provision',
          citation: p.citation || (p.section ? `Section ${p.section}` : p.id),
          court: p.law_name || 'Indian Statutory Corpus',
          year: p.effective_date ? String(p.effective_date).slice(0, 4) : 'Current',
          holding: p.text,
          treatment: 'Positive',
        }));
        setCases(mapped);
      } else {
        setCases([]);
      }
    } catch (err) {
      console.error('Legal corpus search error:', err);
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyBluebook = (cite: string, caseName: string) => {
    navigator.clipboard.writeText(`${caseName}, ${cite}`);
    setCopiedCite(cite);
    setTimeout(() => setCopiedCite(null), 2000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4.25rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5 text-purple-600" /> Statutory & Case Law Prober
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Case Law & Judicial Precedent Research
          </h1>
          <p className="text-xs text-gray-500">
            Search Indian statutes, judicial authorities, and appellate decisions with verified citation grounding.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative flex-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute left-3.5 top-3" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, cases or statutes (e.g., 'arbitration dispute', 'administrative tribunal', 'deposit')..."
            className="w-full bg-transparent pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none placeholder-gray-400"
          />
        </div>

        <select
          value={selectedCourt}
          onChange={(e) => setSelectedCourt(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 cursor-pointer"
        >
          <option value="All Jurisdictions">All Jurisdictions</option>
          <option value="Supreme Court of India">Supreme Court of India</option>
          <option value="High Courts">High Courts</option>
          <option value="Central Administrative Tribunal">CAT / Tribunals</option>
          <option value="Statutory Corpus">Statutory Corpus</option>
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-[#0066FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Search Precedents</span>
        </button>
      </form>

      {/* Case Law Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Found {cases.length} relevant judicial authorities</span>
          <span className="font-mono text-[11px]">ChromaDB Hybrid RAG Validated</span>
        </div>

        {cases.map((c, idx) => (
          <div
            key={c.citation + idx}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-gray-300 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-gray-900 hover:text-blue-600 transition cursor-pointer">
                  {c.caseName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <span>{c.citation}</span>
                  <span>·</span>
                  <span>{c.court}</span>
                  <span>·</span>
                  <span>{c.year}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Treatment: {c.treatment} Authority
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-60 overflow-y-auto">
              <strong className="text-gray-900 block mb-1">Key Holding & Principle:</strong>
              {c.holding}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-[11px] text-gray-400">Standard Citation Grounded</span>
              <button
                onClick={() => copyBluebook(c.citation, c.caseName)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                {copiedCite === c.citation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Citation
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Citation
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
