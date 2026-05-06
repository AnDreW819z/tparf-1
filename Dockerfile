# Frontend Dockerfile для TPARF
# Multi-stage build для оптимизации размера образа

# ██████╗ ██╗   ██╗██╗     ███████╗███╗   ███╗██╗ ██████╗███████╗
# ██╔══██╗██║   ██║██║     ██╔════╝████╗ ████║██║██╔════╝██╔════╝
# ██████╔╝██║   ██║██║     █████╗  ██╔████╔██║██║██║     ███████╗
# ██╔══██╗██║   ██║██║     ██╔══╝  ██║╚██╔╝██║██║██║     ╚════██║
# ██████╔╝╚██████╔╝███████╗███████╗██║ ╚═╝ ██║██║╚██████╗███████║
# ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝ ╚═════╝╚══════╝

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем ВСЕ зависимости (включая dev для сборки)
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем зависимости из предыдущей стадии
COPY --from=deps /app/node_modules ./node_modules
# Копируем все файлы проекта
COPY . .

# Переменные окружения для сборки
# NEXT_PUBLIC_* переменные вшиваются в bundle на этапе сборки
ARG NEXT_PUBLIC_API_BASE_URL=/api/
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Собираем проект
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

# Создаём пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Устанавливаем владельца
RUN chown -R nextjs:nodejs /app

# Переключаемся на пользователя без root-прав
USER nextjs

# Открываем порт Next.js
EXPOSE 3000

# Переменные окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Запускаем сервер
CMD ["node", "server.js"]

# ██████╗ ██╗   ██╗██╗     ███████╗
# ██╔══██╗██║   ██║██║     ██╔════╝
# ██████╔╝██║   ██║██║     █████╗  
# ██╔══██╗██║   ██║██║     ██╔══╝  
# ██████╔╝╚██████╔╝███████╗███████╗
# ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
