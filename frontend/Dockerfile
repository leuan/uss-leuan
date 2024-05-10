FROM node:22-alpine3.19 AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --production

FROM nginx:1.25.5-alpine3.19
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=builder /app/build .
COPY --from=builder /app/static ./static

COPY ./default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
