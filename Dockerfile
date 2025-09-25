# Stage 2 Builder
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

# RUN pnpm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile --store-dir .pnpm-store

COPY . .

RUN pnpm prisma generate

RUN pnpm build

# Stage 2 Runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml* ./

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]