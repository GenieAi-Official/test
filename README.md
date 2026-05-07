# xhs-scraper（小红书内容抓取工具）

基于 Playwright 的小红书网页端抓取脚本，支持：

- 关键词搜索抓取：批量拿到笔记链接并导出
- 笔记详情抓取：标题、正文、作者、图片/视频（尽力提取）、互动数据（尽力提取）
- 用户主页抓取：抓取该用户笔记列表并批量抓取详情
- Markdown 导出：可选把图片下载到本地并在 Markdown 中引用

本工具不会绕过验证码、风控或登录限制；如需登录，请使用浏览器手动登录一次，后续复用本地会话。

## 环境要求

- Python 3.10+
- Playwright（需要额外安装浏览器）

## 安装

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -U pip
python -m pip install -r requirements.txt
python -m playwright install chromium
```

## 快速开始

首次登录（会打开浏览器窗口）：

```bash
python -m xhs_scraper login --user-data-dir ./.xhs_profile
```

无交互环境（例如被 Web 服务调起）可使用自动等待退出：

```bash
python -m xhs_scraper login --user-data-dir ./.xhs_profile --wait-seconds 600
```

关键词搜索并抓取前 30 条结果到 Markdown：

```bash
python -m xhs_scraper search "露营装备" --limit 30 --out ./out --user-data-dir ./.xhs_profile
```

抓取单条笔记：

```bash
python -m xhs_scraper note "https://www.xiaohongshu.com/explore/xxxxxxxx" --out ./out --user-data-dir ./.xhs_profile
```

抓取用户主页（会先拿列表，再抓详情）：

```bash
python -m xhs_scraper user "https://www.xiaohongshu.com/user/profile/xxxxxxxx" --limit 30 --out ./out --user-data-dir ./.xhs_profile
```

## 输出结构

- `out/index.md`：本次抓取索引
- `out/notes/<note_id>.md`：每条笔记的 Markdown
- `out/media/<note_id>/...`：可选的图片下载目录

## 在线网页（自部署控制台）

仓库内提供一个可自部署的 Web 控制台（React + Express），用于在网页里创建任务、查看日志、预览 index.md 并下载产物（zip）。实现位于 [webapp](file:///workspace/webapp)。

启动方式：

```bash
cd webapp
pnpm install
pnpm run dev
```

访问：

- http://localhost:5173/

说明：

- “打开登录浏览器”会在运行 Web 服务的那台机器上弹出浏览器窗口；远程服务器需要远程桌面/带 GUI 的运行环境
- 抓取仍复用 Python Playwright，请先按上面的安装步骤安装好 Python 依赖与 Chromium

## 部署上线（Docker）

默认按“纯无头服务器”假设部署：不提供网页端弹窗登录（`XHS_ALLOW_HEADED_LOGIN=0`），需要你在本地（有浏览器的机器）先登录一次，再把会话目录同步到服务器的 `./data/profile`。

### 1) 在服务器启动服务

```bash
docker compose up -d --build
```

访问：

- http://<你的服务器IP>:3001/

### 2) 本地手动登录并同步会话

在你自己的电脑（有桌面浏览器）运行：

```bash
python -m xhs_scraper login --user-data-dir ./profile
```

把 `./profile` 整个目录复制到服务器的 `./data/profile`（与 `docker-compose.yml` 同级的 data 目录），重启容器后即可在网页里直接创建抓取任务。

### 可选：启用服务器端“弹窗登录”

仅当服务器具备 GUI/远程桌面且容器能访问显示设备时才建议使用，并将环境变量设置为：

- `XHS_ALLOW_HEADED_LOGIN=1`
