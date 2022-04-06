FROM node
WORKDIR /usr/src/app

COPY package.json ./
#COPY package-lock.json ./
COPY ./ ./

#Overwrite the environment variables with the docker specific ones
COPY ./DockerOnly-EnvVariables.js ./src/environment-variables.js

RUN npm ci 

CMD ["npm", "run", "start"]