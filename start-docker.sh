#!/bin/bash

docker build -t nnas .

ABS_PATH=$(pwd)
docker run -it --rm -v "$ABS_PATH":/app nnas