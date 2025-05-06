FROM node:14-alpine as build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Create a .env file with the API URL
RUN echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Build for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]