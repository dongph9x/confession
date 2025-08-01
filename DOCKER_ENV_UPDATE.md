# 🐳 Docker Environment Variables Update

## 📋 Tổng quan

Đã cập nhật Docker configuration để sử dụng environment variables từ file `.env` thay vì hardcode values.

## 🔄 Những thay đổi chính

### 1. **docker-compose.yml**

#### MongoDB Service
```yaml
# Trước
environment:
  MONGO_INITDB_ROOT_USERNAME: admin
  MONGO_INITDB_ROOT_PASSWORD: password123
  MONGO_INITDB_DATABASE: confession_bot
ports:
  - "27017:27017"

# Sau
environment:
  MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME:-admin}
  MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-password123}
  MONGO_INITDB_DATABASE: ${MONGO_DATABASE:-confession_bot}
ports:
  - "${MONGO_PORT:-27017}:27017"
```

#### Bot Service
```yaml
# Trước
environment:
  - NODE_ENV=production
  - BOT_TOKEN=${BOT_TOKEN}
  - MONGODB_URI=mongodb://admin:password123@mongodb:27017/confession_bot?authSource=admin

# Sau
environment:
  - NODE_ENV=${NODE_ENV:-production}
  - BOT_TOKEN=${BOT_TOKEN}
  - CLIENT_ID=${CLIENT_ID}
  - MONGODB_URI=mongodb://${MONGO_USERNAME:-admin}:${MONGO_PASSWORD:-password123}@mongodb:27017/${MONGO_DATABASE:-confession_bot}?authSource=admin
```

#### Lavalink Service
```yaml
# Trước
environment:
  - SERVER_PORT=2333
  - LAVALINK_SERVER_PASSWORD=youshallnotpass
ports:
  - "2333:2333"

# Sau
environment:
  - SERVER_PORT=${LAVALINK_PORT:-2333}
  - LAVALINK_SERVER_PASSWORD=${LAVALINK_AUTH:-youshallnotpass}
ports:
  - "${LAVALINK_PORT:-2333}:2333"
```

### 2. **Environment Variables**

#### Required Variables
- `BOT_TOKEN`: Discord bot token
- `CLIENT_ID`: Discord application client ID

#### Optional Variables (with defaults)
- `NODE_ENV`: Environment (default: production)
- `MONGO_USERNAME`: MongoDB username (default: admin)
- `MONGO_PASSWORD`: MongoDB password (default: password123)
- `MONGO_DATABASE`: MongoDB database name (default: confession_bot)
- `MONGO_PORT`: MongoDB port (default: 27017)
- `MONGODB_URI`: MongoDB connection string
- `LAVALINK_URL`: Lavalink server URL (default: localhost:2333)
- `LAVALINK_AUTH`: Lavalink password (default: youshallnotpass)
- `LAVALINK_PORT`: Lavalink port (default: 2333)

### 3. **New Scripts**

#### `validate-env.js`
- ✅ Validates all environment variables
- ✅ Checks format of critical variables
- ✅ Provides helpful error messages
- ✅ Shows Docker commands

#### `setup-env.js`
- ✅ Creates `.env` file from template
- ✅ Handles existing `.env` files
- ✅ Interactive confirmation for overwrite

#### Updated `docker-run.sh`
- ✅ Uses validation script
- ✅ Better error handling
- ✅ Automatic `.env` creation

## 🚀 Cách sử dụng

### 1. Setup Environment
```bash
# Tạo file .env từ template
node setup-env.js

# Hoặc copy từ example
cp env.example .env
```

### 2. Edit .env File
```env
# Discord Bot Configuration
BOT_TOKEN=your_actual_bot_token_here
CLIENT_ID=your_actual_client_id_here

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

### 3. Validate Configuration
```bash
# Validate environment variables
node validate-env.js
```

### 4. Run with Docker
```bash
# Run with script
./docker-run.sh

# Or manually
docker compose up -d mongodb bot
```

## 🔧 Benefits

### ✅ Flexibility
- Có thể thay đổi cấu hình mà không cần edit docker-compose.yml
- Hỗ trợ nhiều environment khác nhau (dev, staging, prod)

### ✅ Security
- Không hardcode sensitive information
- Environment variables được quản lý tập trung

### ✅ Maintainability
- Dễ dàng update cấu hình
- Consistent across different deployments

### ✅ Validation
- Automatic validation of environment variables
- Clear error messages for missing/invalid values

## 📊 Example Configurations

### Development
```env
NODE_ENV=development
MONGO_PORT=27018
LAVALINK_PORT=2334
```

### Production
```env
NODE_ENV=production
MONGO_USERNAME=prod_user
MONGO_PASSWORD=secure_password
MONGO_DATABASE=confession_prod
```

### Custom MongoDB
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/confession_bot
```

## 🔍 Troubleshooting

### Common Issues

#### Missing CLIENT_ID
```bash
# Error: CLIENT_ID: Missing
# Solution: Add CLIENT_ID to .env file
CLIENT_ID=your_discord_application_client_id
```

#### Invalid BOT_TOKEN
```bash
# Error: BOT_TOKEN: Too short
# Solution: Use full bot token from Discord Developer Portal
BOT_TOKEN=MTM2MjIzMjQzOTI3NjUyMDE5Mi5Hc2V1Lk1hZ2lja2V5Lm1hZ2lja2V5
```

#### Port Conflicts
```bash
# Error: Port already in use
# Solution: Change ports in .env
MONGO_PORT=27018
LAVALINK_PORT=2334
```

### Debug Commands
```bash
# Check environment variables
node validate-env.js

# View Docker logs
docker compose logs -f bot

# Check container environment
docker compose exec bot env

# Restart services
docker compose restart
```

## 📚 Related Files

- `docker-compose.yml`: Updated with environment variables
- `env.example`: Template for environment variables
- `validate-env.js`: Environment validation script
- `setup-env.js`: Environment setup script
- `docker-run.sh`: Updated Docker management script
- `DOCKER_GUIDE.md`: Updated Docker documentation

---

**Note**: Tất cả environment variables giờ đây được lấy từ file `.env` với fallback values cho optional variables. 