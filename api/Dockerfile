FROM node:20.14.0-slim AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM deps AS build
COPY tsconfig.json tsconfig.json
COPY prisma prisma
RUN npx prisma generate
COPY src src
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/enwords?schema=public"
RUN npm run build
RUN npm prune --omit=dev

FROM node:20.14.0-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY prisma prisma
EXPOSE 8787
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
