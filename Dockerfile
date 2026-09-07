# Use official Node.js runtime as parent image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifest files
COPY package*.json ./

# Install production and build dependencies
RUN npm ci

# Copy full application code
COPY . .

# Build Vite frontend assets for production
RUN npm run build

# Expose server port (default 3001)
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Command to start the full-stack server
CMD ["npm", "start"]
