"""
ClauseCite Template Loader
==========================
Scans the backend/templates/ directory and loads all structured JSON templates
from every library into a unified list compatible with DEFAULT_TEMPLATES in
agreement_service.py.

Libraries loaded:
  1. clausecite_structured_json_templates   — 12 Financial Agreement templates
  2. clausecite_tamil_nadu_b2b_library_v2   — 60 Tamil Nadu B2B templates (12 categories)
  3. ClauseCite_Tamil_Nadu_NDA_Template_Library — 10 NDA templates
  4. ClauseCite_POA_Template_Library         — 10 Power of Attorney templates
  5. ClauseCite_India_Lease_Agreements_*     — (DOCX only; metadata registered)
"""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Root of the templates folder (two levels up from this file: app/services → app → backend)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = _BACKEND_DIR / "templates"


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _safe_load_json(path: Path) -> Optional[dict]:
    """Load a JSON file, returning None on any error."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"[TemplateLoader] Could not load {path}: {e}")
        return None


def _extract_fields(raw: dict) -> list[dict]:
    """
    Extract a normalised field list from any template JSON format.
    Returns a list of dicts with at minimum: name, label, required.
    """
    fields = []

    # NDA-style templates have a top-level "fields" list with {key, label, type, required}
    if isinstance(raw.get("fields"), list):
        for f in raw["fields"]:
            if not isinstance(f, dict):
                continue
            key = f.get("key") or f.get("name", "")
            if not key:
                continue
            fields.append({
                "name": key,
                "label": f.get("label", key.replace("_", " ").title()),
                "type": f.get("type", "string"),
                "required": bool(f.get("required", False)),
                "default": f.get("default"),
                "options": f.get("options"),
            })
        return fields

    # Financial / structured templates have an "inputs" list with {key, source_placeholder, type, required}
    if isinstance(raw.get("inputs"), list):
        for inp in raw["inputs"]:
            if not isinstance(inp, dict):
                continue
            key = inp.get("key") or inp.get("name", "")
            if not key or key in ("name", "type", "description", "required"):
                continue  # skip schema-header rows
            fields.append({
                "name": key,
                "label": inp.get("label", key.replace("_", " ").title()),
                "type": inp.get("type", "string"),
                "required": bool(inp.get("required", False)),
                "default": inp.get("value"),
            })
        return fields

    return fields


def _build_template_entry(
    template_id: str,
    name: str,
    document_type: str,
    category: str,
    jurisdiction: str,
    raw: Optional[dict] = None,
) -> dict:
    """Build a DEFAULT_TEMPLATES-compatible dict."""
    fields = _extract_fields(raw) if raw else []
    return {
        "id": template_id,
        "name": name,
        "document_type": document_type,
        "category": category,
        "jurisdiction": jurisdiction,
        "version": raw.get("version", "1.0") if raw else "1.0",
        "schema_": {"fields": fields},
        "_source_json": str(raw.get("_source_path", "")) if raw else "",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Library 1 — Financial Templates (clausecite_structured_json_templates)
# ─────────────────────────────────────────────────────────────────────────────

_FINANCIAL_DIR = (
    TEMPLATES_DIR
    / "clausecite_structured_json_templates"
    / "clausecite_structured_json_templates"
)

# Friendly metadata for each financial template file
_FINANCIAL_META: dict[str, tuple[str, str]] = {
    "fin_loan_001.json":    ("Loan & Lending Agreement",                    "Loan & Lending"),
    "fin_pn_001.json":      ("Promissory Note",                             "Promissory Notes & IOUs"),
    "fin_iou_001.json":     ("Acknowledgement of Debt (IOU)",               "Promissory Notes & IOUs"),
    "fin_pay_001.json":     ("Payment Plan & Instalment Agreement",         "Payment Plans & Instalment Agreements"),
    "fin_share_001.json":   ("Revenue, Grant & Profit-Sharing Agreement",   "Revenue, Grant & Profit Sharing Agreements"),
    "fin_settle_001.json":  ("Debt Settlement Agreement",                   "Debt Settlement & Credit Agreements"),
    "fin_credit_001.json":  ("Credit Facility Agreement",                   "Debt Settlement & Credit Agreements"),
    "fin_guar_001.json":    ("Guarantee & Guarantor Agreement",             "Guarantees & Guarantor Agreements"),
    "fin_ach_001.json":     ("Bank Debit / ACH Payment Authorisation",      "ACH & Payment Authorization Forms"),
    "fin_esc_001.json":     ("Escrow Agreement",                            "Escrow, Security & Collateral Documents"),
    "fin_sec_001.json":     ("Security & Collateral Agreement",             "Escrow, Security & Collateral Documents"),
    "fin_eq_001.json":      ("Investment & Equity Subscription Agreement",  "Investment & Equity Documents"),
}


def load_financial_templates() -> list[dict]:
    """Load 12 structured financial templates."""
    results = []
    if not _FINANCIAL_DIR.exists():
        logger.warning(f"[TemplateLoader] Financial templates dir not found: {_FINANCIAL_DIR}")
        return results

    for filename, (name, sub_category) in _FINANCIAL_META.items():
        path = _FINANCIAL_DIR / filename
        raw = _safe_load_json(path)
        template_id = filename.replace(".json", "").replace("_", "-")
        entry = _build_template_entry(
            template_id=template_id,
            name=name,
            document_type="Financial",
            category=f"Financial Agreements - {sub_category}",
            jurisdiction="India - Tamil Nadu",
            raw=raw,
        )
        results.append(entry)
        logger.info(f"[TemplateLoader] Loaded financial template: {template_id}")

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Library 2 — Tamil Nadu B2B Library v2 (60 templates across 12 categories)
# ─────────────────────────────────────────────────────────────────────────────

_B2B_DIR = TEMPLATES_DIR / "clausecite_tamil_nadu_b2b_library_v2"
_B2B_JSON_DIR = _B2B_DIR / "json"
_B2B_MANIFEST = _B2B_DIR / "manifest.json"

# Map prefix → (document_type, category_name)
_B2B_PREFIX_MAP: dict[str, tuple[str, str]] = {
    "svc": ("B2B Service",       "Service & Consulting Agreements"),
    "sup": ("B2B Supply",        "Supply, Logistics & Manufacturing Agreements"),
    "mkt": ("B2B Marketing",     "Marketing, Sponsorship & Influencer Agreements"),
    "sow": ("B2B SOW",           "Statements of Work & Project Agreements"),
    "ip":  ("B2B IP",            "IP, Technology & Licensing Agreements"),
    "dst": ("B2B Distribution",  "Distribution, Agency & Channel Agreements"),
    "gov": ("B2B Governance",    "Joint Venture, Partnership & Governance Agreements"),
    "ma":  ("B2B M&A",           "M&A, Investment & Fundraising Agreements"),
    "evt": ("B2B Event",         "Events, Venue & Hospitality Agreements"),
    "ctr": ("B2B Contractor",    "Employment, Contractor & HR Agreements"),
    "tax": ("B2B Transaction",   "Transaction, Assignment & General Legal Documents"),
    "dsp": ("B2B Dispute",       "Dispute, Settlement & Legal Service Documents"),
}


def load_b2b_templates() -> list[dict]:
    """Load 60 Tamil Nadu B2B templates from manifest + JSON files."""
    results = []
    if not _B2B_MANIFEST.exists():
        logger.warning(f"[TemplateLoader] B2B manifest not found: {_B2B_MANIFEST}")
        return results

    manifest = _safe_load_json(_B2B_MANIFEST)
    if not manifest:
        return results

    for cat in manifest.get("categories", []):
        cat_name = cat.get("category_name", "B2B Agreements")
        for tmpl in cat.get("templates", []):
            template_id = tmpl.get("template_id", "").lower().replace("-", "_")
            name = tmpl.get("template_name", "Unknown")
            json_rel = tmpl.get("json", "")
            json_path = _B2B_DIR / json_rel if json_rel else None

            raw = _safe_load_json(json_path) if json_path and json_path.exists() else None

            # Determine document_type from prefix
            prefix = template_id.split("_")[0] if template_id else "b2b"
            doc_type, _ = _B2B_PREFIX_MAP.get(prefix, ("B2B", cat_name))

            entry = _build_template_entry(
                template_id=f"tn-b2b-{template_id}",
                name=name,
                document_type=doc_type,
                category=f"Tamil Nadu B2B - {cat_name}",
                jurisdiction="India - Tamil Nadu",
                raw=raw,
            )
            results.append(entry)
            logger.info(f"[TemplateLoader] Loaded B2B template: tn-b2b-{template_id}")

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Library 3 — Tamil Nadu NDA Library (10 templates)
# ─────────────────────────────────────────────────────────────────────────────

_NDA_DIR = (
    TEMPLATES_DIR
    / "ClauseCite_Tamil_Nadu_NDA_Template_Library"
    / "ClauseCite_Tamil_Nadu_NDA_Library"
)
_NDA_JSON_DIR = _NDA_DIR / "json"
_NDA_MANIFEST = _NDA_DIR / "manifest.json"


def load_nda_templates() -> list[dict]:
    """Load 10 Tamil Nadu NDA templates from manifest + JSON files."""
    results = []
    if not _NDA_MANIFEST.exists():
        logger.warning(f"[TemplateLoader] NDA manifest not found: {_NDA_MANIFEST}")
        return results

    manifest = _safe_load_json(_NDA_MANIFEST)
    if not manifest:
        return results

    for tmpl in manifest.get("templates", []):
        template_id = tmpl.get("template_id", "").lower()
        slug = tmpl.get("slug", template_id)
        name = tmpl.get("name", "NDA Template")
        json_rel = tmpl.get("json_path", f"json/{template_id}_{slug}.json")
        json_path = _NDA_DIR / json_rel if json_rel else None

        raw = _safe_load_json(json_path) if json_path and json_path.exists() else None

        entry = _build_template_entry(
            template_id=f"tn-nda-{slug}",
            name=name,
            document_type="NDA",
            category="Tamil Nadu NDA - Non-Disclosure Agreements",
            jurisdiction="India - Tamil Nadu",
            raw=raw,
        )
        results.append(entry)
        logger.info(f"[TemplateLoader] Loaded NDA template: tn-nda-{slug}")

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Library 4 — Power of Attorney Library (10 templates)
# ─────────────────────────────────────────────────────────────────────────────

_POA_DIR = TEMPLATES_DIR / "ClauseCite_POA_Template_Library"
_POA_JSON_DIR = _POA_DIR / "json"
_POA_MANIFEST = _POA_DIR / "manifest.json"


def load_poa_templates() -> list[dict]:
    """Load 10 Power of Attorney templates from manifest + JSON files."""
    results = []
    if not _POA_MANIFEST.exists():
        logger.warning(f"[TemplateLoader] POA manifest not found: {_POA_MANIFEST}")
        return results

    manifest = _safe_load_json(_POA_MANIFEST)
    if not manifest:
        return results

    for tmpl in manifest.get("templates", []):
        template_id = tmpl.get("id", "").lower().replace("_", "-")
        name = tmpl.get("title", "Power of Attorney")
        json_rel = tmpl.get("json", f"json/{tmpl.get('id', template_id)}.json")
        # Try to resolve relative path
        json_path = _POA_DIR / json_rel if json_rel else None

        raw = _safe_load_json(json_path) if json_path and json_path.exists() else None

        high_risk = tmpl.get("high_risk_review", False)
        category = (
            "Power of Attorney - High Risk (Advocate Review Required)"
            if high_risk
            else "Power of Attorney - Standard"
        )

        entry = _build_template_entry(
            template_id=f"tn-poa-{template_id}",
            name=name,
            document_type="Power of Attorney",
            category=f"Tamil Nadu POA - {category}",
            jurisdiction="India - Tamil Nadu",
            raw=raw,
        )
        results.append(entry)
        logger.info(f"[TemplateLoader] Loaded POA template: tn-poa-{template_id}")

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Library 5 — India Lease Agreements (DOCX only — metadata registration)
# ─────────────────────────────────────────────────────────────────────────────

_LEASE_DIR = (
    TEMPLATES_DIR
    / "ClauseCite_India_Lease_Agreements_187_Separate_DOCX"
    / "ClauseCite_Separate_India_Lease_Documents"
)

# Sub-folder → (document_type, category display name)
_LEASE_CATEGORIES: dict[str, tuple[str, str]] = {
    "Residential_leases_&_vacation_rentals":    ("Lease", "Residential Leases & Vacation Rentals"),
    "Commercial_&_business_space_leases":        ("Lease", "Commercial & Business Space Leases"),
    "Car,_truck_&_taxi_leases":                  ("Lease", "Car, Truck & Taxi Leases"),
    "Land,_farm_&_resource_leases":              ("Lease", "Land, Farm & Resource Leases"),
    "Motorcycle,_boat,_RV_&_trailer_rentals":    ("Lease", "Motorcycle, Boat, RV & Trailer Rentals"),
    "Roommate_&_shared_housing_agreements":      ("Lease", "Roommate & Shared Housing Agreements"),
    "RV_park_&_lot_rentals":                     ("Lease", "RV Park & Lot Rentals"),
    "Deposit_receipts_&_rental_records":         ("Lease", "Deposit Receipts & Rental Records"),
    "Eviction,_renewals_&_lease_changes":        ("Lease", "Eviction, Renewals & Lease Changes"),
    "Lease_addenda_&_landlord_documents":        ("Lease", "Lease Addenda & Landlord Documents"),
    "Indian_legal_&_tenancy_documents":          ("Lease", "Indian Legal & Tenancy Documents"),
    "Special-purpose_Indian_rental_agreements":  ("Lease", "Special-Purpose Indian Rental Agreements"),
}


def load_lease_templates() -> list[dict]:
    """
    Register lease template metadata from DOCX files.
    Since these are DOCX files with no JSON, we register them as metadata-only
    templates so the AI drafter knows they exist and can generate them on request.
    """
    results = []
    if not _LEASE_DIR.exists():
        logger.warning(f"[TemplateLoader] Lease dir not found: {_LEASE_DIR}")
        return results

    for folder_name, (doc_type, cat_display) in _LEASE_CATEGORIES.items():
        folder_path = _LEASE_DIR / folder_name
        if not folder_path.exists():
            continue

        docx_files = list(folder_path.glob("*.docx"))
        for docx_file in docx_files:
            # Derive a human name from the filename
            stem = docx_file.stem
            name = stem.replace("_", " ").replace("-", " ").title()
            template_id = f"tn-lease-{stem.lower().replace(' ', '-')}"

            entry = {
                "id": template_id,
                "name": name,
                "document_type": doc_type,
                "category": f"India Lease - {cat_display}",
                "jurisdiction": "India",
                "version": "1.0",
                "schema_": {
                    "fields": [
                        {"name": "landlord_name",    "label": "Landlord / Lessor Name",           "required": True},
                        {"name": "tenant_name",      "label": "Tenant / Lessee Name",              "required": True},
                        {"name": "property_address", "label": "Property / Premises Address",       "required": True},
                        {"name": "monthly_rent",     "label": "Monthly Rent / Hire Charge (INR)",  "type": "number", "required": True},
                        {"name": "lease_term",       "label": "Lease / Rental Term",               "required": True},
                        {"name": "jurisdiction",     "label": "State / Governing Jurisdiction",    "default": "Tamil Nadu, India"},
                    ]
                },
                "_docx_source": str(docx_file),
            }
            results.append(entry)

    logger.info(f"[TemplateLoader] Registered {len(results)} lease templates from DOCX library")
    return results


# ─────────────────────────────────────────────────────────────────────────────
# Master loader — call this to get all templates from all libraries
# ─────────────────────────────────────────────────────────────────────────────

_CACHED_TEMPLATES: list[dict] | None = None


def load_all_file_templates(force_reload: bool = False) -> list[dict]:
    """
    Load and cache all templates from every backend library.
    Returns a flat list compatible with DEFAULT_TEMPLATES.
    """
    global _CACHED_TEMPLATES
    if _CACHED_TEMPLATES is not None and not force_reload:
        return _CACHED_TEMPLATES

    all_templates: list[dict] = []
    all_templates.extend(load_financial_templates())   # 12 financial
    all_templates.extend(load_b2b_templates())         # 60 B2B
    all_templates.extend(load_nda_templates())         # 10 NDA
    all_templates.extend(load_poa_templates())         # 10 POA
    all_templates.extend(load_lease_templates())       # ~187 lease

    _CACHED_TEMPLATES = all_templates
    logger.info(f"[TemplateLoader] Total templates loaded from files: {len(all_templates)}")
    return all_templates


def get_template_by_id_from_files(template_id: str) -> dict | None:
    """Look up a single template by ID from the file-based library."""
    for t in load_all_file_templates():
        if t["id"] == template_id:
            return t
    return None


def get_templates_by_category(category: str) -> list[dict]:
    """Return all templates matching a category substring (case-insensitive)."""
    cat_lower = category.lower()
    return [t for t in load_all_file_templates() if cat_lower in t.get("category", "").lower()]


def get_templates_by_document_type(document_type: str) -> list[dict]:
    """Return all templates matching a document_type (case-insensitive)."""
    dt_lower = document_type.lower()
    return [t for t in load_all_file_templates() if dt_lower in t.get("document_type", "").lower()]


def get_all_categories() -> list[str]:
    """Return a sorted unique list of all category names."""
    return sorted({t.get("category", "") for t in load_all_file_templates() if t.get("category")})

