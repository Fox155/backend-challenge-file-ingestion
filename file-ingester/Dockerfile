# Builder
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# App
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /usr/src/app/dist ./dist

# Copia el directorio 'challenge' que contiene el archivo de datos de entrada.
COPY ./challenge ./challenge

EXPOSE 3000

CMD ["node", "dist/main.js"]