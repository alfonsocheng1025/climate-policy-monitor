"""Tier B (real-time) — recent EU climate legislation via the EUR-Lex / CELLAR SPARQL endpoint.

Verified live 2026-06 against http://publications.europa.eu/webapi/rdf/sparql:
EuroVoc concept 5482 = "climate change"; predicates per the query below (note the
expression->work link is `cdm:expression_belongs_to_work`, NOT `work_has_expression`).
The date FILTER keeps result sets small for an incremental "since" watermark.
"""
import os
import requests
import pandas as pd
import common

ENDPOINT = "http://publications.europa.eu/webapi/rdf/sparql"
SINCE = os.environ.get("EURLEX_SINCE", "2024-01-01")
LIMIT = int(os.environ.get("EURLEX_LIMIT", "300"))
OUT = "eurlex_raw.csv"

QUERY = """PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT DISTINCT ?work ?celex ?title ?date ?eli
WHERE {
  ?work cdm:work_is_about_concept_eurovoc <http://eurovoc.europa.eu/5482> .
  ?work cdm:resource_legal_id_celex ?celex .
  ?work cdm:work_date_document ?date .
  ?expr cdm:expression_belongs_to_work ?work .
  ?expr cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> .
  ?expr cdm:expression_title ?title .
  OPTIONAL { ?work cdm:resource_legal_eli ?eli . }
  FILTER(?date >= "%s"^^xsd:date)
}
ORDER BY DESC(?date)
LIMIT %d"""


def fetch():
    common.ensure_data_dir()
    rows = []
    try:
        q = QUERY % (SINCE, LIMIT)
        resp = requests.get(
            ENDPOINT,
            params={"query": q, "format": "application/sparql-results+json"},
            headers={"Accept": "application/sparql-results+json",
                     "User-Agent": "ZJU-CMIC-policy-monitor"},
            timeout=120,
        )
        resp.raise_for_status()
        for b in resp.json().get("results", {}).get("bindings", []):
            celex = b.get("celex", {}).get("value", "")
            rows.append({
                "celex": celex,
                "title": b.get("title", {}).get("value"),
                "date": b.get("date", {}).get("value"),
                "eli": b.get("eli", {}).get("value"),
                "url": f"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex}",
            })
        df = pd.DataFrame(rows)
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("EUR-Lex", len(df), message=f"since {SINCE}")
        print(f"[EUR-Lex] saved {len(df)} rows (since {SINCE})")
        return df
    except Exception as e:  # noqa: BLE001
        if rows:
            pd.DataFrame(rows).to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("EUR-Lex", len(rows), "partial" if rows else "error", str(e))
        print(f"[EUR-Lex] {'partial' if rows else 'FAILED'}: {e}")
        return None


if __name__ == "__main__":
    fetch()
