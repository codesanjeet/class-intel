"use client";

import {
  LuBookOpen, LuBrain,
  LuChartBar, LuMenu, LuX,
  LuHousePlus,
} from "react-icons/lu";
import Image from "next/image";
import logo from "../public/logo.jpeg";

type TabId = "dashboard" | "performance" | "grading" | "lesson";

interface SidebarProps {
  activeTab: TabId;
  setActiveTab?: (tab: TabId) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const navItems = [
  { id: "lesson"      as TabId, label: "Lessons",     icon: LuBookOpen },
  { id: "performance" as TabId, label: "Performance", icon: LuChartBar },
  { id: "grading"     as TabId, label: "Grading",     icon: LuBrain },
];

const SIDEBAR_W = 240;

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }: SidebarProps) {

  const handleNavClick = (id: TabId) => {
    setActiveTab?.(id);
    setMobileOpen(false);
  };

  return (
    <>

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        className="md:hidden pl-2"
        style={{
          position: "fixed",
          left: mobileOpen ? SIDEBAR_W + 8 : 12,
          top: 14,
          zIndex: 50,
          width: 34, height: 34, borderRadius: 8,
          background: "#13131a",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.7)",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          transition: "left 0.3s ease",
        }}
      >
        {mobileOpen ? <LuX size={16} /> : <LuMenu size={16} />}
      </button>

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed",
          left: 0, top: 0,
          width: SIDEBAR_W,
          height: "100vh",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#13131a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transition: "transform 0.3s ease",
        }}
        className={mobileOpen ? "" : "max-md:-translate-x-full"}
      >
        {/* Ambient glow */}
        <div style={{
          pointerEvents: "none", position: "absolute",
          left: -64, top: -64, width: 192, height: 192, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }} />

        {/* Logo row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "24px 20px 16px",
        }}>
          {/* Rounded-full logo image */}
          <div style={{
            width: 32, height: 32,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
            border: "1.5px solid rgba(99,102,241,0.4)",
          }}>
            <Image
              src={logo}
              alt="ClassIntel logo"
              width={32}
              height={32}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>

          <span style={{
            fontSize: 17, fontWeight: 700, color: "#f0f0f5", letterSpacing: "-0.03em",
          }}>
            ClassIntel
          </span>

          <span style={{
            marginLeft: "auto", borderRadius: 4, padding: "2px 6px",
            fontFamily: "monospace", fontSize: 9, fontWeight: 500,
            color: "#818cf8", background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
          }}>v2</span>
        </div>

        {/* Section label */}
        <p style={{
          padding: "4px 20px 8px",
          fontSize: 10, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "1.5px", color: "rgba(255,255,255,0.22)",
        }}>Main</p>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  position: "relative",
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${isActive ? "rgba(99,102,241,0.28)" : "transparent"}`,
                  background: isActive ? "rgba(99,102,241,0.14)" : "transparent",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.42)",
                  fontSize: 13.5, fontWeight: 500,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 18, borderRadius: "0 4px 4px 0",
                    background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
                  }} />
                )}
                <Icon
                  size={18}
                  style={{ color: isActive ? "#818cf8" : "rgba(255,255,255,0.32)", flexShrink: 0 }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
               
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            Built by <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Logic Labs</span>
          </p>
        </div>
      </aside>
    </>
  );
}