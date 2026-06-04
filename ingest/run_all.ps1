# Climate Policy Monitor — run the full ingest pipeline (fetch all -> normalize -> load).
# Usage from the project folder:
#   powershell -ExecutionPolicy Bypass -File .\ingest\run_all.ps1
# Requires: deps installed (pip install -r ingest/requirements.txt; pip install datasets)
# and ingest/.env containing DATABASE_URL (your Supabase DIRECT connection string).

$ErrorActionPreference = "Continue"
Set-Location (Split-Path $PSScriptRoot -Parent)   # repo root

$fetchers = @(
  "fetch_cpdb", "fetch_oecd_capmf", "fetch_climatewatch", "fetch_worldbank_carbon",
  "fetch_netzero", "fetch_unfccc_ndc", "fetch_eurlex", "fetch_cpr"
)
foreach ($f in $fetchers) {
  Write-Host "`n=== $f ===" -ForegroundColor Cyan
  python "ingest/$f.py"
}
Write-Host "`n=== normalize ===" -ForegroundColor Cyan
python ingest/normalize.py
Write-Host "`n=== load_to_db ===" -ForegroundColor Cyan
python ingest/load_to_db.py
Write-Host "`n=== DONE ===" -ForegroundColor Green
