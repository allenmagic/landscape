<script setup lang="ts">
import { computed } from "vue";
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import type { FirewallBlacklistConfig } from "@landscape-router/types/api/schemas";

const props = defineProps<{
  configs: FirewallBlacklistConfig[];
}>();

const enabledCount = computed(
  () => props.configs.filter((item) => item.enable).length,
);

const sourceCount = computed(() =>
  props.configs.reduce((sum, item) => sum + item.source.length, 0),
);
</script>

<template>
  <SurfacePanel class="firewall-overview-strip">
    <span class="sr-only">firewall-overview</span>
    <div class="firewall-overview-stat">
      <span class="firewall-overview-stat__label">Rules</span>
      <strong class="firewall-overview-stat__value">{{
        configs.length
      }}</strong>
    </div>
    <div class="firewall-overview-stat">
      <span class="firewall-overview-stat__label">Enabled</span>
      <strong class="firewall-overview-stat__value">{{ enabledCount }}</strong>
    </div>
    <div class="firewall-overview-stat">
      <span class="firewall-overview-stat__label">Blacklist Sources</span>
      <strong class="firewall-overview-stat__value">{{ sourceCount }}</strong>
    </div>
  </SurfacePanel>
</template>

<style scoped>
.firewall-overview-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.firewall-overview-stat {
  padding: 6px 2px;
}

.firewall-overview-stat__label {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c8292;
}

.firewall-overview-stat__value {
  font-size: 30px;
  line-height: 1;
  color: #102331;
}

@media (max-width: 720px) {
  .firewall-overview-strip {
    grid-template-columns: 1fr;
  }
}
</style>
