FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies without any extra configuration
RUN npm install --production

# Copy application source
COPY . .

# Set production mode
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Default port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
