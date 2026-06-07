FROM arm64v8/alpine:3.22

RUN apk add --no-cache \
    # C/C++ 编译（duckdb-bundled）
    build-base cmake \
    # eBPF 程序编译 + libbpf 依赖
    clang llvm elfutils-dev zlib-dev zlib-static zstd-static \
    # 其他
    linux-headers pkgconf \
    # rustup 依赖
    curl

# 使用 rustup 安装 Rust 工具链（避免 Alpine 包版本滞后）
# 使用 minimal profile 减小下载量，然后单独添加 rustfmt（libbpf-cargo SkeletonBuilder 需要）
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh -s -- -y --profile minimal --default-toolchain stable && \
    . "$HOME/.cargo/env" && \
    rustup component add rustfmt

ENV PATH="/root/.cargo/bin:${PATH}"

# RUSTC wrapper: Alpine 的 libelf.a 静态链接需要 libzstd
# 使用 RUSTC 包装器而非 build.rustflags，因为后者不作用于 build script
RUN printf '#!/bin/sh\nexec /root/.rustup/toolchains/stable-aarch64-unknown-linux-musl/bin/rustc "$@" -C link-arg=-l:libzstd.a\n' \
    > /usr/local/bin/rustc-wrapper && \
    chmod +x /usr/local/bin/rustc-wrapper
ENV RUSTC=/usr/local/bin/rustc-wrapper

WORKDIR /landscape
