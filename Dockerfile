FROM node:22-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/database.sqlite

CMD ["npm", "start"]
