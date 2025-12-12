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
CMD sh -c '\
  nginx -g "daemon off;"'
