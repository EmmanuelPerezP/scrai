# syntax=docker/dockerfile:1
# Build context is the repo root (see docker-compose.yml / CI).

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---- deps: install workspace deps with the lockfile ----
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/api-client/package.json packages/api-client/package.json
RUN pnpm install --frozen-lockfile || pnpm install

# ---- build ----
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
RUN pnpm --filter @scrai/backend build
# Keep only production deps for the runtime image.
# --legacy: pnpm v10 requires it (or inject-workspace-packages) for `deploy`;
# the backend has no workspace deps to inject, so legacy behaviour is correct.
RUN pnpm --filter @scrai/backend deploy --prod --legacy /app

# ---- runtime ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /repo/apps/backend/dist ./dist
COPY --from=build /repo/apps/backend/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/main.js"]
