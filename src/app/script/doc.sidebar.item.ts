import reactjsSidebarItems from "./sidebarItems/react.sidebar.item";
import type { SidebarSection } from "./sidebarItems/react.sidebar.item";

export type {
  SidebarSection,
  SidebarChild,
} from "./sidebarItems/react.sidebar.item";

const sidebarItems: Record<string, SidebarSection[]> = {
  reactjs: reactjsSidebarItems,
};

export default sidebarItems;
