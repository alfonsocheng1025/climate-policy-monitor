-- ============================================================================
-- Climate Policy Monitor — FUSION LAYER  (see FUSION.md)
-- Run ONCE in Supabase AFTER the data load. Purely additive: reference tables +
-- views over the existing `records` table. No re-ingest; safe to re-run (idempotent).
-- ============================================================================

-- ---------- Reference / crosswalk tables (mirrors db/crosswalks/*.csv) ----------
CREATE TABLE IF NOT EXISTS xwalk_sector     (source_value TEXT PRIMARY KEY, canonical TEXT, label_en TEXT, label_zh TEXT);
CREATE TABLE IF NOT EXISTS xwalk_instrument (source_value TEXT PRIMARY KEY, canonical TEXT, label_en TEXT, label_zh TEXT);
CREATE TABLE IF NOT EXISTS xwalk_status     (source_value TEXT PRIMARY KEY, lifecycle TEXT);
CREATE TABLE IF NOT EXISTS xwalk_legal_force(source_value TEXT PRIMARY KEY, rank INT, label_en TEXT, label_zh TEXT);
CREATE TABLE IF NOT EXISTS dim_country      (iso3 TEXT PRIMARY KEY, name TEXT, region TEXT, income TEXT,
                                             g20 BOOLEAN, eu BOOLEAN, oecd BOOLEAN, annex1 BOOLEAN);

TRUNCATE xwalk_sector;
INSERT INTO xwalk_sector (source_value, canonical, label_en, label_zh) VALUES
  ('Electricity and heat','electricity','Electricity & heat','电力与供热'),
  ('General','cross_sectoral','Cross-sectoral','跨部门'),
  ('Transport','transport','Transport','交通'),
  ('Buildings','buildings','Buildings','建筑'),
  ('Industry','industry','Industry','工业'),
  ('Agriculture and forestry','afolu','Agriculture/Forestry/Land','农林与土地'),
  ('Energy','electricity','Energy','能源'),
  ('Cross-Cutting Area','cross_sectoral','Cross-cutting','跨领域'),
  ('Agriculture','afolu','Agriculture','农业'),
  ('LULUCF','afolu','Land use & forestry','土地利用与林业'),
  ('Waste','other','Waste','废弃物');

TRUNCATE xwalk_instrument;
INSERT INTO xwalk_instrument (source_value, canonical, label_en, label_zh) VALUES
  ('Policy support','target_governance','Targets & governance','目标与治理'),
  ('Strategic planning','target_governance','Targets & governance','目标与治理'),
  ('Climate strategy','target_governance','Targets & governance','目标与治理'),
  ('Target','target_governance','Targets & governance','目标与治理'),
  ('Institutional creation','target_governance','Targets & governance','目标与治理'),
  ('Coordinating body for climate strategy','target_governance','Targets & governance','目标与治理'),
  ('Monitoring','target_governance','Targets & governance','目标与治理'),
  ('Auditing','target_governance','Targets & governance','目标与治理'),
  ('Barrier removal','target_governance','Targets & governance','目标与治理'),
  ('GHG reduction target','target_governance','Targets & governance','目标与治理'),
  ('Renewable energy target','target_governance','Targets & governance','目标与治理'),
  ('Energy efficiency target','target_governance','Targets & governance','目标与治理'),
  ('Political & non-binding climate strategy','target_governance','Targets & governance','目标与治理'),
  ('Formal & legally binding climate strategy','target_governance','Targets & governance','目标与治理'),
  ('Formal & legally binding GHG reduction target','target_governance','Targets & governance','目标与治理'),
  ('Political & non-binding GHG reduction target','target_governance','Targets & governance','目标与治理'),
  ('Political & non-binding renewable energy target','target_governance','Targets & governance','目标与治理'),
  ('Formal & legally binding renewable energy target','target_governance','Targets & governance','目标与治理'),
  ('Formal & legally binding energy efficiency target','target_governance','Targets & governance','目标与治理'),
  ('Political & non-binding energy efficiency target','target_governance','Targets & governance','目标与治理'),
  ('Regulatory Instruments','regulation','Regulation & standards','管制与标准'),
  ('Codes and standards','regulation','Regulation & standards','管制与标准'),
  ('Building codes and standards','regulation','Regulation & standards','管制与标准'),
  ('Product standards','regulation','Regulation & standards','管制与标准'),
  ('Sectoral standards','regulation','Regulation & standards','管制与标准'),
  ('Vehicle fuel-economy and emissions standards','regulation','Regulation & standards','管制与标准'),
  ('Industrial air pollution standards','regulation','Regulation & standards','管制与标准'),
  ('Vehicle air pollution standards','regulation','Regulation & standards','管制与标准'),
  ('Other mandatory requirements','regulation','Regulation & standards','管制与标准'),
  ('Obligation schemes','regulation','Regulation & standards','管制与标准'),
  ('Procurement rules','regulation','Regulation & standards','管制与标准'),
  ('Grid access and priority for renewables','regulation','Regulation & standards','管制与标准'),
  ('Net metering','regulation','Regulation & standards','管制与标准'),
  ('Fiscal or financial incentives','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Grants and subsidies','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Tax relief','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Feed-in tariffs or premiums','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Direct investment','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Infrastructure investments','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Loans','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Funds to sub-national governments','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Tendering schemes','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Retirement premium','subsidy_fiscal','Subsidies & fiscal','补贴与财政'),
  ('Economic instruments','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('Energy and other taxes','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('CO2 taxes','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('ETS','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('Carbon tax','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('Market-based instruments','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('GHG emissions allowances','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('GHG emission reduction crediting and offsetting mechanism','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('Green certificates','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('White certificates','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('User charges','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('Removal of fossil fuel subsidies','carbon_pricing','Carbon pricing & market','碳定价与市场'),
  ('Information and education','information_voluntary','Information & voluntary','信息与自愿'),
  ('Information provision','information_voluntary','Information & voluntary','信息与自愿'),
  ('Negotiated agreements (public-private sector)','information_voluntary','Information & voluntary','信息与自愿'),
  ('Advice or aid in implementation','information_voluntary','Information & voluntary','信息与自愿'),
  ('Performance label','information_voluntary','Information & voluntary','信息与自愿'),
  ('Comparison label','information_voluntary','Information & voluntary','信息与自愿'),
  ('Endorsement label','information_voluntary','Information & voluntary','信息与自愿'),
  ('Voluntary approaches','information_voluntary','Information & voluntary','信息与自愿'),
  ('Public voluntary schemes','information_voluntary','Information & voluntary','信息与自愿'),
  ('Unilateral commitments (private sector)','information_voluntary','Information & voluntary','信息与自愿'),
  ('Professional training and qualification','information_voluntary','Information & voluntary','信息与自愿'),
  ('Research Development and Demonstration (RD&D)','rdd_innovation','RD&D / innovation','研发与示范'),
  ('Research & Development and Deployment (RD&D)','rdd_innovation','RD&D / innovation','研发与示范'),
  ('RD&D funding','rdd_innovation','RD&D / innovation','研发与示范'),
  ('Technology deployment and diffusion','rdd_innovation','RD&D / innovation','研发与示范'),
  ('Technology development','rdd_innovation','RD&D / innovation','研发与示范'),
  ('Demonstration project','rdd_innovation','RD&D / innovation','研发与示范'),
  ('Research programme','rdd_innovation','RD&D / innovation','研发与示范');

TRUNCATE xwalk_status;
INSERT INTO xwalk_status (source_value, lifecycle) VALUES
  ('In force','in_force'),('Implemented','in_force'),
  ('Ended','ended'),('Superseded','ended'),('Abolished','ended'),
  ('Planned','proposed'),('Draft','proposed'),('Under review','proposed'),
  ('Under consideration','proposed'),('Scheduled','proposed'),('Unknown','unknown');

TRUNCATE xwalk_legal_force;
INSERT INTO xwalk_legal_force (source_value, rank, label_en, label_zh) VALUES
  ('Proposed / in discussion',1,'Proposed','提议中'),
  ('Declaration / pledge',2,'Declaration/pledge','宣示/承诺'),
  ('In policy document',3,'In policy document','政策文件'),
  ('In law',4,'In law','已立法'),
  ('Achieved (self-declared)',5,'Achieved','已实现');

-- dim_country: G20 + EU27 + major emitters (expand as needed; views LEFT JOIN, so
-- countries absent here still appear, just without region/income).
TRUNCATE dim_country;
INSERT INTO dim_country (iso3,name,region,income,g20,eu,oecd,annex1) VALUES
  ('USA','United States','North America','High',true,false,true,true),
  ('CHN','China','East Asia','Upper-middle',true,false,false,false),
  ('IND','India','South Asia','Lower-middle',true,false,false,false),
  ('RUS','Russia','Eurasia','Upper-middle',true,false,false,true),
  ('JPN','Japan','East Asia','High',true,false,true,true),
  ('DEU','Germany','Europe','High',true,true,true,true),
  ('GBR','United Kingdom','Europe','High',true,false,true,true),
  ('FRA','France','Europe','High',true,true,true,true),
  ('ITA','Italy','Europe','High',true,true,true,true),
  ('CAN','Canada','North America','High',true,false,true,true),
  ('BRA','Brazil','Latin America','Upper-middle',true,false,false,false),
  ('AUS','Australia','Oceania','High',true,false,true,true),
  ('KOR','South Korea','East Asia','High',true,false,true,false),
  ('IDN','Indonesia','Southeast Asia','Upper-middle',true,false,false,false),
  ('MEX','Mexico','Latin America','Upper-middle',true,false,true,false),
  ('TUR','Turkey','Middle East','Upper-middle',true,false,true,true),
  ('SAU','Saudi Arabia','Middle East','High',true,false,false,false),
  ('ARG','Argentina','Latin America','Upper-middle',true,false,false,false),
  ('ZAF','South Africa','Africa','Upper-middle',true,false,false,false),
  ('AUT','Austria','Europe','High',false,true,true,true),
  ('BEL','Belgium','Europe','High',false,true,true,true),
  ('BGR','Bulgaria','Europe','Upper-middle',false,true,false,true),
  ('HRV','Croatia','Europe','High',false,true,true,true),
  ('CYP','Cyprus','Europe','High',false,true,false,false),
  ('CZE','Czechia','Europe','High',false,true,true,true),
  ('DNK','Denmark','Europe','High',false,true,true,true),
  ('EST','Estonia','Europe','High',false,true,true,true),
  ('FIN','Finland','Europe','High',false,true,true,true),
  ('GRC','Greece','Europe','High',false,true,true,true),
  ('HUN','Hungary','Europe','High',false,true,true,true),
  ('IRL','Ireland','Europe','High',false,true,true,true),
  ('LVA','Latvia','Europe','High',false,true,true,true),
  ('LTU','Lithuania','Europe','High',false,true,true,true),
  ('LUX','Luxembourg','Europe','High',false,true,true,true),
  ('MLT','Malta','Europe','High',false,true,false,false),
  ('NLD','Netherlands','Europe','High',false,true,true,true),
  ('POL','Poland','Europe','High',false,true,true,true),
  ('PRT','Portugal','Europe','High',false,true,true,true),
  ('ROU','Romania','Europe','Upper-middle',false,true,false,true),
  ('SVK','Slovakia','Europe','High',false,true,true,true),
  ('SVN','Slovenia','Europe','High',false,true,true,true),
  ('ESP','Spain','Europe','High',false,true,true,true),
  ('SWE','Sweden','Europe','High',false,true,true,true),
  ('NOR','Norway','Europe','High',false,false,true,true),
  ('CHE','Switzerland','Europe','High',false,false,true,true),
  ('NZL','New Zealand','Oceania','High',false,false,true,true),
  ('ISL','Iceland','Europe','High',false,false,true,true),
  ('IRN','Iran','Middle East','Lower-middle',false,false,false,false),
  ('EGY','Egypt','Africa','Lower-middle',false,false,false,false),
  ('NGA','Nigeria','Africa','Lower-middle',false,false,false,false),
  ('VNM','Vietnam','Southeast Asia','Lower-middle',false,false,false,false),
  ('THA','Thailand','Southeast Asia','Upper-middle',false,false,false,false),
  ('UKR','Ukraine','Europe','Lower-middle',false,false,false,true),
  ('ARE','United Arab Emirates','Middle East','High',false,false,false,false),
  ('CHL','Chile','Latin America','High',false,false,true,false);

-- ---------- Canonical view (doc sources: CPDB / CPR / WB / EUR-Lex) ----------
-- CPDB sector/instrument are comma-joined multi-tags; we map the PRIMARY (first) token.
CREATE OR REPLACE VIEW v_records_canon AS
SELECT r.doc_id, r.record_type, r.country_iso, r.title, r.sector AS raw_sector,
       r.policy_instrument AS raw_instrument, r.decision_date, r.status,
       r.source, r.source_pdf_url, r.source_url,
       xs.canonical  AS canon_sector,
       xi.canonical  AS canon_instrument,
       COALESCE(xst.lifecycle,'unknown') AS lifecycle,
       dc.region, dc.income, dc.g20, dc.eu, dc.annex1
FROM records r
LEFT JOIN xwalk_sector     xs  ON xs.source_value  = btrim(split_part(r.sector, ',', 1))
LEFT JOIN xwalk_instrument xi  ON xi.source_value  = btrim(split_part(r.policy_instrument, ',', 1))
LEFT JOIN xwalk_status     xst ON xst.source_value = r.status
LEFT JOIN dim_country      dc  ON dc.iso3 = r.country_iso;

-- ---------- fact_policy: documents / instruments ----------
CREATE OR REPLACE VIEW fact_policy AS
SELECT * FROM v_records_canon
WHERE record_type IN ('law','policy','carbon_price','carbon_crediting','cooperative_approach');

-- ---------- fact_metric: country x year quantitative (CAPMF stringency/count + carbon price) ----------
CREATE OR REPLACE VIEW fact_metric AS
SELECT q.country_iso, q.metric_year AS year, q.area AS capmf_area, q.metric_name, q.metric_value,
  CASE
    WHEN q.area ~ 'CROSS_SEC' THEN 'cross_sectoral'
    WHEN q.area ~ 'INT'       THEN 'international'
    WHEN q.area ~ 'SEC_E'     THEN 'electricity'
    WHEN q.area ~ 'SEC_T'     THEN 'transport'
    WHEN q.area ~ 'SEC_B'     THEN 'buildings'
    WHEN q.area ~ 'SEC_I'     THEN 'industry'
  END AS canon_sector,
  CASE
    WHEN q.area ~ 'NMBI'   THEN 'regulation'
    WHEN q.area ~ 'MBI'    THEN 'carbon_pricing'
    WHEN q.area ~ 'RDD'    THEN 'rdd_innovation'
    WHEN q.area ~ 'FFPP'   THEN 'carbon_pricing'
    WHEN q.area ~ 'GHGTAR' OR q.area ~ '_CG' THEN 'target_governance'
    WHEN q.area ~ 'INT'    THEN 'intl_finance_coop'
  END AS canon_instrument,
  substr(q.area, 1, 4) AS capmf_level
FROM (SELECT country_iso, metric_year, metric_name, metric_value,
             split_part(doc_id, ':', 3) AS area
      FROM records WHERE source = 'OECD CAPMF') q
UNION ALL
SELECT country_iso, metric_year AS year, NULL, metric_name, metric_value,
       'carbon_pricing', 'carbon_pricing', NULL
FROM records WHERE metric_name = 'carbon_price';

-- ---------- fact_commitment: national pledges with legal force ----------
CREATE OR REPLACE VIEW fact_commitment AS
SELECT r.country_iso, r.record_type AS pledge_type, r.title,
       r.metric_value AS target_year, r.status,
       COALESCE(lf.rank, 0) AS legal_force, lf.label_en AS legal_force_label,
       r.source, r.source_pdf_url
FROM records r
LEFT JOIN xwalk_legal_force lf ON lf.source_value = r.status
WHERE r.record_type IN ('net_zero','ndc','lts');

-- ---------- Diffusion: first adoption year per (instrument family, country) ----------
CREATE OR REPLACE VIEW v_adoption AS
SELECT canon_instrument, country_iso,
       min((substring(decision_date FROM '\d{4}'))::int) AS first_year
FROM v_records_canon
WHERE canon_instrument IS NOT NULL
  AND record_type IN ('law','policy')
  AND decision_date ~ '\d{4}'
GROUP BY canon_instrument, country_iso;

-- ---------- Diffusion S-curve: cumulative adopters per (instrument family, year) ----------
CREATE OR REPLACE VIEW v_diffusion_curve AS
SELECT canon_instrument, first_year AS year,
       count(*)::int AS new_adopters,
       (sum(count(*)) OVER (PARTITION BY canon_instrument ORDER BY first_year))::int AS cumulative_adopters
FROM v_adoption
WHERE first_year IS NOT NULL
GROUP BY canon_instrument, first_year;
