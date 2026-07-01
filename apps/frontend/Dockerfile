# syntax=docker/dockerfile:1
# Build context is the repo root. Requires the generated API client to exist
# (run `pnpm generate:api` first); its sources are compiled into the bundle.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/api-client/package.json packages/api-client/package.json
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS build
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
# pnpm keeps each package's bins in its own node_modules/.bin (e.g. `next`,
# `tsc`), so copy the per-package node_modules too — not just the root.
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /repo/packages/api-client/node_modules ./packages/api-client/node_modules
COPY . .
RUN pnpm --filter @scrai/api-client build \
 && pnpm --filter @scrai/frontend build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# Next.js standalone output preserves the monorepo layout.
COPY --from=build /repo/apps/frontend/.next/standalone ./
COPY --from=build /repo/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /repo/apps/frontend/public ./apps/frontend/public
EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
