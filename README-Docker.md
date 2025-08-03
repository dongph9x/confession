# Docker Setup Guide

This guide will help you set up and run the Confession Bot using Docker and Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Discord Bot Token and Client ID

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit the `.env` file with your Discord bot credentials:

```env
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
MONGODB_URI=mongodb://admin:password@mongodb:27017/confession_bot?authSource=admin
```

### 2. Build and Run

Start all services:

```bash
# Start bot and MongoDB only
docker-compose up -d

# Start with music server (Lavalink)
docker-compose --profile music up -d
```

### 3. Check Status

```bash
docker-compose ps
```

### 4. View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f discord-bot
docker-compose logs -f mongodb
```

## Services

### Discord Bot
- **Container**: `confession-bot`
- **Port**: None (internal only)
- **Dependencies**: MongoDB

### MongoDB
- **Container**: `confession-mongodb`
- **Port**: 27017
- **Data**: Persistent volume `mongodb_data`



## Commands

### Start Services
```bash
# Start all services
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Rebuild and Start
```bash
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f discord-bot
```

### Access MongoDB
```bash
# Connect to MongoDB container
docker exec -it confession-mongodb mongosh

# Or connect from host
mongosh mongodb://admin:password@localhost:27017/confession_bot?authSource=admin
```

### Backup Database
```bash
# Create backup
docker exec confession-mongodb mongodump --out /data/backup

# Copy backup to host
docker cp confession-mongodb:/data/backup ./backup
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Discord Bot Token | Yes |
| `CLIENT_ID` | Discord Client ID | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |

| `NODE_ENV` | Node environment | No |
| `LOG_LEVEL` | Logging level | No |

## Troubleshooting

### Bot not connecting
1. Check if `.env` file exists and has correct `BOT_TOKEN`
2. Verify bot has proper permissions
3. Check logs: `docker-compose logs discord-bot`

### MongoDB connection issues
1. Ensure MongoDB container is running: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in `.env`

### General issues
If you encounter any issues:

1. Rebuild the image: `docker-compose up -d --build`
2. Check logs: `docker-compose logs discord-bot`

### Permission issues
If you encounter permission issues with logs or data directories:

```bash
# Fix permissions
sudo chown -R $USER:$USER ./logs
```

## Development

For development, you can mount the source code:

```yaml
# In docker-compose.yml, add to discord-bot service:
volumes:
  - ./src:/app/src
  - ./logs:/app/logs
```

This allows you to make changes to the code without rebuilding the container.

## Production Deployment

For production deployment:

1. Use a proper `.env` file with production values
2. Consider using Docker secrets for sensitive data
3. Set up proper logging and monitoring
4. Use a reverse proxy if needed
5. Set up automated backups for MongoDB data

## Cleanup

To completely remove all containers and data:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
``` 