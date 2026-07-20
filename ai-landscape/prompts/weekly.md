你正在执行 AI Landscape 周报。当前上海时间：{{NOW}}，报告日期：{{REPORT_DATE}}。

请研究上一完整自然周内全球及中国 AI 领域的新变化，并生成一份可直接写入 Notion 的中文 Markdown 周报。文风必须新闻化、客观、结论先行；说明发生了什么、相比上周改变了什么。不要写过程说明、关键词堆砌、空泛洞察、主观判断、炒作或预测。

硬性要求：
- 以文末提供的上一期周报为结构基线，保留其主章节顺序和格式。
- 每个主章节必须包含简短的“对比上周：”，说明新增、变化、下线、迁移或新分发情况。
- 第7节之后立即加入“本周最值得关注的方向”，只总结客观信号，不提供建议或预测。
- 删除“追踪渠道”“后续追踪清单”“备注”等模板化章节。
- 以“引用链接汇总（去重）”作为最后一个章节，列出周报引用的每个URL且只出现一次。
- 每个主要信息点结尾放1至2个完整可点击来源URL。优先一手原文；聚合站只用于发现，除非聚合站本身就是报道对象。
- 不得出现 cite turnXXsearchYY 等内部引用标记。

每周必须扫描：
1. 全球官方渠道：OpenAI（https://openai.com/news/、https://openai.com/index/）、Anthropic（https://www.anthropic.com/news）、Google/Gemini/DeepMind（https://blog.google/innovation-and-ai/technology/、https://deepmind.google/）、GitHub Changelog（https://github.blog/changelog/）、Vercel Changelog（https://vercel.com/changelog）。
2. 中国官方渠道：腾讯云、阿里云、百度/百度智能云/文心、火山引擎/字节、华为云，以及 DeepSeek、Kimi、智谱、MiniMax、零一万物、百川、阶跃星辰、商汤、通义千问等本周有实质更新的厂商。中国部分优先引用一手公告、博客、文档、发布说明和模型页。
3. smol.ai/AINews（https://news.smol.ai/）：总结本周实际发生的事件，不列关键词；若指向官方公告、论文、GitHub 发布或产品页，引用原始来源。
4. skills.sh（https://www.skills.sh/）：跟踪值得关注的新技能或热门技能，说明实际用途、所属生态和是否构成新的能力或分发界面。
5. GitHub：只以周榜 https://github.com/trending?since=weekly 为榜单来源，输出Top 10。每项包含排名、owner/repo、类别和基于仓库自身简介的1至2句说明；不得添加榜外仓库。总结Top 10主导类别并加入“对比上周：”。
6. Product Hunt：以对应ISO周的 Weekly Leaderboard 为主来源，输出Top 10。每项包含排名、名称、领域/类别及基于产品页说明与截图的1至2句介绍；总结Top 11至20的产品类型，并加入“对比上周：”。
7. 讨论与社区信号：只收录与本周模型、应用、agent、skill或产品变化有实质关系的信号，保持事实化和来源可追溯。

输出限制：只输出周报 Markdown 正文，不要代码围栏，不要额外说明。页面标题为“AI Landscape Report - {{REPORT_DATE}}”。

以下是上一期周报正文，用于结构和周度对比；不要照抄旧闻：

--- 上一期周报开始 ---
{{PREVIOUS_REPORT}}
--- 上一期周报结束 ---
