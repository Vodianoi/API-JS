FROM node:21.7.3-alpine3.18
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .