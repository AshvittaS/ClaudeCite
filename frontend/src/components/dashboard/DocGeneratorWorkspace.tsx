import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Brain,
  MoreVertical,
  SkipForward,
  Wand2,
  Share2,
  Save,
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  ArrowRight,
  Check,
  FileText,
  Search,
  Scale,
  Coins,
  Briefcase,
  Shield,
  FileCheck2,
  Building,
  CheckCircle2,
  Layers,
  Eye,
  Edit3,
  Copy,
} from 'lucide-react';
import ClauseCiteLogo from '../common/ClauseCiteLogo.tsx';
import { api } from '../../api/client.ts';

interface ClarifyingQuestion {
  id: string;
  topic: string;
  question: string;
  example: string;
  options: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// TAILORED CLARIFYING QUESTIONS BY CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

const QUESTIONS_BY_CATEGORY: Record<string, ClarifyingQuestion[]> = {
  financial: [
    {
      id: 'q1',
      topic: 'Jurisdiction & Statutory Compliance',
      question: 'Which Indian State law governs this financial instrument, and what court or arbitral forum has jurisdiction?',
      example: 'Example: Tamil Nadu, India — Madras High Court jurisdiction; Tamil Nadu Money Lenders Act 1957 & TN Stamp Act 2023.',
      options: [
        'Tamil Nadu, India (Madras High Court & District Courts)',
        'Chennai, Tamil Nadu (SIAC / Indian Arbitration Act)',
        'Maharashtra, India (Bombay High Court)',
        'Delhi NCR, India (Delhi High Court)',
      ],
    },
    {
      id: 'q2',
      topic: 'Financial Contracting Parties',
      question: 'What are the formal legal names, constitution (Pvt Ltd/LLP/Individual), and addresses of Lender/Creditor and Borrower/Debtor?',
      example: 'Example: Rajan Financiers Pvt. Ltd. (Lender, Chennai) and Arun Kumar S. (Borrower, Coimbatore).',
      options: [
        'Institutional Financier & Private Commercial Entity',
        'Private Lender & Individual Borrower (Tamil Nadu)',
        'Investor Fund & Tech Startup (Chennai)',
        'Creditor Firm & Trade Debtor (Accord & Satisfaction)',
      ],
    },
    {
      id: 'q3',
      topic: 'Principal, Interest & Repayment Mechanism',
      question: 'What is the principal amount (INR), annual interest rate %, and repayment schedule (EMI/bullet)?',
      example: 'Example: ₹5,00,000 at 18% p.a. reducing balance, 24 monthly EMIs via NACH mandate.',
      options: [
        '₹5,00,000 at 18% p.a., 24 monthly EMIs via NACH mandate',
        '₹10,00,000 bullet repayment in 12 months with 15% interest',
        '₹1,20,000 structured into 10 equal monthly instalments',
        'Equity Investment of ₹50,00,000 for 15% CCPS stake',
      ],
    },
    {
      id: 'q4',
      topic: 'Security, Collateral & Acceleration on Default',
      question: 'What security or collateral is pledged, and what default remedy or acceleration applies?',
      example: 'Example: Personal guarantee + SARFAESI hypothecation; default immediately accelerates full balance with 3% penal interest.',
      options: [
        'Unconditional Personal Guarantee + full acceleration on 7 days notice',
        'Pledge of Immovable Property / Mortgage registered at Sub-Registrar',
        'Unsecured loan with Section 138 NI Act cheque deposit',
        'Liquidated damages capped at principal outstanding + legal costs',
      ],
    },
  ],

  nda: [
    {
      id: 'q1',
      topic: 'Jurisdiction & Governing Law',
      question: 'Which state jurisdiction governs the confidentiality obligations and injunctive relief?',
      example: 'Example: Tamil Nadu, India — governed by Indian Contract Act 1872 (Section 27 compliance).',
      options: [
        'Tamil Nadu, India (Madras High Court)',
        'Karnataka, India (Bengaluru Courts)',
        'Maharashtra, India (Bombay High Court)',
        'Arbitration in Chennai, Tamil Nadu',
      ],
    },
    {
      id: 'q2',
      topic: 'Disclosing & Receiving Parties',
      question: 'Who is disclosing and who is receiving the proprietary confidential information?',
      example: 'Example: Mutual bilateral exchange between Apex Tech Pvt Ltd and Horizon Innovations LLP.',
      options: [
        'Mutual Bilateral Exchange (Both Parties Disclosing & Receiving)',
        'Unilateral — Company Disclosing to Prospective Partner / Vendor',
        'Employer Disclosing to Incoming Senior Employee',
        'Startup Disclosing to Angel Investor / VC Fund',
      ],
    },
    {
      id: 'q3',
      topic: 'Defined Purpose of Disclosure',
      question: 'What is the precise business purpose for which confidential information is being disclosed?',
      example: 'Example: Evaluating a potential joint venture, software licensing, and strategic distribution in Tamil Nadu.',
      options: [
        'Evaluating a potential joint venture and business partnership',
        'Commercial due diligence for M&A / equity investment',
        'Software technology evaluation and integration testing',
        'Vendor service procurement and technical RFP evaluation',
      ],
    },
    {
      id: 'q4',
      topic: 'Confidentiality Term & Trade Secrets',
      question: 'How long should the confidentiality obligation survive, and how are trade secrets protected?',
      example: 'Example: 3 years from disclosure; trade secrets protected indefinitely while remaining secret.',
      options: [
        '3 years from disclosure; trade secrets indefinitely protected',
        '2 years confidentiality survival period',
        '5 years commercial protection with mandatory return/shredding of data',
        'Survives until information enters public domain without breach',
      ],
    },
  ],

  poa: [
    {
      id: 'q1',
      topic: 'Jurisdiction & Sub-Registrar Office',
      question: 'Where will this Power of Attorney be executed and registered in Tamil Nadu?',
      example: 'Example: Sub-Registrar Office, Anna Nagar, Chennai, Tamil Nadu under Powers of Attorney Act 1882.',
      options: [
        'Sub-Registrar Office, Chennai, Tamil Nadu (Compulsory Registration)',
        'Coimbatore District, Tamil Nadu (Notarised / Registered)',
        'Madurai District, Tamil Nadu',
        'General execution across Tamil Nadu with consular attestation',
      ],
    },
    {
      id: 'q2',
      topic: 'Principal & Appointed Attorney Details',
      question: 'What are the formal legal names, Aadhaar/PAN, and relationships of Principal and Agent/Attorney?',
      example: 'Example: Principal: Ramaswamy K. (NRI); Attorney: Sundar Ramaswamy (Blood relative / Son).',
      options: [
        'Principal (NRI / Outstation) appointing close family member in Tamil Nadu',
        'Company appointing authorized director / manager for regulatory filings',
        'Property owner appointing attorney for lease management and maintenance',
        'Client appointing legal practitioner / representative for tax matters',
      ],
    },
    {
      id: 'q3',
      topic: 'Specific Powers Granted',
      question: 'What specific administrative, financial, property, or litigation powers are granted?',
      example: 'Example: Operation of bank accounts, payment of utility dues, representation before TANGEDCO and revenue officials.',
      options: [
        'Special / Limited Power — Banking and revenue administration only',
        'General Power — Administrative management excluding property sale',
        'Property POA — Maintenance, tenant agreements and rent collection',
        'Tax & Litigation Representation before IT Department and GST Authorities',
      ],
    },
    {
      id: 'q4',
      topic: 'Revocability & Stamp Duty',
      question: 'Is this Power of Attorney revocable, and what stamp duty schedule applies under Tamil Nadu Stamp Act?',
      example: 'Example: Revocable at will; executed on ₹100 stamp paper for blood relatives under TN Stamp Schedule.',
      options: [
        'Revocable at will upon written notice; blood relative stamp duty concession',
        'Revocable Power of Attorney with indemnity in favour of Agent',
        'Continuing financial agency with annual accounting requirement',
        'Specific purpose agency terminating automatically upon task completion',
      ],
    },
  ],

  default: [
    {
      id: 'q1',
      topic: 'Jurisdiction & Choice of Law',
      question: 'Which jurisdiction’s law should govern the agreement, and where will disputes be arbitrated?',
      example: 'Example: Tamil Nadu, India — governed by Indian Contract Act 1872; Arbitration in Chennai.',
      options: [
        'Tamil Nadu, India (Madras High Court / Arbitration in Chennai)',
        'India (Applicable State & Central Laws)',
        'California, United States',
        'Delaware, United States',
      ],
    },
    {
      id: 'q2',
      topic: 'Contracting Parties',
      question: 'What are the formal legal names and entity forms of the contracting parties?',
      example: 'Example: Apex Technologies Pvt Ltd (Provider) and Horizon Media Corp (Client).',
      options: [
        'Commercial Entities (Pvt Ltd / LLP in Tamil Nadu)',
        'Bilateral Enterprise Entities',
        'Individual Sole Proprietorship & Client Firm',
        'Employer & Professional Consultant',
      ],
    },
    {
      id: 'q3',
      topic: 'Payment Terms & Milestone Schedule',
      question: 'What is the compensation structure, payment milestone schedule, and late penalty fee?',
      example: 'Example: Net 30 days upon monthly invoice; 1.5% monthly late interest under MSMED Act.',
      options: [
        'Net 30 days upon invoice with 1.5% monthly interest',
        '50% advance / 50% milestone acceptance',
        'Net 15 days electronic transfer (RTGS / NEFT)',
        'Fixed monthly retainer payable on the 1st of each month',
      ],
    },
    {
      id: 'q4',
      topic: 'Liability Ceiling & Indemnity',
      question: 'What limitation of liability cap and indemnification carve-outs should apply under statutory codes?',
      example: 'Example: Aggregate 12 months fees paid; mutual waiver of consequential damages under Section 73 ICA.',
      options: [
        '12 months aggregate fees paid; mutual consequential damage waiver',
        'Fixed monetary liability cap of ₹5,00,000',
        'Mutual consequential damages waiver only',
        'Full indemnity for IP infringement and breach of confidentiality',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED CATEGORY METADATA (Tamil Nadu & India focus)
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryDef {
  id: string;
  name: string;
  badge: string;
  description: string;
  color: string;
  icon: any;
  defaultQuestionsKey: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'all',
    name: 'All Templates',
    badge: 'Library',
    description: 'Browse all 295+ templates across all commercial categories.',
    color: 'gray',
    icon: Layers,
    defaultQuestionsKey: 'default',
  },
  {
    id: 'financial',
    name: 'Financial Agreement Generator',
    badge: 'High Priority',
    description: 'Loan, promissory notes, payment plans, revenue share, debt settlement, guarantees, ACH & equity.',
    color: 'amber',
    icon: Coins,
    defaultQuestionsKey: 'financial',
  },
  {
    id: 'b2b',
    name: 'Tamil Nadu B2B Commercial',
    badge: '60 Templates',
    description: 'Master services, supply, logistics, marketing, consulting, job work & SOW agreements for Tamil Nadu.',
    color: 'blue',
    icon: Briefcase,
    defaultQuestionsKey: 'default',
  },
  {
    id: 'nda',
    name: 'Tamil Nadu NDA Library',
    badge: '10 Templates',
    description: 'Unilateral, mutual, employee, consultant, vendor, investor, M&A & data-sharing NDAs.',
    color: 'emerald',
    icon: Shield,
    defaultQuestionsKey: 'nda',
  },
  {
    id: 'poa',
    name: 'Power of Attorney (POA)',
    badge: '10 Templates',
    description: 'Special, general, banking, property, tax representation & healthcare authorizations for Tamil Nadu.',
    color: 'purple',
    icon: Scale,
    defaultQuestionsKey: 'poa',
  },
  {
    id: 'lease',
    name: 'Lease & Tenancy Agreements',
    badge: '187 Templates',
    description: 'Residential, commercial space, vehicle, farm, deposit receipts & tenancy records under TN tenancy laws.',
    color: 'indigo',
    icon: Building,
    defaultQuestionsKey: 'default',
  },
];

// Featured 9 Financial Templates for instant one-click selection
const FEATURED_FINANCIAL_TEMPLATES = [
  {
    id: 'loan-lending-agreement',
    title: 'Loan & Lending Agreement',
    statute: 'TN Money Lenders Act 1957',
    summary: 'Bilateral commercial/personal loan facility with principal, interest, EMI & default acceleration.',
    popularity: '98%',
  },
  {
    id: 'promissory-note-iou',
    title: 'Promissory Notes & IOUs',
    statute: 'Negotiable Instruments Act 1881',
    summary: 'Negotiable promissory note & debt acknowledgement payable on demand or fixed maturity date.',
    popularity: '96%',
  },
  {
    id: 'payment-plan-instalment',
    title: 'Payment Plans & Installment Agreements',
    statute: 'Indian Contract Act 1872',
    summary: 'Structured debt repayment schedule with down payment, monthly milestones & default penalties.',
    popularity: '94%',
  },
  {
    id: 'revenue-grant-profit-sharing',
    title: 'Revenue, Grant & Profit Sharing Agreements',
    statute: 'CGST/SGST & Income Tax Acts',
    summary: 'Gross/net revenue split, grant milestone disbursements, audit inspection rights & tax allocation.',
    popularity: '92%',
  },
  {
    id: 'debt-settlement-credit',
    title: 'Debt Settlement & Credit Agreements',
    statute: 'Accord & Satisfaction (ICA 1872)',
    summary: 'Compromise settlement of outstanding dues, mutual release of claims & optional renewed credit line.',
    popularity: '95%',
  },
  {
    id: 'guarantee-guarantor',
    title: 'Guarantees & Guarantor Agreements',
    statute: 'Sec. 126-147 Indian Contract Act',
    summary: 'Unconditional personal or corporate guarantee securing principal borrower debt or performance.',
    popularity: '93%',
  },
  {
    id: 'ach-payment-authorization',
    title: 'ACH & Payment Authorization Forms',
    statute: 'RBI NACH & NPCI Regulations',
    summary: 'Mandate authorising recurring bank debits/NACH transfers with bank branch & cancellation rules.',
    popularity: '91%',
  },
  {
    id: 'escrow-security-collateral',
    title: 'Escrow, Security & Collateral Documents',
    statute: 'SARFAESI Act 2002 & Registration Act',
    summary: 'Asset hypothecation, escrow fund custody, collateral pledge & default liquidation rights.',
    popularity: '94%',
  },
  {
    id: 'investment-equity',
    title: 'Investment & Equity Documents',
    statute: 'Companies Act 2013 & SEBI Regulations',
    summary: 'Seed equity, CCPS, post-money valuation, anti-dilution, board rights & FEMA compliance.',
    popularity: '97%',
  },
];

export default function DocGeneratorWorkspace() {
  // Mode: 'prompt' or 'drafting'
  const [stage, setStage] = useState<'prompt' | 'drafting'>('prompt');
  const [agreementTypeInput, setAgreementTypeInput] = useState('Loan & Lending Agreement');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('loan-lending-agreement');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('financial');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Loaded templates from backend
  const [backendTemplates, setBackendTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);

  // Clarifying question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [detailInput, setDetailInput] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: 'Tamil Nadu, India (Madras High Court jurisdiction; TN Stamp Act 2023)',
    q2: 'Rajan Financiers Pvt. Ltd. (Lender) and Arun Kumar S. (Borrower)',
    q3: '₹5,00,000 at 18% p.a. reducing balance, 24 monthly EMIs via NACH mandate',
    q4: 'Personal guarantee + SARFAESI hypothecation; default immediately accelerates full balance',
  });

  // AI Generation State
  const [aiDraftContent, setAiDraftContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Editor states
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [fontSize, setFontSize] = useState('12');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [canvasViewMode, setCanvasViewMode] = useState<'preview' | 'edit'>('preview');
  const [editableDraft, setEditableDraft] = useState<string>('');

  // Fetch all templates from backend on load
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTemplates(true);
    api.listTemplates()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setBackendTemplates(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch backend templates:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTemplates(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine which clarifying questions to ask based on selected category / title
  const activeQuestionsList: ClarifyingQuestion[] = useMemo(() => {
    const titleLower = (agreementTypeInput || '').toLowerCase();
    if (
      titleLower.includes('loan') ||
      titleLower.includes('promissory') ||
      titleLower.includes('financial') ||
      titleLower.includes('payment plan') ||
      titleLower.includes('revenue') ||
      titleLower.includes('debt') ||
      titleLower.includes('guarantee') ||
      titleLower.includes('ach') ||
      titleLower.includes('escrow') ||
      titleLower.includes('equity') ||
      titleLower.includes('credit')
    ) {
      return QUESTIONS_BY_CATEGORY.financial;
    }
    if (titleLower.includes('nda') || titleLower.includes('confidential')) {
      return QUESTIONS_BY_CATEGORY.nda;
    }
    if (titleLower.includes('attorney') || titleLower.includes('poa')) {
      return QUESTIONS_BY_CATEGORY.poa;
    }
    return QUESTIONS_BY_CATEGORY.default;
  }, [agreementTypeInput]);

  const activeQuestion = activeQuestionsList[currentQuestionIndex] || activeQuestionsList[0];

  // Filter templates list for the interactive browser
  const filteredTemplates = useMemo(() => {
    let list = backendTemplates;

    if (selectedCategoryTab === 'financial') {
      list = list.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        const dt = (t.document_type || '').toLowerCase();
        const id = (t.id || '').toLowerCase();
        return cat.includes('financial') || dt.includes('financial') || id.includes('fin-') || id.includes('loan');
      });
    } else if (selectedCategoryTab === 'b2b') {
      list = list.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        const id = (t.id || '').toLowerCase();
        return cat.includes('b2b') || id.includes('b2b') || id.includes('svc') || id.includes('sup');
      });
    } else if (selectedCategoryTab === 'nda') {
      list = list.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        const id = (t.id || '').toLowerCase();
        const dt = (t.document_type || '').toLowerCase();
        return cat.includes('nda') || dt === 'nda' || id.includes('nda');
      });
    } else if (selectedCategoryTab === 'poa') {
      list = list.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        const id = (t.id || '').toLowerCase();
        return cat.includes('poa') || id.includes('poa') || cat.includes('attorney');
      });
    } else if (selectedCategoryTab === 'lease') {
      list = list.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        const id = (t.id || '').toLowerCase();
        return cat.includes('lease') || id.includes('lease') || cat.includes('rental');
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => {
        const name = (t.name || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        const id = (t.id || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || id.includes(q);
      });
    }

    return list;
  }, [backendTemplates, selectedCategoryTab, searchQuery]);

  // Handle generation via backend
  const handleGenerateAiDraft = async (typeText?: string, tId?: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    const targetType = typeText || agreementTypeInput;
    const targetId = tId || selectedTemplateId;

    try {
      const res = await api.generateDraft({
        template_id: targetId,
        document_type: targetType,
        requirements: `Draft a statutory agreement for ${targetType} for parties ${answers['q2'] || 'Contracting Parties'} in ${answers['q1'] || 'Tamil Nadu, India'}. Key commercial & payment terms: ${answers['q3'] || 'Standard'}. Security & liability provisions: ${answers['q4'] || 'Standard acceleration and protection'}.`,
        answers,
        jurisdiction: answers['q1'] || 'India - Tamil Nadu',
      });
      if (res?.content) {
        setAiDraftContent(res.content);
        setEditableDraft(res.content);
      }
    } catch (err: any) {
      console.error('Draft generation error:', err);
      setGenerationError(err?.message || 'Failed to connect to AI server. Rendered statutory template.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartDrafting = (typeText: string, tId?: string) => {
    setAgreementTypeInput(typeText);
    if (tId) setSelectedTemplateId(tId);
    setEditableDraft('');
    setAiDraftContent('');
    setCurrentQuestionIndex(0);
    setStage('drafting');
    handleGenerateAiDraft(typeText, tId);
  };

  const handleNextQuestion = (answerText: string) => {
    if (!answerText.trim()) return;
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: answerText }));
    setDetailInput('');
    if (currentQuestionIndex < activeQuestionsList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleAutoFill = () => {
    const defaultVal = activeQuestion.options[0] || 'Standard commercial and statutory terms pursuant to Tamil Nadu law.';
    setDetailInput(defaultVal);
    handleNextQuestion(defaultVal);
  };

  const effectiveText = editableDraft || aiDraftContent || generateContractText();

  const handleCopyText = () => {
    navigator.clipboard.writeText(effectiveText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleExportDoc = () => {
    const text = effectiveText;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClauseCite_${agreementTypeInput.replace(/\s+/g, '_')}_Tamil_Nadu_v1.0.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // High-fidelity fallback contract generator tailored to chosen category and inputs
  const generateContractText = () => {
    const jur = answers['q1'] || 'Tamil Nadu, India';
    const parties = answers['q2'] || 'Lender & Borrower / Contracting Parties';
    const terms = answers['q3'] || 'Principal amount & repayment schedule agreed herein';
    const security = answers['q4'] || 'Unconditional security and acceleration remedies upon default';
    const titleUpper = agreementTypeInput.toUpperCase();
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return `# ${titleUpper}
*(Executed under the Laws of India & Applicable Tamil Nadu Statutes)*

**Place of Execution:** Chennai, Tamil Nadu, India  
**Effective Date:** ${today}  
**Jurisdiction:** ${jur}  

---

### PARTIES TO THIS AGREEMENT:
${parties} (collectively referred to as the **"Parties"** and individually as a **"Party"**).

### PREAMBLE & RECITALS:
**WHEREAS**, the Parties are entering into this ${agreementTypeInput} for legal consideration acknowledged herein;  
**AND WHEREAS**, both Parties represent that they possess full legal capacity under Section 11 of the Indian Contract Act, 1872 to execute and deliver this instrument;  
**NOW, THEREFORE**, in consideration of the mutual covenants, financial terms, and obligations set forth herein, the Parties agree as follows:

---

### 1. DEFINITIONS & PRINCIPAL TERMS
1.1. **Core Obligation:** The Parties agree to adhere strictly to the following agreed terms:
> **Financial & Commercial Terms:** ${terms}

1.2. **Governing State Law:** Governed by the substantive laws of India, including the Indian Contract Act 1872, the Tamil Nadu Money Lenders Act 1957, the Negotiable Instruments Act 1881, the SARFAESI Act 2002, and the Tamil Nadu Stamp Act 2023, as applicable to the subject matter of this instrument.

---

### 2. DISBURSEMENT, REPAYMENT & INTEREST TERMS
2.1. All sums payable under this Agreement shall be remitted via electronic funds transfer (RTGS / NEFT / IMPS) or authorized NACH / ECS bank debit mandate.  
2.2. Any delayed payment beyond the agreed due date shall accrue late interest at the rate of 1.5% per month or the statutory rate prescribed under applicable law, without prejudice to other default remedies.

---

### 3. SECURITY, COLLATERAL & COVENANTS
3.1. **Security & Protection:** ${security}  
3.2. **Negative Covenants:** Neither Party shall assign, encumber, or create third-party charges over the underlying subject matter or collateral without prior written authorization from the other Party.

---

### 4. EVENTS OF DEFAULT & ACCELERATION CLAUSE
4.1. The occurrence of any of the following constitutes an **Event of Default**:
- (a) Failure to pay any principal, interest, or installment within seven (7) days of due date;
- (b) Any material inaccuracy in statutory representations or KYC documentation;
- (c) Initiation of insolvency, winding-up, or bankruptcy proceedings against an obligor.

4.2. **Remedies upon Default:** Upon an Event of Default, the non-defaulting party may, by written notice, declare the entire outstanding balance immediately due and payable (*Acceleration*) and enforce security through competent forums including Section 138 NI Act proceedings or SARFAESI enforcement.

---

### 5. DISPUTE RESOLUTION & JURISDICTION
5.1. Any dispute, claim, or difference arising out of or in connection with this Agreement shall be referred to arbitration in accordance with the **Arbitration and Conciliation Act, 1996**.  
5.2. **Arbitral Seat & Venue:** Chennai, Tamil Nadu, India. Language of proceedings shall be English.  
5.3. Subject to arbitration, the Courts at **Chennai, Tamil Nadu** (including the High Court of Judicature at Madras) shall have exclusive jurisdiction.

---

### 6. STAMP DUTY & REGISTRATION
This instrument shall be executed on appropriate non-judicial stamp paper or e-stamp certificate in accordance with the **Tamil Nadu Stamp Act 2023**. Where mandated under Section 17 of the Registration Act 1908, the Parties shall present this instrument for registration before the jurisdictional Sub-Registrar.

---

### SIGNATURES & EXECUTION:

**FOR AND ON BEHALF OF FIRST PARTY:**  
Signature: _____________________________________  
Name: _________________________________________  
Designation: __________________________________  
Date: _________________________________________  

**FOR AND ON BEHALF OF SECOND PARTY:**  
Signature: _____________________________________  
Name: _________________________________________  
Designation: __________________________________  
Date: _________________________________________  

**IN THE PRESENCE OF WITNESSES:**  
1. Witness Signature: ___________________________  
   Name & Address: _____________________________  
2. Witness Signature: ___________________________  
   Name & Address: _____________________________  

---
*DRAFT — Generated by ClauseCite AI Legal Intelligence. Requires independent qualified attorney review prior to execution.*`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-gray-900 overflow-hidden font-sans relative">
      {stage === 'prompt' ? (
        /* =========================================================================
           STAGE 1: PROMPT & TEMPLATE SELECTOR SCREEN
           ========================================================================= */
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
          {/* Top Bar with ClauseCite Branding */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <ClauseCiteLogo size="sm" showText={true} />
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Agreement Creator • Tamil Nadu & India
              </span>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              <span>295+ Statutory Templates Connected</span>
            </div>
          </div>

          {/* Center Stage: Title + Smart Input Pill */}
          <div className="text-center space-y-4 max-w-3xl mx-auto w-full pt-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              What type of agreement do you want to create?
            </h1>
            <p className="text-sm text-gray-600">
              Select from the Financial Agreement Generator below or search across 5 comprehensive Tamil Nadu template libraries.
            </p>

            {/* Smart Search / Prompt Pill */}
            <div className="w-full pt-2">
              <div className="bg-white rounded-full border border-gray-300 shadow-md px-4 py-2.5 flex items-center gap-3 hover:border-gray-400 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <button
                  type="button"
                  onClick={() => alert('ClauseCite Intelligence: Formulate statutory contracts based on Indian Contract Act, Tamil Nadu Money Lenders Act, and current stamp laws.')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  <Brain className="w-3.5 h-3.5 text-blue-600" />
                  <span>Explain</span>
                </button>

                <input
                  type="text"
                  value={agreementTypeInput}
                  onChange={(e) => setAgreementTypeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartDrafting(agreementTypeInput);
                  }}
                  placeholder="e.g. Loan Agreement, Promissory Note, Payment Plan, Mutual NDA, Lease..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 p-0"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-gray-400 font-medium hidden sm:inline">
                    Enter ↵
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartDrafting(agreementTypeInput)}
                    className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 flex items-center justify-center transition cursor-pointer shadow-xs"
                    title="Generate Agreement"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================================
              FEATURED: FINANCIAL AGREEMENT GENERATOR (9 TEMPLATES)
              ======================================================================= */}
          <div className="space-y-4 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 rounded-3xl p-6 border border-amber-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Financial Agreement Generator</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      9 Statutory Templates
                    </span>
                  </h2>
                  <p className="text-xs text-gray-600">
                    Compliant with Tamil Nadu Money Lenders Act 1957, Negotiable Instruments Act 1881 & TN Stamp Act 2023.
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full w-fit">
                ₹ Tamil Nadu Jurisdiction Ready
              </span>
            </div>

            {/* 9 Financial Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {FEATURED_FINANCIAL_TEMPLATES.map((tmpl) => (
                <motion.div
                  key={tmpl.id}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  onClick={() => handleStartDrafting(tmpl.title, tmpl.id)}
                  className="bg-white rounded-2xl p-4 border border-amber-200/70 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {tmpl.statute}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">
                        ★ {tmpl.popularity}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition leading-snug">
                      {tmpl.title}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {tmpl.summary}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                    <span>Create Agreement</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* =======================================================================
              ALL 5 CATEGORIES BROWSER & SEARCH
              ======================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Browse All 5 Categories for India (Tamil Nadu)
                </h3>
                <p className="text-xs text-gray-500">
                  Select a category to inspect or launch guided drafting for any of the 295+ templates.
                </p>
              </div>

              {/* Search Filter Box */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter templates..."
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategoryTab === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Loaded Templates List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {filteredTemplates.slice(0, 15).map((tmpl: any) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleStartDrafting(tmpl.name, tmpl.id)}
                  className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-sm transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {tmpl.document_type || 'Agreement'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {tmpl.jurisdiction || 'Tamil Nadu'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition leading-snug">
                      {tmpl.name}
                    </h4>

                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {tmpl.category || 'General Commercial Agreement'}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700 group-hover:text-blue-600">
                    <span>Draft Template</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length > 15 && (
              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  Showing 15 of {filteredTemplates.length} matching templates. Use the search bar above to narrow down results.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
           STAGE 2: SPLIT DRAFTING WORKSPACE
           ========================================================================= */
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-white">
          {/* LEFT COLUMN: AI Clarifying Questions & Controls */}
          <div className="w-full lg:w-[48%] border-r border-gray-200 flex flex-col justify-between h-full bg-[#FAFAFA] overflow-y-auto">
            {/* Left Header Bar */}
            <div className="p-4 px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ClauseCiteLogo size="sm" showText={false} />
                <div className="truncate">
                  <span className="text-xs font-extrabold text-gray-900 block truncate">
                    {agreementTypeInput}
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold block">
                    Tamil Nadu Statutory Drafting
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <button
                  onClick={() => setStage('prompt')}
                  className="text-xs font-semibold text-gray-600 hover:text-black px-2.5 py-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  Change Template
                </button>
              </div>
            </div>

            {/* Conversation Flow Area */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* User Prompt Bubble on Right */}
              <div className="flex justify-end">
                <div className="bg-gray-200 text-gray-900 text-xs font-bold px-4 py-2 rounded-2xl rounded-tr-xs">
                  {agreementTypeInput}
                </div>
              </div>

              {/* Clarifying Question Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600" />
                  <span>
                    ClauseCite Clarification ({currentQuestionIndex + 1}/{activeQuestionsList.length})
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {activeQuestion.topic}
                </h3>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                  {activeQuestion.question}
                </p>

                <div className="border-l-2 border-blue-500 pl-3 py-1 text-xs text-gray-500 font-mono">
                  {activeQuestion.example}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {activeQuestion.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDetailInput(opt);
                        handleNextQuestion(opt);
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border border-gray-200 text-gray-700 transition cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Status Card & Input Pill */}
            <div className="p-4 sm:p-6 bg-white border-t border-gray-200 space-y-3 shrink-0">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-2xs shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                      <span>⏸</span>
                      <span>Paused: Waiting for details</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Add details below to refine the clauses, or click Auto-fill.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < activeQuestionsList.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }
                    }}
                    className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-200 transition cursor-pointer"
                    title="Skip question"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleAutoFill}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800 transition cursor-pointer shadow-2xs"
                  >
                    <span>Auto-fill</span>
                    <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Input Capsule */}
              <div className="bg-white rounded-full border border-gray-200 shadow-xs px-3.5 py-2 flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  <Brain className="w-3.5 h-3.5 text-blue-600" />
                  <span>Explain</span>
                </button>

                <input
                  type="text"
                  value={detailInput}
                  onChange={(e) => setDetailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNextQuestion(detailInput);
                  }}
                  placeholder="Provide specific details here..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 p-0"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-gray-400">Ctrl+Y</span>
                  <button
                    onClick={() => handleNextQuestion(detailInput)}
                    className="w-7 h-7 rounded-full bg-black text-white hover:bg-gray-800 flex items-center justify-center transition cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 text-center">
                Powered by ClauseCite AI Engine • Grounded in Indian and Tamil Nadu statutory law.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Document Canvas & Rich Text Editor */}
          <div className="w-full lg:w-[52%] flex flex-col h-full bg-gray-50 overflow-hidden">
            {/* Document Header Bar */}
            <div className="p-3.5 px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-none truncate max-w-[280px]">
                    ClauseCite_{agreementTypeInput.replace(/\s+/g, '_')}_Draft
                  </h4>
                  <span className="text-[10px] font-mono text-gray-400">
                    v1.0 • Tamil Nadu Statutory Grounded
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-100 text-xs font-semibold transition cursor-pointer"
                  title="Copy full text"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  <span>{copiedSuccess ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => {
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2000);
                  }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
                  title="Save draft"
                >
                  {saveSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleExportDoc}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-gray-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Rich Text Toolbar */}
            <div className="px-6 py-2 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs text-gray-700 shrink-0 select-none">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Formatted View vs Source Edit Toggle */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 mr-1.5">
                  <button
                    onClick={() => setCanvasViewMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      canvasViewMode === 'preview'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Formatted legal typography with bolding, headers, and signature tables"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Formatted View</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!editableDraft) {
                        setEditableDraft(effectiveText);
                      }
                      setCanvasViewMode('edit');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      canvasViewMode === 'edit'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    title="Edit raw text or markdown"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Source</span>
                  </button>
                </div>

                <div className="w-px h-4 bg-gray-200 mx-1 hidden sm:block" />

                <button className="p-1.5 hover:bg-gray-100 rounded cursor-pointer" title="Undo">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded cursor-pointer" title="Redo">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer pr-4"
                >
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                </select>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer"
                >
                  <option value="11">11 pt</option>
                  <option value="12">12 pt</option>
                  <option value="13">13 pt</option>
                  <option value="14">14 pt</option>
                  <option value="16">16 pt</option>
                </select>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <button
                  onClick={() => setIsBold(!isBold)}
                  className={`p-1.5 rounded cursor-pointer ${isBold ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-1.5 rounded cursor-pointer ${isItalic ? 'bg-gray-200 italic' : 'hover:bg-gray-100'}`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`p-1.5 rounded cursor-pointer ${isUnderline ? 'bg-gray-200 underline' : 'hover:bg-gray-100'}`}
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <button
                  onClick={() => setTextAlign('left')}
                  className={`p-1.5 rounded cursor-pointer ${textAlign === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`p-1.5 rounded cursor-pointer ${textAlign === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('justify')}
                  className={`p-1.5 rounded cursor-pointer ${textAlign === 'justify' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="Justify"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] text-gray-400 font-mono hidden md:inline">
                {canvasViewMode === 'preview' ? 'Formatted Legal View' : 'Editable Source'}
              </span>
            </div>

            {/* Live Paper Canvas Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 relative flex justify-center bg-gray-100/60">
              <div
                style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  textAlign: textAlign,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textDecoration: isUnderline ? 'underline' : 'none',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }}
                className="bg-white rounded-xl shadow-lg border border-gray-200/90 p-8 sm:p-14 w-full max-w-3xl min-h-[850px] text-gray-900 leading-relaxed transition-transform relative select-text"
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
                    <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-gray-800">ClauseCite AI is generating agreement...</p>
                    <p className="text-xs text-gray-500 text-center max-w-md">
                      Grounding statutory clauses in the Tamil Nadu Money Lenders Act, NI Act, Indian Contract Act, and TN Stamp Schedule.
                    </p>
                  </div>
                ) : canvasViewMode === 'preview' ? (
                  <div className="prose-legal text-gray-900">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-xl sm:text-2xl font-black text-center text-gray-950 uppercase tracking-wide mt-2 mb-6 pb-3 border-b-2 border-gray-900 leading-tight"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-base sm:text-lg font-extrabold text-gray-950 tracking-wide mt-6 mb-3 uppercase pb-1 border-b border-gray-200"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-sm sm:text-base font-extrabold text-gray-950 mt-5 mb-2 uppercase tracking-wide"
                            {...props}
                          />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4
                            className="text-xs sm:text-sm font-bold text-gray-900 mt-3.5 mb-1.5"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-extrabold text-black" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic text-gray-800" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="leading-relaxed mb-4 text-gray-900 last:mb-0" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-900 font-medium" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-6 mb-4 space-y-1.5 text-gray-900" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-relaxed pl-1 marker:text-gray-900 marker:font-bold" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-900 bg-gray-50 pl-4 pr-3 py-2.5 my-4 rounded-r-lg text-gray-800 italic"
                            {...props}
                          />
                        ),
                        table: ({ node, ...props }) => (
                          <div className="w-full overflow-x-auto my-4 rounded-lg border border-gray-300 shadow-2xs">
                            <table className="w-full border-collapse text-xs text-left" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-gray-100 border-b border-gray-300 text-gray-950 font-bold" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th className="border border-gray-300 p-2.5 font-bold" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="border border-gray-300 p-2.5 text-gray-800 align-top" {...props} />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr className="my-6 border-t-2 border-gray-200" {...props} />
                        ),
                      }}
                    >
                      {effectiveText}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    value={editableDraft || effectiveText}
                    onChange={(e) => setEditableDraft(e.target.value)}
                    className="w-full h-full min-h-[750px] bg-transparent border-none p-0 focus:outline-none focus:ring-0 font-mono text-xs sm:text-sm leading-relaxed resize-none text-gray-900"
                    placeholder="Edit agreement text..."
                  />
                )}
              </div>

              {/* Floating Zoom Widget */}
              <div className="fixed bottom-6 left-[51%] z-30 bg-black/90 text-white rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-bold shadow-xl border border-white/10">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                  className="hover:text-gray-300 px-1 cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-[11px]">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                  className="hover:text-gray-300 px-1 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
