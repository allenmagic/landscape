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

<style scoped>
.firewall-empty {
  display: flex;
  min-height: 280px;
  align-items: center;
  justify-content: center;
}
</style>
