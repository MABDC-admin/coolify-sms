FROM oven/bun:1.3.8-alpine AS deps
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN bun run build

FROM oven/bun:1.3.8-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/database ./database
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src ./src
EXPOSE 3000
CMD ["bun", "dist/server/server.js"]
