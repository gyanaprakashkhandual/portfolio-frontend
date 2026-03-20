const seleniumFileMap: Record<string, { fileName: string; filePath: string }> =
  {
    // Getting Started
    "introduction-to-selenium": {
      fileName: "Intro.md",
      filePath: "note/test/selenium/getting-started/Intro.md",
    },
    "selenium-project-setup": {
      fileName: "ProjectSetup.md",
      filePath: "note/test/selenium/getting-started/ProjectSetup.md",
    },
    "environment-setup": {
      fileName: "EnvironmentSetup.md",
      filePath:
        "note/test/selenium/getting-started/EnvironmentSetup.md",
    },
    "browser-drivers": {
      fileName: "BrowserDrivers.md",
      filePath:
        "note/test/selenium/getting-started/BrowserDrivers.md",
    },
    "first-selenium-test": {
      fileName: "FirstTest.md",
      filePath:
        "note/test/selenium/getting-started/FirstTest.md",
    },
    "webdriver-basics": {
      fileName: "WebDriverBasics.md",
      filePath:
        "note/test/selenium/getting-started/WebDriverBasics.md",
    },
    "maven-and-gradle-setup": {
      fileName: "MavenGradle.md",
      filePath:
        "note/test/selenium/getting-started/MavenGradle.md",
    },

    // WebDriver Core
    "locator-strategies": {
      fileName: "LocatorStrategies.md",
      filePath:
        "note/test/selenium/webdriver-core/LocatorStrategies.md",
    },
    "browser-commands": {
      fileName: "BrowserCommands.md",
      filePath:
        "note/test/selenium/webdriver-core/BrowserCommands.md",
    },
    "navigation-commands": {
      fileName: "NavigationCommands.md",
      filePath:
        "note/test/selenium/webdriver-core/NavigationCommands.md",
    },
    "webelement-interactions": {
      fileName: "WebElementInteractions.md",
      filePath:
        "note/test/selenium/webdriver-core/WebElementInteractions.md",
    },
    "waits-and-synchronization": {
      fileName: "Waits.md",
      filePath: "note/test/selenium/webdriver-core/Waits.md",
    },
    "handling-dropdowns": {
      fileName: "Dropdowns.md",
      filePath: "note/test/selenium/webdriver-core/Dropdowns.md",
    },
    "handling-alerts-and-popups": {
      fileName: "AlertsPopups.md",
      filePath:
        "note/test/selenium/webdriver-core/AlertsPopups.md",
    },
    "handling-frames-and-iframes": {
      fileName: "Frames.md",
      filePath: "note/test/selenium/webdriver-core/Frames.md",
    },
    "handling-windows-and-tabs": {
      fileName: "WindowsTabs.md",
      filePath:
        "note/test/selenium/webdriver-core/WindowsTabs.md",
    },
    "screenshots-and-videos": {
      fileName: "ScreenshotsVideos.md",
      filePath:
        "note/test/selenium/webdriver-core/ScreenshotsVideos.md",
    },

    // Page Object Model
    "introduction-to-pom": {
      fileName: "IntroPOM.md",
      filePath:
        "note/test/selenium/page-object-model/IntroPOM.md",
    },
    "page-factory": {
      fileName: "PageFactory.md",
      filePath:
        "note/test/selenium/page-object-model/PageFactory.md",
    },
    "base-page-class": {
      fileName: "BasePage.md",
      filePath:
        "note/test/selenium/page-object-model/BasePage.md",
    },
    "page-components": {
      fileName: "PageComponents.md",
      filePath:
        "note/test/selenium/page-object-model/PageComponents.md",
    },
    "pom-with-inheritance": {
      fileName: "POMInheritance.md",
      filePath:
        "note/test/selenium/page-object-model/POMInheritance.md",
    },
    "fluent-page-object-pattern": {
      fileName: "FluentPOM.md",
      filePath:
        "note/test/selenium/page-object-model/FluentPOM.md",
    },

    // Cucumber BDD
    "introduction-to-bdd": {
      fileName: "IntroBDD.md",
      filePath: "note/test/selenium/cucumber/IntroBDD.md",
    },
    "gherkin-syntax": {
      fileName: "GherkinSyntax.md",
      filePath: "note/test/selenium/cucumber/GherkinSyntax.md",
    },
    "feature-files": {
      fileName: "FeatureFiles.md",
      filePath: "note/test/selenium/cucumber/FeatureFiles.md",
    },
    "step-definitions": {
      fileName: "StepDefinitions.md",
      filePath: "note/test/selenium/cucumber/StepDefinitions.md",
    },
    "hooks-before-and-after": {
      fileName: "Hooks.md",
      filePath: "note/test/selenium/cucumber/Hooks.md",
    },
    "scenario-outline-and-examples": {
      fileName: "ScenarioOutline.md",
      filePath: "note/test/selenium/cucumber/ScenarioOutline.md",
    },
    "tags-and-filtering": {
      fileName: "TagsFiltering.md",
      filePath: "note/test/selenium/cucumber/TagsFiltering.md",
    },
    "background-keyword": {
      fileName: "Background.md",
      filePath: "note/test/selenium/cucumber/Background.md",
    },
    "data-tables": {
      fileName: "DataTables.md",
      filePath:
        "note/test/selenium/cucumber/advanced/DataTables.md",
    },
    "doc-strings": {
      fileName: "DocStrings.md",
      filePath:
        "note/test/selenium/cucumber/advanced/DocStrings.md",
    },
    "custom-parameter-types": {
      fileName: "CustomParameterTypes.md",
      filePath:
        "note/test/selenium/cucumber/advanced/CustomParameterTypes.md",
    },
    "world-object": {
      fileName: "WorldObject.md",
      filePath:
        "note/test/selenium/cucumber/advanced/WorldObject.md",
    },

    // Framework Architecture
    "project-structure": {
      fileName: "ProjectStructure.md",
      filePath:
        "note/test/selenium/framework/ProjectStructure.md",
    },
    "driver-manager": {
      fileName: "DriverManager.md",
      filePath: "note/test/selenium/framework/DriverManager.md",
    },
    "config-and-properties": {
      fileName: "ConfigProperties.md",
      filePath:
        "note/test/selenium/framework/ConfigProperties.md",
    },
    "test-data-management": {
      fileName: "TestDataManagement.md",
      filePath:
        "note/test/selenium/framework/TestDataManagement.md",
    },
    "utilities-and-helpers": {
      fileName: "Utilities.md",
      filePath: "note/test/selenium/framework/Utilities.md",
    },
    "logging-with-log4j": {
      fileName: "Log4j.md",
      filePath: "note/test/selenium/framework/Log4j.md",
    },

    // Advanced WebDriver
    "javascript-executor": {
      fileName: "JavaScriptExecutor.md",
      filePath:
        "note/test/selenium/advanced/JavaScriptExecutor.md",
    },
    "actions-class": {
      fileName: "ActionsClass.md",
      filePath: "note/test/selenium/advanced/ActionsClass.md",
    },
    "drag-and-drop": {
      fileName: "DragDrop.md",
      filePath: "note/test/selenium/advanced/DragDrop.md",
    },
    "file-upload-and-download": {
      fileName: "FileUploadDownload.md",
      filePath:
        "note/test/selenium/advanced/FileUploadDownload.md",
    },
    "cookies-management": {
      fileName: "Cookies.md",
      filePath: "note/test/selenium/advanced/Cookies.md",
    },
    "headless-browser-testing": {
      fileName: "HeadlessTesting.md",
      filePath: "note/test/selenium/advanced/HeadlessTesting.md",
    },
    "chrome-devtools-protocol": {
      fileName: "CDP.md",
      filePath: "note/test/selenium/advanced/CDP.md",
    },

    // Reporting
    "extent-reports": {
      fileName: "ExtentReports.md",
      filePath: "note/test/selenium/reporting/ExtentReports.md",
    },
    "allure-reports": {
      fileName: "AllureReports.md",
      filePath: "note/test/selenium/reporting/AllureReports.md",
    },
    "cucumber-html-reports": {
      fileName: "CucumberHTMLReports.md",
      filePath:
        "note/test/selenium/reporting/CucumberHTMLReports.md",
    },
    "screenshots-in-reports": {
      fileName: "ScreenshotsInReports.md",
      filePath:
        "note/test/selenium/reporting/ScreenshotsInReports.md",
    },

    // CI/CD and Grid
    "selenium-grid": {
      fileName: "SeleniumGrid.md",
      filePath: "note/test/selenium/cicd/SeleniumGrid.md",
    },
    "parallel-execution": {
      fileName: "ParallelExecution.md",
      filePath: "note/test/selenium/cicd/ParallelExecution.md",
    },
    "jenkins-integration": {
      fileName: "Jenkins.md",
      filePath: "note/test/selenium/cicd/Jenkins.md",
    },
    "github-actions-integration": {
      fileName: "GitHubActions.md",
      filePath: "note/test/selenium/cicd/GitHubActions.md",
    },
    "docker-with-selenium": {
      fileName: "Docker.md",
      filePath: "note/test/selenium/cicd/Docker.md",
    },

    // Best Practices
    "stable-locator-strategies": {
      fileName: "StableLocators.md",
      filePath:
        "note/test/selenium/best-practices/StableLocators.md",
    },
    "test-independence": {
      fileName: "TestIndependence.md",
      filePath:
        "note/test/selenium/best-practices/TestIndependence.md",
    },
    "retry-mechanisms": {
      fileName: "RetryMechanisms.md",
      filePath:
        "note/test/selenium/best-practices/RetryMechanisms.md",
    },
    "cross-browser-testing": {
      fileName: "CrossBrowserTesting.md",
      filePath:
        "note/test/selenium/best-practices/CrossBrowserTesting.md",
    },
    "typescript-with-selenium": {
      fileName: "TypeScript.md",
      filePath:
        "note/test/selenium/best-practices/TypeScript.md",
    },
  };

export default seleniumFileMap;
