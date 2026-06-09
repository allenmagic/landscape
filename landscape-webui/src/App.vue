<script setup lang="ts">
import { darkTheme, enUS, zhCN, dateZhCN, dateEnUS } from "naive-ui";
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { usePreferenceStore } from "@/stores/preference";
import Env from "@/components/Env.vue";
import { LANDSCAPE_TOKEN_KEY } from "@/lib/common";
import { appThemeOverrides } from "@/theme/naiveTheme";

const prefStore = usePreferenceStore();
const route = useRoute();

onMounted(() => {
  tryLoadPreference();
});

// 登录成功后路由变化时（从 /login 到其他页面），加载偏好设置
watch(
  () => route.path,
  () => {
    tryLoadPreference();
  },
);

function tryLoadPreference() {
  // 仅在不在登录页且有 token 时加载偏好设置，避免认证失败提示
  if (route.path !== "/login" && localStorage.getItem(LANDSCAPE_TOKEN_KEY)) {
    prefStore.loadPreference();
  }
}

const currentLocale = computed(() => {
  return prefStore.language?.startsWith("en") ? enUS : zhCN;
});

const currentDateLocale = computed(() => {
  return prefStore.language?.startsWith("en") ? dateEnUS : dateZhCN;
});

const currentTheme = computed(() => {
  return prefStore.theme === "light" ? null : darkTheme;
});
</script>

<template>
  <n-config-provider
    :locale="currentLocale"
    :date-locale="currentDateLocale"
    :theme="currentTheme"
    style="display: flex; flex: 1"
    :theme-overrides="appThemeOverrides"
  >
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <Env></Env>
          <RouterView />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>
