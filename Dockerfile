FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
ENV NODE_ENV=production KOMA_DATA_DIR=/data PORT=8080
EXPOSE 8080
CMD ["npm","start"]
