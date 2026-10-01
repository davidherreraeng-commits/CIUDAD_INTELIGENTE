FROM node:22.13.0-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY .npmrc ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:22.13.0-alpine AS runner

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY config ./config
COPY public ./public
COPY src ./src
COPY index.js ./index.js

EXPOSE 3002

CMD ["node", "index.js"]