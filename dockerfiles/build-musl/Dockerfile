FROM rust:alpine3.22

RUN rustup component add rustfmt && \
    rustup target add aarch64-unknown-linux-musl

RUN apk update && apk add --no-cache \
    bash \
    bpftool \
    build-base \
    clang \
    clang-dev \
    clang-static \
    cmake \
    curl \
    elfutils-dev \
    elfutils-static \
    git \
    libbpf-dev \
    linux-headers \
    llvm \
    llvm-dev \
    llvm-static \
    make \
    musl-dev \
    openssl-dev \
    openssl-libs-static \
    perl \
    pkgconf \
    wget \
    zlib-dev \
    zlib-static \
    zstd-dev \
    zstd-static

ENV OPENSSL_STATIC=1 \
    OPENSSL_DIR=/usr \
    PKG_CONFIG_ALL_STATIC=1 \
    RUSTFLAGS="-C target-feature=+crt-static"

WORKDIR /landscape
