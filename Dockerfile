FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

COPY prisma ./prisma

RUN npm install --include=optional

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx svelte-kit sync

RUN npx prisma generate

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]