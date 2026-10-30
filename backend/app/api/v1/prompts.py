from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Prompt, User
from app.schemas.schemas import PromptOut
from app.api.dependencies import get_current_user

router = APIRouter()

DEFAULT_PROMPTS = [
    {
        "id": "prompt-clause-risk",
        "name": "Audit High-Risk Clauses",
        "category": "contract_review",
        "description": "Analyze indemnity, liability caps, and termination rights in an agreement.",
        "prompt_body": "Review the uploaded contract specifically focusing on: 1. Indemnification obligations and whether they are mutual. 2. Limitation of liability and exclusions from the cap. 3. Termination for convenience vs cause.",
        "jurisdiction": "India",
    },
    {
        "id": "prompt-bns-crossref",
        "name": "IPC to BNS Transition Cross-Check",
        "category": "statutory_research",
        "description": "Cross-reference Indian Penal Code 1860 sections against Bharatiya Nyaya Sanhita 2023.",
        "prompt_body": "Map the following IPC offenses to corresponding Bharatiya Nyaya Sanhita (BNS) 2023 provisions, identifying any substantive changes in definitions, penalties, or procedures.",
        "jurisdiction": "India",
    },
    {
        "id": "prompt-employment-notice",
        "name": "Employment Non-Compete Validity Check",
        "category": "employment",
        "description": "Verify enforceability of post-termination covenants under Section 27 of Indian Contract Act 1872.",
        "prompt_body": "Evaluate the enforceability of the post-employment non-compete clause in this agreement in light of Section 27 of the Indian Contract Act, 1872 and settled Supreme Court precedents.",
        "jurisdiction": "India",
    },
    {
        "id": "prompt-arbitration-clause",
        "name": "Arbitration Clause Review (2015/2019 Amendments)",
        "category": "dispute_resolution",
        "description": "Ensure arbitration clause complies with Arbitration and Conciliation Act 1996 as amended.",
        "prompt_body": "Review the dispute resolution clause to ensure seat vs venue distinction is unambiguous and conforms with the Arbitration and Conciliation Act, 1996 and relevant court rulings.",
        "jurisdiction": "India",
    },
]


@router.get("", response_model=list[PromptOut])
def list_prompts(
    category: Optional[str] = Query(None),
    jurisdiction: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    db_prompts = db.query(Prompt).all()
    if db_prompts:
        prompts = [
            PromptOut(
                id=p.id,
                name=p.name,
                category=p.category,
                description=p.description,
                prompt_body=p.prompt_body,
                jurisdiction=p.jurisdiction,
            )
            for p in db_prompts
        ]
    else:
        prompts = [PromptOut(**p) for p in DEFAULT_PROMPTS]

    if category:
        prompts = [p for p in prompts if p.category.lower() == category.lower()]
    if jurisdiction:
        prompts = [p for p in prompts if jurisdiction.lower() in (p.jurisdiction or "").lower()]

    return prompts
