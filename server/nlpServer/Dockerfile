FROM wombat7/openjdk-node-docker

COPY . .
RUN npm install -g node-gyp
RUN npm install
EXPOSE 3000
WORKDIR /

CMD npm run server