docker-compose down
docker volume prune
docker-compose up --build

docker-compose down
docker-compose up --build -d

docker ps
docker-compose down
docker-compose up -d

docker-compose down && docker-compose up --build -d