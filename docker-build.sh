#!/usr/bin/env bash

tar --exclude=config/deployment.json --exclude=override/deployment.json --exclude=kube --exclude=api/public --exclude=node_modules --exclude=*.tar.gz --exclude=.nyc_output --exclude=tags --exclude=.git --exclude=coverage --exclude=.vscode/ --exclude=.nyc_output/ -cvf app.tar.gz ./

docker build -t jiomeetserver -f Dockerfile .;

if [ $# -ne 0 ]
  then
      echo "pushing to remote repo";
      $(aws ecr get-login --region ap-south-1 | sed -e 's/-e none//g');
      docker tag jiomeetserver:latest 157960520452.dkr.ecr.ap-south-1.amazonaws.com/jiomeet-sumanta:server
      docker push 157960520452.dkr.ecr.ap-south-1.amazonaws.com/jiomeet-sumanta:server
fi

rm app.tar.gz
