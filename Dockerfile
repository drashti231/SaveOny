# --- Build stage ---
FROM node:22-slim AS builder

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace config files first for better layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files for dependency resolution
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY lib/integrations/openai_ai_integrations/package.json ./lib/integrations/openai_ai_integrations/
COPY lib/integrations-openai-ai-server/package.json ./lib/integrations-openai-ai-server/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY artifacts/api-server ./artifacts/api-server
COPY lib/api-zod ./lib/api-zod
COPY lib/db ./lib/db
COPY lib/integrations ./lib/integrations
COPY lib/integrations-openai-ai-server ./lib/integrations-openai-ai-server

# Build the API server
RUN pnpm --filter @workspace/api-server run build

# --- Production stage ---
FROM node:22-slim AS runner

RUN npm install -g pnpm@10

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY lib/integrations/openai_ai_integrations/package.json ./lib/integrations/openai_ai_integrations/
COPY lib/integrations-openai-ai-server/package.json ./lib/integrations-openai-ai-server/

RUN pnpm install --frozen-lockfile --prod

# Copy built output from builder stage
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

EXPOSE 3000

ENV PORT=3000

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
