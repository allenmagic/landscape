# aarch64-musl 编译支持 — 实现方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Landscape 项目添加 aarch64-musl 编译目标支持，本地通过 Docker Alpine 容器构建，CI 通过 aarch64 runner 原生构建。

**Architecture:** 以 `arm64v8/alpine:3.22` 为基础镜像，通过 apk 安装 Rust 工具链和所有 C/C++ 构建依赖，在容器内实现 aarch64 musl 原生编译。Dockerfile 同时支持本地 QEMU 模拟和 CI aarch64 runner 原生执行。

**Tech Stack:** Docker (multi-arch), Alpine Linux 3.22, Rust 1.87.0-r1 (apk), build-base, cmake, clang/llvm

---

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `dockerfiles/build-musl/Dockerfile` | 重写 | Alpine 构建镜像，包含 Rust + 全部 C/C++/eBPF 构建依赖 |
| `.cargo/config.toml` | 修改 | 去掉 aarch64-musl 的 `-crt-static`，启用静态链接 |
| `build_env.sh` | 修改 | 新增 `x86_64-musl` 和 `aarch64-musl` 两个 target |
| `scripts/build_server.sh` | 修改 | 新增 musl 目标 Docker 编译分支 |
| `landscape-dns/src/server/matcher.rs` | 修改 | jemalloc 条件编译：musl 目标跳过 |
| `landscape-protobuf/src/lib.rs` | 修改 | jemalloc 条件编译：musl 目标跳过 |
| `.github/workflows/build-and-release.yml` | 修改 | 新增 aarch64-musl CI matrix entry |

---

### Task 1: 重写 musl 构建 Dockerfile

**Files:**
- Modify: `dockerfiles/build-musl/Dockerfile`

- [ ] **Step 1: 写入新的 Dockerfile 内容**

```dockerfile
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
```

- [ ] **Step 2: 验证 Dockerfile 语法和内容**

```bash
cat dockerfiles/build-musl/Dockerfile
```

预期输出：`FROM arm64v8/alpine:3.22` 开头，包含 `apk add --no-cache rust cargo build-base cmake clang llvm elfutils-dev zlib-dev linux-headers pkgconf rustfmt`。

> 注意：本地为 x86_64 主机，aarch64 镜像实际构建需要 QEMU（`docker build --platform linux/arm64`）。完整构建验证将在 Task 8 中执行。

- [ ] **Step 3: 提交**

```bash
git add dockerfiles/build-musl/Dockerfile
git commit -m "feat: rewrite build-musl Dockerfile with apk-based Rust and build deps"
```

---

### Task 2: 修正 .cargo/config.toml 中 aarch64-musl 配置

**Files:**
- Modify: `.cargo/config.toml:19-21`

- [ ] **Step 1: 去掉 `-crt-static`，启用 musl 默认静态链接**

将以下内容：

```toml
[target.aarch64-unknown-linux-musl]
linker = "gcc"
rustflags = ["-C", "target-feature=-crt-static"]
```

替换为：

```toml
[target.aarch64-unknown-linux-musl]
linker = "gcc"
```

- [ ] **Step 2: 验证 config.toml 语法**

```bash
cat .cargo/config.toml | grep -A2 'aarch64-unknown-linux-musl'
```

预期输出：
```
[target.aarch64-unknown-linux-musl]
linker = "gcc"
```

且下一行不再有 `rustflags = ...`。

- [ ] **Step 3: 提交**

```bash
git add .cargo/config.toml
git commit -m "fix: remove -crt-static for aarch64-musl, enable musl default static linking"
```

---

### Task 3: 在 build_env.sh 中新增 musl target

**Files:**
- Modify: `build_env.sh:15-19`

- [ ] **Step 1: 在 TARGETS 数组中新增两个 musl target**

将：

```bash
declare -A TARGETS=(
    ["x86_64"]="x86_64-unknown-linux-gnu"
    ["aarch64"]="aarch64-unknown-linux-gnu"
    ["armv7"]="armv7-unknown-linux-gnueabihf"
)
```

替换为：

```bash
declare -A TARGETS=(
    ["x86_64"]="x86_64-unknown-linux-gnu"
    ["aarch64"]="aarch64-unknown-linux-gnu"
    ["armv7"]="armv7-unknown-linux-gnueabihf"
    ["x86_64-musl"]="x86_64-unknown-linux-musl"
    ["aarch64-musl"]="aarch64-unknown-linux-musl"
)
```

- [ ] **Step 2: 验证 target 可被正确识别**

```bash
source build_env.sh --list 2>/dev/null
```

预期输出应包含 `x86_64-musl` 和 `aarch64-musl`：
```
Supported architectures:
1) x86_64
2) aarch64
3) armv7
4) x86_64-musl
5) aarch64-musl
6) Use default architecture (x86_64)
```

- [ ] **Step 3: 提交**

```bash
git add build_env.sh
git commit -m "feat: add x86_64-musl and aarch64-musl targets to build_env.sh"
```

---

### Task 4: 在 build_server.sh 中新增 musl Docker 编译分支

**Files:**
- Modify: `scripts/build_server.sh`

- [ ] **Step 1: 重写 build_server.sh，新增 musl 检测与 Docker 编译路径**

将当前内容：

```bash
#!/usr/bin/env bash

set -euo pipefail

echo "构建 Rust 项目..."
cargo build --release --target "$TARGET_ARCH" --features=duckdb-bundled

echo "复制 Rust 构建产物到 $SCRIPT_DIR/output/landscape-webserver-$TARGET"
mkdir -p "$SCRIPT_DIR/output"
cp "$SCRIPT_DIR/target/$TARGET_ARCH/release/landscape-webserver" "$SCRIPT_DIR/output/landscape-webserver-$TARGET"
```

替换为：

```bash
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
```

说明：
- `$SCRIPT_DIR` 由 `build_env.sh` 设置（`build.sh` 先 source `build_env.sh` 再 source 本脚本），始终指向项目根目录，无需重新定义
- musl 检测：`[[ "$TARGET_ARCH" == *-musl ]]` 匹配所有 musl 目标
- **平台适配**：x86_64 宿主编译 aarch64-musl 时自动加 `--platform linux/arm64`；CI aarch64 runner 上不加，原生执行
- Docker 镜像 tag 包含 target triple 避免不同架构镜像冲突
- 源码通过 `-v "$SCRIPT_DIR:/landscape"` 挂载进容器，编译产物直接写入宿主机 `target/` 目录

- [ ] **Step 2: 验证脚本语法**

```bash
bash -n scripts/build_server.sh
```

预期：无输出（无语法错误）。

- [ ] **Step 3: 提交**

```bash
git add scripts/build_server.sh
git commit -m "feat: add Docker-based musl build path to build_server.sh"
```

---

### Task 5: jemalloc 条件编译 — landscape-dns

**Files:**
- Modify: `landscape-dns/src/server/matcher.rs:118-120,126`

**背景**：jemalloc 在 musl 上不兼容（缺少 `__malloc_hook`、`pthread_getname_np` 等符号）。当前 jemalloc 仅在 `#[cfg(test)]` 下使用（不在 release binary 中），但 `cargo test` 在 musl 容器中仍会失败。需要加 `target_env` 条件编译。

- [ ] **Step 1: 修改全局分配器声明**

将第 118-120 行的：

```rust
#[cfg(test)]
#[global_allocator]
static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;
```

替换为：

```rust
#[cfg(all(test, not(target_env = "musl")))]
#[global_allocator]
static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;
```

- [ ] **Step 2: 修改测试模块内 jemalloc_ctl 导入**

将第 126 行的：

```rust
    use jemalloc_ctl::{epoch, stats};
```

替换为：

```rust
    #[cfg(not(target_env = "musl"))]
    use jemalloc_ctl::{epoch, stats};
```

- [ ] **Step 3: 修改 test_memory_usage 函数**

将第 150-158 行的 `test_memory_usage` 函数体用条件编译包裹。找到该函数定义，在 `fn test_memory_usage() {` 上一行添加 `#[cfg(not(target_env = "musl"))]`：

```rust
    #[cfg(not(target_env = "musl"))]
    fn test_memory_usage() {
        epoch::advance().unwrap();
        let allocated = stats::allocated::read().unwrap();
        let active = stats::active::read().unwrap();
        println!("Allocated memory: {} kbytes", allocated / 1024);
        println!("Active memory: {} kbytes", active / 1024);
    }
```

- [ ] **Step 4: 修改 mem_useage 测试**

将第 160-206 行的 `mem_useage` 测试函数用条件编译包裹，因为它调用了 `test_memory_usage()`。在 `#[test]` 上一行添加 `#[cfg(not(target_env = "musl"))]`：

```rust
    #[cfg(not(target_env = "musl"))]
    #[test]
    pub fn mem_useage() {
        // ... 函数体保持不变
    }
```

- [ ] **Step 5: 验证编译（gnu 目标不受影响）**

```bash
cargo check -p landscape-dns --tests
```

预期：编译通过，无错误。

- [ ] **Step 6: 提交**

```bash
git add landscape-dns/src/server/matcher.rs
git commit -m "fix: gate jemalloc allocator and memory tests on non-musl targets in landscape-dns"
```

---

### Task 6: jemalloc 条件编译 — landscape-protobuf

**Files:**
- Modify: `landscape-protobuf/src/lib.rs:372-374,380`

- [ ] **Step 1: 修改全局分配器声明**

将第 372-374 行的：

```rust
#[cfg(test)]
#[global_allocator]
static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;
```

替换为：

```rust
#[cfg(all(test, not(target_env = "musl")))]
#[global_allocator]
static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;
```

- [ ] **Step 2: 修改测试模块内 jemalloc_ctl 导入**

将第 380 行的：

```rust
    use jemalloc_ctl::{epoch, stats};
```

替换为：

```rust
    #[cfg(not(target_env = "musl"))]
    use jemalloc_ctl::{epoch, stats};
```

- [ ] **Step 3: 修改 test_memory_usage 函数**

将第 388-396 行的 `test_memory_usage` 函数用条件编译包裹：

```rust
    #[cfg(not(target_env = "musl"))]
    fn test_memory_usage() {
        epoch::advance().unwrap();
        let allocated = stats::allocated::read().unwrap();
        let active = stats::active::read().unwrap();
        println!("Allocated memory: {} kbytes", allocated / 1024);
        println!("Active memory: {} kbytes", active / 1024);
    }
```

- [ ] **Step 4: 修改调用 test_memory_usage 的测试函数**

以下 3 个测试函数调用了 `test_memory_usage()`，需要添加 `#[cfg(not(target_env = "musl"))]`：

- `read_raw` (第 397-411 行)
- `test` (第 413-426 行)  
- `test_read` (第 428-453 行)

每个函数的 `#[tokio::test]` 上一行添加：

```rust
    #[cfg(not(target_env = "musl"))]
```

注意：`parse_txt_geo_ips_skips_invalid_lines` (第 455 行以后) 不调用 `test_memory_usage()`，无需修改。

- [ ] **Step 5: 验证编译（gnu 目标不受影响）**

```bash
cargo check -p landscape-protobuf --tests
```

预期：编译通过，无错误。

- [ ] **Step 6: 提交**

```bash
git add landscape-protobuf/src/lib.rs
git commit -m "fix: gate jemalloc allocator and memory tests on non-musl targets in landscape-protobuf"
```

---

### Task 7: CI build-and-release.yml 新增 aarch64-musl matrix

**Files:**
- Modify: `.github/workflows/build-and-release.yml`

- [ ] **Step 1: 在 matrix.settings 中新增 aarch64-musl entry**

在 `matrix.settings` 列表末尾（第 22 行 `target: aarch64-unknown-linux-gnu` 之后）新增：

```yaml
          - host: ubuntu-22.04-arm
            architecture: aarch64-musl
            target: aarch64-unknown-linux-musl
```

完整修改后的 settings 段：

```yaml
      matrix:
        settings:
          - host: ubuntu-22.04
            architecture: x86_64
            target: x86_64-unknown-linux-gnu

          - host: ubuntu-22.04-arm
            architecture: aarch64
            target: aarch64-unknown-linux-gnu

          - host: ubuntu-22.04-arm
            architecture: aarch64-musl
            target: aarch64-unknown-linux-musl
```

- [ ] **Step 2: 修改 Build binaries 步骤以支持 Docker 构建**

当前 Build binaries 步骤（第 56-62 行）对 musl target 无法直接执行 `cargo build`（aarch64 runner 是 glibc 系统，没有 musl 工具链）。需要新增 Docker 构建逻辑。

将 Build binaries step 替换为：

```yaml
      - name: Build binaries
        run: |
          if [[ "${{ matrix.settings.target }}" == *-musl ]]; then
            docker build -t landscape-build-musl ./dockerfiles/build-musl
            docker run --rm \
              -v $PWD:/landscape \
              landscape-build-musl \
              sh -c "cargo build --release --target ${{ matrix.settings.target }} --features duckdb-bundled"
          else
            cargo build --release --target ${{ matrix.settings.target }} --features duckdb-bundled
          fi
          cargo build --release --package landscape-ebpf --bin redirect_pkg_handler --target ${{ matrix.settings.target }}
          mkdir -p output
          cp target/${{ matrix.settings.target }}/release/landscape-webserver output/landscape-webserver-${{ matrix.settings.architecture }}
          cp target/${{ matrix.settings.target }}/release/redirect_pkg_handler output/redirect_pkg_handler-${{ matrix.settings.architecture }}
```

注意：`redirect_pkg_handler` 也走相同构建方式（`cargo build` 在 musl target 下同样需要在容器内执行）。上方的脚本中 Docker 构建仅包了 `landscape-webserver`，`redirect_pkg_handler` 需在容器内一并构建。修正后：

```yaml
      - name: Build binaries
        run: |
          if [[ "${{ matrix.settings.target }}" == *-musl ]]; then
            docker build -t landscape-build-musl ./dockerfiles/build-musl
            docker run --rm \
              -v $PWD:/landscape \
              landscape-build-musl \
              sh -c "cargo build --release --target ${{ matrix.settings.target }} --features duckdb-bundled && cargo build --release --package landscape-ebpf --bin redirect_pkg_handler --target ${{ matrix.settings.target }}"
          else
            cargo build --release --target ${{ matrix.settings.target }} --features duckdb-bundled
            cargo build --release --package landscape-ebpf --bin redirect_pkg_handler --target ${{ matrix.settings.target }}
          fi
          mkdir -p output
          cp target/${{ matrix.settings.target }}/release/landscape-webserver output/landscape-webserver-${{ matrix.settings.architecture }}
          cp target/${{ matrix.settings.target }}/release/redirect_pkg_handler output/redirect_pkg_handler-${{ matrix.settings.architecture }}
```

- [ ] **Step 3: 更新 release body 描述**

将第 167-172 行的 release body 从：

```yaml
          body: |
            Auto-generated build from GitHub Actions.

            Supported targets:
            - `x86_64-unknown-linux-gnu` (Debian / Ubuntu x86_64)
            - `aarch64-unknown-linux-gnu` (Armbian / Debian / Ubuntu ARM64)
```

修改为：

```yaml
          body: |
            Auto-generated build from GitHub Actions.

            Supported targets:
            - `x86_64-unknown-linux-gnu` (Debian / Ubuntu x86_64)
            - `aarch64-unknown-linux-gnu` (Armbian / Debian / Ubuntu ARM64)
            - `aarch64-unknown-linux-musl` (Alpine / musl-based ARM64)
```

- [ ] **Step 4: 验证 YAML 语法**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/build-and-release.yml'))"
```

如果没有安装 PyYAML，可以用：

```bash
cat .github/workflows/build-and-release.yml | grep -E '^\s+-' | head -20
```

确认 matrix settings 中包含 `aarch64-musl`。

- [ ] **Step 5: 提交**

```bash
git add .github/workflows/build-and-release.yml
git commit -m "ci: add aarch64-musl build target to build-and-release workflow"
```

---

### Task 8: 端到端验证（本地 Docker 构建）

**此 Task 仅验证代码结构可编译，完整 release 构建需较长时间，建议在 CI 上执行。**

- [ ] **Step 1: 构建 Docker 镜像**

```bash
docker build --platform linux/arm64 -t landscape-build-musl ./dockerfiles/build-musl
```

预期：镜像构建成功。可能需要约 2-3 分钟（apk 下载和安装）。

- [ ] **Step 2: 验证 Rust 环境**

```bash
docker run --rm --platform linux/arm64 landscape-build-musl sh -c "rustc --version && cargo --version"
```

预期输出类似：
```
rustc 1.87.0
cargo 1.87.0
```

- [ ] **Step 3: 在容器中执行 cargo check（非 release build，快速验证）**

```bash
docker run --rm --platform linux/arm64 \
    -v $PWD:/landscape \
    landscape-build-musl \
    sh -c "cargo check --target aarch64-unknown-linux-musl --features duckdb-bundled"
```

预期：cargo check 通过，没有编译错误。

> 注意：如果 QEMU 模拟太慢（可能超过 10 分钟），可以跳过此步骤，在 merge 后通过 CI 验证。

- [ ] **Step 4: 提交（如有修正）**

```bash
git add -A
git commit -m "chore: finalize aarch64-musl build support"
```

---

## 依赖关系

```
Task 1 (Dockerfile) ──┐
Task 2 (config.toml) ─┤
Task 3 (build_env)  ──┼──→ Task 4 (build_server) ──→ Task 8 (验证)
Task 5 (dns jemalloc) ┤
Task 6 (proto jemalloc)┤
Task 7 (CI yml) ──────┘
```

Task 1-7 互不依赖，可并行执行。Task 8 依赖 Task 1-4。

## 验证清单

- [ ] `.cargo/config.toml` 中 aarch64-musl 不再包含 `-crt-static`
- [ ] `build_env.sh --list` 列出 `x86_64-musl` 和 `aarch64-musl`
- [ ] `build_server.sh` 能检测 musl target 并走 Docker 路径
- [ ] Dockerfile 包含全部构建依赖（rust、cargo、build-base、cmake、clang、llvm、elfutils-dev、zlib-dev、linux-headers、pkgconf、rustfmt）
- [ ] gnu 目标下 `cargo check --tests` 不受影响（Task 5、6 后）
- [ ] CI yaml 包含 aarch64-musl matrix entry，语法有效
- [ ] Docker 容器内 `cargo check --target aarch64-unknown-linux-musl` 通过
