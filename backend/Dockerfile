# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
# Usar npm install para não exigir package-lock.json; omitir dev deps em produção
RUN npm install --omit=dev

COPY src ./src

ENV PORT=5001
EXPOSE 5001
CMD ["node", "src/server.js"]
