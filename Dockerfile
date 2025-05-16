From node:20 

Workdir /app

copy package.json ./
Run npm install
copy . .
Expose 4000
CMD ["npm", "run" ,"start-dev"]