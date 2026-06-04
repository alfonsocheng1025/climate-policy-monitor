# 手把手部署指南 / Setup Guide

把这个平台从代码变成"线上、有数据、自动更新"的网站，一共三段：
**① 建数据库（Supabase）→ ② 本地跑通采集 → ③ 部署网站（Vercel）+ 自动化（GitHub Actions）。**

> 任何一步卡住，把终端/页面的报错贴给我即可。第 5 步首次真实采集的输出尤其要发我——我会据各源真实列名校准 `ingest/normalize.py`。

---

## ① 建数据库

### 第 1 步：开通 Supabase Postgres
1. 打开 https://supabase.com → **Sign in**（用 GitHub 账号登录最省事）。
2. 点 **New project**：
   - **Organization**：选你的（没有就新建一个，免费）。
   - **Name**：`climate-policy-monitor`
   - **Database Password**：设一个强密码并**务必记下来**（连接串里要用，忘了只能重置）。
   - **Region**：选离你近的，例如 *Northeast Asia (Tokyo)* 或 *Southeast Asia (Singapore)*。
   - **Plan**：Free 即可。
3. 等 1–2 分钟项目初始化完成。

### 第 2 步：建表（运行 schema.sql）
1. 左侧菜单 → **SQL Editor** → **New query**。
2. 打开本仓库的 `db/schema.sql`，**全选复制**，粘贴进编辑器。
3. 点右下角 **Run**。看到 *Success. No rows returned* 即建表成功。
4. 左侧 **Table Editor** 里应能看到 `records` 与 `harvest_runs` 两张表。

### 第 3 步：拿到两种连接串（关键，别用反）
Supabase 有两种连接串，本项目两层各用一种：

| 用途 | 端口 | 给谁 |
|------|------|------|
| **直连 Direct**（`db.<ref>.supabase.co:5432`） | 5432 | 采集层 → `ingest/.env` 的 `DATABASE_URL`（批量 upsert 用直连更稳） |
| **池化 Pooled / Transaction**（`...pooler.supabase.com:6543`） | 6543 | 网站层 → `web/.env.local` 的 `POSTGRES_URL`（无服务器函数用池化） |

操作：左侧 **Project Settings（齿轮）→ Database** → 找到 **Connection string**：
- 复制 **URI** 标签里的串；把 `[YOUR-PASSWORD]` 替换成第 1 步的密码。
- 直连串端口是 `5432`；在 **Connection pooling** 区域能拿到 `6543` 的池化串。
- 两个串都长这样：`postgresql://postgres.<ref>:<密码>@<host>:<端口>/postgres`

---

## ② 本地跑通采集

### 第 4 步：写本地环境变量
PowerShell：
```powershell
Copy-Item ingest/.env.example ingest/.env
# 然后编辑 ingest/.env，把 DATABASE_URL 设为【直连 5432】串
```
（`.env` 已被 `.gitignore` 忽略，不会误传。脚本会自动读取它。）

### 第 5 步：建 Python 环境并首次采集
**务必用 Python 3.11 或 3.12**（你的 3.14 装 pandas/psycopg2 可能失败）：
```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ingest/requirements.txt
```
先用**单源**验证整条链路：
```powershell
python ingest/fetch_cpdb.py      # 抓 CPDB -> data/cpdb_raw.csv
python ingest/normalize.py       # 标准化 -> data/records_normalized.csv
python ingest/load_to_db.py      # 入库 Supabase
```
跑通后再补齐其余源（OECD/Climate Watch/World Bank/Net Zero/UNFCCC/CPR），最后再 `normalize` + `load`。
> 把每步输出发我，我据真实列名微调映射；CPR 那步需要先 `pip install datasets`，可最后再做。

### 第 6 步：本地看网站
```powershell
cd web
npm install
"POSTGRES_URL=<你的【池化 6543】串>" | Out-File -Encoding utf8 .env.local
npm run dev
```
浏览器打开 http://localhost:3000 。数据已入库的话，看板/地图/检索/数据页都会有内容。

---

## ③ 部署 + 自动化

### 第 7 步：推到 GitHub
1. 在 https://github.com/new 新建**空**仓库 `climate-policy-monitor`（不要勾 Add README）。
2. 本地关联并推送：
   ```powershell
   git remote add origin https://github.com/<你的用户名>/climate-policy-monitor.git
   git push -u origin main
   ```

### 第 8 步：部署到 Vercel
1. https://vercel.com → **Add New… → Project** → Import 刚才的 GitHub 仓库。
2. **Root Directory 选 `web`**（重要：Next 应用在子目录里）。
3. **Environment Variables**：加 `POSTGRES_URL` = 你的【池化】串。
4. **Deploy**。完成后会给你一个 `*.vercel.app` 网址。
   - 之后可在 Vercel 绑定自定义域名（如 `policy.newsfindsme.com` 这类，匹配你的监测站家族）。

### 第 9 步：开启自动采集（GitHub Actions）
1. GitHub 仓库 → **Settings → Secrets and variables → Actions → New repository secret**：
   - `DATABASE_URL` = 【直连】串
   - （可选）`WB_CARBON_URL` = 世行碳定价最新 xlsx 地址
2. **Actions** 标签页 → 选 *Ingest Climate Policy Data* → **Run workflow** 先手动测一次。
3. 之后按 cron（每周一）自动运行；实时层（Tier B）会按每日 cron 跑。

---

## 常见问题
- **直连 vs 池化用反**：采集=直连(5432)，网站=池化(6543)。这是最常见的坑。
- **SSL 报错**：Supabase 强制 SSL；采集脚本已自动追加 `sslmode=require`，`@vercel/postgres` 默认走 SSL。
- **Python 3.14 装包失败**：一定用 3.11/3.12 venv。
- **Vercel 构建找不到 Next**：确认 Root Directory 设成了 `web`。
- **网站显示"暂无数据"**：说明库是空的或连接串没配对——先确认第 5 步入库成功、第 6/8 步连接串正确。
