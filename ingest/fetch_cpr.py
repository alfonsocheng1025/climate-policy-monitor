"""Tier A — Climate Policy Radar / CCLW: full document CATALOG.

CPR has NO public API (2026); the open corpus is passage-level Parquet on Hugging Face
(ClimatePolicyRadar/all-document-text-data, CC-BY-4.0, ~3.59 GB, 48 shards x 1.5M rows).
Each ROW is a text passage, but document metadata repeats on every row — so we read
ONLY the metadata columns (column projection) and dedup by document_id. This yields the
whole corpus's catalog (title/country/date/sector/instrument/concepts/summary) cheaply,
WITHOUT the bulk passage text (Option A: fits a 500 MB DB). `description`/summary becomes
the searchable text. Requires: huggingface_hub, pyarrow.

Env: CPR_MAX_DOCS (0=all), CPR_MAX_SHARDS (0=all), CPR_SHARD_START (0).
"""
import os
import json
import pandas as pd
import common

OUT = "cpr_raw.csv"
REPO = "datasets/ClimatePolicyRadar/all-document-text-data"
MAX_DOCS = int(os.environ.get("CPR_MAX_DOCS", "0"))
MAX_SHARDS = int(os.environ.get("CPR_MAX_SHARDS", "0"))
SHARD_START = int(os.environ.get("CPR_SHARD_START", "0"))
CAT_MAP = {"Legislative": "law", "Executive": "policy", "Litigation": "litigation"}
CONCEPT_KEYS = ("framework", "response", "hazard", "sector", "keyword", "instrument", "topic")
COLS = [
    "document_id",
    "document_metadata.import_id", "document_metadata.slug",
    "document_metadata.family_import_id", "document_metadata.family_slug",
    "document_metadata.family_title", "document_metadata.document_title",
    "document_metadata.collection_title", "document_metadata.collection_summary",
    "document_metadata.description",
    "document_metadata.geographies", "document_metadata.languages",
    "document_metadata.publication_ts", "document_metadata.source_url",
    "document_metadata.source", "document_metadata.category",
    "document_metadata.corpus_type_name", "document_metadata.corpus_import_id",
    "document_metadata.type", "document_metadata.translated",
    "document_metadata.metadata",
    "document_cdn_object", "document_content_type", "document_md5_sum",
    "_html_data.detected_title",
]


def _first(v):
    if v is None:
        return None
    if isinstance(v, (str, bytes, dict)):
        return v if isinstance(v, str) else None
    try:
        return v[0] if len(v) else None
    except Exception:  # noqa: BLE001
        return None


def _tolist(v):
    """Concept tags may be None, a string, or a multi-value array. Normalize to
    a clean list (or None) without ever calling bool() on an array."""
    if v is None:
        return None
    if isinstance(v, (str, bytes)):
        return [str(v)]
    try:
        out = [str(x) for x in v if x is not None]
        return out or None
    except TypeError:
        return [str(v)]


def _clean(v):
    """Make any parquet value JSON-serializable: ndarray/list -> list, struct -> dict,
    NaN -> None. Never calls bool() on an array."""
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return None if (isinstance(v, float) and v != v) else v
    if isinstance(v, (str, bytes)):
        return v if isinstance(v, str) else v.decode("utf-8", "ignore")
    if isinstance(v, dict):
        return {str(k): _clean(x) for k, x in v.items()}
    try:
        return [_clean(x) for x in v]
    except TypeError:
        return str(v)


def _g(row, key):
    v = row.get(key)
    return None if v is None or (isinstance(v, float) and pd.isna(v)) else v


def fetch():
    common.ensure_data_dir()
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
    try:
        from huggingface_hub import HfFileSystem
        import pyarrow.parquet as pq
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPR/CCLW", 0, "error", f"deps missing: {e}")
        print("[CPR] need huggingface_hub + pyarrow (pip install)")
        return None
    try:
        fs = HfFileSystem()
        files = sorted(fs.glob(REPO + "/**/*.parquet"))
        if SHARD_START:
            files = files[SHARD_START:]
        if MAX_SHARDS:
            files = files[:MAX_SHARDS]
        docs = {}
        for fi, f in enumerate(files):
            try:
                pf = pq.ParquetFile(fs.open(f))
                for rg in range(pf.num_row_groups):
                    tbl = pf.read_row_group(rg, columns=COLS)
                    ids = tbl.column("document_id").to_pylist()
                    new_idx, seen = [], set()
                    for i, did in enumerate(ids):
                        if did and did not in docs and did not in seen:
                            seen.add(did)
                            new_idx.append(i)
                    if not new_idx:
                        continue
                    sub = tbl.take(new_idx).to_pandas()
                    for _, row in sub.iterrows():
                        did = row["document_id"]
                        try:
                            # full = every metadata field, cleaned to JSON-safe values
                            full = {c: _clean(row.get(c)) for c in COLS}
                            md = full.get("document_metadata.metadata")
                            md = md if isinstance(md, dict) else {}
                            concepts = {}
                            for ck in CONCEPT_KEYS:
                                cv = _tolist(md.get(ck))
                                if cv:
                                    concepts[ck] = cv
                            sec = concepts.get("sector")
                            inst = concepts.get("instrument")
                            geo = full.get("document_metadata.geographies")
                            docs[did] = {
                                "document_id": did,
                                "document_title": (full.get("document_metadata.family_title")
                                                   or full.get("document_metadata.document_title")),
                                "geographies": geo[0] if isinstance(geo, list) and geo else None,
                                "publication_ts": full.get("document_metadata.publication_ts"),
                                "source_url": full.get("document_metadata.source_url"),
                                "description": (full.get("document_metadata.description")
                                                or full.get("document_metadata.collection_summary")),
                                "doc_form": full.get("document_metadata.type"),
                                "sector": sec[0] if sec else None,
                                "instrument": inst[0] if inst else None,
                                "concepts": json.dumps(concepts, ensure_ascii=False) if concepts else None,
                                "record_type": CAT_MAP.get(full.get("document_metadata.category"), "policy"),
                                # traceability so the full text can be re-fetched later:
                                "import_id": full.get("document_metadata.import_id"),
                                "slug": full.get("document_metadata.slug"),
                                "md5_sum": full.get("document_md5_sum"),
                                "cdn_object": full.get("document_cdn_object"),
                                # complete original metadata (every field) -> records.raw
                                "doc_meta_json": json.dumps(full, ensure_ascii=False),
                            }
                        except Exception:  # noqa: BLE001
                            continue
                        if MAX_DOCS and len(docs) >= MAX_DOCS:
                            break
                    if MAX_DOCS and len(docs) >= MAX_DOCS:
                        break
                print(f"[CPR] shard {fi + 1}/{len(files)}: {len(docs)} docs so far")
                if MAX_DOCS and len(docs) >= MAX_DOCS:
                    break
            except Exception as e:  # noqa: BLE001
                print(f"[CPR] shard {f} error (skipped): {e}")
        df = pd.DataFrame(list(docs.values()))
        df["full_text"] = df["description"]  # Option A: summary is the searchable text
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("CPR/CCLW", len(df), message="catalog: metadata+summary, no passage text")
        print(f"[CPR] saved {len(df)} documents (catalog)")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPR/CCLW", 0, "error", str(e))
        print(f"[CPR] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
