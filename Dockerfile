# Use official Node.js image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy rest of the code
COPY . .

# Expose your backend port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]