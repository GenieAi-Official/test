# AI Landscape weekly cloud automation

GitHub Actions runs the weekly AI Landscape report without relying on a local Mac. The schedule uses UTC because GitHub cron expressions are UTC.

## Schedules

- Weekly report: Mondays at 09:00 Asia/Shanghai (`01:00 UTC`).
- The workflow also supports manual `workflow_dispatch` runs for validation.
- Scheduled runs are enabled when this workflow is present on the repository default branch. Missing secrets fail the run explicitly instead of silently skipping it.

## Required GitHub Actions secrets

- `OPENAI_API_KEY`: OpenAI Platform API key. A ChatGPT subscription does not provide this key.
- `NOTION_API_KEY`: required by the weekly report. The Notion integration must have read and insert-content access to the parent page.
- `NOTION_PARENT_PAGE_ID`: required by the weekly report. For the current workflow this is the ID of `大模型/agent学习记录`.

Optional repository variables:

- `WEEKLY_OPENAI_MODEL`: defaults to `gpt-5.5`.

Never commit credentials to this public repository. Configure them under **Settings → Secrets and variables → Actions**.

## Local validation

```bash
python -m unittest discover -s ai-landscape/tests -v
python -m compileall -q ai-landscape
```

Live execution requires the corresponding environment variables:

```bash
OPENAI_API_KEY=... NOTION_API_KEY=... NOTION_PARENT_PAGE_ID=... \
  python ai-landscape/run.py weekly
```
