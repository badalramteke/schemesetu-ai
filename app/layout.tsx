import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProvider } from "@/components/providers/AppProvider";

export const metadata: Metadata = {
  title: "SchemeSetu AI — Government Schemes Made Simple",
  description:
    "Voice-first AI assistant helping rural Indian citizens discover and apply for government schemes like PM-KISAN, PMJAY, PMAY, MGNREGA, and APY.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Accessibility: Skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
