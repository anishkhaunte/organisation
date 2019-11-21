# setup middleware.
os=$(uname -s)
if [ $os == "Darwin" ]; then
    NEW_UUID=$((1 + RANDOM % 100))
else
    NEW_UUID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)
fi
docker run --name $NEW_UUID"_redis" -d redis
docker run --name $NEW_UUID"_mongo" -d mongo 

RIP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $NEW_UUID"_redis")
MIP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $NEW_UUID"_mongo")

docker run -v $(pwd):/usr/src/ --name $NEW_UUID"_node" node:8-alpine sh -c "cd /usr/src/ && mkdir -p /home/ubuntu && touch /home/ubuntu/cert.pem && touch /home/ubuntu/key.pem && npm install && MONGODB_HOST=$MIP REDIS_HOST=$RIP npm test && MONGODB_HOST=$MIP REDIS_HOST=$RIP npm run coverage"

#cleanup
docker kill $NEW_UUID"_redis"
docker kill $NEW_UUID"_mongo"

docker rm -f $NEW_UUID"_redis"
docker rm -f $NEW_UUID"_mongo"
