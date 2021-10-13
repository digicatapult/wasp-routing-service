#!/bin/bash

echo $GITHUB_PACKAGE_TOKEN > ./token
DOCKER_BUILDKIT=1 docker build --secret id=github,src=./token -t wasp-routing-service .
rm ./token
