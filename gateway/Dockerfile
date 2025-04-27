FROM node:22.14.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g @nestjs/cli

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "sh", "run.sh" ]