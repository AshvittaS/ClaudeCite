export interface LegalChatSession {
  id: string;
  title: string;
  date: string;
  jurisdiction: string;
  preview: string;
  messages: {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    citations?: string[];
    riskRating?: 'Low' | 'Medium' | 'High';
    timestamp: string;
  }[];
}

export interface LegalVaultDoc {
  id: string;
  name: string;
  category: string;
  size: string;
  date: string;
  riskScore: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Audited' | 'Needs Review' | 'Signed';
  summary: string;
  keyRisks: string[];
}

export interface CaseFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export interface CaseChat {
  id: string;
  title: string;
  updatedAt: string;
  messagesCount: number;
  preview: string;
}

export interface CaseItem {
  id: string;
  name: string;
  instructionType: 'default' | 'custom';
  customInstructions?: string;
  createdAt: string;
  updatedAt: string;
  files: CaseFile[];
  chats: CaseChat[];
}

export interface CaseLawItem {
  citation: string;
  caseName: string;
  court: string;
  year: string;
  holding: string;
  treatment: 'Positive' | 'Caution' | 'Distinguished';
}

export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'case-rental',
    name: 'Rental Agreement',
    instructionType: 'default',
    createdAt: 'Oct 19, 2026',
    updatedAt: 'Recently',
    files: [],
    chats: [],
  },
  {
    id: 'case-nda',
    name: 'NDA Templates',
    instructionType: 'custom',
    customInstructions: 'Strict adherence to statutory non-disclosure standards, mutual definitions of Confidential Information, and survival clauses.',
    createdAt: 'Oct 15, 2026',
    updatedAt: 'Recently',
    files: [],
    chats: [],
  },
  {
    id: 'case-divorce',
    name: 'Family Law Settlement',
    instructionType: 'default',
    createdAt: 'Oct 12, 2026',
    updatedAt: 'Recently',
    files: [],
    chats: [],
  },
];

export const TEST_USER = {
  name: 'Alex Morgan, Esq.',
  email: 'testuser@clausecite.com',
  role: 'Senior Legal Counsel',
  organization: 'Horizon Tech Global Corp',
  plan: 'ClauseCite Legal Workspace',
  avatar: 'AM',
  memberSince: 'March 2025',
  jurisdictionDefault: 'India',
  creditsRemaining: 'Unlimited',
};

export const INITIAL_VAULT_DOCS: LegalVaultDoc[] = [];

export const INITIAL_CHAT_SESSIONS: LegalChatSession[] = [];

export const SAMPLE_CASE_LAW: CaseLawItem[] = [];
