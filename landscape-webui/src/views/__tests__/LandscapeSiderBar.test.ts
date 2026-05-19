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

vi.mock("naive-ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("naive-ui")>();
  return {
    ...actual,
    NLayoutSider: {
      template: "<aside><slot /></aside>",
    },
  };
});

const AppShellSidebarSectionStub = {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  template: "<section>{{ title }}</section>",
};

const NMenuStub = {
  props: {
    options: {
      type: Array as PropType<Array<{ label?: string; children?: any[] }>>,
      default: () => [],
    },
  },
  methods: {
    flatten(items: Array<{ label?: string; children?: any[] }>): string[] {
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
          "n-layout": {
            template: "<div><slot /></div>",
          },
          "n-layout-header": {
            template: "<div><slot /></div>",
          },
          "n-layout-footer": {
            template: "<div><slot /></div>",
          },
          "n-flex": {
            template: "<div><slot /></div>",
          },
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

  it("keeps the product shell labels visible after regrouping", () => {
    const wrapper = mount(LandscapeSiderBar, {
      global: {
        stubs: {
          AppShellSidebarSection: AppShellSidebarSectionStub,
          CopyRight: true,
          "n-layout": {
            template: "<div><slot /></div>",
          },
          "n-layout-header": {
            template: "<div><slot /></div>",
          },
          "n-layout-footer": {
            template: "<div><slot /></div>",
          },
          "n-flex": {
            template: "<div><slot /></div>",
          },
          "n-menu": NMenuStub,
        },
      },
    });

    expect(wrapper.text()).toContain("routes.group-overview");
    expect(wrapper.text()).toContain("routes.group-system");
  });
});
