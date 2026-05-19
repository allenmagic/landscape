<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import type { Component } from "vue";
import { computed, h, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { NIcon } from "naive-ui";

import {
  Network4,
  Settings,
  CicsSystemGroup,
  ModelBuilder,
  ChartCombo,
  ServerDns,
  NetworkPublic,
  Devices,
  Dashboard,
  Certificate,
  Gateway,
} from "@vicons/carbon";
import { ImportExportRound } from "@vicons/material";
import { Wall } from "@vicons/tabler";
import { Docker } from "@vicons/fa";
import { BookGlobe20Regular } from "@vicons/fluent";

import AppShellSidebarSection from "@/components/shell/AppShellSidebarSection.vue";
import CopyRight from "@/components/CopyRight.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const menuActiveKey = ref<string>("");

watch(
  () => route.path,
  (path) => {
    const key = path.startsWith("/") ? path.substring(1) : path;
    menuActiveKey.value = key;
  },
  { immediate: true },
);
const collapsed = ref(false);

function clickMenu(key: string) {
  router.push({
    path: key ? `/${key}` : "/",
  });
}

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const groupedMenuOptions = computed<
  Array<{ title: string; items: MenuOption[] }>
>(() => [
  {
    title: t("routes.group-overview"),
    items: [
      {
        label: t("routes.dashboard"),
        key: "",
        icon: renderIcon(CicsSystemGroup),
      },
    ],
  },
  {
    title: t("routes.group-network"),
    items: [
      {
        label: t("routes.nat"),
        key: "nat",
        icon: renderIcon(ImportExportRound),
      },
      {
        label: t("routes.status"),
        key: "status",
        icon: renderIcon(Dashboard),
        children: [
          {
            label: t("routes.dhcp-v4"),
            key: "dhcp-v4",
          },
          {
            label: t("routes.ipv6-pd"),
            key: "ipv6-pd",
          },
          {
            label: t("routes.ipv6-ra"),
            key: "ipv6-ra",
          },
        ],
      },
    ],
  },
  {
    title: t("routes.group-traffic-policy"),
    items: [
      {
        label: t("routes.flow"),
        key: "flow",
        icon: renderIcon(ModelBuilder),
      },
      {
        label: t("routes.firewall"),
        key: "firewall",
        icon: renderIcon(Wall),
      },
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
          {
            label: t("routes.dns-redirect"),
            key: "dns-redirect",
          },
          {
            label: t("routes.dns-upstream"),
            key: "dns-upstream",
          },
          {
            label: t("routes.dns-provider-profiles"),
            key: "dns-provider-profiles",
          },
        ],
      },
      {
        label: t("routes.geo"),
        key: "geo",
        icon: renderIcon(BookGlobe20Regular),
        children: [
          {
            label: t("routes.geo-domain"),
            key: "geo-domain",
          },
          {
            label: t("routes.geo-ip"),
            key: "geo-ip",
          },
        ],
      },
      {
        label: t("routes.ddns"),
        key: "ddns",
        icon: renderIcon(NetworkPublic),
      },
    ],
  },
  {
    title: t("routes.group-infrastructure"),
    items: [
      {
        label: t("routes.docker"),
        key: "docker",
        icon: renderIcon(Docker),
      },
      {
        label: t("routes.gateway"),
        key: "gateway",
        icon: renderIcon(Gateway),
      },
      {
        label: t("routes.domains"),
        key: "domains",
        icon: renderIcon(Certificate),
        children: [
          {
            label: t("routes.cert-accounts"),
            key: "cert-accounts",
          },
          {
            label: t("routes.certs"),
            key: "certs",
          },
        ],
      },
    ],
  },
  {
    title: t("routes.group-system"),
    items: [
      {
        label: t("routes.metric-group"),
        key: "metric-group",
        icon: renderIcon(ChartCombo),
        children: [
          {
            label: t("routes.connect-info"),
            key: "connect-info",
            children: [
              {
                label: t("routes.connect-live"),
                key: "metric/conn/live",
              },
              {
                label: t("routes.connect-src"),
                key: "metric/conn/src",
              },
              {
                label: t("routes.connect-dst"),
                key: "metric/conn/dst",
              },
              {
                label: t("routes.connect-history"),
                key: "metric/conn/history",
              },
            ],
          },
          {
            label: t("routes.dns-metric"),
            key: "metric/dns",
          },
        ],
      },
      {
        label: t("routes.mac-binding"),
        key: "mac-binding",
        icon: renderIcon(Devices),
      },
      {
        label: t("routes.config"),
        key: "config",
        icon: renderIcon(Settings),
      },
    ],
  },
]);
</script>
<template>
  <n-layout-sider
    class="app-sidebar"
    position="relative"
    :native-scrollbar="false"
    :bordered="false"
    collapse-mode="width"
    :collapsed-width="72"
    :width="280"
    :collapsed="collapsed"
    show-trigger="bar"
    @collapse="collapsed = true"
    @expand="collapsed = false"
  >
    <div class="app-sidebar__inner">
      <header class="app-sidebar__brand">
        <div v-if="!collapsed" class="app-sidebar__brand-copy">
          <p class="app-sidebar__eyebrow">Landscape Console</p>
          <strong class="app-sidebar__title">Landscape</strong>
        </div>
        <div class="app-sidebar__status" />
      </header>

      <n-scrollbar class="app-sidebar__nav">
        <div class="app-sidebar__sections">
          <AppShellSidebarSection
            v-for="section in groupedMenuOptions"
            :key="section.title"
            :title="section.title"
            :options="section.items"
            :collapsed="collapsed"
            :value="menuActiveKey"
            @select="clickMenu"
          />
        </div>
      </n-scrollbar>

      <footer class="app-sidebar__footer">
        <CopyRight :icon="true" />
      </footer>
    </div>
  </n-layout-sider>
</template>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgba(183, 201, 216, 0.7);
  background:
    linear-gradient(180deg, rgba(252, 254, 255, 0.98), rgba(244, 249, 252, 0.94));
}

.app-sidebar__inner {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100%;
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 72px;
  padding: 20px 18px 16px;
}

.app-sidebar__brand-copy {
  min-width: 0;
}

.app-sidebar__eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6c8292;
}

.app-sidebar__title {
  font-size: 20px;
  color: #102331;
}

.app-sidebar__status {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #169d6b;
  box-shadow: 0 0 0 5px rgba(22, 157, 107, 0.14);
}

.app-sidebar__nav {
  min-height: 0;
  padding: 0 10px 12px;
}

.app-sidebar__sections {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.app-sidebar__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 10px 14px 16px;
}
</style>
