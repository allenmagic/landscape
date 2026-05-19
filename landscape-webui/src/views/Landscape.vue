<script setup lang="ts">
import OverviewHero from "@/components/dashboard/OverviewHero.vue";
import OperationsPanelGrid from "@/components/dashboard/OperationsPanelGrid.vue";
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import CPUUsage from "@/components/sysinfo/CPUUsage.vue";
import MemUsage from "@/components/sysinfo/MemUsage.vue";
import DnsStatusCard from "@/components/dns/DnsStatusCard.vue";
import SystemInfo from "@/components/sysinfo/SystemInfo.vue";
import NetFlow from "@/components/topology/NetFlow.vue";
</script>

<template>
  <div class="landscape-home">
    <OverviewHero />

    <SurfacePanel class="landscape-home__canvas">
      <header class="landscape-home__section-head">
        <p class="landscape-home__eyebrow">Network</p>
        <h3>network-canvas</h3>
      </header>
      <NetFlow class="landscape-home__flow" />
    </SurfacePanel>

    <OperationsPanelGrid>
      <n-grid x-gap="16" y-gap="16" cols="1 800:2 1500:4">
        <n-gi style="display: flex; height: 280px">
          <SystemInfo />
        </n-gi>
        <n-gi style="display: flex; height: 280px">
          <CPUUsage />
        </n-gi>
        <n-gi style="display: flex; height: 280px">
          <MemUsage />
        </n-gi>
        <n-gi style="display: flex; height: 280px">
          <DnsStatusCard />
        </n-gi>
      </n-grid>
    </OperationsPanelGrid>
  </div>
</template>

<style scoped>
.landscape-home {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.landscape-home__canvas {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 640px;
}

.landscape-home__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.landscape-home__section-head h3 {
  margin: 0;
  font-size: 28px;
  color: #102331;
}

.landscape-home__eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5f7384;
}

.landscape-home__flow {
  flex: 1;
  min-height: 560px;
  width: 100%;
}
</style>
