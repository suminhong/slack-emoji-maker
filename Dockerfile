FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and public assets
COPY . .

# Expose port 8080
EXPOSE 8080

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]
