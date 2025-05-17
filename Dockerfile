From node:20 as base
From base as development

Workdir /app

copy package.json ./
ARG NODE_ENV
Run npm install 

copy . .
Expose 4000
CMD ["npm", "run" ,"start-dev"]


From base as production

Workdir /app

copy package.json ./
ARG NODE_ENV
Run npm install --production

copy . .
Expose 4000
CMD ["npm" ,"start"]