<script setup lang="ts">
import SurfacePanel from "@/components/shell/SurfacePanel.vue";
import { useSysInfo } from "@/stores/systeminfo";

const sysInfo = useSysInfo();
</script>

<template>
  <SurfacePanel elevated class="overview-hero">
    <div class="overview-hero__copy">
      <p class="overview-hero__eyebrow">Landscape Console</p>
      <h2 class="overview-hero__title">overview-hero</h2>
      <p class="overview-hero__description">
        Router health, runtime footprint, and network posture in one place.
      </p>
    </div>

    <div class="overview-hero__stats">
      <div class="overview-stat">
        <span class="overview-stat__label">Uptime</span>
        <strong class="overview-stat__value">
          {{ sysInfo.router_status.uptime > 0 ? "Live" : "Booting" }}
        </strong>
      </div>
      <div class="overview-stat">
        <span class="overview-stat__label">CPU</span>
        <strong class="overview-stat__value">
          {{ sysInfo.router_status.global_cpu_info.toFixed(1) }}%
        </strong>
      </div>
      <div class="overview-stat">
        <span class="overview-stat__label">Load</span>
        <strong class="overview-stat__value">
          {{ sysInfo.router_status.load_avg.one.toFixed(2) }}
        </strong>
      </div>
    </div>
  </SurfacePanel>
</template>

<style scoped>
.overview-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: 24px;
  align-items: end;
  background:
    radial-gradient(circle at top left, rgba(15, 154, 168, 0.16), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 251, 254, 0.95));
}

.overview-hero__copy {
  min-width: 0;
}

.overview-hero__eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5f7384;
}

.overview-hero__title {
  margin: 0;
  font-size: 42px;
  line-height: 0.96;
  color: #102331;
}

.overview-hero__description {
  margin: 16px 0 0;
  max-width: 56ch;
  font-size: 15px;
  line-height: 1.6;
  color: #5f7384;
}

.overview-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.overview-stat {
  padding: 18px;
  border: 1px solid rgba(183, 201, 216, 0.7);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.76);
}

.overview-stat__label {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c8292;
}

.overview-stat__value {
  font-size: 24px;
  color: #102331;
}

@media (max-width: 1080px) {
  .overview-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .overview-hero__stats {
    grid-template-columns: 1fr;
  }
}
</style>
