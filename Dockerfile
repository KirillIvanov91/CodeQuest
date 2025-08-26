# Simple Node image
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --production
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]
