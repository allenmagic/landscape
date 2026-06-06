FROM arm64v8/alpine:3.22

RUN apk add --no-cache \
    # Rust 工具链 (1.87.0-r1)
    rust cargo \
    # C/C++ 编译（duckdb-bundled）
    build-base cmake \
    # eBPF 程序编译 + libbpf 依赖
    clang llvm elfutils-dev zlib-dev \
    # 其他
    linux-headers pkgconf \
    # CI 格式检查
    rustfmt

WORKDIR /landscape
