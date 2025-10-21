# Frontend Dockerfile (build + nginx static server)
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Usar npm install pois não temos package-lock.json
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine AS runner
# Basic SPA config: serve index.html for all routes
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
