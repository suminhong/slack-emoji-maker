FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and public assets
COPY . .

# Expose port 5173 (Vite default)
EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]
