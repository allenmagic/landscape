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

<style scoped>
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-section__title {
  margin: 0;
  padding: 0 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6c8292;
}
</style>
