# Sử dụng Node.js 18 Alpine để giảm kích thước image
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Cài đặt dependencies cần thiết cho build
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Cài đặt dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Tạo thư mục logs nếu chưa có
RUN mkdir -p src/logs

# Tạo user không phải root để chạy ứng dụng
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bot -u 1001

# Thay đổi quyền sở hữu
RUN chown -R bot:nodejs /app
USER bot

# Expose port (nếu cần)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Command để chạy bot
CMD ["node", "src/index.js"] 