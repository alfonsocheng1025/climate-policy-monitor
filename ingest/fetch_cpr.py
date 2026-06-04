"""Tier A — Climate Policy Radar / CCLW from the open Hugging Face dataset.

CPR has NO public API (2026); the open corpus is passage-level Parquet on Hugging Face:
  ClimatePolicyRadar/all-document-text-data  (CC-BY-4.0, ~3.59 GB)
Each ROW is a text block (passage), NOT a document — one document = many passages.
We stream and aggregate passages to document level. Real fields are nested under
`document_metadata.*` (verified 2026-06), incl. the `document_metadata.metadata`
concept tags (framework/response/hazard/sector/keyword/instrument).

CPR_MAX_DOCS caps how many *documents* we ingest (default 200 = a sample; the full
corpus is ~tens of thousands of docs). Full-corpus ingest = download the parquet
shards and group by document_id (a later optimization). Requires: pip install datasets.
"""
import os
import json
import pandas as pd
import common

MAX_DOCS = int(os.environ.get("CPR_MAX_DOCS", "200"))
HARD_PASSAGES = int(os.environ.get("CPR_MAX_PASSAGES", "150000"))
OUT = "cpr_raw.csv"
CAT_MAP = {"Legislative": "law", "Executive": "policy", "Litigation": "litigation"}
CONCEPT_KEYS = ("framework", "response", "hazard", "sector", "keyword", "instrument")


def _first(v):
    if isinstance(v, (list, tuple)) and v:
        return v[0]
    return v


def fetch():
    common.ensure_data_dir()
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
    try:
        from datasets import load_dataset
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPR/CCLW", 0, "error", f"datasets not installed: {e}")
        print("[CPR] `datasets` not installed; skipping (pip install datasets)")
        return None
    try:
        ds = load_dataset("ClimatePolicyRadar/all-document-text-data",
                          split="train", streaming=True)
        docs = {}
        for i, row in enumerate(ds):
            if i >= HARD_PASSAGES:
                break
            did = row.get("document_id")
            if not did:
                continue
            if did not in docs:
                if len(docs) >= MAX_DOCS:
                    break
                md = row.get("document_metadata.metadata") or {}
                concepts = {k: md.get(k) for k in CONCEPT_KEYS if md.get(k)}
                docs[did] = {
                    "document_id": did,
                    "document_title": (row.get("document_metadata.family_title")
                                       or row.get("document_metadata.document_title")),
                    "geographies": _first(row.get("document_metadata.geographies")),
                    "publication_ts": row.get("document_metadata.publication_ts"),
                    "source_url": row.get("document_metadata.source_url"),
                    "description": (row.get("document_metadata.description")
                                    or row.get("document_metadata.family_summary")),
                    "doc_form": row.get("document_metadata.type"),
                    "sector": _first(md.get("sector")),
                    "instrument": _first(md.get("instrument")),
                    "concepts": json.dumps(concepts, ensure_ascii=False) if concepts else None,
                    "category": row.get("document_metadata.category"),
                    "_text": [],
                }
            t = row.get("text_block.text")
            if t:
                docs[did]["_text"].append(str(t))
        for d in docs.values():
            ft = "\n".join(d.pop("_text"))[:200000]
            d["full_text"] = ft or (d.get("description") or None)
            d["record_type"] = CAT_MAP.get(d.pop("category", None), "policy")
        df = pd.DataFrame(list(docs.values()))
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("CPR/CCLW", len(df), "partial", f"capped at {MAX_DOCS} docs")
        print(f"[CPR] saved {len(df)} documents")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPR/CCLW", 0, "error", str(e))
        print(f"[CPR] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
