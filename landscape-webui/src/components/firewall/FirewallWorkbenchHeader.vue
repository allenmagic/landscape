<script setup lang="ts">
import PageHeader from "@/components/shell/PageHeader.vue";

const emit = defineEmits<{
  create: [];
}>();
</script>

<template>
  <PageHeader
    eyebrow="Traffic & Policy"
    title="Firewall"
    description="firewall-workbench"
  >
    <template #actions>
      <n-button type="primary" @click="emit('create')">Create Rule</n-button>
    </template>
  </PageHeader>
</template>
