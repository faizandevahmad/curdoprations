FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libstdc++
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/app/data
EXPOSE 4000
CMD ["node", "src/index.js"]
