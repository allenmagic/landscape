<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="page-header">
    <div class="page-header__copy">
      <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
      <h2 class="page-header__title">{{ title }}</h2>
      <p v-if="description" class="page-header__description">{{ description }}</p>
    </div>
    <div v-if="$slots.status" class="page-header__status">
      <slot name="status" />
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 16px;
  align-items: start;
}

.page-header__copy {
  min-width: 0;
}

.page-header__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5f7384;
}

.page-header__title {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  color: #102331;
}

.page-header__description {
  margin: 10px 0 0;
  max-width: 68ch;
  color: #5f7384;
  line-height: 1.5;
}

.page-header__status,
.page-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 900px) {
  .page-header {
    grid-template-columns: 1fr;
  }
}
</style>
