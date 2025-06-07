FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
CMD ["node", "server.js"] # ou app.js, ou server.js, o que for seu arquivo principal
