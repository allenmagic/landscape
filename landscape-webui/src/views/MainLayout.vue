<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useHistoryRouteStore } from "@/stores/history_route";
import { usePtyStore } from "@/stores/pty";
import GlobalTerminal from "@/components/GlobalTerminal.vue";
import AppTopbar from "@/components/shell/AppTopbar.vue";
import LandscapeSiderBar from "@/views/LandscapeSiderBar.vue";

const route = useRoute();
const historyStore = useHistoryRouteStore();

watch(
  () => route.path,
  () => {
    historyStore.addRoute(route);
  },
  { immediate: true },
);
const ptyStore = usePtyStore();
const DOCK_SAFE_MARGIN = 8;

const contentStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    top: "132px",
    left: "0",
    display: "flex",
    padding: "20px 24px 24px",
    transition: "all 0.3s ease",
  };

  if (ptyStore.viewMode === "dock" && ptyStore.isOpen) {
    if (ptyStore.dockPosition === "bottom") {
      baseStyle.bottom = `${ptyStore.dockSize + DOCK_SAFE_MARGIN}px`;
      baseStyle.right = "0px";
    } else if (ptyStore.dockPosition === "right") {
      baseStyle.bottom = "0px";
      baseStyle.right = `${ptyStore.dockSize + DOCK_SAFE_MARGIN}px`;
    }
  } else {
    baseStyle.bottom = "0px";
    baseStyle.right = "0px";
  }

  return baseStyle;
});
</script>

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
          content-style="flex: 1; display: flex; height: 100%;"
          content-class="main-body"
        >
          <RouterView />
        </n-layout>
      </n-layout>
    </n-layout>
  </div>
</template>

<style scoped>
.app-shell {
  flex: 1;
  background: transparent;
}

.app-shell__main {
  background: transparent;
}

.app-shell__body {
  background: transparent;
}
</style>
