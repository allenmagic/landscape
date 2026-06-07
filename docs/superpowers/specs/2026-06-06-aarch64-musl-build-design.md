# aarch64-musl 编译支持 — 设计文档

日期: 2026-06-06
状态: 待评估

---

## 背景

Landscape 项目当前只构建和发布 gnu 目标（x86_64、aarch64、armv7），.cargo/config.toml 中虽有 7 个 musl 目标的配置骨架，但 linker 配置为无法工作的 `gcc`（在 x86_64 宿主上无法为其他架构生成代码）。需要支持 aarch64-musl 目标的生产级编译。

## 目标

1. `build.sh` 支持 `--target aarch64-musl`
2. CI 自动构建并发布 aarch64-musl 产物
3. 本地开发环境（x86_64-gnu）也能执行 aarch64-musl 构建（通过 Docker）

## 方案选型

**选择方案 B：Alpine aarch64 容器原生编译**

- 基础镜像：`arm64v8/alpine:3.22`
- 工具链：apk 安装 `rust cargo` (1.87.0-r1)
- 本地 QEMU 模拟（慢），CI aarch64 runner 原生（快）
- 本地和 CI 使用同一 Dockerfile，构建可复现

## Docker 构建镜像

**文件**: `dockerfiles/build-musl/Dockerfile`

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
```

说明：
- `build-base` 包含 gcc、g++、make、musl-dev、binutils，一次性替代分散安装
- Alpine 是 musl 原生系统，`gcc` 产出的 .o 天然就是 musl ABI
- 无需交叉工具链，无需 rustup，全部走 apk 包管理

## 构建依赖与 musl 兼容性

| 依赖 | 来源 | musl 兼容 | 处理方式 |
|---|---|---|---|
| Rust std | `rust` (apk) | ✅ 原生 | 默认 target 即 `aarch64-unknown-linux-musl` |
| duckdb (C++) | `duckdb-sys` build.rs | ✅ g++ 编译 | g++ 产出 musl ABI .o |
| jemalloc | `jemalloc-sys` | ❌ 不兼容 | 条件编译跳过，用 musl mallocng |
| libbpf-sys | `libbpf-sys` build.rs | ✅ libelf+zlib | `elfutils-dev` + `zlib-dev` (apk) |
| ring | `rustls` 依赖 | ✅ 纯 Rust | 无需处理 |
| zstd | `zstd-sys` | ✅ zlib | `zlib-dev` (apk) |
| eBPF C 程序 | `libbpf-cargo` | ✅ clang 编译 | BPF 字节码架构无关 |

## 改动清单

### 1. `dockerfiles/build-musl/Dockerfile` — 重写

从当前仅含基础构建工具的空壳扩展为可编译完整项目。

### 2. `.cargo/config.toml` — 微调

```toml
# 修改前
[target.aarch64-unknown-linux-musl]
linker = "gcc"
rustflags = ["-C", "target-feature=-crt-static"]

# 修改后
[target.aarch64-unknown-linux-musl]
linker = "gcc"
# 去掉 -crt-static，使用 musl 默认的完全静态链接
```

说明：容器内 gcc 天然是 aarch64 musl gcc，linker 无需改；去掉 `-crt-static` 启用静态链接，单二进制便于部署。

### 3. `build_env.sh` — 新增 target

```bash
declare -A TARGETS=(
    ["x86_64"]="x86_64-unknown-linux-gnu"
    ["aarch64"]="aarch64-unknown-linux-gnu"
    ["armv7"]="armv7-unknown-linux-gnueabihf"
    ["x86_64-musl"]="x86_64-unknown-linux-musl"       # 新增
    ["aarch64-musl"]="aarch64-unknown-linux-musl"      # 新增
)
```

### 4. `build_server.sh` — 新增 musl Docker 编译分支

```
musl 目标 → docker build + docker run → 容器内 cargo build
gnu 目标  → 现有逻辑不变
```

### 5. jemalloc 条件编译（2 个文件）

`landscape-dns/src/server/matcher.rs` 和 `landscape-protobuf/src/lib.rs`：

```rust
#[cfg(not(target_env = "musl"))]
static GLOBAL: jemallocator::Jemalloc = jemallocator::Jemalloc;
// musl 目标下不声明全局分配器，Rust 自动使用 musl mallocng
```

### 6. `.github/workflows/build-and-release.yml` — 新增 CI matrix

```yaml
- host: ubuntu-22.04-arm
  architecture: aarch64-musl
  target: aarch64-unknown-linux-musl
```

构建步骤中使用 `docker build` + `docker run`，与本地一致。

## 本地 vs CI 构建路径

| | 本地 (x86_64) | CI |
|---|---|---|
| x86_64-musl | `docker run alpine` (x86_64 原生，快) | `ubuntu-22.04` + `docker run alpine` (原生) |
| aarch64-musl | `docker run --platform arm64 alpine` (QEMU 模拟，慢) | `ubuntu-22.04-arm` + `docker run alpine` (aarch64 原生，快) |
| Docker 镜像 | 同一份 Dockerfile | 同一份 Dockerfile |

## 风险点

| 风险 | 严重度 | 缓解措施 |
|---|---|---|
| duckdb C++ 在 Alpine 编译失败 | 中 | Alpine g++ + cmake 足以编译 duckdb；如遇问题可启用 vendored 策略 |
| clang/llvm 版本不兼容 eBPF | 低 | Alpine 3.22 clang 支持 BPF target；`libbpf-cargo` 已验证 |
| QEMU 本地编译太慢 | 高（影响开发体验） | 本地主要靠 CI 构建产物；本地仅验证代码结构可编译 |
| jemalloc 条件编译遗漏 | 低 | 仅 2 个文件，改动范围明确 |

## 不在本次 scope

- 其他 5 个 musl 目标（loongarch64、riscv64、s390x、powerpc64le、armv7-musl）— Dockerfile 设计保留扩展性，后续仅需加 target + 验证
- mimalloc 替代 jemalloc — 待 mimalloc#556 修复后再评估
- Docker 镜像推送到 registry — 当前每次本地 docker build，耗时约 1-2 分钟，相比 Rust 编译时间（10-30 分钟）可忽略
