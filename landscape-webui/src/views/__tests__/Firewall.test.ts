import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Firewall from "@/views/Firewall.vue";

vi.mock("@/api/firewall_blacklist", () => ({
  get_firewall_blacklists: vi.fn().mockResolvedValue([]),
}));

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  };
});

describe("Firewall", () => {
  it("renders the workbench header and overview strip", async () => {
    const wrapper = mount(Firewall, {
      global: {
        stubs: {
          FirewallWorkbenchHeader: {
            template: "<div>firewall-workbench</div>",
          },
          FirewallOverviewStrip: {
            template: "<div>firewall-overview</div>",
          },
          FirewallEmptyState: { template: "<div>firewall-empty</div>" },
          FirewallBlacklistEditModal: { template: "<div />" },
        },
      },
    });

    await Promise.resolve();

    expect(wrapper.text()).toContain("firewall-workbench");
    expect(wrapper.text()).toContain("firewall-overview");
  });
});
