export interface SidebarChild {
  id: string;
  label: string;
  children?: SidebarChild[];
}
export interface SidebarSection {
  id: string;
  label: string;
  children: SidebarChild[];
}

const seleniumSidebarItems: SidebarSection[] = [
  {
    id: "sl-1",
    label: "Getting Started",
    children: [
      { id: "sl-1-1", label: "Introduction to Selenium" },
      { id: "sl-1-2", label: "Project Setup" },
      { id: "sl-1-3", label: "Environment Setup" },
      { id: "sl-1-4", label: "Browser Drivers" },
      { id: "sl-1-5", label: "First Selenium Test" },
      { id: "sl-1-6", label: "WebDriver Basics" },
      { id: "sl-1-7", label: "Maven and Gradle Setup" },
    ],
  },
  {
    id: "sl-2",
    label: "WebDriver Core",
    children: [
      { id: "sl-2-1", label: "Locator Strategies" },
      { id: "sl-2-2", label: "Browser Commands" },
      { id: "sl-2-3", label: "Navigation Commands" },
      { id: "sl-2-4", label: "WebElement Interactions" },
      { id: "sl-2-5", label: "Waits and Synchronization" },
      { id: "sl-2-6", label: "Handling Dropdowns" },
      { id: "sl-2-7", label: "Handling Alerts and Popups" },
      { id: "sl-2-8", label: "Handling Frames and iFrames" },
      { id: "sl-2-9", label: "Handling Windows and Tabs" },
      { id: "sl-2-10", label: "Screenshots and Videos" },
    ],
  },
  {
    id: "sl-3",
    label: "Page Object Model",
    children: [
      { id: "sl-3-1", label: "Introduction to POM" },
      { id: "sl-3-2", label: "Page Factory" },
      { id: "sl-3-3", label: "Base Page Class" },
      { id: "sl-3-4", label: "Page Components" },
      { id: "sl-3-5", label: "POM with Inheritance" },
      { id: "sl-3-6", label: "Fluent Page Object Pattern" },
    ],
  },
  {
    id: "sl-4",
    label: "Cucumber BDD",
    children: [
      { id: "sl-4-1", label: "Introduction to BDD" },
      { id: "sl-4-2", label: "Gherkin Syntax" },
      { id: "sl-4-3", label: "Feature Files" },
      { id: "sl-4-4", label: "Step Definitions" },
      { id: "sl-4-5", label: "Hooks - Before and After" },
      { id: "sl-4-6", label: "Scenario Outline and Examples" },
      { id: "sl-4-7", label: "Tags and Filtering" },
      { id: "sl-4-8", label: "Background Keyword" },
      {
        id: "sl-4-9",
        label: "Cucumber Advanced",
        children: [
          { id: "sl-4-9-1", label: "Data Tables" },
          { id: "sl-4-9-2", label: "Doc Strings" },
          { id: "sl-4-9-3", label: "Custom Parameter Types" },
          { id: "sl-4-9-4", label: "World Object" },
        ],
      },
    ],
  },
  {
    id: "sl-5",
    label: "Framework Architecture",
    children: [
      { id: "sl-5-1", label: "Project Structure" },
      { id: "sl-5-2", label: "Driver Manager" },
      { id: "sl-5-3", label: "Config and Properties" },
      { id: "sl-5-4", label: "Test Data Management" },
      { id: "sl-5-5", label: "Utilities and Helpers" },
      { id: "sl-5-6", label: "Logging with Log4j" },
    ],
  },
  {
    id: "sl-6",
    label: "Advanced WebDriver",
    children: [
      { id: "sl-6-1", label: "JavaScript Executor" },
      { id: "sl-6-2", label: "Actions Class" },
      { id: "sl-6-3", label: "Drag and Drop" },
      { id: "sl-6-4", label: "File Upload and Download" },
      { id: "sl-6-5", label: "Cookies Management" },
      { id: "sl-6-6", label: "Headless Browser Testing" },
      { id: "sl-6-7", label: "Chrome DevTools Protocol" },
    ],
  },
  {
    id: "sl-7",
    label: "Reporting",
    children: [
      { id: "sl-7-1", label: "Extent Reports" },
      { id: "sl-7-2", label: "Allure Reports" },
      { id: "sl-7-3", label: "Cucumber HTML Reports" },
      { id: "sl-7-4", label: "Screenshots in Reports" },
    ],
  },
  {
    id: "sl-8",
    label: "CI/CD and Grid",
    children: [
      { id: "sl-8-1", label: "Selenium Grid" },
      { id: "sl-8-2", label: "Parallel Execution" },
      { id: "sl-8-3", label: "Jenkins Integration" },
      { id: "sl-8-4", label: "GitHub Actions Integration" },
      { id: "sl-8-5", label: "Docker with Selenium" },
    ],
  },
  {
    id: "sl-9",
    label: "Best Practices",
    children: [
      { id: "sl-9-1", label: "Stable Locator Strategies" },
      { id: "sl-9-2", label: "Test Independence" },
      { id: "sl-9-3", label: "Retry Mechanisms" },
      { id: "sl-9-4", label: "Cross Browser Testing" },
      { id: "sl-9-5", label: "TypeScript with Selenium" },
    ],
  },
];

export default seleniumSidebarItems;
