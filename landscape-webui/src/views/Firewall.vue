<script setup lang="ts">
import { get_firewall_blacklists } from "@/api/firewall_blacklist";
import FirewallBlacklistEditModal from "@/components/firewall/FirewallBlacklistEditModal.vue";
import FirewallBlacklistCard from "@/components/firewall/FirewallBlacklistCard.vue";
import FirewallEmptyState from "@/components/firewall/FirewallEmptyState.vue";
import FirewallOverviewStrip from "@/components/firewall/FirewallOverviewStrip.vue";
import FirewallWorkbenchHeader from "@/components/firewall/FirewallWorkbenchHeader.vue";
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import type { FirewallBlacklistConfig } from "@landscape-router/types/api/schemas";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const configs = ref<FirewallBlacklistConfig[]>([]);
const show_create_modal = ref(false);
const { t } = useI18n();

async function read_configs() {
  configs.value = await get_firewall_blacklists();
}

onMounted(async () => {
  await read_configs();
});
</script>
<template>
  <div class="firewall-page">
    <FirewallWorkbenchHeader @create="show_create_modal = true" />
    <FirewallOverviewStrip :configs="configs" />

    <SurfacePanel class="firewall-page__body">
      <div class="firewall-page__intro">
        <n-text depth="3">{{ t("firewall.card.ip_blacklist_desc") }}</n-text>
      </div>

      <n-grid
        v-if="configs.length > 0"
        x-gap="16"
        y-gap="16"
        cols="1 900:2 1400:3"
      >
        <n-grid-item
          v-for="config in configs"
          :key="config.id"
          style="display: flex"
        >
          <FirewallBlacklistCard :rule="config" @refresh="read_configs()" />
        </n-grid-item>
      </n-grid>

      <FirewallEmptyState
        v-else
        :description="t('common.no_firewall_rules')"
      />
    </SurfacePanel>

    <FirewallBlacklistEditModal
      v-model:show="show_create_modal"
      :id="null"
      @refresh="read_configs()"
    />
  </div>
</template>

<style scoped>
.firewall-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.firewall-page__body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.firewall-page__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
