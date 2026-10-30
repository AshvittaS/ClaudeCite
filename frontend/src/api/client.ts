/**
 * ClauseCite Frontend API Client
 * Seamlessly interfaces with the FastAPI backend at http://localhost:8000/api/v1
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  private token: string | null = null;
  private currentWorkspaceId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('clausecite_token');
    this.currentWorkspaceId = localStorage.getItem('clausecite_workspace_id');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('clausecite_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('clausecite_token');
  }

  setWorkspaceId(id: string) {
    this.currentWorkspaceId = id;
    localStorage.setItem('clausecite_workspace_id', id);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.currentWorkspaceId) {
      headers['X-Workspace-Id'] = this.currentWorkspaceId;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = `API error ${res.status}`;
      try {
        const errorJson = await res.json();
        errorMessage = errorJson.detail?.message || errorJson.detail || errorMessage;
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // --- Auth ---
  async login(email: string, password: string) {
    const res = await this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(email: string, password: string, displayName?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName || '' }),
    });
  }

  async getCurrentUser() {
    return this.request<{ id: string; email: string; display_name: string }>('/auth/me');
  }

  // --- Chats ---
  async askClauseCite(content: string, jurisdiction: string = 'India', documentIds: string[] = []) {
    return this.request<{
      answer: string;
      tag: string;
      citations: string[];
      raw_sources: any[];
      follow_ups: string[];
    }>('/chats/ask', {
      method: 'POST',
      body: JSON.stringify({
        content,
        jurisdiction,
        document_ids: documentIds,
      }),
    });
  }

  async listChats(caseId?: string) {
    const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
    return this.request<any[]>(`/chats${qs}`);
  }

  async createChat(title: string = 'New Chat', caseId?: string) {
    return this.request<any>('/chats', {
      method: 'POST',
      body: JSON.stringify({ title, case_id: caseId }),
    });
  }

  async getChatMessages(chatId: string) {
    return this.request<any[]>(`/chats/${chatId}/messages`);
  }

  async sendMessage(
    chatId: string,
    content: string,
    documentIds: string[] = [],
    jurisdiction?: string
  ) {
    return this.request<any>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        document_ids: documentIds,
        jurisdiction: jurisdiction || 'India',
      }),
    });
  }

  // --- Documents ---
  async listDocuments(caseId?: string) {
    const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
    return this.request<any[]>(`/documents${qs}`);
  }

  async uploadDocument(file: File, caseId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (caseId) {
      formData.append('case_id', caseId);
    }
    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(documentId: string) {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // --- Summaries & Risk Analysis ---
  async summarizeDocument(documentId: string, focus: string[] = [], jurisdiction = 'India') {
    return this.request<any>('/summaries', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        focus,
        jurisdiction,
      }),
    });
  }

  // --- Comparisons & Diff ---
  async compareDocuments(baselineId: string, revisedId: string, jurisdiction = 'India') {
    return this.request<any>('/comparisons', {
      method: 'POST',
      body: JSON.stringify({
        baseline_document_id: baselineId,
        revised_document_id: revisedId,
        jurisdiction,
      }),
    });
  }

  // --- Agreement Drafting ---
  async listTemplates(params?: { document_type?: string; jurisdiction?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.document_type) query.set('document_type', params.document_type);
    if (params?.jurisdiction) query.set('jurisdiction', params.jurisdiction);
    if (params?.category) query.set('category', params.category);
    const qs = query.toString();
    return this.request<any[]>(`/agreements/templates${qs ? `?${qs}` : ''}`);
  }

  async listTemplateCategories() {
    return this.request<{ category: string; count: number; templates: any[] }[]>('/agreements/templates/categories');
  }

  async getTemplate(templateId: string) {
    return this.request<any>(`/agreements/templates/${templateId}`);
  }

  async generateDraft(data: {
    template_id?: string;
    document_type: string;
    requirements: string;
    answers?: Record<string, any>;
    jurisdiction?: string;
  }) {
    return this.request<any>('/agreements/draft', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        jurisdiction: data.jurisdiction || 'India',
      }),
    });
  }

  // --- Search & Legal Corpus ---
  async searchWorkspace(q: string) {
    return this.request<any[]>(`/search?q=${encodeURIComponent(q)}`);
  }

  async searchLegalCorpus(q: string, topK: number = 6) {
    return this.request<any[]>(`/search/legal?q=${encodeURIComponent(q)}&top_k=${topK}`);
  }

  // --- Cases ---
  async listCases(statusFilter?: string) {
    const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
    return this.request<any[]>(`/cases${qs}`);
  }

  async createCase(title: string, practiceArea: string = 'General Commercial', customInstructions?: string) {
    return this.request<any>('/cases', {
      method: 'POST',
      body: JSON.stringify({
        title,
        practice_area: practiceArea,
        custom_instructions: customInstructions,
      }),
    });
  }

  async getCase(caseId: string) {
    return this.request<any>(`/cases/${caseId}`);
  }

  async updateCase(
    caseId: string,
    data: { title?: string; status?: string; practice_area?: string; custom_instructions?: string }
  ) {
    return this.request<any>(`/cases/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCase(caseId: string) {
    return this.request(`/cases/${caseId}`, {
      method: 'DELETE',
    });
  }

  // --- Settings ---
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(data: {
    default_jurisdiction?: string;
    citation_style?: string;
    citation_strictness?: string;
    export_defaults?: Record<string, any>;
    model_preferences?: Record<string, any>;
  }) {
    return this.request<any>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- Prompts ---
  async listPrompts(category?: string, jurisdiction?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (jurisdiction) params.append('jurisdiction', jurisdiction);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/prompts${qs}`);
  }

  // --- Feedback ---
  async submitFeedback(category: string, message: string) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ category, message }),
    });
  }
}

export const api = new ApiClient();
