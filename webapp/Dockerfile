FROM mcr.microsoft.com/playwright/python:v1.59.0-jammy

ENV CI=true

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && corepack enable \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN python -m pip install -U pip \
  && python -m pip install -r /app/requirements.txt

COPY webapp /app/webapp
COPY xhs_scraper /app/xhs_scraper
COPY README.md /app/README.md

WORKDIR /app/webapp
RUN pnpm install --frozen-lockfile \
  && pnpm run build

ENV PORT=3001
ENV DATA_DIR=/data
ENV XHS_USER_DATA_DIR=/data/profile
ENV XHS_ALLOW_HEADED_LOGIN=0

EXPOSE 3001

CMD ["pnpm","run","server:start"]
