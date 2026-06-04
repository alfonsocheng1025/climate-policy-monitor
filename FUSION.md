# Data Fusion Strategy — Climate Policy Monitor

> A rethink of how the heterogeneous sources combine. Companion to [`PLAN.md`](./PLAN.md).
> Grounded in the **real field values** observed in each source (June 2026), not assumptions.

---

## 0. Diagnosis: we have a UNION, not a FUSION

The current `records` table is an **append/union**: every source's rows are stacked and tagged
with `source` + `record_type` + a generic `metric_*` slot + `raw`. That is the right *landing
layer*, but it is not fusion:

- **No shared vocabulary** — `sector`="Electricity and heat" (CPDB) vs `LEV2_SEC_E_MBI` (CAPMF)
  vs "Energy" (Climate Watch) never meet.
- **Mixed grains in one table** — a *document* (CPDB/CPR), a *country×year×indicator observation*
  (CAPMF), and a *national pledge* (NZT/NDC) are not the same kind of thing and can't be counted
  together.
- **No entity links** — Germany's *EEG* appears as a CPDB policy, a CPR document family, and EU
  directives, with no connection. NDCs appear in UNFCCC + Climate Watch + IGES, unlinked.
- **No reconciliation** — when Net Zero Tracker says "in law" but no law exists in CPR/CCLW, nothing
  flags the disagreement.

Fusion = **conformed dimensions + grain-separated facts + entity resolution + provenance**, which is
what unlocks rich cross-analysis and intuitive visualization.

---

## 1. Source grain & field semantics (what a row and its values actually mean)

| Source | Grain (1 row =) | Key fields & **what the values mean** |
|---|---|---|
| **CPDB** | one **policy** (incl. subnational: Country 6176 / Subnational 281 / City 50) | `sector`,`policy_instrument`,`policy_type`,`policy_objective` are **comma-joined multi-level tags** (e.g. `"Electricity and heat, Renewables"`, `"Target, GHG reduction target"`). `policy_status`: In force(4798)/Ended(1115)/Superseded(512)/Planned/Draft/Under review. `policy_type` = *abatement area* (Energy efficiency, Renewables…), NOT instrument. `decision_date`=year. |
| **OECD CAPMF** | one **(country × policy-item × measure × year)** observation | **Two measures**: `POL_STRINGENCY` (0–10 index of how strong a policy is) and `POL_COUNT` (# policies). `CLIM_ACT_POL` is a **4-level hierarchy** (LEV1=3 → LEV2=15 → LEV3=56 → LEV4=130). Organizing frame: **Sector{Electricity,Transport,Buildings,Industry} × {Market-based, Non-market-based}** + Cross-sectoral(governance, RD&D, fossil-fuel-production, GHG-targets) + International(finance, cooperation, reporting). |
| **Climate Watch** (ndc/lts/net_zero_content) | one **(country × indicator)** answer — **tall key-value** | `indicator_name` is a *question* ("Mitigation contribution type", "Net-zero Target Year", "Coverage of GHGs"), `value` is the *answer* (text/category). `global_category`=Mitigation/Adaptation/Overview. → **must be pivoted** to one row/country per pledge. |
| **CPR / CCLW** | one **document** (law/policy/UNFCCC/litigation) | `family_*` groups a policy and its amendments (**use as native policy-entity id**). `category`=Legislative/Executive/Litigation/UNFCCC. `metadata.{framework,sector,instrument,hazard,keyword}` = CPR's own taxonomy (sparse). `import_id`/`md5`/`source_url` = re-fetch keys. |
| **World Bank** | one **carbon-pricing instrument** / **crediting mechanism** / **Art.6 agreement** | `Type`=ETS/Carbon tax; `Status`=Implemented/Scheduled/Under consideration/Abolished; `price`=USD/tCO₂e; coverage=% of jurisdiction emissions. Jurisdiction is a *name* (often subnational). |
| **Net Zero Tracker** | one **entity pledge** (country/region/city/company) | `net_zero_status` = **ordinal legal force**: Proposed/in discussion < Declaration/pledge < In policy document < In law < Achieved. `year`=target year. |
| **UNFCCC NDC Registry** | one **submission file** | `Version` 1.0→4.0 = the **ratchet cycle**; `Status`=Active/Archived; `FileType`=NDC/Addendum/Translation. → **dedup to current** (Active + max Version, drop Translations/Addenda). |
| **EUR-Lex** | one **EU legal act** | `celex`=stable id; supranational (country = EU). |

---

## 2. Conformed taxonomies + crosswalks (the heart of fusion)

Anchor everything on **CAPMF's frame**, extended with AFOLU (CAPMF omits it; CPDB/CPR have it).

### 2a. Canonical SECTOR (8) — crosswalk
| canonical | CPDB top token | CAPMF code | CPR/CW |
|---|---|---|---|
| `electricity` | Electricity and heat | `SEC_E_*` | Energy/Electricity |
| `transport` | Transport | `SEC_T_*` | Transport |
| `buildings` | Buildings | `SEC_B_*` | Buildings |
| `industry` | Industry | `SEC_I_*` | Industry |
| `afolu` | Agriculture and forestry | — | LULUCF/Agriculture |
| `cross_sectoral` | General | `CROSS_SEC_*` | Cross-Cutting Area |
| `international` | — | `INT_*` | UNFCCC |
| `other` | (fallback) | — | Waste/Other |

### 2b. Canonical INSTRUMENT FAMILY (7) — crosswalk
| canonical | CPDB top tokens | CAPMF | World Bank |
|---|---|---|---|
| `carbon_pricing` | Economic instruments, Energy and other taxes | `*_MBI`, `FFPP` | ETS, Carbon tax, crediting |
| `regulation` | Regulatory Instruments, Codes and standards, Building codes | `*_NMBI` | — |
| `subsidy_fiscal` | Fiscal or financial incentives, Grants and subsidies, Tax relief, Feed-in tariffs, Direct investment, Infrastructure investments | (part of NMBI) | — |
| `rdd_innovation` | R&D… | `CROSS_SEC_RDD` | — |
| `target_governance` | Target, Strategic planning, Climate strategy, Policy support | `GHGTAR`, `CG` | — |
| `information_voluntary` | Information and education, Information provision, Negotiated agreements | — | — |
| `intl_finance_coop` | — | `INT_C_FIN`, `INT_C_COORD`, `INT_GHGREP` | Art.6 cooperative |

### 2c. Canonical LIFECYCLE (policy status)
`proposed` ← Planned/Draft/Under review/Under consideration/Scheduled · `in_force` ← In force/Implemented ·
`ended` ← Ended/Superseded/Abolished · `unknown`.

### 2d. Canonical LEGAL FORCE (ordinal, for commitments) — used to fuse net-zero/NDC across sources
`1 proposed` < `2 declaration` < `3 in_policy` < `4 in_law` < `5 achieved`
(NZT statuses map directly; a CPR/CCLW *legislative* net-zero doc bumps a country to ≥4).

### 2e. OBJECTIVE
`mitigation` / `adaptation` / `cross`, plus co-benefit tags (air_pollution, energy_security,
energy_access, economic_development, land_use) — CPDB `policy_objective` multi-tag.

> Crosswalks live as small CSVs in `db/crosswalks/` (sector, instrument, status, legal_force) +
> a `dim_country.csv` (iso3 → name, region, sub-region, income group, G20/EU/OECD/Annex-I flags,
> population, latest total GHG — for per-capita / per-emission normalization). These are seeded into
> reference tables and applied at normalize time.

---

## 3. The fused model (implement as a VIEW layer over `records` — no re-ingest)

Keep `records` as the **landing/union layer** (it already has `raw` + everything). Add:

**Reference/dimension tables** (seeded from `db/crosswalks/*.csv`): `dim_country`, `xwalk_sector`,
`xwalk_instrument`, `xwalk_status`, `xwalk_legal_force`.

**Canonical columns** added at normalize time to `records`: `canon_sectors` (JSONB array),
`canon_instruments` (JSONB array), `lifecycle`, `objective` (array), `legal_force` (int),
plus split/pivot handled in code (CPDB multi-tags split; CW content pivoted; UNFCCC deduped).

**Grain-separated fact VIEWS:**
- `fact_policy` — documents/instruments (CPDB, CPR/CCLW, EUR-Lex, WB instruments). One row per policy
  entity; canonical sector/instrument via bridge views (`jsonb_array_elements`).
- `fact_metric` — country×year quant: CAPMF stringency *and* count by LEV2 area, carbon price + coverage
  (WB), emissions (dim_country). Columns: country, year, area_code, metric_name, value, unit.
- `fact_commitment` — fused national pledges: one row per (country, pledge_type ∈ {ndc, lts, net_zero})
  with `target_year`, `target_value`, `legal_force`, `coverage`, and `sources[]` + `agreement` flag.

**Entity resolution:**
- *Policy families*: use CPR `family_import_id` natively; cross-source linking (CPDB↔CPR↔EUR-Lex) via
  `country + normalized_title (trigram) + year ±1 + shared canonical instrument` → `fused_policy_id`
  with a confidence score; stored in a `policy_link` table (candidate links, human-verifiable).
- *Commitment fusion*: per country, combine NZT + CW `net_zero_content` (pivoted) + any CPR net-zero
  *law* → one net-zero record with `legal_force = max(sources)`, `target_year`, and an `agreement`
  flag (e.g. ⚠ "NZT=in_law but no CCLW statute found").

**Provenance & conflict:** every fused entity keeps `sources[]` (doc_ids) + per-field source +
agreement flags. Conflicts are shown, not hidden (a research-credibility feature).

---

## 4. Descriptive analyses (single-lens, per fused dimension)
- Coverage: #policies by country / region / income group / canonical sector / instrument family.
- Stringency: CAPMF 0–10 by country × LEV2 area; distribution & leaders/laggards.
- Adoption timeline: new policies/laws per year by instrument family (CPR/CPDB dates).
- Carbon-pricing landscape: price + coverage by instrument (WB), ETS vs tax.
- Commitments: net-zero target-year distribution by legal force; NDC ratchet versions.

## 5. Cross-analyses (the payoff of fusion)
| # | Question | Fused fields |
|---|---|---|
| 1 | **Breadth × Depth** — many policies but weak? | policy COUNT (CPDB/CPR) × stringency INDEX (CAPMF) per country |
| 2 | **Promise × Action** — pledges backed by laws? | NDC ambition (CW indicators) × domestic coverage (CPDB count + CAPMF stringency) |
| 3 | **Pledge × Statute** — talk vs law | net-zero `legal_force` (NZT) × net-zero in legislation (CPR/CCLW) → agreement flag |
| 4 | **Stringency × Price** — consistency | CAPMF carbon-pricing stringency × actual price (WB) |
| 5 | **Instrument mix** | canonical instrument distribution per country/region (all doc sources) |
| 6 | **Sector × country matrix** | counts (CPDB/CPR) + stringency (CAPMF LEV2) in one cell (bivariate) |
| 7 | **Did policy bend the curve?** | adoption + CAPMF stringency trajectory + emissions (dim_country) over time |
| 8 | **Ratchet ambition** | NDC version timeline (UNFCCC) × "Strengthened…" indicators (CW) |
| 9 | **Pricing vs coverage** | WB price × % emissions covered, sized/colored by instrument |
| 10 | **Litigation pressure** (if Sabin added) × policy density |

## 6. Policy diffusion (the dynamic / longitudinal core)

Diffusion = how policies spread across jurisdictions over time. With fused adoption dates
(`decision_date`) + `dim_country` (region / income / bloc) + canonical instruments, we can measure it:

- **Adoption S-curve** — cumulative # of countries that have adopted an instrument family or a
  *specific* instrument (carbon tax, ETS, feed-in tariff, net-zero target, NDC) over time. The
  signature diffusion chart; reveals tipping points and saturation.
- **Diffusion wavefront map** — choropleth colored by *year of first adoption* of instrument X, with a
  **time slider/animation** → literally watch a policy spread across the world.
- **Leader–laggard & lag-time** — rank countries by adoption year; distribution of lags behind the
  first mover; early-adopter vs late-majority cohorts.
- **Peer / regional co-movement** — adoption rate by region / income group / bloc over time. Clustered
  adoption is the empirical signature of **learning, emulation, competition, coercion** (name the
  candidate mechanism; don't over-claim causation).
- **Adoption sequence** — typical within-country ordering of instrument families (e.g. *target →
  subsidy → pricing*) via median adoption year per family → "policy pathway."
- **EU coercion / transposition** — EUR-Lex directives followed by lagged member-state adoptions in
  CCLW/CPDB: a clean, observable diffusion mechanism.
- **Net-zero cascade** — the 2019–2021 surge of pledges, and escalation *up the legal-force ladder*
  (declaration → policy → law) per country over time.
- **NDC ratchet diffusion** — version upgrades (1.0→2.0→3.0→4.0, from UNFCCC) across countries over
  time, cross-referenced with Climate Watch "Strengthened…" indicators (ambition up or flat?).

*Data caveats (be honest in the UI):* CPDB/CPR `decision_date` give policy adoption years (✓). But the
**net-zero pledge date** and the **carbon-pricing implementation year** aren't captured yet — a small
normalize enhancement (pull WB "Year of Implementation"; use CPR net-zero law dates / UNFCCC LTS
submission dates as pledge-date proxies). Flagged as a follow-up so diffusion charts don't silently
mislead.

## 7. Deeper analytical dimensions (richness & breadth)

- **Portfolio diversity** — per country, a Shannon/Herfindahl index over instrument families & sectors
  → "policy-mix breadth": balanced vs concentrated (e.g. all-subsidies vs a full toolkit).
- **Gap analysis** — which (canonical sector × instrument) cells a country lacks **relative to its
  regional / income peers** → "missing instruments," a directly actionable view.
- **Coherence / consistency** — target↔instrument (net-zero pledge but no carbon price?),
  stringency↔price (#4), ambition↔action (#2): flag internal contradictions.
- **Stability / volatility** — churn = (ended + superseded) / total; policy turnover over time
  (predictability matters to investors and is itself a research variable).
- **Equity / climate-justice lens** — effort (coverage, stringency) vs **capacity** (GDP/capita) vs
  **responsibility** (historical emissions) and **per-capita** normalization → who leads *adjusted for
  wealth/responsibility*. Strong fit for communication framing.
- **Co-benefit framing** — CPDB `policy_objective` co-tags (air pollution, energy security, energy
  access, economic development): *how* countries justify climate action — a discourse/communication signal.
- **Country archetypes (clustering)** — cluster nations by their (sector × instrument) stringency /
  coverage vectors → "policy families of states" (carbon-pricing pioneers, regulation-heavy,
  subsidy-driven, target-only/nascent). Hierarchical or k-means; label the clusters.
- **Composite comprehensiveness index** — coverage × stringency × legal-force into one score, with
  **explicit caveats + a sensitivity toggle** (indices invite misreading; show the components).
- **Cross-monitor link (unique to your ecosystem)** — join **Policy** × **News**
  (`monitor.newsfindsme`) × **Papers** (`pmonitor`) by country / topic / time: *attention vs evidence
  vs action*. Does media or research attention **lead or lag** policy adoption? A genuinely novel
  science-communication analysis only the ZJU-CMIC portal can run — and a natural flagship "Insight."
- **Discourse / text layer** — CPR concept & keyword trends over time, framing analysis; full text
  retrievable on demand via the traceability IDs already stored in `raw`.
- **Litigation accountability** (if Sabin added) — case counts vs policy gaps / stringency: where
  courts fill the policy vacuum.

## 8. Rich visualization scheme (mapped to the fused model)
- **Bivariate choropleth** — two metrics at once (e.g. stringency × emissions, or coverage × price). 2-D color legend.
- **Stringency genome heatmap** — country × **CAPMF LEV2 (15)**; cell = stringency, optional count as opacity. (Now feasible & meaningful.)
- **Sankey** — country → canonical sector → instrument family (policy-count flows).
- **Scatter plots** — Breadth×Depth (#1) and Promise×Action (#2), bubble = emissions, color = region; click → country.
- **Net-zero ladder** — beeswarm of entities on (target_year × legal_force), color = legal force ordinal.
- **Carbon-price dot plot** — price per jurisdiction, dot size = coverage, split ETS/tax.
- **Policy-family timeline** — CPR families with amendment/version history as horizontal tracks.
- **Instrument radar** — a country's profile across the 7 instrument families.
- **Streamgraph** — adoption over time by instrument family (composition-through-time).
- **Concept network** — CPR `keyword`/`hazard` co-occurrence (where tagged).
- **Drill path** — bivariate map → country profile → sector → instrument family → policy family → document → source `raw`.
- **Adoption S-curves** — small multiples, one per instrument family; cumulative adopters over time (diffusion §6).
- **Diffusion wavefront map + time slider** — year-of-first-adoption choropleth, animated to show spread.
- **Ridgeline / streamgraph by region** — adoptions over time per region (peer co-movement).
- **Country-archetype scatter** — 2-D projection (PCA/MDS) of countries colored by policy-portfolio cluster.
- **Equity quadrant** — effort (stringency/coverage) vs responsibility/capacity (per-capita emissions / GDP).
- **Cross-monitor timeline** — news attention (`monitor`) vs research (`pmonitor`) vs policy adoption for a
  topic/country: the flagship "attention vs evidence vs action" Insight unique to your ecosystem.
- **Insights stories** (science-communication layer): "The gap between pledges and laws" (#3),
  "Breadth isn't depth" (#1), "Who actually prices carbon" (#4), "Watching net-zero spread" (§6),
  "Attention vs action" (cross-monitor) — annotated versions of the above.

Every view carries the house rules from `PLAN.md` §6: bilingual, provenance + agreement flags,
export + citation, colorblind-safe, honest encodings (count ≠ stringency ≠ ambition; gaps shown).

## 9. Build path (incremental, no re-ingest)
1. **Fusion layer as a view over `records`** — `db/fusion.sql` (self-contained, run once in Supabase
   *after* the data load): crosswalk + `dim_country` reference tables (+seed INSERTs), canonical views
   (`v_records_canon`), grain-separated facts (`fact_policy` / `fact_metric` / `fact_commitment`), and
   diffusion views (`v_adoption`, `v_diffusion_curve`). **Touches nothing in the running ingest.**
2. **Date-capture enhancement** (for diffusion) — small `normalize.py` tweak: WB implementation year,
   net-zero pledge-date proxy. (Next ingest cycle.)
3. **Cross-analysis API + viz** — scatters (breadth×depth, promise×action, equity), bivariate map,
   LEV2 stringency heatmap, Sankey, net-zero ladder, S-curves + wavefront map.
4. **Country archetypes & composite index** — clustering + index with sensitivity toggle.
5. **Entity resolution** — CPR `family_import_id` first (free), then fuzzy cross-source `policy_link`.
6. **Cross-monitor link** — join policy × news × papers (ZJU-CMIC flagship Insight).

The crosswalks (embedded in `db/fusion.sql`, mirrored to `db/crosswalks/*.csv`) are the real
intellectual asset — **version-controlled, citable, and ideally reviewed by a domain expert (you)**.
