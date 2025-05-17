#!/bin/bash

docker build -t nnas .
docker run -it --rm -v .:/app nnas