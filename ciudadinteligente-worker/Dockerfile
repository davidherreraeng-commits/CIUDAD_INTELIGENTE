FROM node:22.13.0-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:22.13.0-alpine AS runner

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY src ./src

CMD ["node", "src/index.js"]