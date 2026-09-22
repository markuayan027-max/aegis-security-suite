# ─────────────────────────────────────────────────────────────────────────────
# Created: 2026-09-16 | Purpose: Production 24/7 Cloud Container for E-Secure 1.0
# Last verified with: Docker 27.0+ / Node.js 22-alpine
# Target: Google Cloud Run / Google Cloud SQL (PostgreSQL 16+)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS runner

WORKDIR /app

# Non-root security user
RUN addgroup -S E-Securegroup && adduser -S E-Secureuser -G E-Securegroup

# Copy application files
COPY --chown=E-Secureuser:E-Securegroup package.json server.js index.html style.css app.js offline-dispatch.html ./
COPY --chown=E-Secureuser:E-Securegroup data ./data
COPY --chown=E-Secureuser:E-Securegroup src ./src

USER E-Secureuser

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Healthcheck for Cloud Run & Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {if (r.statusCode !== 200) process.exit(1)})"

CMD ["node", "server.js"]
