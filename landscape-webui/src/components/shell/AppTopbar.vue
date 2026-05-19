<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Logout, Terminal } from "@vicons/carbon";

import { LANDSCAPE_TOKEN_KEY } from "@/lib/common";
import { useFrontEndStore } from "@/stores/front_end_config";
import { useHistoryRouteStore } from "@/stores/history_route";
import { usePtyStore } from "@/stores/pty";
import AppRouteTabs from "./AppRouteTabs.vue";
import IntervalFetch from "@/components/head/IntervalFetch.vue";
import LanguageSetting from "@/components/head/LanguageSetting.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const historyStore = useHistoryRouteStore();
const ptyStore = usePtyStore();
const frontEndStore = useFrontEndStore();

const currentTitle = computed(() => t((route.name as string) || "routes.dashboard"));
const currentSubtitle = computed(() =>
  route.path === "/" ? "Landscape Console" : `Landscape Console / ${route.path}`,
);

function handleTagClick(path: string) {
  router.push(path);
}

function handleTagClose(path: string) {
  historyStore.removeRoute(path);
  if (path === route.path) {
    const lastRoute =
      historyStore.visitedRoutes[historyStore.visitedRoutes.length - 1];
    router.push(lastRoute?.path || "/");
  }
}

function logout() {
  localStorage.removeItem(LANDSCAPE_TOKEN_KEY);
  frontEndStore.INSERT_USERNAME("");
  router.push("/login");
}
</script>

<template>
  <header class="app-topbar">
    <div class="app-topbar__row">
      <div class="app-topbar__context">
        <p class="app-topbar__eyebrow">{{ currentSubtitle }}</p>
        <h1 class="app-topbar__title">{{ currentTitle }}</h1>
      </div>

      <div class="app-topbar__actions">
        <LanguageSetting />
        <PresentationMode />
        <n-button
          quaternary
          circle
          size="small"
          @click="ptyStore.toggleOpen"
          title="WebShell"
        >
          <template #icon>
            <n-icon :component="Terminal" />
          </template>
        </n-button>
        <n-button
          quaternary
          circle
          size="small"
          @click="logout"
          :title="t('common.logout')"
        >
          <template #icon>
            <n-icon :component="Logout" />
          </template>
        </n-button>
        <IntervalFetch />
      </div>
    </div>

    <n-scrollbar x-scrollable class="app-topbar__tabs">
      <AppRouteTabs
        :routes="historyStore.visitedRoutes"
        :active-path="route.path"
        @select="handleTagClick"
        @close="handleTagClose"
        @pin="historyStore.togglePin($event)"
      />
    </n-scrollbar>
  </header>
</template>

<style scoped>
.app-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 24px 16px;
  border-bottom: 1px solid rgba(183, 201, 216, 0.7);
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.76);
}

.app-topbar__row {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.app-topbar__context {
  min-width: 0;
}

.app-topbar__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f7384;
}

.app-topbar__title {
  margin: 0;
  font-size: 30px;
  line-height: 1.05;
  color: #102331;
}

.app-topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.app-topbar__tabs {
  max-width: 100%;
}

@media (max-width: 960px) {
  .app-topbar__row {
    flex-direction: column;
    align-items: stretch;
  }

  .app-topbar__actions {
    justify-content: flex-start;
  }
}
</style>
