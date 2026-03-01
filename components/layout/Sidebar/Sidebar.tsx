"use client";

import React from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Home, MessageCirclePlus, HelpCircle, Phone, Settings, Info, Lock, MessageSquare } from "lucide-react";
import NavItem from "./NavItem";
import { t } from "@/lib/i18n";

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, startNewChat, language, chatHistory, setChatId, setCurrentView } = useApp();
  const i = t(language).sidebar;

  return (
    <>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.3)" }} />}
      <aside
        role="navigation"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 50, width: 280, height: "100%",
          background: "#fff", borderRight: "1px solid #e8e8f0",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #e8e8f0" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #910A67, #720455)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>S</div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>SchemeSetu</p>
            <p style={{ fontSize: 11, color: "#999", margin: 0 }}>{i.tagline}</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: 12, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem icon={<Home size={18} />} label={i.home} onClick={() => { startNewChat(); setSidebarOpen(false); setCurrentView("home"); }} />
          <NavItem icon={<MessageCirclePlus size={18} />} label={i.newChat} onClick={() => { startNewChat(); }} />
          <div style={{ height: 1, background: "#e8e8f0", margin: "12px 0" }} />
          
          {chatHistory.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", padding: "0 10px", margin: "0 0 4px" }}>
                Recent Chats
              </p>
              {chatHistory.slice(0, 5).map(chat => (
                <NavItem 
                  key={chat.id} 
                  icon={<MessageSquare size={16} />} 
                  label={chat.title.length > 25 ? chat.title.slice(0, 25) + '...' : chat.title} 
                  onClick={() => {
                    setChatId(chat.id);
                    setCurrentView("chat");
                    setSidebarOpen(false);
                  }} 
                />
              ))}
              <div style={{ height: 1, background: "#e8e8f0", margin: "12px 0" }} />
            </div>
          )}

          <NavItem icon={<HelpCircle size={18} />} label={i.faq} />
          <NavItem icon={<Phone size={18} />} label={i.contact} />
          <div style={{ height: 1, background: "#e8e8f0", margin: "12px 0" }} />
          <NavItem icon={<Settings size={18} />} label={i.settings} />
          <NavItem icon={<Info size={18} />} label={i.about} />
          <NavItem icon={<Lock size={18} />} label={i.privacy} />
        </nav>

        <div style={{ padding: "12px 20px", borderTop: "1px solid #e8e8f0" }}>
          <p style={{ fontSize: 11, color: "#999", margin: 0 }}>{i.footer}</p>
        </div>
      </aside>
    </>
  );
}
