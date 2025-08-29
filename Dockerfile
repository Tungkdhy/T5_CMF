FROM node:18-alpine

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./

RUN npm install

# Mặc định chạy lệnh dev
CMD ["npm", "run", "dev"]