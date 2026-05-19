<script setup lang="ts">
import type { HistoryRoute } from "@/stores/history_route";
import { Pin, PinFilled, Close } from "@vicons/carbon";
import { useI18n } from "vue-i18n";

defineProps<{
  routes: HistoryRoute[];
  activePath: string;
}>();

const { t } = useI18n();

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
        {{ t(route.name) }}
      </button>
      <button class="route-tab__pin" @click.stop="emit('pin', route.path)">
        <n-icon :component="route.pinned ? PinFilled : Pin" />
      </button>
      <button
        v-if="!route.pinned"
        class="route-tab__close"
        @click.stop="emit('close', route.path)"
      >
        <n-icon :component="Close" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.route-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.route-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(183, 201, 216, 0.8);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
}

.route-tab--active {
  border-color: rgba(15, 154, 168, 0.36);
  background: rgba(215, 242, 244, 0.92);
}

.route-tab__main,
.route-tab__pin,
.route-tab__close {
  border: 0;
  background: transparent;
  color: #102331;
}

.route-tab__main {
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 999px;
  font: inherit;
  white-space: nowrap;
}

.route-tab__pin,
.route-tab__close {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
}

.route-tab__pin:hover,
.route-tab__close:hover,
.route-tab__main:hover {
  background: rgba(16, 35, 49, 0.06);
}
</style>
