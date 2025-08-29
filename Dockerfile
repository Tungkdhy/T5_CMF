FROM node:18-alpine

WORKDIR /app

# Cài đặt pnpm (global)
RUN npm install -g pnpm

# Copy package.json + pnpm-lock.yaml (nếu có)
COPY package.json pnpm-lock.yaml* ./

# Cài dependencies
RUN pnpm install

# Copy toàn bộ source code
COPY . .

# Mặc định chạy dev
CMD ["pnpm", "dev"]