FROM rust:alpine3.23

ARG RUST_TARGET=x86_64-unknown-linux-musl

RUN apk add --no-cache \
    # C/C++ 编译（duckdb-bundled）
    build-base cmake \
    # eBPF 程序编译 + libbpf 依赖
    clang llvm elfutils-dev zlib-dev zlib-static zstd-static \
    # 其他
    linux-headers pkgconf

# 添加 musl target + rustfmt（libbpf-cargo SkeletonBuilder 需要）
RUN rustup target add ${RUST_TARGET} && \
    rustup component add rustfmt

# RUSTC wrapper: Alpine 的 libelf.a 静态链接需要 libzstd
# 使用 RUSTC 包装器而非 build.rustflags，因为后者不作用于 build script
RUN printf '#!/bin/sh\n'"rustup run stable-${RUST_TARGET} rustc \"\$@\" -C link-arg=-l:libzstd.a\n" \
    > /usr/local/bin/rustc-wrapper && \
    chmod +x /usr/local/bin/rustc-wrapper
ENV RUSTC=/usr/local/bin/rustc-wrapper

# aarch64 only: libbpf C 代码在 armv8-a（无 LSE）下会生成对 __aarch64_ldadd4_sync
# 的调用，需显式启用 LSE 指令避免链接 libatomic。x86_64 不需要此标志
ARG LSE_CFLAGS=""
ENV LIBBPF_SYS_EXTRA_CFLAGS="${LSE_CFLAGS}"

WORKDIR /landscape
