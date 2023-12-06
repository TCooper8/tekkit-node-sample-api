FROM node:18-alpine as build
WORKDIR /app

COPY *.json ./
RUN npm ci
COPY src src
RUN npm run build
RUN npm ci --production 



FROM node:18-alpine as tests
WORKDIR /app

COPY *.json ./
RUN npm ci
COPY src src
CMD npm test


# Production image.
FROM node:18-alpine
WORKDIR /app

COPY package.json package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build /app/

CMD node index.js