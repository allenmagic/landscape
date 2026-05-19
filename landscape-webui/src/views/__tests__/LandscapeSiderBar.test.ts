import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import type { PropType } from "vue";
import LandscapeSiderBar from "@/views/LandscapeSiderBar.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ path: "/" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/stores/pty", () => ({
  usePtyStore: () => ({}),
}));

const AppShellSidebarSectionStub = {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  template: "<section>{{ title }}</section>",
};

const passthroughStub = {
  template: "<div><slot /></div>",
};

const NMenuStub = {
  props: {
    options: {
      type: Array as PropType<Array<{ label?: string; children?: any[] }>>,
      default: () => [],
    },
  },
  methods: {
    flatten(
      items: Array<{ label?: string; children?: any[] }>,
    ): string[] {
      return items.flatMap((item) => [
        item.label ?? "",
        ...(item.children ? this.flatten(item.children) : []),
      ]);
    },
  },
  template:
    "<div class='menu-stub'>{{ flatten(options).filter(Boolean).join(' | ') }}</div>",
};

describe("LandscapeSiderBar", () => {
  it("renders the new task-oriented navigation groups", () => {
    const wrapper = mount(LandscapeSiderBar, {
      global: {
        stubs: {
          AppShellSidebarSection: AppShellSidebarSectionStub,
          CopyRight: true,
          "n-layout-sider": passthroughStub,
          "n-layout": passthroughStub,
          "n-layout-header": passthroughStub,
          "n-layout-footer": passthroughStub,
          "n-flex": passthroughStub,
          "n-menu": NMenuStub,
        },
      },
    });

    const text = wrapper.text();
    expect(text).toContain("routes.group-overview");
    expect(text).toContain("routes.group-network");
    expect(text).toContain("routes.group-traffic-policy");
    expect(text).toContain("routes.group-name-service");
    expect(text).toContain("routes.group-infrastructure");
    expect(text).toContain("routes.group-system");
  });
});
