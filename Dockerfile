# ========================================================
# Dockerfile para NestJS - Gestor 67 CRUD Web
# Optimizado con Multi-stage Build para Producción
# ========================================================

# Etapa 1: Compilación de TypeScript
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Imagen final liviana de ejecución
FROM node:20-slim AS runner

WORKDIR /app
    
ENV NODE_ENV=production
ENV PORT=3000

# Instalar únicamente dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar archivos compilados y frontend estático
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Crear usuario sin privilegios por seguridad
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
