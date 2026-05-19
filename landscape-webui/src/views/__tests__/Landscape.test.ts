import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Landscape from "@/views/Landscape.vue";

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  };
});

vi.mock("@/components/sysinfo/SystemInfo.vue", () => ({
  default: { template: "<div>system-info-stub</div>" },
}));

vi.mock("@/components/sysinfo/CPUUsage.vue", () => ({
  default: { template: "<div>cpu-usage-stub</div>" },
}));

vi.mock("@/components/sysinfo/MemUsage.vue", () => ({
  default: { template: "<div>mem-usage-stub</div>" },
}));

vi.mock("@/components/dns/DnsStatusCard.vue", () => ({
  default: { template: "<div>dns-status-stub</div>" },
}));

vi.mock("@/components/topology/NetFlow.vue", () => ({
  default: { template: "<div>net-flow-stub</div>" },
}));

describe("Landscape", () => {
  it("renders the overview hero, network canvas, and operations panels", () => {
    const wrapper = mount(Landscape, {
      global: {
        stubs: {
          OverviewHero: { template: "<div>overview-hero</div>" },
          OperationsPanelGrid: {
            template: "<div>operations-panels<slot /></div>",
          },
          NetFlow: { template: "<div>net-flow-stub</div>" },
        },
      },
    });

    expect(wrapper.text()).toContain("overview-hero");
    expect(wrapper.text()).toContain("network-canvas");
    expect(wrapper.text()).toContain("operations-panels");
  });
});
