# node:22：仓库锁定的 pnpm@11.1.2 在 node 20 上会报 ERR_UNKNOWN_BUILTIN_MODULE。
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate
WORKDIR /app

# ── install deps ──────────────────────────────────────────────────────────────
# 复制所有 workspace 的 manifest（--frozen-lockfile 需校验全部成员）。
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/render/package.json apps/render/
COPY packages/scenes/package.json packages/scenes/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN pnpm --filter @auto/web build

# ── serve with nginx ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
