<script setup lang="ts">
defineProps<{
  padded?: boolean;
  elevated?: boolean;
}>();
</script>

<template>
  <section
    class="surface-panel"
    :class="{
      'surface-panel--padded': padded !== false,
      'surface-panel--elevated': elevated,
    }"
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
