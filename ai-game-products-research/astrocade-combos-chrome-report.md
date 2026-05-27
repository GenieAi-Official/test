# Astrocade / Combos 产品实测总结

调研日期：2026-05-27  
浏览器：Chrome  
截图目录：`/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/`

说明：Combos 在 Chrome 中识别到已登录状态，所以截图呈现的是登录后的产品后台；Astrocade 也显示了登录后的 Studio 入口。为避免触发实际生成和消耗 credits，我没有点击最终的 `Create game` / `Generate asset` 动作，只点击了创建前流程、试玩、发现、模板和素材类型入口。

## Astrocade

### 截图

首页是游戏消费/发现页，按 Players' Choice、Trending 等 feed 展示社区游戏，卡片直接显示播放量和作者。

![Astrocade home](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/astrocade-home-chrome.png)

创建入口是聊天式 “wish-to-game” 流程。点击 `Inspire Me` 后，系统先让用户选择题材方向，再给出可直接继续细化的游戏创意卡片。

![Astrocade guided create](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/astrocade-guided-create-chrome.png)

游戏详情页支持直接试玩，并有分数、分享、评论、点赞、收藏、关注创作者等消费社区动作。

![Astrocade game playing](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/astrocade-game-playing-chrome.png)

创作者变现页明确给出门槛：总播放量 100K，至少发布 3 个游戏；并引导参与 Game Jam、Creator Community、Astro Academy。

![Astrocade earn](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/astrocade-earn-chrome.png)

### 核心功能判断

- **消费侧**：更像游戏版短内容 feed，核心不是单个大作，而是大量轻量互动内容的发现、试玩和连续消费。
- **创作侧**：通过自然语言、灵感按钮、题材选择、创意卡片来降低“从空白开始”的门槛。
- **社区侧**：每个游戏都有创作者主页、关注、评论、点赞、收藏、分享和分数体系。
- **变现侧**：已经把创作者播放量、发布量、Game Jam 和培训体系接上，明显在做 creator economy。

### 一句话定位

Astrocade 更像 “AI 生成游戏 + TikTok/Roblox 式分发 + 创作者经济” 的消费平台。

## Combos

### 截图

点击官网的 `Build your game` 后进入登录态 dashboard。核心首屏是 Boo 创建助手、模板卡片、prompt 输入框、平台选择、Plan 按钮和 Create game 按钮。

![Combos dashboard](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/combos-dashboard-chrome.png)

Discover 页强调社区游戏发现，顶部有 Likes、Plays、Remix 数据，推荐游戏有 `Play Now` 和 `Remix`。

![Combos discover](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/combos-discover-chrome.png)

游戏页展示 iframe 试玩区、作者、游戏说明、Remix、分享、点赞、播放数、评论等。

![Combos game play](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/combos-game-play-chrome.png)

Generator 页是素材生成器，支持 Image、数量选择、参考图、3D Model、Character、Items、Sprites、Scene、Game UI 等资产模板。点击 Character Design 后会自动填入一段示例 prompt，Generate asset 按钮变为可用。

![Combos generator](/Users/liulan/Desktop/work/ai-game-products-research/chrome-screenshots/combos-generator-character-chrome.png)

### 核心功能判断

- **创建侧**：更工具化，中心是 Boo prompt、模板、Plan、Create game、PC 平台选择和 credits。
- **模板侧**：有 Narrative Game、2D Platform、3D Platformer 等起步模板，适合从类型模板快速启动。
- **社区侧**：有 Discover、Play、Remix、Like、Comment、Plays，说明它不只是编辑器，也在做内容消费闭环。
- **资产侧**：内置游戏资产生成器，覆盖角色、3D、道具、精灵、场景、UI。
- **商业化侧**：侧边栏有 credits 和 Upgrade to Pro，当前更像订阅/credits 驱动的创作工具。

### 一句话定位

Combos 更像 “AI game agent + 游戏模板/素材生成 + 社区 Remix” 的创作工作台。

## 对比结论

- Astrocade 的第一重心是 **内容消费和创作者生态**：先让用户玩、刷、关注、互动，再引导创作和变现。
- Combos 的第一重心是 **创作工作台和资产/模板生产力**：先让用户用 Boo 和模板做游戏，再通过 Discover/Remix 承接社区分发。
- 如果看市场路线，Astrocade 更接近平台型路线；Combos 更接近工具型路线，但已经在往平台化补社区能力。
- 两者都没有把“AI 生成”单独作为终点，而是在做一个闭环：生成 -> 试玩 -> 发布 -> 发现 -> 互动/Remix -> 再创作。

## 本次点击记录

- Astrocade：打开首页、点击 `Create`、点击 `Inspire Me`、选择 `Fantasy worlds`、打开游戏卡片、点击 `Tap to play`、打开 `Earn`。
- Combos：打开官网、点击 `Build your game`、进入 dashboard、打开 `Discover`、打开社区游戏页、打开 `Generator`、点击 `Character Design` 模板。

