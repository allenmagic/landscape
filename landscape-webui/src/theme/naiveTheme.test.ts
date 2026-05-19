import { describe, expect, it } from "vitest";
import { appThemeOverrides, appThemeTokens } from "./naiveTheme";

describe("appThemeOverrides", () => {
  it("uses the light-first accent and surface tokens", () => {
    expect(appThemeTokens.color.bgApp).toBe("#f3f7fb");
    expect(appThemeTokens.color.accent).toBe("#0f9aa8");
    expect(appThemeOverrides.common?.primaryColor).toBe("#0f9aa8");
    expect(appThemeOverrides.common?.cardColor).toBe("#ffffff");
    expect(appThemeOverrides.Card?.borderRadius).toBe("20px");
  });
});
