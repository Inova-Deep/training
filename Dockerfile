# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests first — leverages Docker layer cache
# so npm ci only re-runs when package*.json changes
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx virtual host
RUN rm /etc/nginx/conf.d/default.conf

# Inject our SPA-aware nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
