"""Normalize all raw source CSVs into the unified `records` schema.

Output: data/records_normalized.csv (columns = common.COLUMNS, see db/schema.sql).
Each source has a mapper; mappers use defensive lookups because upstream column
names vary by release — verify/adjust against the first real fetch of each source.
"""
import re
import pandas as pd
import common


def _g(row, *names, default=None):
    for n in names:
        if n in row and pd.notna(row[n]) and str(row[n]).strip() != "":
            return row[n]
    return default


def _iso(v):
    if v is None:
        return None
    s = str(v).strip().upper()
    return s[:3] if s and s != "NAN" else None


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _year(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def _slug(s):
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")[:80]


def from_cpdb():
    df = common.safe_read_csv("cpdb_raw.csv")
    out = []
    for _, r in df.iterrows():
        pid = _g(r, "Policy ID", "policy_id", default=r.name)
        out.append(common.record(
            doc_id=f"cpdb:{pid}", record_type="policy",
            country_iso=_iso(_g(r, "ISO", "Country ISO", "iso")),
            title=_g(r, "Policy name", "Policy", "policy_name"),
            sector=_g(r, "Sector name", "Sector"),
            policy_instrument=_g(r, "Type of policy instrument", "Policy instrument"),
            status=_g(r, "Policy status", "Status"),
            decision_date=_g(r, "Date of decision", "Decision date"),
            source="CPDB", license="CC-BY-4.0",
            source_url="https://climatepolicydatabase.org",
        ))
    return out


def from_capmf():
    df = common.safe_read_csv("oecd_capmf_raw.csv")
    out = []
    for _, r in df.iterrows():
        area, pol = _g(r, "REF_AREA"), _g(r, "CLIM_ACT_POL")
        meas, yr, val = _g(r, "MEASURE"), _g(r, "TIME_PERIOD"), _g(r, "OBS_VALUE")
        if val is None:
            continue
        out.append(common.record(
            doc_id=f"capmf:{area}:{pol}:{meas}:{yr}", record_type="stringency_score",
            country_iso=_iso(area),
            title=_g(r, "Climate actions and policies", "CLIM_ACT_POL"),
            metric_name=("capmf_" + str(meas).lower()) if meas else "capmf",
            metric_value=_num(val),
            metric_unit=_g(r, "Unit of measure", "UNIT_MEASURE"),
            metric_year=_year(yr), decision_date=str(yr) if yr else None,
            source="OECD CAPMF", license="OECD",
            source_url="https://www.oecd.org/en/data/datasets/"
                       "climate-actions-and-policies-measurement-framework.html",
        ))
    return out


def from_climatewatch():
    df = common.safe_read_csv("climatewatch_raw.csv")
    out = []
    for _, r in df.iterrows():
        cid = _g(r, "id", "ndc_id", default=r.name)
        out.append(common.record(
            doc_id=f"cw:{cid}", record_type="ndc",
            country_iso=_iso(_g(r, "iso_code3", "location", "iso")),
            title=_g(r, "indicator_name", "category", "sector"),
            full_text=_g(r, "value", "description"),
            source="Climate Watch", license="CC-BY-4.0",
            source_url="https://www.climatewatchdata.org",
        ))
    return out


def from_cpr():
    df = common.safe_read_csv("cpr_raw.csv")
    out = []
    for _, r in df.iterrows():
        did = _g(r, "document_id", default=r.name)
        url = _g(r, "source_url")
        out.append(common.record(
            doc_id=f"cpr:{did}", record_type="law",
            country_iso=_iso(_g(r, "geographies", "geography_iso")),
            title=_g(r, "document_title"),
            decision_date=_g(r, "publication_ts", "document_date"),
            full_text=_g(r, "full_text"),
            source_pdf_url=url, source_url=url,
            source="CPR/CCLW", license="CC-BY-4.0",
        ))
    return out


def from_worldbank():
    df = common.safe_read_csv("worldbank_carbon_raw.csv")
    out = []
    for _, r in df.iterrows():
        name = _g(r, "Instrument name", "Name", "instrument", default=r.name)
        out.append(common.record(
            doc_id=f"wbcp:{_slug(name)}", record_type="carbon_price",
            country_iso=_iso(_g(r, "Jurisdiction ISO", "ISO", "iso3")),
            subnational=_g(r, "Subnational"),
            title=str(name),
            policy_instrument=_g(r, "Type", "Instrument type"),
            status=_g(r, "Status"),
            metric_name="carbon_price",
            metric_value=_num(_g(r, "Price", "Price_rate", "price")),
            metric_unit="USD/tCO2e",
            source="World Bank", license="CC-BY-4.0",
            source_url="https://carbonpricingdashboard.worldbank.org",
        ))
    return out


def from_netzero():
    df = common.safe_read_csv("netzero_raw.csv")
    out = []
    for _, r in df.iterrows():
        ent = _g(r, "Entity", "entity", default=r.name)
        out.append(common.record(
            doc_id=f"nzt:{_slug(ent)}", record_type="net_zero",
            country_iso=_iso(_g(r, "Code", "iso_code")),
            title=str(ent),
            status=_g(r, "status", "target_status"),
            metric_name="net_zero_target_year",
            metric_value=_num(_g(r, "target_year", "year")),
            source="Net Zero Tracker", license="CC-BY",
            source_url="https://zerotracker.net",
        ))
    return out


def from_unfccc_ndc():
    df = common.safe_read_csv("unfccc_ndcs_raw.csv")
    out = []
    for _, r in df.iterrows():
        code = _g(r, "Code", "code")
        ver = _g(r, "Version", "version", default="")
        ftype = _g(r, "FileType", "file_type", default="")
        out.append(common.record(
            doc_id=f"ndc:{code}:{ver}:{ftype}".rstrip(":"),
            record_type="ndc",
            country_iso=_iso(code),
            title=_g(r, "Title", "Party"),
            status=_g(r, "Status"),
            version=str(ver) if ver else None,
            submission_date=_g(r, "SubmissionDate", "submission_date"),
            decision_date=_g(r, "SubmissionDate"),
            source_pdf_url=_g(r, "EncodedAbsUrl"),
            source_url="https://unfccc.int/NDCREG",
            source="UNFCCC NDC Registry", license="Public domain",
        ))
    return out


def from_eurlex():
    df = common.safe_read_csv("eurlex_raw.csv")
    out = []
    for _, r in df.iterrows():
        celex = _g(r, "celex", default=r.name)
        url = _g(r, "url", "eli")
        out.append(common.record(
            doc_id=f"eurlex:{celex}",
            record_type="law",
            country_iso="EUU",  # EU as a supranational entity (no single ISO-3 country)
            title=_g(r, "title"),
            decision_date=_g(r, "date"),
            submission_date=_g(r, "date"),
            source_url=url, source_pdf_url=url,
            source="EUR-Lex", license="EU reuse (attribution)",
        ))
    return out


SOURCES = [from_cpdb, from_capmf, from_climatewatch, from_cpr, from_worldbank,
           from_netzero, from_unfccc_ndc, from_eurlex]


def normalize():
    rows = []
    for fn in SOURCES:
        try:
            part = fn()
            rows.extend(part)
            print(f"[normalize] {fn.__name__}: {len(part)} rows")
        except Exception as e:  # noqa: BLE001
            print(f"[normalize] {fn.__name__} FAILED: {e}")
    df = pd.DataFrame(rows, columns=common.COLUMNS)
    df.to_csv(common.NORMALIZED, index=False)
    print(f"[normalize] TOTAL {len(df)} rows -> {common.NORMALIZED}")
    return df


if __name__ == "__main__":
    common.ensure_data_dir()
    normalize()
