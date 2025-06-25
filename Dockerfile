FROM node:20

WORKDIR /server

ENV PATH /server/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./

RUN npm install --silent

RUN npm install jest -g --silent

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
