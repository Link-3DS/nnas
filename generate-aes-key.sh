#!/bin/bash

ENV_FILE=".env"

GREEN="\033[0;32m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m"

echo -e "${BLUE}Generating AES Key...${NC}"

AES_KEY=$(openssl rand -hex 32)

if grep -q "^AES_KEY=" "$ENV_FILE"; then
    if sed -i "s/^AES_KEY=.*/AES_KEY=$AES_KEY/" "$ENV_FILE"; then
        echo -e "${GREEN}AES Key updated successfully!${NC}"
    else
        echo -e "${RED}Error updating AES Key.${NC}"
    fi
else
    if echo "AES_KEY=$AES_KEY" >> "$ENV_FILE"; then
        echo -e "${GREEN}AES Key added successfully!${NC}"
    else
        echo -e "${RED}Error adding AES Key.${NC}"
    fi
fi