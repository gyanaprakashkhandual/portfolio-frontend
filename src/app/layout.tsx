import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/Nav.bar";
import { ThemeProvider } from "@/app/context/Theme.context";
import StoreProvider from "./context/Store.context";
import { ContentProvider } from "./context/Content.context";
import { ActionMenuProvider } from "./context/Action.menu.context";
export const metadata: Metadata = {
  title: "Gyan's",
  description:
    "Personal portfolio showcasing projects, skills, and experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('portfolio-theme');
                  var theme = (stored === 'light' || stored === 'dark') ? stored
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ActionMenuProvider>
        <ThemeProvider>
          <ContentProvider>
            <Navbar />
            <StoreProvider>{children}</StoreProvider>
          </ContentProvider>
        </ThemeProvider>
        </ActionMenuProvider>
      </body>
    </html>
  );
}
