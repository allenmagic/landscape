# Landscape Web UI 重设计第一阶段实施计划

> 原文：[`2026-05-15-landscape-webui-redesign-phase1.md`](./2026-05-15-landscape-webui-redesign-phase1.md)
>
> 说明：本文件为中文整理版，保留原计划的任务结构、文件范围、实施顺序和验收标准。具体代码示例与命令片段请以原文为准。

> **供执行型 agent 使用：** 推荐配合 `superpowers:subagent-driven-development` 或 `superpowers:executing-plans`，按任务逐项推进。原计划使用 `- [ ]` 复选框语法追踪步骤。

**目标：** 在不改变后端行为的前提下，完成 `Landscape Web UI` 第一阶段重设计，包括新的、受 Vercel 风格启发的应用壳层，更新为浅色优先的主题 token，重设计首页，以及重设计 `Firewall` 页面。

**架构思路：** 新增一层较薄的表现层，用于承载主题 token 和 shell 基础组件；随后让应用框架、首页和 `Firewall` 页面逐步迁移到这套基础组件上。数据流、路由和 API 接线尽量保持不变，因此这次工作本质上是 UI 架构升级，而不是前端逻辑重写。

**技术栈：** Vue 3、Vite、TypeScript、Naive UI、Pinia、Vue I18n、Vitest、Vue Test Utils

---

## 文件范围

### 需要修改的现有文件

- `landscape-webui/package.json`
  增加测试工具链和测试脚本。
- `landscape-webui/src/App.vue`
  通过 `NConfigProvider` 接入新的浅色优先主题覆盖。
- `landscape-webui/src/style.css`
  将全局背景、根尺寸、字体和 shell 级样式迁移到新的 token 语言。
- `landscape-webui/src/views/MainLayout.vue`
  用新的应用壳层替换当前较薄的头部和普通内容框架。
- `landscape-webui/src/views/LandscapeSiderBar.vue`
  重建导航分组、产品化 framing 和折叠态行为。
- `landscape-webui/src/views/Landscape.vue`
  用新的总览 Hero、Network Canvas 和运维面板替换当前较平的卡片网格。
- `landscape-webui/src/views/Firewall.vue`
  将当前普通黑名单列表页改造成工作台式布局。
- `landscape-webui/src/components/firewall/FirewallBlacklistCard.vue`
  调整卡片内容样式，使其符合新的 `Firewall` 工作台语言。
- `landscape-webui/src/stores/preference.ts`
  将默认主题回退从深色改为浅色。
- `landscape-webui/src/i18n/zh/main.ts`
  更新路由分组标签和 shell 文案。
- `landscape-webui/src/i18n/en/main.ts`
  更新路由分组标签和 shell 文案。

### 需要新增的文件

- `landscape-webui/vitest.config.ts`
  Vue SFC 测试的 Vitest 配置。
- `landscape-webui/src/test/setup.ts`
  共享测试初始化和组件桩。
- `landscape-webui/src/theme/tokens.ts`
  颜色、圆角、阴影、间距和布局常量的类型化 token 定义。
- `landscape-webui/src/theme/naiveTheme.ts`
  将 token 层映射为 Naive UI 的 `themeOverrides`。
- `landscape-webui/src/components/shell/AppShellSidebarSection.vue`
  可复用的侧边栏分组渲染器。
- `landscape-webui/src/components/shell/AppTopbar.vue`
  新的页面上下文顶部栏。
- `landscape-webui/src/components/shell/AppRouteTabs.vue`
  重新设计的路由历史标签。
- `landscape-webui/src/components/shell/PageHeader.vue`
  统一页面头部组件，含标题、副标题、状态插槽和操作插槽。
- `landscape-webui/src/components/shell/SurfacePanel.vue`
  统一软质表面容器，用于 shell、页面主体和 dashboard 区块。
- `landscape-webui/src/components/dashboard/OverviewHero.vue`
  首页 Hero，承载系统摘要和状态提示。
- `landscape-webui/src/components/dashboard/OperationsPanelGrid.vue`
  CPU、内存、DNS 和系统信息面板的统一外层。
- `landscape-webui/src/components/firewall/FirewallOverviewStrip.vue`
  `Firewall` 页顶部摘要条。
- `landscape-webui/src/components/firewall/FirewallWorkbenchHeader.vue`
  `Firewall` 页头部和主要操作区。
- `landscape-webui/src/components/firewall/FirewallEmptyState.vue`
  `Firewall` 页的新空状态。

### 需要新增的测试文件

- `landscape-webui/src/theme/naiveTheme.test.ts`
- `landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts`
- `landscape-webui/src/views/__tests__/Landscape.test.ts`
- `landscape-webui/src/views/__tests__/Firewall.test.ts`

---

## 任务 1：加入 UI 测试基建和主题 Token 层

**涉及文件：**

- 新增：`landscape-webui/vitest.config.ts`
- 新增：`landscape-webui/src/test/setup.ts`
- 新增：`landscape-webui/src/theme/tokens.ts`
- 新增：`landscape-webui/src/theme/naiveTheme.ts`
- 测试：`landscape-webui/src/theme/naiveTheme.test.ts`
- 修改：`landscape-webui/package.json`
- 修改：`landscape-webui/src/App.vue`
- 修改：`landscape-webui/src/style.css`
- 修改：`landscape-webui/src/stores/preference.ts`

- [ ] **Step 1：先写一个失败的主题测试**
  验证新的浅色优先 token 和 Naive UI `themeOverrides` 是否导出并匹配目标颜色、surface 和圆角。

- [ ] **Step 2：运行测试并确认失败**
  预期原因包括：`vitest` 尚未安装、`src/theme/naiveTheme.ts` 不存在、导出未实现。

- [ ] **Step 3：补齐测试工具链和主题实现**
  需要完成的工作：
  - 在 `package.json` 中增加 `test` 脚本和测试依赖。
  - 新建 `vitest.config.ts`。
  - 新建 `src/test/setup.ts`。
  - 新建 `src/theme/tokens.ts`。
  - 新建 `src/theme/naiveTheme.ts`。
  - 在 `App.vue` 中将 `appThemeOverrides` 接入 `NConfigProvider`。
  - 在 `style.css` 中引入新的全局背景、字体和布局基础。
  - 在 `preference` store 中把主题默认值切换为 `light`。

- [ ] **Step 4：安装依赖并重新跑测试**
  预期结果：主题测试通过。

- [ ] **Step 5：提交**
  提交信息：`feat: add landscape webui theme foundation`

---

## 任务 2：重建应用 Shell 和导航

**涉及文件：**

- 新增：`landscape-webui/src/components/shell/AppShellSidebarSection.vue`
- 新增：`landscape-webui/src/components/shell/AppTopbar.vue`
- 新增：`landscape-webui/src/components/shell/AppRouteTabs.vue`
- 新增：`landscape-webui/src/components/shell/PageHeader.vue`
- 新增：`landscape-webui/src/components/shell/SurfacePanel.vue`
- 测试：`landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts`
- 修改：`landscape-webui/src/views/LandscapeSiderBar.vue`
- 修改：`landscape-webui/src/views/MainLayout.vue`
- 修改：`landscape-webui/src/i18n/zh/main.ts`
- 修改：`landscape-webui/src/i18n/en/main.ts`

- [ ] **Step 1：先写一个失败的侧边栏分组测试**
  测试目标是确认新的任务导向导航分组已渲染出来。

- [ ] **Step 2：运行测试并确认失败**
  预期原因：当前侧边栏还没有渲染新的路由分组标签。

- [ ] **Step 3：实现新的 shell 基础组件和重组后的侧边栏**
  需要完成的工作：
  - 新建 `SurfacePanel.vue`，作为统一的浅色表面容器。
  - 新建 `AppRouteTabs.vue`，负责顶部历史路由标签。
  - 新建 `AppTopbar.vue`，提供新的页面上下文栏。
  - 新建 `AppShellSidebarSection.vue`，渲染按组组织的菜单。
  - 新建 `PageHeader.vue`，统一页面头部。
  - 在中英文 i18n 中加入新的路由分组文案。
  - 修改 `LandscapeSiderBar.vue`，将原来的扁平菜单改造成按组构造的菜单。
  - 修改 `MainLayout.vue`，接入 `AppTopbar` 和新的 shell body。

- [ ] **Step 4：运行侧边栏测试和构建检查**
  预期结果：
  - 侧边栏测试通过。
  - `landscape-webui` 构建通过。

- [ ] **Step 5：提交**
  提交信息：`feat: redesign landscape webui shell`

---

## 任务 3：将首页重设计为控制台 Landing Page

**涉及文件：**

- 新增：`landscape-webui/src/components/dashboard/OverviewHero.vue`
- 新增：`landscape-webui/src/components/dashboard/OperationsPanelGrid.vue`
- 测试：`landscape-webui/src/views/__tests__/Landscape.test.ts`
- 修改：`landscape-webui/src/views/Landscape.vue`
- 修改：`landscape-webui/src/components/sysinfo/SystemInfo.vue`
- 修改：`landscape-webui/src/components/sysinfo/CPUUsage.vue`
- 修改：`landscape-webui/src/components/sysinfo/MemUsage.vue`
- 修改：`landscape-webui/src/components/dns/DnsStatusCard.vue`

- [ ] **Step 1：先写一个失败的首页结构测试**
  测试目标是验证页面中出现这三个核心区块标记：
  - `overview-hero`
  - `network-canvas`
  - `operations-panels`

- [ ] **Step 2：运行测试并确认失败**
  预期原因：当前首页还没有这些新结构。

- [ ] **Step 3：实现首页 Hero 和分段式 dashboard**
  需要完成的工作：
  - 新建 `OverviewHero.vue`。
  - 新建 `OperationsPanelGrid.vue`。
  - 修改 `Landscape.vue`，使其依次包含：
    - 顶部 `OverviewHero`
    - 中段 `Network Canvas`
    - 底部运行态信息面板
  - 微调 `SystemInfo.vue`、`CPUUsage.vue`、`MemUsage.vue`、`DnsStatusCard.vue` 的内部卡片样式，使其统一到新的视觉语言。

- [ ] **Step 4：运行首页测试和构建**
  预期结果：
  - 首页测试通过。
  - `landscape-webui` 构建通过。

- [ ] **Step 5：提交**
  提交信息：`feat: redesign landscape homepage`

---

## 任务 4：将 `Firewall` 页面重设计为策略工作台

**涉及文件：**

- 新增：`landscape-webui/src/components/firewall/FirewallOverviewStrip.vue`
- 新增：`landscape-webui/src/components/firewall/FirewallWorkbenchHeader.vue`
- 新增：`landscape-webui/src/components/firewall/FirewallEmptyState.vue`
- 测试：`landscape-webui/src/views/__tests__/Firewall.test.ts`
- 修改：`landscape-webui/src/views/Firewall.vue`
- 修改：`landscape-webui/src/components/firewall/FirewallBlacklistCard.vue`

- [ ] **Step 1：先写一个失败的 `Firewall` 页面测试**
  测试目标是验证两个关键结构标记：
  - `firewall-workbench`
  - `firewall-overview`

- [ ] **Step 2：运行测试并确认失败**
  预期原因：当前 `Firewall` 页面尚未具备新的工作台结构。

- [ ] **Step 3：实现 `Firewall` 工作台结构**
  需要完成的工作：
  - 新建 `FirewallWorkbenchHeader.vue`。
  - 新建 `FirewallOverviewStrip.vue`。
  - 新建 `FirewallEmptyState.vue`。
  - 修改 `Firewall.vue`，将页面结构调整为：
    - 顶部工作台 Header
    - 规则摘要条
    - 主工作区 SurfacePanel
    - 有规则时展示卡片网格
    - 无规则时展示空状态
    - 保留原有创建/编辑弹窗逻辑
  - 修改 `FirewallBlacklistCard.vue`，使其卡片样式与工作台语言一致。

- [ ] **Step 4：运行 `Firewall` 测试和构建**
  预期结果：
  - `Firewall` 测试通过。
  - `landscape-webui` 构建通过。

- [ ] **Step 5：提交**
  提交信息：`feat: redesign firewall workbench`

---

## 任务 5：完成跨页面统一打磨

**涉及文件：**

- 修改：`landscape-webui/src/style.css`
- 修改：`landscape-webui/src/views/MainLayout.vue`
- 修改：`landscape-webui/src/views/Landscape.vue`
- 修改：`landscape-webui/src/views/Firewall.vue`
- 修改：`landscape-webui/src/components/shell/PageHeader.vue`
- 修改：`landscape-webui/src/components/shell/SurfacePanel.vue`

- [ ] **Step 1：补一个最终 shell 冒烟测试**
  在 `LandscapeSiderBar.test.ts` 中追加测试，确保导航重组后 shell 标签仍可见。

- [ ] **Step 2：在 polish 开始前先跑一次冒烟测试**
  预期结果：测试先通过，再开始统一打磨。

- [ ] **Step 3：执行最后一轮一致性收尾**
  需要完成的工作：
  - 在 `style.css` 中加入响应式规则。
  - 调整 `MainLayout.vue` 和新 shell 组件，使 PTY 打开时 body padding 仍然稳定，窄屏下 top bar 仍可读。
  - 确保尚未重做的页面也能继承新的页面边距和 surface 节奏。
  - 调整 `Landscape.vue` 和 `Firewall.vue`，统一 section gap、空状态和高密度内容区块的节奏。

- [ ] **Step 4：执行第一阶段完整验证**
  预期结果：
  - Vitest 全部通过。
  - 构建通过。
  - Prettier 检查通过，无额外格式化改动。

- [ ] **Step 5：提交**
  提交信息：`feat: polish landscape webui redesign phase one`

---

## 规格覆盖检查

- 视觉系统和 token 层：由任务 1 覆盖。
- 受 Vercel 启发的 shell 和导航分组：由任务 2 覆盖。
- 首页重设计，包括 `Overview Hero`、`Network Canvas` 和 `Operational Panels`：由任务 3 覆盖。
- `Firewall` 作为代表性工作台页面：由任务 4 覆盖。
- 第一阶段的一致性、响应式，以及与未重做页面共存：由任务 5 覆盖。

原设计文档中的每个主要目标都有对应实施任务，没有遗漏区块。

## 占位符检查

原计划已检查常见占位符和模糊的“以后再处理”描述。

计划正文中没有残留占位内容。

## 类型与命名一致性检查

- 主题导出在各任务中统一使用 `appThemeTokens` 和 `appThemeOverrides`。
- 导航重组在测试和 i18n 中统一使用相同的 route-group key。
- 首页测试和实现统一使用这三个标记：`overview-hero`、`network-canvas`、`operations-panels`。
- `Firewall` 页面测试和实现统一使用这两个标记：`firewall-workbench`、`firewall-overview`。

当前计划中不存在相互冲突的命名。
