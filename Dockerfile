# ============================
#  Etapa 1: Build de Angular
# ============================
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependencias y hacer build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# ============================
#  Etapa 2: Servir con Nginx
# ============================
FROM nginx:alpine AS runtime    
WORKDIR /usr/share/nginx/html

# 👇 Aquí es donde va la línea que preguntas
RUN apk add --no-cache jq

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar build Angular
COPY --from=build /app/dist/avalink/browser/ /usr/share/nginx/html/

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto que usa Railway
EXPOSE 8080

# Reemplazar config.json antes de iniciar Nginx
# Reemplazar config.json antes de iniciar Nginx
CMD sh -c '\
  CONFIG_FILE="/usr/share/nginx/html/config.json"; \
  TMP_FILE="/tmp/config.tmp"; \
  cp "$CONFIG_FILE" "$TMP_FILE"; \
  if [ -n "$API_URL" ]; then \
    echo "🔧 Reemplazando urlApi..."; \
    jq --arg v "$API_URL" ".urlApi = \$v" "$TMP_FILE" > "$TMP_FILE.1" && mv "$TMP_FILE.1" "$TMP_FILE"; \
  else \
    echo "⚠️ API_URL no definida"; \
  fi; \
  if [ -n "$API_KEY" ]; then \
    echo "🔧 Reemplazando apiKey..."; \
    jq --arg v "$API_KEY" ".apiKey = \$v" "$TMP_FILE" > "$TMP_FILE.1" && mv "$TMP_FILE.1" "$TMP_FILE"; \
  else \
    echo "⚠️ API_KEY no definida"; \
  fi; \
  if [ -n "$TURNSTILE_SITE_KEY" ]; then \
    echo "🔧 Reemplazando turnstileSiteKey..."; \
    jq --arg v "$TURNSTILE_SITE_KEY" ".turnstileSiteKey = \$v" "$TMP_FILE" > "$TMP_FILE.1" && mv "$TMP_FILE.1" "$TMP_FILE"; \
  else \
    echo "⚠️ TURNSTILE_SITE_KEY no definida"; \
  fi; \
  mv "$TMP_FILE" "$CONFIG_FILE"; \
  nginx -g "daemon off;"'

