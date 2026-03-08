import reactjsSidebarItems from "./sidebarItem/react.sidebar.item";
import type { SidebarSection } from "./sidebarItem/react.sidebar.item";

export type { SidebarSection, SidebarChild } from "./sidebarItem/react.sidebar.item";

const sidebarItems: Record<string, SidebarSection[]> = {
  reactjs: reactjsSidebarItems,
};

export default sidebarItems;