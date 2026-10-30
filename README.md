# ClauseCite — Legal AI Intelligence & Agreement Creator

**ClauseCite** is an enterprise-grade Legal AI platform designed for contract analysis, automated legal document drafting, and statutory research with verified case citations. Built specifically for Indian jurisprudence (Central Acts & Tamil Nadu State enactments) and international commercial standards.

---

## 🌟 Key Features

- **Ask ClauseCite (Live RAG Engine):** Jurisdiction-aware legal research assistant powered by Google Gemini and a hybrid BM25 + dense vector retrieval pipeline across statutory acts (*Indian Contract Act 1872*, *BNSS 2023*, *TNRRRLT Act 2017*, *DPDP Act 2023*, etc.). Provides real case citations, risk ratings, and follow-up inquiries.
- **Agreement Creator (295+ Templates):** Multi-category automated legal document generator with dynamic variable fill-in and dual-mode markdown paper rendering (Formatted Legal View vs Source Editor):
  - **Financial Agreements (9 Templates):** Loan & Lending, Promissory Notes & IOUs, Payment Plans & Installments, Revenue Sharing, Debt Settlement, Guarantees, ACH Authorization, Escrow & Collateral, Investment & Equity.
  - **Commercial & B2B Agreements (60 Templates):** Master Services Agreements, Procurement, Logistics, Vendor, SOWs.
  - **Non-Disclosure Agreements (10 Templates):** Mutual, Unilateral, Employee, Consultant, M&A Due Diligence.
  - **Power of Attorney (10 Templates):** General, Special, Banking, Property, Healthcare.
  - **Lease & Tenancy Agreements (187 Templates):** Commercial, Residential, Vehicle, Industrial space leases.
- **AI Redline & Document Comparison:** Side-by-side contract difference analysis highlighting uncapped liabilities, unilateral termination rights, and foreign dispute venue shifts with risk scoring and counsel action plans.
- **Legal Vault & Workspace Management:** Full multi-tenant workspace with case management, document review, and export capabilities.

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed on your system:

| Dependency | Minimum Version | Notes |
| :--- | :--- | :--- |
| **Python** | 3.10+ (tested on 3.12 / 3.13) | Backend FastAPI service |
| **Node.js** | 18+ (tested on 20+) | Frontend Vite + React environment |
| **npm** or **pnpm** | 9+ | Package manager |
| **Google Gemini API Key** | — | Free key available from [Google AI Studio](https://aistudio.google.com/) |

---

## 🚀 How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/AshvittaS/ClaudeCite.git
cd ClaudeCite
```

---

### 2. Backend Setup & Run

Open a terminal in the root directory:

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
.venv\Scripts\activate.bat
# On macOS / Linux:
source .venv/bin/activate

# Install required backend dependencies
pip install -r requirements.txt

# Create your local environment configuration
cp .env.example .env
```

#### Configure `.env` in `backend/`:
Open `backend/.env` in your text editor and add your **Gemini API Key**:

```env
APP_ENV=development
APP_SECRET_KEY=generate-a-random-secret-key-here
GEMINI_API_KEY=your_actual_gemini_api_key_here
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.0-flash
DATABASE_URL=sqlite:///./clausecite.db
```

*(Note: SQLite is used by default for rapid local development. PostgreSQL is also supported by changing `DATABASE_URL`)*.

#### Start the Backend Server:

```bash
python run_server.py
```

The FastAPI backend will start at:
- **API Server:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

### 3. Frontend Setup & Run

Open a **new terminal window** in the root directory:

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Create frontend environment configuration
cp .env.example .env
```

Ensure `frontend/.env` points to the backend API:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### Start the Frontend Development Server:

```bash
npm run dev
```

The application will be running at:
- **Web App:** `http://localhost:5173` (or `http://localhost:3000`)

---

## 🛠️ Environment Configuration Details

### Backend (`backend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `APP_ENV` | Environment mode (`development` or `production`) | `development` |
| `APP_SECRET_KEY` | Secret key for JWT session tokens | `change-me-in-production` |
| `GEMINI_API_KEY` | Google AI Studio API Key for live legal reasoning | `YOUR_GEMINI_API_KEY` |
| `LLM_MODEL` | Gemini model variant | `gemini-2.0-flash` |
| `DATABASE_URL` | Database connection string | `sqlite:///./clausecite.db` |
| `CHROMA_PERSIST_PATH` | Vector store directory | `./chroma_db` |
| `UPLOAD_DIR` | Directory for uploaded client documents | `./private_uploads` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend REST API endpoint prefix | `http://localhost:8000/api/v1` |

---

## 📁 Project Directory Structure

```text
ClaudeCite/
├── backend/                              # FastAPI Python Service
│   ├── app/
│   │   ├── ai/                           # LLM clients, RAG adapter, citation verifier
│   │   ├── api/v1/                       # Endpoints (chats, agreements, compare, auth, etc.)
│   │   ├── core/                         # Config, security, error handlers
│   │   ├── db/                           # SQLAlchemy models and session engine
│   │   ├── document_processing/          # Redline text diffing & parsing
│   │   ├── schemas/                      # Pydantic validation schemas
│   │   └── services/                     # Business logic & template loaders
│   ├── templates/                        # 295+ File-based Indian legal templates (.docx/.md)
│   ├── requirements.txt                  # Python dependencies
│   ├── run_server.py                     # Entry point for backend
│   └── .env.example
├── frontend/                             # React 19 + TypeScript + Vite UI
│   ├── public/assets/aistudio/           # Local UI image mockups and branding assets
│   ├── src/
│   │   ├── api/                          # Strongly typed API client
│   │   ├── components/                   # Landing page components & interactive modals
│   │   │   ├── common/                   # Legal markdown renderer, logos
│   │   │   ├── dashboard/                # DocGeneratorWorkspace, DocCompare, ChatWorkspace
│   │   │   └── modals/                   # ChatStudioModal, CompareDocsModal, TemplateModal
│   │   ├── App.tsx                       # Root view router (Landing <-> SaaS Dashboard)
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── datasets/                             # Legal corpus (Indian Acts & CUAD dataset)
├── docs/                                 # Technical architecture & API specifications
├── .gitignore                            # Strictly excludes secrets, databases & keys
└── README.md
```

---

## 🧪 Building for Production

To produce an optimized production build of the frontend:

```bash
cd frontend
npm run build
```

The output bundle will be generated in `frontend/dist/` ready to be served by any static host or reverse-proxied via NGINX/Caddy.

---

## 🔒 Security & Privacy Notice

- All confidential user files, `.env` API keys, database credentials, and local SQLite/Chroma databases are strictly configured in `.gitignore` and are **never** committed or pushed to public repositories.
- ClauseCite AI provides automated research and contract drafting assistance; always review legal documentation with a licensed attorney in your jurisdiction prior to execution.
