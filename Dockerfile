FROM node:8-alpine

LABEL description="Docker file for organizations app"

RUN mkdir -p /var/www/logs/
RUN mkdir -p /logs/
RUN mkdir -p /usr/src/
WORKDIR /usr/src/

ADD package.json /usr/src/package.json
RUN npm install --production


COPY . .

CMD ["node", "index.js"]


