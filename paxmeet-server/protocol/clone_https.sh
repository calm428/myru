#!/bin/sh

# Check if a token is provided as an argument
if [ -z "$1" ]; then
    echo "Usage: $0 <token>"
    exit 1
fi

TOKEN=$1
BRANCH=release/prod

# Replace 'TOKEN' in the URL with the actual token provided
GIT_URL=$(echo "https://x-token-auth:TOKEN@bitbucket.org/myru/myru-protocol.git" | sed "s/TOKEN/$TOKEN/")

# Execute the git clone command with the tokenized URL
git clone -b $BRANCH "$GIT_URL"