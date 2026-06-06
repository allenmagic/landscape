#!/usr/bin/env bash

set -euo pipefail

# SCRIPT_DIR 由 build_env.sh 设置（build.sh 在 source 本脚本之前先 source build_env.sh）
# 此脚本不单独执行，始终通过 build.sh 调用

echo "构建 Rust 项目..."
echo "Target: $TARGET, Rust target: $TARGET_ARCH"

if [[ "$TARGET_ARCH" == *-musl ]]; then
    # musl 目标：通过 Docker Alpine 容器编译
    DOCKERFILE_DIR="$SCRIPT_DIR/dockerfiles/build-musl"
    IMAGE_TAG="landscape-build-musl:$(echo "$TARGET_ARCH" | tr '[:upper:]' '[:lower:]')"
    HOST_ARCH="$(uname -m)"

    # 确定是否需要 --platform 参数
    # 当宿主架构与目标架构不一致时，Docker 需要显式指定 platform 以启用 QEMU 模拟
    case "$TARGET_ARCH" in
        aarch64-unknown-linux-musl) DOCKER_ARCH="arm64" ;;
        x86_64-unknown-linux-musl)  DOCKER_ARCH="amd64" ;;
        *)                          DOCKER_ARCH="" ;;
    esac

    PLATFORM_FLAG=""
    if [[ -n "$DOCKER_ARCH" ]]; then
        TARGET_DOCKER_PLATFORM="linux/$DOCKER_ARCH"
        HOST_DOCKER_PLATFORM="linux/amd64"
        [[ "$HOST_ARCH" == "aarch64" ]] && HOST_DOCKER_PLATFORM="linux/arm64"

        if [[ "$TARGET_DOCKER_PLATFORM" != "$HOST_DOCKER_PLATFORM" ]]; then
            PLATFORM_FLAG="--platform $TARGET_DOCKER_PLATFORM"
            echo "宿主架构 ($HOST_ARCH) 与目标架构不匹配，启用 QEMU 模拟: $PLATFORM_FLAG"
        fi
    fi

    echo "构建 Docker 镜像: $IMAGE_TAG"
    docker build $PLATFORM_FLAG -t "$IMAGE_TAG" "$DOCKERFILE_DIR"

    echo "在 Docker 容器中编译..."
    docker run --rm \
        $PLATFORM_FLAG \
        -v "$SCRIPT_DIR:/landscape" \
        "$IMAGE_TAG" \
        sh -c "cargo build --release --target $TARGET_ARCH --features duckdb-bundled"
else
    # gnu 目标：本地编译（现有逻辑）
    cargo build --release --target "$TARGET_ARCH" --features=duckdb-bundled
fi

echo "复制 Rust 构建产物到 $SCRIPT_DIR/output/landscape-webserver-$TARGET"
mkdir -p "$SCRIPT_DIR/output"
cp "$SCRIPT_DIR/target/$TARGET_ARCH/release/landscape-webserver" "$SCRIPT_DIR/output/landscape-webserver-$TARGET"
