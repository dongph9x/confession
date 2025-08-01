# 🐳 Docker Setup Guide

Hướng dẫn chi tiết để chạy Confession Bot với Docker.

## 📋 Yêu cầu

- Docker và Docker Compose đã được cài đặt
- Discord Bot Token
- MongoDB (sẽ được cài đặt tự động)

## 🚀 Quick Start

### 1. Cấu hình Environment

Tạo file `.env` từ file `env.example`:

```bash
cp env.example .env
```

Chỉnh sửa file `.env`:

```env
# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here

# MongoDB Configuration
MONGO_USERNAME=admin
MONGO_PASSWORD=password123
MONGO_DATABASE=confession_bot
MONGO_PORT=27017
MONGODB_URI=mongodb://admin:password123@localhost:27017/confession_bot?authSource=admin

# Lavalink Music Server (Optional)
LAVALINK_URL=localhost:2333
LAVALINK_AUTH=youshallnotpass
LAVALINK_PORT=2333

# Environment
NODE_ENV=production
```

### 2. Chạy với Script

```bash
chmod +x docker-run.sh
./docker-run.sh
```

### 3. Chạy thủ công

**Chỉ chạy bot với MongoDB:**
```bash
docker compose up -d mongodb bot
```

**Chạy bot với MongoDB và Lavalink (music):**
```bash
docker compose --profile music up -d
```

## 📊 Quản lý Services

### Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Chỉ bot
docker-compose logs -f bot

# Chỉ MongoDB
docker-compose logs -f mongodb

# Chỉ Lavalink
docker-compose logs -f lavalink
```

### Dừng services
```bash
docker-compose down
```

### Restart service
```bash
docker-compose restart bot
```

### Xem status
```bash
docker-compose ps
```

## 🔧 Troubleshooting

### 1. Bot không kết nối được MongoDB

Kiểm tra logs:
```bash
docker-compose logs bot
```

Đảm bảo MongoDB đã sẵn sàng:
```bash
docker-compose logs mongodb
```

### 2. Bot không hoạt động

Kiểm tra environment variables:
```bash
docker-compose exec bot env | grep BOT_TOKEN
```

### 3. Music không hoạt động

Kiểm tra Lavalink:
```bash
docker-compose logs lavalink
```

Đảm bảo Lavalink đã khởi động:
```bash
docker-compose ps lavalink
```

## 🗄️ Database Management

### Backup MongoDB
```bash
docker-compose exec mongodb mongodump --out /data/backup
docker cp confession-mongodb:/data/backup ./backup
```

### Restore MongoDB
```bash
docker cp ./backup confession-mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

### Xóa database
```bash
docker-compose down -v
```

## 🔄 Development

### Build lại image
```bash
docker-compose build --no-cache
```

### Vào container
```bash
docker-compose exec bot sh
```

### Xem logs real-time
```bash
docker-compose logs -f --tail=100
```

## 📁 File Structure

```
confession/
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Services orchestration
├── .dockerignore          # Files to exclude from build
├── docker-run.sh          # Convenience script
├── lavalink-config.yml    # Lavalink configuration
├── env.example           # Environment variables template
└── src/                  # Bot source code
```

## 🔐 Security

### MongoDB Authentication
- Username: `${MONGO_USERNAME:-admin}`
- Password: `${MONGO_PASSWORD:-password123}`
- Database: `${MONGO_DATABASE:-confession_bot}`
- Port: `${MONGO_PORT:-27017}`

### Network Isolation
- Services chạy trong network `confession-network`
- MongoDB chỉ accessible từ bot container
- Ports exposed: `${MONGO_PORT:-27017}` (MongoDB), `${LAVALINK_PORT:-2333}` (Lavalink)

## 📈 Monitoring

### Health Checks
- MongoDB: Kiểm tra kết nối database
- Bot: Kiểm tra process hoạt động
- Lavalink: Kiểm tra music server

### Logs
- Bot logs: `./logs/`
- Lavalink logs: `./logs/` (trong container)

## 🚨 Important Notes

1. **Backup Data**: Luôn backup MongoDB data trước khi update
2. **Environment Variables**: Không commit file `.env` vào git
3. **Ports**: Đảm bảo ports 27017 và 2333 không bị conflict
4. **Memory**: MongoDB cần ít nhất 512MB RAM
5. **Storage**: MongoDB data được lưu trong Docker volume

## 🆘 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker-compose logs`
2. Restart services: `docker-compose restart`
3. Rebuild: `docker-compose build --no-cache`
4. Clean start: `docker-compose down -v && docker-compose up -d` 