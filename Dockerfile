FROM node

LABEL maintainer="jonas@sliplane.io"

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm install

COPY . .

RUN npx tsc

CMD ["node", "dist/app.js"]

EXPOSE 3000