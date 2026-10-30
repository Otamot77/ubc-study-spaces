# Build the mobile React frontend once. The running container has no npm install step.
FROM node:24-alpine AS frontend
WORKDIR /build/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# One origin serves both static frontend and /api, so GPS is available over HTTPS
# once the hosting provider attaches its TLS domain.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    STATIC_DIR=/app/public

COPY server/package.json /app/server/package.json
COPY server/src/ /app/server/src/
COPY --from=frontend /build/web/dist/ /app/public/

EXPOSE 8787
CMD ["node", "server/src/server.js"]
