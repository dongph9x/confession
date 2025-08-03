# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install basic dependencies
RUN apk add --no-cache \
    ca-certificates \
    ttf-freefont

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port (if needed for health checks)
EXPOSE 3000

# Set the default command
CMD ["npm", "start"] 