FROM node:16.20
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y --no-install-recommends git 
RUN git clone https://github.com/KidBrightAI/kidbright_MAI_ide 
RUN cp -rf ./kidbright_MAI_ide/*  .
RUN rm -rf ./kidbright_MAI_ide
RUN npm install 
#RUN npm run build
CMD ["npm", "run", "dev"]
