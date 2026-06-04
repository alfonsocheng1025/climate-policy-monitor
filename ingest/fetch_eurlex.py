"""Tier B — EU climate legislation via the EUR-Lex / CELLAR SPARQL endpoint.

Verified live 2026-06 against http://publications.europa.eu/webapi/rdf/sparql:
EuroVoc concept 5482 = "climate change". Fetches the WHOLE climate-tagged corpus
(no date cap by default), paginated via LIMIT/OFFSET. Set EURLEX_SINCE for an
incremental window. Each row keeps celex/title/date/eli/url; normalize stores the
full row in `raw`.
"""
import os
import requests
import pandas as pd
import common

ENDPOINT = "http://publications.europa.eu/webapi/rdf/sparql"
SINCE = os.environ.get("EURLEX_SINCE", "1900-01-01")  # effectively all history
PAGE = int(os.environ.get("EURLEX_PAGE", "1000"))
MAX = int(os.environ.get("EURLEX_MAX", "100000"))
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
LIMIT %d OFFSET %d"""


def fetch():
    common.ensure_data_dir()
    rows = []
    try:
        offset = 0
        while offset < MAX:
            q = QUERY % (SINCE, PAGE, offset)
            resp = requests.get(
                ENDPOINT,
                params={"query": q, "format": "application/sparql-results+json"},
                headers={"Accept": "application/sparql-results+json",
                         "User-Agent": "ZJU-CMIC-policy-monitor"},
                timeout=180,
            )
            resp.raise_for_status()
            binds = resp.json().get("results", {}).get("bindings", [])
            if not binds:
                break
            for b in binds:
                celex = b.get("celex", {}).get("value", "")
                rows.append({
                    "celex": celex,
                    "title": b.get("title", {}).get("value"),
                    "date": b.get("date", {}).get("value"),
                    "eli": b.get("eli", {}).get("value"),
                    "work": b.get("work", {}).get("value"),
                    "url": f"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex}",
                })
            print(f"[EUR-Lex] offset {offset}: +{len(binds)} (total {len(rows)})")
            if len(binds) < PAGE:
                break
            offset += PAGE
        df = pd.DataFrame(rows)
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("EUR-Lex", len(df), message=f"all since {SINCE}")
        print(f"[EUR-Lex] saved {len(df)} rows")
        return df
    except Exception as e:  # noqa: BLE001
        if rows:
            pd.DataFrame(rows).to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("EUR-Lex", len(rows), "partial" if rows else "error", str(e))
        print(f"[EUR-Lex] {'partial' if rows else 'FAILED'}: {e}")
        return None


if __name__ == "__main__":
    fetch()
