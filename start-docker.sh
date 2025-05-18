#!/bin/bash

docker build -t nnas .

ABS_PATH=$(pwd)
docker run -it -d --name nnas -v "$ABS_PATH":/app nnas
