FROM node:14.17-alpine as production_build

RUN mkdir code
WORKDIR /code

COPY package.json package-lock.json ./

RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

FROM production_build as dev_build

CMD ["npm", "run", "start:dev"]

COPY . .

FROM production_build as test_build

CMD ["npm", "run", "test"]

COPY . .

# return main image
FROM production_build

COPY . .

RUN npm run build
