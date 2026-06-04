"""Upsert data/records_normalized.csv into Postgres `records`, then write per-source
rows into `harvest_runs` (the Mode 9 transparency dashboard).

Upsert keys on doc_id. first_seen_at is preserved across runs (DB default on insert,
untouched on conflict); last_updated_at is bumped on every conflicting update.
"""
import csv
import json
import datetime
import common

INSERT_COLS = common.COLUMNS  # first_seen_at / last_updated_at are DB-managed


def _val(row, c):
    v = row.get(c)
    if v in ("", None):
        return None
    if c == "concepts":
        try:
            json.loads(v)
            return v
        except (TypeError, ValueError):
            return json.dumps(v)
    return v


def load():
    from psycopg2.extras import execute_values

    with open(common.NORMALIZED, newline="", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))
    if not reader:
        print("[load] nothing to load")
        return

    rows = [tuple(_val(r, c) for c in INSERT_COLS) for r in reader]
    conn = common.get_conn()
    cur = conn.cursor()

    # Existing doc_ids → lets us count genuinely new records per source.
    cur.execute("SELECT doc_id FROM records")
    existing = {r[0] for r in cur.fetchall()}

    collist = ",".join(INSERT_COLS)
    updates = ", ".join(f"{c}=EXCLUDED.{c}" for c in INSERT_COLS if c != "doc_id")
    sql = (f"INSERT INTO records ({collist}) VALUES %s "
           f"ON CONFLICT (doc_id) DO UPDATE SET {updates}, last_updated_at=now()")
    execute_values(cur, sql, rows, page_size=1000)

    # Per-source harvest_runs rows (combine fetch manifest with upsert counts).
    manifest = common.read_manifest()
    by_source = {}
    for r in reader:
        s = r.get("source") or "unknown"
        st = by_source.setdefault(s, {"upserted": 0, "new": 0})
        st["upserted"] += 1
        if r.get("doc_id") not in existing:
            st["new"] += 1

    now = datetime.datetime.now(datetime.timezone.utc)
    for s, st in by_source.items():
        m = manifest.get(s, {})
        status = m.get("status", "ok")
        cur.execute(
            "INSERT INTO harvest_runs "
            "(source, fetched, upserted, new_records, errors, status, message, finished_at) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (s, m.get("fetched", st["upserted"]), st["upserted"], st["new"],
             1 if status == "error" else 0, status, m.get("message", ""), now),
        )

    conn.commit()
    cur.close()
    conn.close()
    print(f"[load] upserted {len(rows)} rows across {len(by_source)} sources")


if __name__ == "__main__":
    load()
