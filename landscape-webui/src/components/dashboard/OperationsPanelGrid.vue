<template>
  <div class="operations-panels">
    <span class="sr-only">operations-panels</span>
    <slot />
  </div>
</template>

<style scoped>
.operations-panels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
