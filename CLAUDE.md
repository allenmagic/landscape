# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指导。

## 项目概述

Landscape 是一个基于 eBPF 的 Linux 路由器平台，使用 Rust、eBPF（AF_PACKET）和 Vue 3 前端构建。它提供网络服务管理、基于策略的流量调度、DNS、NAT、防火墙，以及 REST API 和 Web 管理界面。需要 Linux 内核 6.9+ 且启用 BTF/BPF，并以 root 权限运行。

## 常用命令

### 后端（Rust）
```bash
cargo build --workspace          # 构建所有 crate（默认构建 landscape-webserver）
cargo test --workspace           # 运行所有测试
cargo fmt --all                  # 格式化所有 Rust 代码
```

### 前端（Vue 3 + Vite）
```bash
pnpm install --frozen-lockfile   # 安装前端依赖（首次）
./gen_ts_bindings.sh             # 从 OpenAPI schema 重新生成 TypeScript API 客户端
./web.sh                         # 启动前端开发服务器（自动检查 API 绑定）
pnpm --filter landscape-webui build     # 类型检查并构建前端
pnpm --filter landscape-webui test      # 运行前端测试（vitest）
pnpm --filter landscape-webui exec prettier --check "src/**/*.{vue,ts,js,json,css,scss}"
```

### 格式化（提交 PR 前）
```bash
./fmt.sh                 # 格式化全部：Rust + C/eBPF + 前端
./fmt.sh --rust          # 仅 cargo fmt
./fmt.sh --c             # 仅 clang-format-18（eBPF C 文件）
./fmt.sh --frontend      # 仅 prettier
```

### 完整发布构建
```bash
bash ./build.sh -t x86_64   # 构建前端 + 打包静态资源 + 构建 release 二进制文件
```

### 系统依赖（与 CI 一致）
```bash
sudo apt-get install -y cmake clang curl gcc llvm make pkg-config libelf-dev libclang-dev zlib1g-dev zstd
```

## 架构

### Workspace Crate 结构

| Crate | 职责 |
|---|---|
| `landscape-webserver` | 二进制入口。Axum HTTP/HTTPS 服务器、REST API（utoipa/OpenAPI）、WebSocket、基于 ACME 的 TLS。依赖 `landscape` 和 `landscape-database`。 |
| `landscape` | 核心库。所有业务逻辑：配置初始化、设备管理、DHCP 服务器/客户端、DNS、防火墙、流控规则、Geo IP/Site、NAT、PPPoE、路由管理、WiFi、Docker 集成。重导出 netlink 工具函数。 |
| `landscape-common` | 共享类型和工具。`RuntimeConfig`、`LandscapeApiResp<T>`、错误类型（`LdError`、`LdResult`）、`ControllerService` 模式、`LandscapeStore` trait。依赖 `landscape-macro`。 |
| `landscape-ebpf` | eBPF C 程序（位于 `src/bpf/`）+ Rust 用户态加载器。管理 BPF map 路径、pipeline 优先级，以及通过 libbpf-rs 进行程序挂载。 |
| `landscape-database` | SeaORM schema、Repository 模式、数据库迁移。`impl_repository!` 宏生成 `Repository` + `LandscapeStore` 实现。通过 `sea-orm` 使用 SQLite。 |
| `landscape-dns` | 基于 hickory 的 DNS 服务器。 |
| `landscape-gateway` | 基于 Pingora 的反向代理网关。 |
| `landscape-macro` | 过程宏（如 `LdApiError` derive）。 |
| `landscape-protobuf` | 通过 quick-protobuf 定义的 Protobuf 消息。 |
| `landscape-types` | 自动生成的 TypeScript API 客户端（orval）。被 `landscape-webui` 以 `@landscape-router/types` 引入。 |

### 关键模式

**Service Controller 模式**（`landscape-common/src/service/controller.rs`）：`ControllerService` trait 协调服务生命周期——检查冲突、更新内存中的服务、持久化到数据库、失败时回滚。被 NAT、DNS、防火墙、路由等服务使用。

**Repository 模式**（`landscape-database/src/repository.rs`）：每个领域模块定义自己的 `Repository` 实现。`impl_repository!` 宏同时生成 SeaORM `Repository` 实现和 `LandscapeStore` trait 实现。所有 Repository 被组合到 `LandscapeDBServiceProvider` 中，由 webserver 注入到各服务。

**API 响应信封**：所有 REST 端点返回 `LandscapeApiResp<T>`，包含 `data`、`error_id`、`message` 和 `args` 字段。自定义的 `JsonBody<T>` 提取器将 JSON 反序列化错误转换为该信封格式。

**eBPF Pipeline**：BPF 程序通过 TC（traffic control）挂载，按优先级排序：入方向为 防火墙 → NAT → PPPoE → 路由，出方向为 路由 → PPPoE。BPF map 路径命名空间为 `/sys/fs/bpf/landscape/{ebpf_map_space}/`。

**配置存储**：所有配置位于 `~/.landscape-router/`（可自定义）。配置文件为 `landscape.toml`，启动时自动迁移且支持降级。可通过 `landscape_init.toml` 进行初始化配置（可选）。

### 前端
- Vue 3 + Vite + TypeScript，使用 Naive UI 组件库
- 状态管理：Pinia + `pinia-plugin-persistedstate`
- API 客户端位于 `landscape-types/`，由 orval 自动生成——切勿直接编辑
- `@vue-flow/core` 用于拓扑/流量可视化
- `apexcharts` 用于指标图表，`@xterm/xterm` 用于终端模拟

### 数据流
1. Web UI → REST API（axum）→ `ControllerService` → 内存中的 `ServiceManager` + 数据库持久化
2. eBPF 程序通过 TC hook 检查网络接口上的数据包，查询由用户态服务填充的 BPF map
3. 流量调度使用源匹配 `(SIP-CIDR, MAC)` 和目标匹配 `(DIP, domain, Geo)` 规则
4. DNS 是每个流独立的：每个流有自己的 DNS 配置和缓存，避免跨流缓存污染

### 重要约束
- eBPF C 代码中**禁止**格式化 `vmlinux.h`（它是自动生成的）
- `landscape-types/` 中的 API 客户端代码是自动生成的，切勿直接编辑
- 修改后端 OpenAPI 路由或 schema 后，必须运行 `./gen_ts_bindings.sh`
- `sudo` 仅用于运行实际的二进制文件——构建、格式化或测试时绝不使用
- 项目使用 `pnpm` 配合 Corepack；包装脚本通过 `scripts/pnpm_cmd.sh` 解析 pnpm 命令
