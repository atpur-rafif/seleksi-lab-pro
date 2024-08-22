FROM node:22
WORKDIR /app
COPY . .
RUN npm i
RUN node build.mjs
CMD ["node", "dist.js"]
