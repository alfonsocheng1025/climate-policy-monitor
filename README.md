# Climate Policy Monitor — 全球气候政策采集与可视化平台

一套完整方案：**定时采集**（GitHub Actions）+ **存储**（Supabase Postgres + Git 快照）+ **双语在线可视化查询平台**（Next.js on Vercel）。

本项目是 [ZJU-CMIC 气候与科学传播研究计划](https://research.newsfindsme.com/) 的第三个"监测站"，与
**气候新闻观测站**（`monitor.newsfindsme.com`）、**气候论文监测站**（`pmonitor.newsfindsme.com`）并列。

> ⚠️ **正在按 [`PLAN.md`](./PLAN.md) 重构。** 下表的原始三源脚手架（Perplexity 生成）正在被一套更全面、
> 已核实（2026-06）的多源 + 实时采集方案取代。详细的数据源、数据模型与**可视化设计/模式**见 `PLAN.md`。
> 当前 `ingest/` 与 `web/` 仍为原始脚手架。

## 数据源（重构后，详见 PLAN.md §3）
| 角色 | 代表源 | 内容 | 接入 |
|------|--------|------|------|
| 综合/历史底座 | CPDB · OECD CAPMF · Climate Watch · CPR/CCLW · World Bank Carbon Pricing · Net Zero Tracker | 结构化政策、强度分数、NDC/净零、全文法律、碳定价 | CSV / SDMX / JSON REST / HuggingFace Parquet |
| NDC + 实时信号 | openclimatedata · UNFCCC NDC RSS · EUR-Lex | 官方 NDC、欧盟立法近实时 | CSV diff / RSS / SPARQL |
| 可选扩展 | Sabin 诉讼 · FAOLEX · pcet.cn / ccchina | 气候诉讼、环境立法、中国政策 | CSV / JSON / 抓取 |

## 目录结构
```
climate-policy-platform/
├── ingest/                 # Python 采集脚本
│   ├── fetch_cpdb.py
│   ├── fetch_oecd_capmf.py
│   ├── fetch_cpr.py
│   ├── normalize.py        # 统一 schema 标准化
│   ├── load_to_db.py       # 入库 Postgres
│   └── requirements.txt
├── db/
│   └── schema.sql          # Postgres 建表
├── web/                    # Next.js 平台 (Vercel)
│   ├── app/
│   ├── components/
│   └── lib/
├── .github/workflows/
│   └── ingest.yml          # 定时采集 cron
├── docs/
│   └── data_dictionary.csv # 数据字典
└── data/                   # 标准化快照 (git 版本化)
```

## 快速开始
1. 采集层：`cd ingest && pip install -r requirements.txt && python fetch_cpdb.py`
2. 数据库：在 Vercel/Supabase 创建 Postgres，运行 `db/schema.sql`
3. 平台：`cd web && npm install && npm run dev`，部署 `vercel --prod`
4. 自动化：在 GitHub 仓库 Secrets 设置 `DATABASE_URL`，Actions 即按 cron 运行

## 环境变量
- `DATABASE_URL` — Postgres 连接串（**采集层** `ingest/` 使用）
- `POSTGRES_URL` — Postgres 连接串（**平台层** `web/` 经 `@vercel/postgres` 使用；Vercel 上自动注入，本地需手动设置）
- `CPR_DATASET_URL` — Climate Policy Radar 数据集地址（重构后改用 HuggingFace Parquet，见 PLAN.md）
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob（可选，存全文/PDF）
