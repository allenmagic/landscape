import type { GlobalThemeOverrides } from "naive-ui";
import { appTokens } from "./tokens";

export const appThemeTokens = appTokens;

export const appThemeOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: appTokens.color.bgApp,
    cardColor: appTokens.color.bgSurface,
    primaryColor: appTokens.color.accent,
    primaryColorHover: "#139fb0",
    primaryColorPressed: "#0b8793",
    successColor: appTokens.color.success,
    warningColor: appTokens.color.warning,
    errorColor: appTokens.color.danger,
    infoColor: appTokens.color.info,
    textColorBase: appTokens.color.textPrimary,
    textColor2: appTokens.color.textSecondary,
    borderColor: appTokens.color.borderSoft,
    borderRadius: "16px",
    fontFamily: '"Lato", system-ui, sans-serif',
    fontFamilyMono: '"Fira Code", monospace',
    fontWeightStrong: "600",
  },
  Card: {
    borderRadius: appTokens.radius.card,
    color: appTokens.color.bgSurface,
  },
  Layout: {
    color: appTokens.color.bgApp,
    siderColor: appTokens.color.bgElevated,
    headerColor: "rgba(255, 255, 255, 0.82)",
  },
  Button: {
    borderRadiusMedium: "14px",
  },
  Input: {
    borderRadius: "14px",
  },
};
