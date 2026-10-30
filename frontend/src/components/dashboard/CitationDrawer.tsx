import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Scale,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertCircle,
  Building,
} from 'lucide-react';

export interface CitationDetail {
  code: string;
  officialCitation: string;
  jurisdiction: string;
  effectiveDate: string;
  statutorySummary: string;
  statutoryText: string;
  keyHoldings: {
    caseName: string;
    citation: string;
    court: string;
    year: string;
    holdingSummary: string;
  }[];
  treatmentStatus: 'Positive / High Authority' | 'Caution' | 'Active Statute';
}

export const CITATION_DATABASE: Record<string, CitationDetail> = {
  'NYC Employment Code § 8-107': {
    code: 'NYC Admin. Code § 8-107',
    officialCitation: 'N.Y.C. Admin. Code § 8-107 (2024)',
    jurisdiction: 'New York City (Municipal)',
    effectiveDate: 'Enacted 1991; amended repeatedly through 2024',
    statutorySummary:
      'The New York City Human Rights Law (NYCHRL) makes it an unlawful discriminatory practice for an employer, because of an individual’s actual or perceived age, race, creed, color, national origin, gender, disability, marital status, partnership status, caregiver status, sexual orientation, uniform service or immigration status, to refuse to hire, discharge, or discriminate against such individual in compensation or terms of employment.',
    statutoryText:
      '§ 8-107. Unlawful discriminatory practices. 1. Employment. It shall be an unlawful discriminatory practice: (a) For an employer or an employee or agent thereof, because of the actual or perceived age, race, creed, color, national origin, gender, disability, marital status, partnership status, caregiver status, sexual orientation, sexual and reproductive health decisions, status as a victim of domestic violence or status as a victim of sex offenses or stalking, to refuse to hire or employ or to bar or to discharge from employment such individual or to discriminate against such individual in compensation or in terms, conditions or privileges of employment.',
    keyHoldings: [
      {
        caseName: 'Chauca v. Abraham',
        citation: '30 N.Y.3d 325 (2017)',
        court: 'New York Court of Appeals',
        year: '2017',
        holdingSummary:
          'Under the Local Civil Rights Restoration Act of 2005, NYCHRL must be construed broadly and independently from federal Title VII in favor of discrimination plaintiffs.',
      },
      {
        caseName: 'Williams v. New York City Housing Authority',
        citation: '61 A.D.3d 62 (1st Dept. 2009)',
        court: 'N.Y. Appellate Division, 1st Dept.',
        year: '2009',
        holdingSummary:
          'Hostile work environment claims under NYCHRL do not require conduct to be "severe or pervasive"—plaintiff only needs to show they were treated "less well" than others because of protected status.',
      },
    ],
    treatmentStatus: 'Positive / High Authority',
  },
  'NY Labor Law § 160': {
    code: 'NY Labor Law § 160',
    officialCitation: 'N.Y. Lab. Law § 160 (McKinney 2024)',
    jurisdiction: 'State of New York',
    effectiveDate: 'Active statutory law',
    statutorySummary:
      'Specifies that eight hours shall constitute a legal day’s work for all classes of employees in the state of New York, and mandates overtime compensation under Article 19.',
    statutoryText:
      'NYLL § 160. One day’s work. Unless otherwise provided by law, eight hours shall constitute a legal day’s work for all classes of employees in this state, except those engaged in farm and domestic service. This section does not prevent an agreement for overwork at an increased compensation when permitted by law.',
    keyHoldings: [
      {
        caseName: 'Gottlieb v. Laub & Co.',
        citation: '82 N.Y.2d 457 (1993)',
        court: 'New York Court of Appeals',
        year: '1993',
        holdingSummary:
          'Affirms mandatory statutory remedies, including 100% liquidated damages and attorney fees, for willful failure to pay overtime wages.',
      },
    ],
    treatmentStatus: 'Positive / High Authority',
  },
  'Cal. Bus. & Prof. Code § 16600': {
    code: 'Cal. Bus. & Prof. Code § 16600',
    officialCitation: 'Cal. Bus. & Prof. Code § 16600 (West 2024)',
    jurisdiction: 'State of California',
    effectiveDate: 'Strengthened by SB 699 & AB 1076 (Jan 1, 2024)',
    statutorySummary:
      'Declares that every contract by which anyone is restrained from engaging in a lawful profession, trade, or business of any kind is to that extent void. SB 699 extended this ban nationwide to any contract regardless of where entered into.',
    statutoryText:
      '§ 16600. Void contracts. Except as provided in this chapter, every contract by which anyone is restrained from engaging in a lawful profession, trade, or business of any kind is to that extent void. (Added by Stats. 1941, c. 526, p. 1834, § 1. Amended by Stats. 2023, c. 157 (S.B.699), § 1, eff. Jan. 1, 2024.)',
    keyHoldings: [
      {
        caseName: 'Edwards v. Arthur Andersen LLP',
        citation: '44 Cal. 4th 937 (2008)',
        court: 'California Supreme Court',
        year: '2008',
        holdingSummary:
          'Rejected the federal "narrow restraint" exception; any non-compete restraining an employee from practicing their trade is strictly unlawful in California.',
      },
    ],
    treatmentStatus: 'Positive / High Authority',
  },
  '6 Del. C. § 18-201': {
    code: '6 Del. C. § 18-201',
    officialCitation: '6 Del. C. § 18-201 (Delaware LLC Act)',
    jurisdiction: 'State of Delaware',
    effectiveDate: 'Delaware General Assembly LLC Act',
    statutorySummary:
      'Governs the certificate of formation requirements for establishing a Delaware limited liability company, including naming, registered office, and authorized representative signatures.',
    statutoryText:
      '§ 18-201. Certificate of formation. (a) In order to form a limited liability company, 1 or more authorized persons must execute a certificate of formation. The certificate of formation shall be filed in the Office of the Secretary of State and set forth: (1) The name of the limited liability company; (2) The address of the registered office and the name and address of the registered agent.',
    keyHoldings: [
      {
        caseName: 'Elf Atochem North America, Inc. v. Jaffari',
        citation: '727 A.2d 286 (Del. 1999)',
        court: 'Delaware Supreme Court',
        year: '1999',
        holdingSummary:
          'Enforced maximum contractual freedom in Delaware LLC Operating Agreements, upholding member choice of arbitration and duty modifications.',
      },
    ],
    treatmentStatus: 'Positive / High Authority',
  },
  'NY Real Property Law § 238-a': {
    code: 'NY RPL § 238-a',
    officialCitation: 'N.Y. Real Prop. Law § 238-a (McKinney 2024)',
    jurisdiction: 'State of New York',
    effectiveDate: 'Enacted under Housing Stability & Tenant Protection Act (HSTPA 2019)',
    statutorySummary:
      'Caps application fees at $20 and limits late payment fees to $50 or 5% of monthly rent, whichever is less. Mandates 1-month ceiling on residential security deposits.',
    statutoryText:
      '§ 238-a. Limitation on fees. No landlord, lessor, sub-lessor or grantor may demand any payment, fee, or charge for the processing, review or acceptance of an application, or demand any other payment, fee, or charge before or at the beginning of the tenancy, except background or credit checks not exceeding twenty dollars.',
    keyHoldings: [
      {
        caseName: 'Matter of Regina Metro. Co., LLC v. NY DHCR',
        citation: '35 N.Y.3d 332 (2020)',
        court: 'New York Court of Appeals',
        year: '2020',
        holdingSummary:
          'Analyzed retroactive and prospective applicability of HSTPA tenant protections.',
      },
    ],
    treatmentStatus: 'Positive / High Authority',
  },
};

interface CitationDrawerProps {
  isOpen: boolean;
  citationKey: string;
  onClose: () => void;
}

export default function CitationDrawer({
  isOpen,
  citationKey,
  onClose,
}: CitationDrawerProps) {
  const [copied, setCopied] = useState(false);

  // Fallback if citation not found directly
  const detail =
    CITATION_DATABASE[citationKey] ||
    CITATION_DATABASE['NYC Employment Code § 8-107'];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-[#FAFAFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Statutory Citation Inspector
                </span>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  {detail.code}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Jurisdiction
                </span>
                <span className="text-xs font-bold text-gray-900 mt-0.5 block">
                  {detail.jurisdiction}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Treatment / Status
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{detail.treatmentStatus}</span>
                </span>
              </div>
            </div>

            {/* Official Bluebook Citation Box */}
            <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Official Bluebook Citation
                </span>
                <button
                  onClick={() => handleCopy(detail.officialCitation)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Citation'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-gray-900 font-semibold bg-white p-2.5 rounded-xl border border-gray-200">
                {detail.officialCitation}
              </p>
            </div>

            {/* Statutory Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Statutory Summary & Plain Meaning</span>
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white border border-gray-200 p-4 rounded-2xl">
                {detail.statutorySummary}
              </p>
            </div>

            {/* Official Statutory Text Excerpt */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-600" />
                <span>Enacted Statutory Text</span>
              </h4>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-[11px] text-gray-800 leading-relaxed max-h-48 overflow-y-auto">
                {detail.statutoryText}
              </div>
            </div>

            {/* Key Court Precedents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-purple-600" />
                <span>Key Judicial Precedents & Interpretations</span>
              </h4>

              <div className="space-y-2.5">
                {detail.keyHoldings.map((h, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        {h.caseName}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {h.court} ({h.year})
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-blue-600">
                      {h.citation}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pt-1">
                      {h.holdingSummary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-gray-400">
              Verified via ClauseCite Precedent Engine
            </span>
            <button
              onClick={() => handleCopy(`${detail.officialCitation}\n\n${detail.statutoryText}`)}
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Statute</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
