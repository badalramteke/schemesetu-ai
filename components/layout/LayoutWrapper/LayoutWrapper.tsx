"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import Header from "@/components/layout/Header/Header";
import AccessibilityPanel from "@/components/features/accessibility/AccessibilityPanel/AccessibilityPanel";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
      <Sidebar />
      <Header />
      <main id="main-content" role="main" style={{ paddingTop: 56 }}>
        {children}
      </main>
      {/* Floating accessibility controls — bottom-right */}
      <AccessibilityPanel />
    </div>
  );
}
