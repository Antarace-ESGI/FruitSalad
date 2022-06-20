FROM node:18-alpine AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM nginx AS runner
WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./static /usr/share/nginx/html/static

EXPOSE 80