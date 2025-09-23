FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Add build argument for API URL
ARG VITE_BASE_API_URL
ENV VITE_BACKEND_URL=$VITE_BASE_API_URL

# Build the application
RUN npm run build

# Production stage

# Copy nginx configuration if you have any custom config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5173

# Start nginx
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]