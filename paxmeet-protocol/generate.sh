#!/usr/bin/env sh

PROTO_TMP_DIR="./tmp"
PROTO_VALIDATOR_DIR="${PROTO_TMP_DIR}/protovalidate"
LIVEKIT_PROTO_DIR="${PROTO_TMP_DIR}/livekit-protocol"

if [ ! -d ${PROTO_TMP_DIR} ]; then
  mkdir -p ${PROTO_TMP_DIR}
fi

if [ ! -d ${PROTO_VALIDATOR_DIR} ]; then
  git clone https://github.com/bufbuild/protovalidate ${PROTO_VALIDATOR_DIR}
fi

if [ ! -d ${LIVEKIT_PROTO_DIR} ]; then
  git clone https://github.com/livekit/protocol ${LIVEKIT_PROTO_DIR}
fi

GOPATH=$HOME/go

protoc \
-I ${GOPATH}/pkg/mod \
-I ${PROTO_VALIDATOR_DIR}/proto/protovalidate \
-I ${LIVEKIT_PROTO_DIR} \
--proto_path=proto_files \
proto_files/*.proto \
--go_out=paths=source_relative:./plugnmeet \
--validate_out="lang=go,paths=source_relative:./plugnmeet"
