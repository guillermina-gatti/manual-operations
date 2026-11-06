FROM node:20-alpine

# openssl: required by Prisma on Alpine
RUN apk add --no-cache openssl && corepack enable

WORKDIR /repo
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

ENV NODE_ENV=production
EXPOSE 3001
# start:prod runs the migrations before starting the API
CMD ["pnpm", "--filter", "api", "start:prod"]