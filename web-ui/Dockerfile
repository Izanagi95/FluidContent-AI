FROM node:18-bullseye AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm install
RUN npm run build

# stage finale
FROM node:18-bullseye

WORKDIR /app

# Installiamo un server statico (serve)
RUN npm install -g serve

# Copiamo solo la build
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
