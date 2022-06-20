# Start development environment
1. Install [NodeJS 18](https://nodejs.org/fr/download/current/)
2. Install [Yarn](https://yarnpkg.com/getting-started/install/)
3. Start project
```shell
yarn dev
```
4. Open https://localhost:3000

# Start production with Docker
1. Install [Docker Engine](https://docs.docker.com/engine/install/)
2. Build the container
```shell
docker build -t fruit-salad .
```
3. Start the container and expose port 80
```shell
docker run -p 80:80 fruit-salad
```