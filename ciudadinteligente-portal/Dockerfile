FROM node:22.13.0-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY .npmrc ./
RUN npm ci --ignore-scripts

FROM node:22.13.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_URL_API
ARG VITE_PATH

ENV VITE_URL_API=${VITE_URL_API}
ENV VITE_PATH=${VITE_PATH}

RUN npm run build

FROM nginx:1.27-alpine AS runner

WORKDIR /usr/share/nginx/html

ARG BRANCH

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/portal \
    /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/run \
    /var/log/nginx
RUN chmod -R 775 /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx
RUN chgrp -R 0 /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

COPY nginx.${BRANCH}.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/dist/ /usr/share/nginx/html/portal/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
