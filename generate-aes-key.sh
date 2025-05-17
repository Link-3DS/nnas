#!/bin/bash

ENV_FILE=".env"

AES_KEY=$(openssl rand -hex 32)

if grep -q "^AES_KEY=" "$ENV_FILE"; then
    sed -i "s/^AES_KEY=.*/AES_KEY=$AES_KEY/" "$ENV_FILE"
else
    echo "AES_KEY=$AES_KEY" >> "$ENV_FILE"
fi

echo "AES Key generated successfully!"