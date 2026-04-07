"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardPanel from "@/components/Dashboard";
import LessonPanel from "@/components/Lession";
import GradingPanel from "@/components/Grading";
import PerformancePanel from "@/components/Performance";

type TabId = "dashboard" | "performance" | "grading" | "lesson";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const panels: Record<TabId, React.ReactNode> = {
    dashboard:   <DashboardPanel />,
    performance: <PerformancePanel />,
    grading:     <GradingPanel />,
    lesson:      <LessonPanel />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#0a0b0f", position: "relative" }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Dark overlay when mobile sidebar is open */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 30,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ✅ md:ml-[240px] — no left margin on mobile, 240px on desktop */}
      <main
        className="md:ml-[240px]"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          background: "#f4f5f7",
        }}
      >
        {panels[activeTab]}
      </main>
    </div>
  );
}