#ligth image node
FROM node:20-alpine

WORKDIR /usr/src/app

#copy dependecy files
COPY package*.json ./

#install dependecies

RUN npm i

COPY . .

#Expose port Nestjs
EXPOSE 3000

CMD ["npm","run","start:dev"]


