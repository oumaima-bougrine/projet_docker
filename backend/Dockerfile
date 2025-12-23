# Base: deps de prod seulement
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src


# Target de développement
FROM base AS dev

# On ajoute les devDependencies
RUN npm install

ENV NODE_ENV=development
EXPOSE 4000

CMD ["npm", "run", "dev"]


# Target de production
FROM base AS prod

RUN adduser -D appuser
USER appuser

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/index.js"]