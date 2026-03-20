import reactjsSidebarItems from "./sidebarItems/react.sidebar.item";
import type { SidebarSection, SidebarChild } from "./sidebarItems/react.sidebar.item";
import seleniumSidebarItems from "./sidebarItems/selenium.sidebar.item";

export type {
  SidebarSection,
  SidebarChild,
} from "./sidebarItems/react.sidebar.item";

const sidebarItems: Record<string, SidebarSection[]> = {
  reactjs: reactjsSidebarItems,
  selenium: seleniumSidebarItems,
};

export default sidebarItems;
