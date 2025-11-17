FROM node:20.14.0-slim AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM deps AS build
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public public
COPY src src
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
