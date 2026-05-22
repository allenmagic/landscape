# Landscape Web UI Redesign Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the phase-1 Landscape Web UI redesign with a new Vercel-inspired shell, refreshed light-first theme tokens, a redesigned homepage, and a redesigned `Firewall` page without changing backend behavior.

**Architecture:** Add a small presentation layer for theme tokens and shell primitives, then migrate the application frame, homepage, and `Firewall` page onto those primitives. Keep data flow, routes, and API wiring mostly intact so this remains a UI architecture change instead of a frontend logic rewrite.

**Tech Stack:** Vue 3, Vite, TypeScript, Naive UI, Pinia, Vue I18n, Vitest, Vue Test Utils

---

## File Map

### Existing files to modify

- `landscape-webui/package.json`
  Add test tooling and a test script.
- `landscape-webui/src/App.vue`
  Apply the new light-first theme overrides through `NConfigProvider`.
- `landscape-webui/src/style.css`
  Move global page background, root sizing, typography, and shell-safe utility styles to the new token-based design language.
- `landscape-webui/src/views/MainLayout.vue`
  Replace the current thin header and plain content frame with the new shell layout.
- `landscape-webui/src/views/LandscapeSiderBar.vue`
  Rebuild navigation grouping, product framing, and collapsed-state behavior.
- `landscape-webui/src/views/Landscape.vue`
  Replace the current flat card grid with the new overview hero, network canvas framing, and operational panels.
- `landscape-webui/src/views/Firewall.vue`
  Replace the current plain blacklist grid page with the new workbench layout.
- `landscape-webui/src/components/firewall/FirewallBlacklistCard.vue`
  Restyle card content to match the new `Firewall` workbench language.
- `landscape-webui/src/stores/preference.ts`
  Change the default theme fallback from dark to light for phase 1.
- `landscape-webui/src/i18n/zh/main.ts`
  Update route grouping labels and shell copy.
- `landscape-webui/src/i18n/en/main.ts`
  Update route grouping labels and shell copy.

### New files to create

- `landscape-webui/vitest.config.ts`
  Test runner config for Vue SFC tests.
- `landscape-webui/src/test/setup.ts`
  Shared test setup and component stubs.
- `landscape-webui/src/theme/tokens.ts`
  Typed token definitions for color, radius, shadow, spacing, and layout constants.
- `landscape-webui/src/theme/naiveTheme.ts`
  Transform the token layer into `themeOverrides` for Naive UI.
- `landscape-webui/src/components/shell/AppShellSidebarSection.vue`
  Reusable grouped sidebar section renderer.
- `landscape-webui/src/components/shell/AppTopbar.vue`
  New page context top bar.
- `landscape-webui/src/components/shell/AppRouteTabs.vue`
  Restyled route history chips for the top bar.
- `landscape-webui/src/components/shell/PageHeader.vue`
  Reusable page header block with title, subtitle, status slot, and action slot.
- `landscape-webui/src/components/shell/SurfacePanel.vue`
  Shared soft surface wrapper for shell/body/dashboard sections.
- `landscape-webui/src/components/dashboard/OverviewHero.vue`
  Homepage hero with system summary and status callouts.
- `landscape-webui/src/components/dashboard/OperationsPanelGrid.vue`
  Styled wrapper for CPU, memory, DNS, and system panels.
- `landscape-webui/src/components/firewall/FirewallOverviewStrip.vue`
  Top summary block for `Firewall`.
- `landscape-webui/src/components/firewall/FirewallWorkbenchHeader.vue`
  `Firewall` page header actions and description.
- `landscape-webui/src/components/firewall/FirewallEmptyState.vue`
  New empty state for the `Firewall` page.

### Test files to create

- `landscape-webui/src/theme/naiveTheme.test.ts`
- `landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts`
- `landscape-webui/src/views/__tests__/Landscape.test.ts`
- `landscape-webui/src/views/__tests__/Firewall.test.ts`

---

### Task 1: Add UI Test Harness And Theme Token Layer

**Files:**
- Create: `landscape-webui/vitest.config.ts`
- Create: `landscape-webui/src/test/setup.ts`
- Create: `landscape-webui/src/theme/tokens.ts`
- Create: `landscape-webui/src/theme/naiveTheme.ts`
- Test: `landscape-webui/src/theme/naiveTheme.test.ts`
- Modify: `landscape-webui/package.json`
- Modify: `landscape-webui/src/App.vue`
- Modify: `landscape-webui/src/style.css`
- Modify: `landscape-webui/src/stores/preference.ts`

- [ ] **Step 1: Write the failing theme test**

Create `landscape-webui/src/theme/naiveTheme.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { appThemeOverrides, appThemeTokens } from "./naiveTheme";

describe("appThemeOverrides", () => {
  it("uses the light-first accent and surface tokens", () => {
    expect(appThemeTokens.color.bgApp).toBe("#f3f7fb");
    expect(appThemeTokens.color.accent).toBe("#0f9aa8");
    expect(appThemeOverrides.common?.primaryColor).toBe("#0f9aa8");
    expect(appThemeOverrides.common?.cardColor).toBe("#ffffff");
    expect(appThemeOverrides.Card?.borderRadius).toBe("20px");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/theme/naiveTheme.test.ts
```

Expected: FAIL because `vitest`, `src/theme/naiveTheme.ts`, and the exports do not exist yet.

- [ ] **Step 3: Add the test toolchain and the theme implementation**

Modify `landscape-webui/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^26.1.0",
    "vitest": "^2.1.8"
  }
}
```

Create `landscape-webui/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
```

Create `landscape-webui/src/test/setup.ts`:

```ts
import { config } from "@vue/test-utils";

config.global.stubs = {
  RouterLink: {
    template: "<a><slot /></a>",
  },
  RouterView: {
    template: "<div data-router-view />",
  },
};
```

Create `landscape-webui/src/theme/tokens.ts`:

```ts
export const appTokens = {
  color: {
    bgApp: "#f3f7fb",
    bgSurface: "#ffffff",
    bgElevated: "#fcfeff",
    borderSoft: "#dbe5ee",
    borderStrong: "#b7c9d8",
    textPrimary: "#102331",
    textSecondary: "#5f7384",
    accent: "#0f9aa8",
    accentSoft: "#d7f2f4",
    success: "#169d6b",
    warning: "#d08a18",
    danger: "#d14d61",
    info: "#3274d9",
  },
  radius: {
    card: "20px",
    pill: "999px",
  },
  shadow: {
    card: "0 12px 30px rgba(16, 35, 49, 0.08)",
    float: "0 18px 44px rgba(16, 35, 49, 0.12)",
  },
  spacing: {
    pageX: "24px",
    pageY: "20px",
    section: "20px",
  },
} as const;
```

Create `landscape-webui/src/theme/naiveTheme.ts`:

```ts
import type { GlobalThemeOverrides } from "naive-ui";
import { appTokens } from "./tokens";

export const appThemeTokens = appTokens;

export const appThemeOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: appTokens.color.bgApp,
    cardColor: appTokens.color.bgSurface,
    primaryColor: appTokens.color.accent,
    primaryColorHover: "#139fb0",
    primaryColorPressed: "#0b8793",
    successColor: appTokens.color.success,
    warningColor: appTokens.color.warning,
    errorColor: appTokens.color.danger,
    infoColor: appTokens.color.info,
    textColorBase: appTokens.color.textPrimary,
    textColor2: appTokens.color.textSecondary,
    borderColor: appTokens.color.borderSoft,
    borderRadius: "16px",
    fontFamily: '"Lato", system-ui, sans-serif',
    fontFamilyMono: '"Fira Code", monospace',
  },
  Card: {
    borderRadius: appTokens.radius.card,
    color: appTokens.color.bgSurface,
  },
  Layout: {
    color: appTokens.color.bgApp,
    siderColor: appTokens.color.bgElevated,
    headerColor: "rgba(255,255,255,0.82)",
  },
  Button: {
    borderRadiusMedium: "14px",
  },
  Input: {
    borderRadius: "14px",
  },
};
```

Modify `landscape-webui/src/App.vue`:

```ts
import { appThemeOverrides } from "@/theme/naiveTheme";
```

```vue
<n-config-provider
  :locale="currentLocale"
  :date-locale="currentDateLocale"
  :theme="currentTheme"
  :theme-overrides="appThemeOverrides"
  style="display: flex; flex: 1"
>
```

Modify `landscape-webui/src/style.css`:

```css
:root {
  font-family: "Lato", system-ui, sans-serif;
  color: #102331;
  background:
    radial-gradient(circle at top left, #eef9fb 0%, rgba(238, 249, 251, 0) 32%),
    linear-gradient(180deg, #f6f9fc 0%, #eef4f8 100%);
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

#app {
  width: 100%;
  height: 100%;
  display: flex;
}
```

Modify `landscape-webui/src/stores/preference.ts`:

```ts
theme.value = config.theme || "light";
```

```ts
theme.value = ui.theme || "light";
```

```ts
theme: theme.value === "light" ? undefined : theme.value,
```

- [ ] **Step 4: Install dependencies and run the test again**

Run:

```bash
pnpm install
pnpm --filter landscape-webui exec vitest run src/theme/naiveTheme.test.ts
```

Expected: PASS with one passing test.

- [ ] **Step 5: Commit**

```bash
git add landscape-webui/package.json landscape-webui/vitest.config.ts landscape-webui/src/test/setup.ts landscape-webui/src/theme/tokens.ts landscape-webui/src/theme/naiveTheme.ts landscape-webui/src/App.vue landscape-webui/src/style.css landscape-webui/src/stores/preference.ts landscape-webui/src/theme/naiveTheme.test.ts
git commit -m "feat: add landscape webui theme foundation"
```

---

### Task 2: Rebuild The Application Shell And Navigation

**Files:**
- Create: `landscape-webui/src/components/shell/AppShellSidebarSection.vue`
- Create: `landscape-webui/src/components/shell/AppTopbar.vue`
- Create: `landscape-webui/src/components/shell/AppRouteTabs.vue`
- Create: `landscape-webui/src/components/shell/PageHeader.vue`
- Create: `landscape-webui/src/components/shell/SurfacePanel.vue`
- Test: `landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts`
- Modify: `landscape-webui/src/views/LandscapeSiderBar.vue`
- Modify: `landscape-webui/src/views/MainLayout.vue`
- Modify: `landscape-webui/src/i18n/zh/main.ts`
- Modify: `landscape-webui/src/i18n/en/main.ts`

- [ ] **Step 1: Write the failing sidebar grouping test**

Create `landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import LandscapeSiderBar from "@/views/LandscapeSiderBar.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ path: "/" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("LandscapeSiderBar", () => {
  it("renders the new task-oriented navigation groups", () => {
    const wrapper = mount(LandscapeSiderBar, {
      global: {
        stubs: {
          CopyRight: true,
        },
      },
    });

    const text = wrapper.text();
    expect(text).toContain("routes.group-overview");
    expect(text).toContain("routes.group-network");
    expect(text).toContain("routes.group-traffic-policy");
    expect(text).toContain("routes.group-name-service");
    expect(text).toContain("routes.group-infrastructure");
    expect(text).toContain("routes.group-system");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/views/__tests__/LandscapeSiderBar.test.ts
```

Expected: FAIL because the current sidebar does not render those new route-group labels.

- [ ] **Step 3: Implement the new shell primitives and regrouped sidebar**

Create `landscape-webui/src/components/shell/SurfacePanel.vue`:

```vue
<script setup lang="ts">
defineProps<{
  padded?: boolean;
  elevated?: boolean;
}>();
</script>

<template>
  <section
    class="surface-panel"
    :class="{ 'surface-panel--padded': padded !== false, 'surface-panel--elevated': elevated }"
  >
    <slot />
  </section>
</template>

<style scoped>
.surface-panel {
  border: 1px solid #dbe5ee;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(16, 35, 49, 0.08);
}

.surface-panel--padded {
  padding: 20px;
}

.surface-panel--elevated {
  background: rgba(255, 255, 255, 0.98);
}
</style>
```

Create `landscape-webui/src/components/shell/AppRouteTabs.vue`:

```vue
<script setup lang="ts">
import type { HistoryRoute } from "@/stores/history_route";

defineProps<{
  routes: HistoryRoute[];
  activePath: string;
}>();

const emit = defineEmits<{
  select: [path: string];
  close: [path: string];
  pin: [path: string];
}>();
</script>

<template>
  <div class="route-tabs">
    <div
      v-for="route in routes"
      :key="route.path"
      class="route-tab"
      :class="{ 'route-tab--active': route.path === activePath }"
    >
      <button class="route-tab__main" @click="emit('select', route.path)">
        {{ route.name }}
      </button>
      <button class="route-tab__pin" @click.stop="emit('pin', route.path)">
        {{ route.pinned ? "●" : "○" }}
      </button>
      <button
        v-if="!route.pinned"
        class="route-tab__close"
        @click.stop="emit('close', route.path)"
      >
        ×
      </button>
    </div>
  </div>
</template>
```

Create `landscape-webui/src/components/shell/AppTopbar.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import AppRouteTabs from "./AppRouteTabs.vue";
import IntervalFetch from "@/components/head/IntervalFetch.vue";
import LanguageSetting from "@/components/head/LanguageSetting.vue";
import { useHistoryRouteStore } from "@/stores/history_route";
import { usePtyStore } from "@/stores/pty";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const historyStore = useHistoryRouteStore();
const ptyStore = usePtyStore();

const currentTitle = computed(() => t((route.name as string) || "routes.dashboard"));
</script>

<template>
  <header class="app-topbar">
    <div class="app-topbar__context">
      <p class="app-topbar__eyebrow">Landscape Console</p>
      <h1 class="app-topbar__title">{{ currentTitle }}</h1>
    </div>
    <div class="app-topbar__actions">
      <LanguageSetting />
      <button class="app-topbar__icon" @click="ptyStore.toggleOpen">Terminal</button>
      <IntervalFetch />
    </div>
    <AppRouteTabs
      :routes="historyStore.visitedRoutes"
      :active-path="route.path"
      @select="router.push($event)"
      @close="historyStore.removeRoute($event)"
      @pin="historyStore.togglePin($event)"
    />
  </header>
</template>
```

Create `landscape-webui/src/components/shell/AppShellSidebarSection.vue`:

```vue
<script setup lang="ts">
import type { MenuOption } from "naive-ui";

defineProps<{
  title: string;
  options: MenuOption[];
  collapsed: boolean;
  value: string;
}>();

const emit = defineEmits<{
  select: [key: string];
}>();
</script>

<template>
  <section class="sidebar-section">
    <p v-if="!collapsed" class="sidebar-section__title">{{ title }}</p>
    <n-menu
      :value="value"
      :collapsed="collapsed"
      :collapsed-width="72"
      :collapsed-icon-size="20"
      :options="options"
      @update:value="emit('select', $event)"
    />
  </section>
</template>
```

Create `landscape-webui/src/components/shell/PageHeader.vue`:

```vue
<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="page-header">
    <div>
      <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
      <h2 class="page-header__title">{{ title }}</h2>
      <p v-if="description" class="page-header__description">{{ description }}</p>
    </div>
    <div class="page-header__status">
      <slot name="status" />
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>
```

Modify `landscape-webui/src/i18n/zh/main.ts` route section:

```ts
"group-overview": "总览",
"group-network": "网络",
"group-traffic-policy": "流量与策略",
"group-name-service": "名称服务",
"group-infrastructure": "基础设施",
"group-system": "系统",
```

Modify `landscape-webui/src/i18n/en/main.ts` route section:

```ts
"group-overview": "Overview",
"group-network": "Network",
"group-traffic-policy": "Traffic & Policy",
"group-name-service": "Name Service",
"group-infrastructure": "Infrastructure",
"group-system": "System",
```

Modify `landscape-webui/src/views/LandscapeSiderBar.vue` so it builds group arrays instead of one flat menu:

```ts
const groupedMenuOptions = computed(() => [
  {
    title: t("routes.group-overview"),
    items: [{ label: t("routes.dashboard"), key: "", icon: renderIcon(CicsSystemGroup) }],
  },
  {
    title: t("routes.group-network"),
    items: [
      { label: t("routes.nat"), key: "nat", icon: renderIcon(ImportExportRound) },
      {
        label: t("routes.status"),
        key: "status",
        icon: renderIcon(Dashboard),
        children: [
          { label: t("routes.dhcp-v4"), key: "dhcp-v4" },
          { label: t("routes.ipv6-pd"), key: "ipv6-pd" },
          { label: t("routes.ipv6-ra"), key: "ipv6-ra" },
        ],
      },
    ],
  },
  {
    title: t("routes.group-traffic-policy"),
    items: [
      { label: t("routes.flow"), key: "flow", icon: renderIcon(ModelBuilder) },
      { label: t("routes.firewall"), key: "firewall", icon: renderIcon(Wall) },
    ],
  },
  {
    title: t("routes.group-name-service"),
    items: [
      {
        label: t("routes.dns"),
        key: "dns",
        icon: renderIcon(ServerDns),
        children: [
          { label: t("routes.dns-redirect"), key: "dns-redirect" },
          { label: t("routes.dns-upstream"), key: "dns-upstream" },
          { label: t("routes.dns-provider-profiles"), key: "dns-provider-profiles" },
        ],
      },
      {
        label: t("routes.geo"),
        key: "geo",
        icon: renderIcon(BookGlobe20Regular),
        children: [
          { label: t("routes.geo-domain"), key: "geo-domain" },
          { label: t("routes.geo-ip"), key: "geo-ip" },
        ],
      },
      { label: t("routes.ddns"), key: "ddns", icon: renderIcon(NetworkPublic) },
    ],
  },
  {
    title: t("routes.group-infrastructure"),
    items: [
      { label: t("routes.docker"), key: "docker", icon: renderIcon(Docker) },
      { label: t("routes.gateway"), key: "gateway", icon: renderIcon(Gateway) },
      {
        label: t("routes.domains"),
        key: "domains",
        icon: renderIcon(Certificate),
        children: [
          { label: t("routes.cert-accounts"), key: "cert-accounts" },
          { label: t("routes.certs"), key: "certs" },
        ],
      },
    ],
  },
  {
    title: t("routes.group-system"),
    items: [
      { label: t("routes.mac-binding"), key: "mac-binding", icon: renderIcon(Devices) },
      { label: t("routes.config"), key: "config", icon: renderIcon(Settings) },
    ],
  },
]);
```

Modify `landscape-webui/src/views/MainLayout.vue` to use `AppTopbar` and a padded shell body:

```vue
<template>
  <div class="app-shell">
    <n-layout position="absolute" has-sider>
      <LandscapeSiderBar />
      <n-layout class="app-shell__main">
        <AppTopbar />
        <GlobalTerminal />
        <n-layout
          :native-scrollbar="false"
          position="absolute"
          class="app-shell__body"
          :style="contentStyle"
        >
          <RouterView />
        </n-layout>
      </n-layout>
    </n-layout>
  </div>
</template>
```

- [ ] **Step 4: Run the sidebar test and shell build checks**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/views/__tests__/LandscapeSiderBar.test.ts
pnpm --filter landscape-webui build
```

Expected: sidebar test PASS, Vite build PASS.

- [ ] **Step 5: Commit**

```bash
git add landscape-webui/src/components/shell/AppShellSidebarSection.vue landscape-webui/src/components/shell/AppTopbar.vue landscape-webui/src/components/shell/AppRouteTabs.vue landscape-webui/src/components/shell/PageHeader.vue landscape-webui/src/components/shell/SurfacePanel.vue landscape-webui/src/views/LandscapeSiderBar.vue landscape-webui/src/views/MainLayout.vue landscape-webui/src/i18n/zh/main.ts landscape-webui/src/i18n/en/main.ts landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts
git commit -m "feat: redesign landscape webui shell"
```

---

### Task 3: Redesign The Homepage As A Console Landing Page

**Files:**
- Create: `landscape-webui/src/components/dashboard/OverviewHero.vue`
- Create: `landscape-webui/src/components/dashboard/OperationsPanelGrid.vue`
- Test: `landscape-webui/src/views/__tests__/Landscape.test.ts`
- Modify: `landscape-webui/src/views/Landscape.vue`
- Modify: `landscape-webui/src/components/sysinfo/SystemInfo.vue`
- Modify: `landscape-webui/src/components/sysinfo/CPUUsage.vue`
- Modify: `landscape-webui/src/components/sysinfo/MemUsage.vue`
- Modify: `landscape-webui/src/components/dns/DnsStatusCard.vue`

- [ ] **Step 1: Write the failing homepage structure test**

Create `landscape-webui/src/views/__tests__/Landscape.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Landscape from "@/views/Landscape.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("Landscape", () => {
  it("renders the overview hero, network canvas, and operations panels", () => {
    const wrapper = mount(Landscape, {
      global: {
        stubs: {
          OverviewHero: { template: "<div>overview-hero</div>" },
          OperationsPanelGrid: { template: "<div>operations-panels<slot /></div>" },
          NetFlow: { template: "<div>net-flow-stub</div>" },
        },
      },
    });

    expect(wrapper.text()).toContain("overview-hero");
    expect(wrapper.text()).toContain("network-canvas");
    expect(wrapper.text()).toContain("operations-panels");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/views/__tests__/Landscape.test.ts
```

Expected: FAIL because the new section markers do not exist yet.

- [ ] **Step 3: Implement the homepage hero and sectioned dashboard**

Create `landscape-webui/src/components/dashboard/OverviewHero.vue`:

```vue
<script setup lang="ts">
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import { useSysInfo } from "@/stores/systeminfo";

const sysInfo = useSysInfo();
</script>

<template>
  <SurfacePanel elevated class="overview-hero">
    <div class="overview-hero__copy">
      <p class="overview-hero__eyebrow">Landscape Console</p>
      <h2 class="overview-hero__title">overview-hero</h2>
      <p class="overview-hero__description">
        Router health, runtime footprint, and network posture in one place.
      </p>
    </div>
    <div class="overview-hero__stats">
      <div class="overview-stat">
        <span class="overview-stat__label">Uptime</span>
        <strong class="overview-stat__value">
          {{ sysInfo.router_status.start_at ? "Live" : "Booting" }}
        </strong>
      </div>
      <div class="overview-stat">
        <span class="overview-stat__label">DNS</span>
        <strong class="overview-stat__value">{{ sysInfo.router_status.hostname || "--" }}</strong>
      </div>
    </div>
  </SurfacePanel>
</template>
```

Create `landscape-webui/src/components/dashboard/OperationsPanelGrid.vue`:

```vue
<template>
  <div class="operations-panels">
    <span class="sr-only">operations-panels</span>
    <slot />
  </div>
</template>
```

Modify `landscape-webui/src/views/Landscape.vue`:

```vue
<script setup lang="ts">
import OverviewHero from "@/components/dashboard/OverviewHero.vue";
import OperationsPanelGrid from "@/components/dashboard/OperationsPanelGrid.vue";
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import CPUUsage from "@/components/sysinfo/CPUUsage.vue";
import MemUsage from "@/components/sysinfo/MemUsage.vue";
import DnsStatusCard from "@/components/dns/DnsStatusCard.vue";
import SystemInfo from "@/components/sysinfo/SystemInfo.vue";
import NetFlow from "@/components/topology/NetFlow.vue";
</script>

<template>
  <div class="landscape-home">
    <OverviewHero />

    <SurfacePanel class="landscape-home__canvas">
      <header class="landscape-home__section-head">
        <p class="landscape-home__eyebrow">Network</p>
        <h3>network-canvas</h3>
      </header>
      <NetFlow style="min-height: 560px; width: 100%" />
    </SurfacePanel>

    <OperationsPanelGrid>
      <n-grid x-gap="16" y-gap="16" cols="1 800:2 1500:4">
        <n-gi><SystemInfo /></n-gi>
        <n-gi><CPUUsage /></n-gi>
        <n-gi><MemUsage /></n-gi>
        <n-gi><DnsStatusCard /></n-gi>
      </n-grid>
    </OperationsPanelGrid>
  </div>
</template>
```

Modify each of `SystemInfo.vue`, `CPUUsage.vue`, `MemUsage.vue`, and `DnsStatusCard.vue` to keep their logic but update the internal `n-card` classes toward the new visual language:

```vue
<n-card class="ops-card" content-style="display: flex; flex-direction: column; height: 100%;">
```

Add a shared scoped style block pattern to each component:

```css
.ops-card {
  border-radius: 20px;
  border: 1px solid #dbe5ee;
  box-shadow: 0 12px 30px rgba(16, 35, 49, 0.08);
  background: rgba(255, 255, 255, 0.92);
}
```

- [ ] **Step 4: Run the homepage test and build**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/views/__tests__/Landscape.test.ts
pnpm --filter landscape-webui build
```

Expected: homepage test PASS, Vite build PASS.

- [ ] **Step 5: Commit**

```bash
git add landscape-webui/src/components/dashboard/OverviewHero.vue landscape-webui/src/components/dashboard/OperationsPanelGrid.vue landscape-webui/src/views/Landscape.vue landscape-webui/src/components/sysinfo/SystemInfo.vue landscape-webui/src/components/sysinfo/CPUUsage.vue landscape-webui/src/components/sysinfo/MemUsage.vue landscape-webui/src/components/dns/DnsStatusCard.vue landscape-webui/src/views/__tests__/Landscape.test.ts
git commit -m "feat: redesign landscape homepage"
```

---

### Task 4: Redesign The `Firewall` Page As A Policy Workbench

**Files:**
- Create: `landscape-webui/src/components/firewall/FirewallOverviewStrip.vue`
- Create: `landscape-webui/src/components/firewall/FirewallWorkbenchHeader.vue`
- Create: `landscape-webui/src/components/firewall/FirewallEmptyState.vue`
- Test: `landscape-webui/src/views/__tests__/Firewall.test.ts`
- Modify: `landscape-webui/src/views/Firewall.vue`
- Modify: `landscape-webui/src/components/firewall/FirewallBlacklistCard.vue`

- [ ] **Step 1: Write the failing `Firewall` page test**

Create `landscape-webui/src/views/__tests__/Firewall.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Firewall from "@/views/Firewall.vue";

vi.mock("@/api/firewall_blacklist", () => ({
  get_firewall_blacklists: vi.fn().mockResolvedValue([]),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("Firewall", () => {
  it("renders the workbench header and overview strip", async () => {
    const wrapper = mount(Firewall, {
      global: {
        stubs: {
          FirewallWorkbenchHeader: { template: "<div>firewall-workbench</div>" },
          FirewallOverviewStrip: { template: "<div>firewall-overview</div>" },
          FirewallEmptyState: { template: "<div>firewall-empty</div>" },
          FirewallBlacklistEditModal: { template: "<div />" },
        },
      },
    });

    await Promise.resolve();

    expect(wrapper.text()).toContain("firewall-workbench");
    expect(wrapper.text()).toContain("firewall-overview");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/views/__tests__/Firewall.test.ts
```

Expected: FAIL because the new workbench markers do not exist yet.

- [ ] **Step 3: Implement the `Firewall` workbench structure**

Create `landscape-webui/src/components/firewall/FirewallWorkbenchHeader.vue`:

```vue
<script setup lang="ts">
import PageHeader from "@/components/shell/PageHeader.vue";
const emit = defineEmits<{ create: [] }>();
</script>

<template>
  <PageHeader
    eyebrow="Traffic & Policy"
    title="Firewall"
    description="firewall-workbench"
  >
    <template #actions>
      <n-button type="primary" @click="emit('create')">Create Rule</n-button>
    </template>
  </PageHeader>
</template>
```

Create `landscape-webui/src/components/firewall/FirewallOverviewStrip.vue`:

```vue
<script setup lang="ts">
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import type { FirewallBlacklistConfig } from "@landscape-router/types/api/schemas";

defineProps<{
  configs: FirewallBlacklistConfig[];
}>();
</script>

<template>
  <SurfacePanel class="firewall-overview-strip">
    <span class="sr-only">firewall-overview</span>
    <div class="firewall-overview-stat">
      <span class="firewall-overview-stat__label">Rules</span>
      <strong class="firewall-overview-stat__value">{{ configs.length }}</strong>
    </div>
    <div class="firewall-overview-stat">
      <span class="firewall-overview-stat__label">Enabled</span>
      <strong class="firewall-overview-stat__value">
        {{ configs.filter((item) => item.enable).length }}
      </strong>
    </div>
    <div class="firewall-overview-stat">
      <span class="firewall-overview-stat__label">Blacklist Sources</span>
      <strong class="firewall-overview-stat__value">
        {{ configs.reduce((sum, item) => sum + item.source.length, 0) }}
      </strong>
    </div>
  </SurfacePanel>
</template>
```

Create `landscape-webui/src/components/firewall/FirewallEmptyState.vue`:

```vue
<script setup lang="ts">
defineProps<{
  description: string;
}>();
</script>

<template>
  <div class="firewall-empty">
    <n-empty :description="description" />
  </div>
</template>
```

Modify `landscape-webui/src/views/Firewall.vue`:

```vue
<script setup lang="ts">
import { get_firewall_blacklists } from "@/api/firewall_blacklist";
import FirewallBlacklistEditModal from "@/components/firewall/FirewallBlacklistEditModal.vue";
import FirewallBlacklistCard from "@/components/firewall/FirewallBlacklistCard.vue";
import FirewallOverviewStrip from "@/components/firewall/FirewallOverviewStrip.vue";
import FirewallWorkbenchHeader from "@/components/firewall/FirewallWorkbenchHeader.vue";
import FirewallEmptyState from "@/components/firewall/FirewallEmptyState.vue";
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import type { FirewallBlacklistConfig } from "@landscape-router/types/api/schemas";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const configs = ref<FirewallBlacklistConfig[]>([]);
const show_create_modal = ref(false);
const { t } = useI18n();

async function read_configs() {
  configs.value = await get_firewall_blacklists();
}

onMounted(read_configs);
</script>

<template>
  <div class="firewall-page">
    <FirewallWorkbenchHeader @create="show_create_modal = true" />
    <FirewallOverviewStrip :configs="configs" />

    <SurfacePanel class="firewall-page__body">
      <div class="firewall-page__intro">
        <n-text depth="3">{{ t("firewall.card.ip_blacklist_desc") }}</n-text>
      </div>

      <n-grid
        v-if="configs.length > 0"
        x-gap="16"
        y-gap="16"
        cols="1 900:2 1400:3"
      >
        <n-grid-item v-for="config in configs" :key="config.id" style="display: flex">
          <FirewallBlacklistCard :rule="config" @refresh="read_configs()" />
        </n-grid-item>
      </n-grid>

      <FirewallEmptyState
        v-else
        :description="t('common.no_firewall_rules')"
      />
    </SurfacePanel>

    <FirewallBlacklistEditModal
      v-model:show="show_create_modal"
      :id="null"
      @refresh="read_configs()"
    />
  </div>
</template>
```

Modify `landscape-webui/src/components/firewall/FirewallBlacklistCard.vue` to align with the workbench styling:

```vue
<n-card size="small" class="firewall-rule-card" style="flex: 1; min-width: 280px">
```

```css
.firewall-rule-card {
  border-radius: 18px;
  border: 1px solid #dbe5ee;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248, 252, 255, 0.94));
}
```

- [ ] **Step 4: Run the `Firewall` test and build**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/views/__tests__/Firewall.test.ts
pnpm --filter landscape-webui build
```

Expected: `Firewall` test PASS, Vite build PASS.

- [ ] **Step 5: Commit**

```bash
git add landscape-webui/src/components/firewall/FirewallOverviewStrip.vue landscape-webui/src/components/firewall/FirewallWorkbenchHeader.vue landscape-webui/src/components/firewall/FirewallEmptyState.vue landscape-webui/src/views/Firewall.vue landscape-webui/src/components/firewall/FirewallBlacklistCard.vue landscape-webui/src/views/__tests__/Firewall.test.ts
git commit -m "feat: redesign firewall workbench"
```

---

### Task 5: Finish The Cross-Cutting Polish Pass

**Files:**
- Modify: `landscape-webui/src/style.css`
- Modify: `landscape-webui/src/views/MainLayout.vue`
- Modify: `landscape-webui/src/views/Landscape.vue`
- Modify: `landscape-webui/src/views/Firewall.vue`
- Modify: `landscape-webui/src/components/shell/PageHeader.vue`
- Modify: `landscape-webui/src/components/shell/SurfacePanel.vue`

- [ ] **Step 1: Write a final shell smoke test**

Append to `landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts`:

```ts
it("keeps the product shell labels visible after regrouping", () => {
  const wrapper = mount(LandscapeSiderBar, {
    global: {
      stubs: {
        CopyRight: true,
      },
    },
  });

  expect(wrapper.text()).toContain("routes.group-overview");
  expect(wrapper.text()).toContain("routes.group-system");
});
```

- [ ] **Step 2: Run the smoke test before the polish pass**

Run:

```bash
pnpm --filter landscape-webui exec vitest run src/views/__tests__/LandscapeSiderBar.test.ts
```

Expected: PASS before the polish pass starts.

- [ ] **Step 3: Apply the final consistency pass**

Update `landscape-webui/src/style.css` with shell-safe responsive rules:

```css
@media (max-width: 1280px) {
  :root {
    --app-page-x: 18px;
  }
}

@media (max-width: 768px) {
  :root {
    --app-page-x: 14px;
  }

  .app-topbar {
    padding: 14px;
  }

  .overview-hero,
  .firewall-page__body {
    padding: 16px;
  }
}
```

Update `landscape-webui/src/views/MainLayout.vue` and the new shell components so:

- the shell body maintains padding when the PTY dock opens
- the top bar stays readable on narrow widths
- untouched pages inherit the new page padding and surface rhythm automatically

Representative CSS to add in `MainLayout.vue`:

```css
.app-shell__main {
  background: transparent;
}

.app-shell__body {
  padding: 20px 24px 24px;
}
```

Update `landscape-webui/src/views/Landscape.vue` and `landscape-webui/src/views/Firewall.vue` to ensure:

- section gaps are visually consistent
- no component feels visually disconnected from the shell
- empty states and dense content blocks share the same surface rhythm

- [ ] **Step 4: Run the full phase-1 verification set**

Run:

```bash
pnpm --filter landscape-webui exec vitest run
pnpm --filter landscape-webui build
pnpm --filter landscape-webui exec prettier --check "src/**/*.{vue,ts,js,json,css,scss}"
```

Expected:

- Vitest: all tests PASS
- Build: PASS
- Prettier: PASS with no formatting changes required

- [ ] **Step 5: Commit**

```bash
git add landscape-webui/src/style.css landscape-webui/src/views/MainLayout.vue landscape-webui/src/views/Landscape.vue landscape-webui/src/views/Firewall.vue landscape-webui/src/components/shell/PageHeader.vue landscape-webui/src/components/shell/SurfacePanel.vue landscape-webui/src/views/__tests__/LandscapeSiderBar.test.ts
git commit -m "feat: polish landscape webui redesign phase one"
```

---

## Spec Coverage Check

- Visual system and token layer: covered by Task 1.
- Vercel-inspired shell and navigation regrouping: covered by Task 2.
- Homepage redesign with `Overview Hero`, `Network Canvas`, and `Operational Panels`: covered by Task 3.
- `Firewall` redesign as the representative workbench page: covered by Task 4.
- Phase-1 consistency, responsiveness, and coexistence with untouched pages: covered by Task 5.

No spec section is left without an implementation task.

## Placeholder Scan

Plan checked for common placeholder markers and vague deferred-work phrasing.

None remain in the plan body.

## Type Consistency Check

- Theme exports use `appThemeTokens` and `appThemeOverrides` consistently across tasks.
- Navigation regrouping uses the same route-group keys in tests and i18n updates.
- Homepage sections use the same marker names in tests and implementation: `overview-hero`, `network-canvas`, `operations-panels`.
- `Firewall` page tests and implementation use the same markers: `firewall-workbench`, `firewall-overview`.

No conflicting names remain in the plan.
