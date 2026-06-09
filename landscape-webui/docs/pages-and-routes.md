# Landscape 前端页面与路由文档

> 最后更新：2026-06-08

## 架构概览

前端项目基于 **Vue 3 + Vite + TypeScript**，使用 **Naive UI** 组件库，路由由 **vue-router** (history 模式) 管理。

### 路由结构总览

```
/login                  # 登录页（独立布局）
/                       # 主布局 MainLayout
├── /                   # 系统概览 (Dashboard)
├── /nat                # 静态 NAT
├── /dhcp-v4            # DHCPv4 服务
├── /ipv6-pd            # IPv6 PD
├── /ipv6-ra            # IPv6 RA
├── /flow               # 分流设置
├── /firewall           # 防火墙
├── /dns-redirect       # DNS 重定向
├── /dns-upstream       # 上游 DNS
├── /dns-provider-profiles  # DNS 服务商配置
├── /ddns               # DDNS
├── /geo-domain         # 地理域名
├── /geo-ip             # 地理 IP
├── /docker             # Docker 管理
├── /gateway            # 内网 HTTP 反代
├── /cert-accounts      # ACME 账户
├── /certs              # 证书管理
├── /mac-binding        # 设备管理
├── /config             # 系统配置
├── /metric/conn/live   # 活跃连接
├── /metric/conn/history # 连接历史查询
├── /metric/conn/iface  # 网卡实时
├── /metric/conn/src    # 源 IP 统计
├── /metric/conn/dst    # 目的 IP 统计
├── /metric/conn/history-src  # 源 IP 历史
├── /metric/conn/history-dst  # 目的 IP 历史
├── /metric/dns          # DNS 指标
└── /:pathMatch(.*)*    # 404
```

---

## 路由表详情

### 独立路由（无需 MainLayout）

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/login` | `Login` | `views/Login.vue` | 登录页面，独立于主布局 |

### 主路由（MainLayout 子路由）

所有内页面包裹在 `MainLayout`（`views/MainLayout.vue`）中，该布局包含侧边栏 `LandscapeSiderBar`、顶栏 `AppTopbar` 和全局终端 `GlobalTerminal`。

---

## 侧边栏菜单分组

侧边栏定义在 `views/LandscapeSiderBar.vue`，按功能分为 6 个分组：

| 分组 | i18n Key | 中文名 |
|------|----------|--------|
| 总览 | `group-overview` | 总览 |
| 网络 | `group-network` | 网络 |
| 流量与策略 | `group-traffic-policy` | 流量与策略 |
| 名称服务 | `group-name-service` | 名称服务 |
| 基础设施 | `group-infrastructure` | 基础设施 |
| 系统 | `group-system` | 系统 |

---

## 页面详情

### 1. 总览（Overview）

#### Dashboard — `views/Landscape.vue`
- **路径**: `/`
- **路由名**: `routes.dashboard`
- **功能**: 系统概览面板，展示核心系统状态和网络拓扑
- **核心组件**:
  - `OverviewHero` — 概览头部区域
  - `NetFlow` — 网络拓扑可视化（基于 `@vue-flow/core`）
  - `SystemInfo` — CPU/内存/系统基本信息（`CPUUsage`, `MemUsage`, `SystemInfo`）
  - `DnsStatusCard` — DNS 服务状态卡片
  - `OperationsPanelGrid` — 面板网格布局容器

---

### 2. 网络（Network）

#### 静态 NAT — `views/StaticNatMapping.vue`
- **路径**: `/nat`
- **路由名**: `routes.nat`
- **功能**: 管理静态 NAT 端口映射规则
- **核心组件**:
  - `StaticMappingCard` — 映射规则卡片
  - `MappingEditModal` — 创建/编辑映射弹窗

#### DHCPv4 服务 — `views/status/DHCPv4Server.vue`
- **路径**: `/dhcp-v4`
- **路由名**: `routes.dhcp-v4`
- **功能**: 查看 DHCPv4 分配 IP 信息、ARP 扫描结果
- **核心组件**: `AssignedIpTable`, `DHCPMacExhibit`, `OnlineStatus`

#### IPv6 PD — `views/status/IPv6PD.vue`
- **路径**: `/ipv6-pd`
- **路由名**: `routes.ipv6-pd`
- **功能**: 查看各接口 IPv6 前缀委派 (Prefix Delegation) 状态
- **核心组件**: `IAPrefixInfoCard`

#### IPv6 RA — `views/status/IPv6RA.vue`
- **路径**: `/ipv6-ra`
- **路由名**: `routes.ipv6-ra`
- **功能**: 查看 LAN 侧 IPv6 Router Advertisement 分配信息，含 DHCPv6 分配表
- **核心组件**: `DHCPv6AssignedTable`, `DHCPv6ConfigSection`

---

### 3. 流量与策略（Traffic & Policy）

#### 分流设置 — `views/Flow.vue`
- **路径**: `/flow`
- **路由名**: `routes.flow`
- **功能**: 管理流量调度规则 (Flow Rules)，每个 Flow 定义源匹配 `(SIP-CIDR, MAC)` 和目标匹配 `(DIP, domain, Geo)` 规则
- **核心组件**:
  - `DefaultFlowConfigCard` — 默认流配置 / 创建入口
  - `FlowConfigCard` — 单个流的配置卡片
  - `FlowEditModal` — 流编辑弹窗
  - `FlowMatchRule` / `FlowTargetRule` — 匹配规则编辑
  - `RouteTraceDrawer` — 路由追踪抽屉

#### 防火墙 — `views/Firewall.vue`
- **路径**: `/firewall`
- **路由名**: `routes.firewall`
- **功能**: 管理 IP 黑名单规则，基于 eBPF 的数据包过滤
- **核心组件**:
  - `FirewallWorkbenchHeader` — 工具栏头部
  - `FirewallOverviewStrip` — 概览统计带
  - `FirewallBlacklistCard` — 黑名单规则卡片
  - `FirewallBlacklistEditModal` — 编辑弹窗
  - `FirewallEmptyState` — 空状态展示

---

### 4. 名称服务（Name Service）

#### DNS 重定向 — `views/dns/DnsRedirect.vue`
- **路径**: `/dns-redirect`
- **路由名**: `routes.dns-redirect`
- **功能**: 管理 DNS 重定向规则（将特定域名请求重定向到指定 DNS 服务器）
- **核心组件**: `DnsRedirectCard`, `DnsRedirectEditModal`

#### 上游 DNS — `views/dns/DnsUpstream.vue`
- **路径**: `/dns-upstream`
- **路由名**: `routes.dns-upstream`
- **功能**: 管理上游 DNS 服务器配置
- **核心组件**: `DnsUpstreamCard`, `UpstreamEditModal`, `DefaultUpstream`, `SelectUpstream`

#### DNS 服务商配置 — `views/domain/DnsProviderProfiles.vue`
- **路径**: `/dns-provider-profiles`
- **路由名**: `routes.dns-provider-profiles`
- **功能**: 管理 DNS 服务商凭据配置文件（如 Cloudflare、阿里云等），用于 DDNS 自动更新
- **核心组件**: `ConfigModal`

#### DDNS — `views/domain/DdnsJobs.vue`
- **路径**: `/ddns`
- **路由名**: `routes.ddns`
- **功能**: 管理动态 DNS 任务，监控 DDNS 更新状态
- **核心组件**: `ConfigModal`

#### 地理域名 — `views/GeoDomain.vue`
- **路径**: `/geo-domain`
- **路由名**: `routes.geo-domain`
- **功能**: 管理地理域名规则缓存（GeoSite），查看/刷新域名分类数据库
- **核心组件**:
  - `GeoSiteCacheCard`, `GeoSiteDrawer`
  - `GeoSiteItemCard`, `GeoSiteEditModal`
  - `GeoSiteDetailDrawer`
  - `GeoSiteKeySelect`, `GeoSiteNameSelect`

#### 地理 IP — `views/GeoIp.vue`
- **路径**: `/geo-ip`
- **路由名**: `routes.geo-ip`
- **功能**: 管理地理 IP 规则缓存（GeoIP），查看/刷新 IP 地理位置数据库
- **核心组件**:
  - `GeoIpCacheCard`, `GeoIpDrawer`
  - `GeoIpItemCard`, `GeoIpEditModal`
  - `GeoIpDetailDrawer`
  - `GeoIpKeySelect`, `GeoIpNameSelect`

---

### 5. 基础设施（Infrastructure）

#### Docker 管理 — `views/Docker.vue`
- **路径**: `/docker`
- **路由名**: `routes.docker`
- **功能**: 管理 Docker 容器和镜像，包括容器运行状态、拉取镜像
- **核心组件**:
  - `DockerStatusCard` — Docker 服务状态
  - `DockerAllContainer` — 所有容器列表
  - `DockerContainerCard` — 容器详情卡片
  - `ContainerRunModal` — 运行容器弹窗
  - `DockerImageCard` / `DockerImageDrawer` — 镜像管理
  - `ImagePullModal` / `PullTaskCard` / `ImgPullHistory` — 镜像拉取任务

#### 内网 HTTP 反代 — `views/Gateway.vue`
- **路径**: `/gateway`
- **路由名**: `routes.gateway`
- **功能**: 管理基于 Pingora 的反向代理网关规则，支持 HTTP/HTTPS 端口配置
- **核心组件**: `GatewayRuleCard`, `GatewayRuleEditModal`

#### ACME 账户 — `views/cert/CertAccounts.vue`
- **路径**: `/cert-accounts`
- **路由名**: `routes.cert-accounts`
- **功能**: 管理 ACME (Let's Encrypt) 证书账户
- **核心组件**: `CertAccountCard`, `CertAccountEditModal`

#### 证书管理 — `views/cert/CertOrders.vue`
- **路径**: `/certs`
- **路由名**: `routes.certs`
- **功能**: 管理 TLS 证书订单，支持颁发、续期、撤销操作
- **核心组件**: `CertOrderCard`, `CertOrderEditModal`, `CertInfoModal`

---

### 6. 系统（System）

#### 指标监控 — 连接信息

| 页面 | 路径 | 组件 | 说明 |
|------|------|------|------|
| 活跃连接 | `/metric/conn/live` | `views/metric/conn/LiveMetric.vue` | 实时活跃连接列表，含虚拟滚动 |
| 历史查询 | `/metric/conn/history` | `views/metric/conn/HistoryMetric.vue` | 按时间范围查询历史连接 |
| 网卡实时 | `/metric/conn/iface` | `views/metric/conn/IfaceMetric.vue` | 按网卡维度展示实时连接统计 |
| 源 IP 统计 | `/metric/conn/src` | `views/metric/conn/SrcIpMetric.vue` | 按源 IP 聚合的连接统计 |
| 目的 IP 统计 | `/metric/conn/dst` | `views/metric/conn/DstIpMetric.vue` | 按目的 IP 聚合的连接统计 |
| 源 IP 历史 | `/metric/conn/history-src` | `views/metric/conn/HistorySrcIpMetric.vue` | 历史源 IP 连接统计 |
| 目的 IP 历史 | `/metric/conn/history-dst` | `views/metric/conn/HistoryDstIpMetric.vue` | 历史目的 IP 连接统计 |

**核心组件**（指标模块公共）:
- `ConnectVirtualList` — 虚拟滚动连接列表
- `LiveConnectChart` / `HistoryConnectChart` — 实时/历史连接图表
- `IpStatsList` / `HistoryIpStatsList` — IP 统计列表
- `ConnectChartDrawer` — 连接图表抽屉
- `ConnectViewSwitcher` — 视图切换器

#### 指标监控 — DNS — `views/metric/DNSMetric.vue`
- **路径**: `/metric/dns`
- **路由名**: `routes.dns-metric`
- **功能**: DNS 查询指标（仪表盘 + 查询表格 + 历史图表），支持按设备筛选
- **核心组件**: `DNSDashboard` (仪表盘子组件)

#### 设备管理 — `views/EnrolledDevice.vue`
- **路径**: `/mac-binding`
- **路由名**: `routes.mac-binding`
- **功能**: 管理已注册设备 MAC 绑定，设备身份识别
- **核心组件**: `EnrolledDeviceCard`, `EnrolledDeviceEditModal`

#### 系统配置 — `views/Config.vue`
- **路径**: `/config`
- **路由名**: `routes.config`
- **功能**: 系统配置集中管理页面
- **子配置卡片**:
  - `UIConfigCard` — 前端 UI 偏好设置
  - `DNSConfigCard` — DNS 全局配置
  - `MetricConfigCard` — 指标采集配置
  - `BackupConfigCard` — 备份与恢复配置
  - `PasswordConfigCard` — 管理员密码修改

---

### 错误页面

| 页面 | 路由 | 组件 | 说明 |
|------|------|------|------|
| 404 | `/:pathMatch(.*)*` | `views/error/NotFound.vue` | Catch-all 路由，显示 404 页面 |

---

## 路由文件结构

```
src/router/
├── index.ts           # 主路由定义（MainLayout + Login）
├── metric.ts          # 指标监控子路由（8 条）
└── service_status.ts  # 服务状态子路由（3 条：DHCPv4, IPv6PD, IPv6RA）
```

## 视图文件结构

```
src/views/
├── Landscape.vue          # Dashboard
├── MainLayout.vue         # 主布局容器
├── Login.vue              # 登录页
├── LandscapeSiderBar.vue  # 侧边栏（菜单定义）
├── StaticNatMapping.vue   # 静态 NAT
├── Flow.vue               # 分流设置
├── Firewall.vue           # 防火墙
├── Docker.vue             # Docker 管理
├── Gateway.vue            # 内网反代
├── GeoDomain.vue          # 地理域名
├── GeoIp.vue              # 地理 IP
├── Config.vue             # 系统配置
├── EnrolledDevice.vue     # 设备管理
├── cert/
│   ├── CertAccounts.vue   # ACME 账户
│   └── CertOrders.vue     # 证书管理
├── dns/
│   ├── DnsRedirect.vue    # DNS 重定向
│   └── DnsUpstream.vue    # 上游 DNS
├── domain/
│   ├── DdnsJobs.vue       # DDNS
│   └── DnsProviderProfiles.vue  # DNS 服务商配置
├── error/
│   └── NotFound.vue       # 404
├── metric/
│   ├── DNSMetric.vue      # DNS 指标
│   ├── DNSDashboard.vue   # DNS 仪表盘
│   └── conn/
│       ├── LiveMetric.vue
│       ├── HistoryMetric.vue
│       ├── IfaceMetric.vue
│       ├── SrcIpMetric.vue
│       ├── DstIpMetric.vue
│       ├── HistorySrcIpMetric.vue
│       └── HistoryDstIpMetric.vue
├── status/
│   ├── DHCPv4Server.vue
│   ├── IPv6PD.vue
│   └── IPv6RA.vue
└── config_parts/
    ├── UIConfigCard.vue
    ├── DNSConfigCard.vue
    ├── MetricConfigCard.vue
    ├── BackupConfigCard.vue
    └── PasswordConfigCard.vue
```

## 关键设计模式

- **MainLayout** 是承载所有内页面的容器，包含侧边栏 + 顶栏 + 全局终端 dock
- **侧边栏菜单**在 `LandscapeSiderBar.vue` 中用 `computed` 定义，分组结构比路由更丰富（有嵌套子菜单，如 DNS 相关、Geo、Domains & Certificates、Metrics、Connect Info 等）
- 部分侧边栏菜单项（如 `geo`、`dns`、`metric-group`、`connect-info`）是**非路由纯菜单节点**，仅用于展开子菜单
- **Split 子路由**：`metric.ts` 和 `service_status.ts` 将路由定义拆分到独立文件，通过 spread 操作符合并到主路由数组
