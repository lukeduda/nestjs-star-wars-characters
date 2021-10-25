# Star Wars Characters API

REST API based on Nest.js and MongoDB, with unit and e2e test suites.

For now only simplified environments are specified:
- development (docker-compose based)
- test (npm run based)

## Easiest startup
```bash
docker-compose up --build
```

### API Starting endpoint 
http://localhost:3000/characters

### Open API docs
http://localhost:3000/api/

### Example GET /characters request
```json
[
    {
        "_id": "6176ef3bb1f69e500ca7daf8",
        "episodes": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
        ],
        "name": "Luke Skywalker",
        "__v": 0
    },
    {
        "_id": "6176ef41b1f69e500ca7dafa",
        "episodes": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
        ],
        "name": "Darth Vader",
        "__v": 0
    },
    {
        "_id": "6176ef46b1f69e500ca7dafc",
        "episodes": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
        ],
        "name": "Han Solo",
        "__v": 0
    },
    {
        "_id": "6176ef4ab1f69e500ca7dafe",
        "planet": "Alderaan",
        "episodes": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
        ],
        "name": "Leia Organa",
        "__v": 0
    },
    {
        "_id": "6176ef4eb1f69e500ca7db00",
        "episodes": [
            "NEWHOPE"
        ],
        "name": "Wilhuff Tarkin",
        "__v": 0
    },
    {
        "_id": "6176ef53b1f69e500ca7db02",
        "episodes": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
        ],
        "name": "C-3PO",
        "__v": 0
    },
    {
        "_id": "6176ef57b1f69e500ca7db04",
        "episodes": [
            "NEWHOPE",
            "EMPIRE",
            "JEDI"
        ],
        "name": "R2-D2",
        "__v": 0
    }
]
```

## Unit Testing
**Optional** - remove existing node_modules bound to the docker-compose instance
```bash
sudo rm -rf node_modules
```

Install dependencies
```bash
npm install
```
Run Unit tests
```bash
npm run test
```

## E2E Testing
**Optional** - remove existing node_modules bound to the docker-compose instance
```bash
sudo rm -rf node_modules
```

Below commands create testing `.env` file and setup testing MongoDB.
```bash
cp .env.test.dist .env
docker-compose -f docker-compose-test.yaml up
```

Run E2E tests
```bash
npm run test:e2e
```

## Local development using docker-compose
Install dependencies
```bash
docker-compose up --build
```
