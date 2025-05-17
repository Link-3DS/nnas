FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY .env .env

COPY . .

CMD ["node", "index.js"]