"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  FolderKanban,
  Cpu,
  Shield,
  GraduationCap,
  Award,
  Briefcase,
  Trophy,
  FileText,
  Mail,
  Map,
  GitPullRequest,
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavSectionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isSecondary?: boolean;
}

export const PRIMARY_NAV_ITEMS: NavSectionItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "projects", label: "Featured Projects", icon: FolderKanban },
  { id: "skills", label: "Technical Skills", icon: Cpu },
  { id: "labs", label: "Cybersecurity Labs and Practical Projects", icon: Shield },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certificates", label: "Certificates and Achievements", icon: Award },
  { id: "experience", label: "Experience and Internships", icon: Briefcase },
  { id: "hackathons", label: "Hackathons and Competitions", icon: Trophy },
  { id: "research", label: "Research and Technical Writing", icon: FileText },
  { id: "contact", label: "Contact", icon: Mail },
];

export const SECONDARY_NAV_ITEMS: NavSectionItem[] = [
  { id: "roadmap", label: "Learning Roadmap", icon: Map, isSecondary: true },
  { id: "opensource", label: "Open Source Contributions", icon: GitPullRequest, isSecondary: true },
  { id: "extracurricular", label: "Extracurricular Activities", icon: Activity, isSecondary: true },
];

interface PortfolioSidebarProps {
  visibleSectionIds: string[];
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function PortfolioSidebar({
  visibleSectionIds,
  collapsed: externalCollapsed,
  onToggleCollapse,
}: PortfolioSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isControlled = externalCollapsed !== undefined;
  const collapsed = isControlled ? externalCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (isControlled) {
      onToggleCollapse?.(!collapsed);
    } else {
      setInternalCollapsed(!collapsed);
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("home");

  // Filter items based on which sections actually exist on the page
  const primaryItems = PRIMARY_NAV_ITEMS.filter((item) =>
    visibleSectionIds.includes(item.id)
  );
  const secondaryItems = SECONDARY_NAV_ITEMS.filter((item) =>
    visibleSectionIds.includes(item.id)
  );

  // Scrollspy: update active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const allIds = [...primaryItems, ...secondaryItems].map((i) => i.id);
      const scrollY = window.scrollY;

      // Find which section is currently centered or nearest to the top
      let currentActive = allIds[0] || "home";
      for (const id of allIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          if (scrollY >= top) {
            currentActive = id;
          }
        }
      }
      setActiveId(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [primaryItems, secondaryItems]);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const renderNavItem = (item: NavSectionItem, isMobile = false) => {
    const Icon = item.icon;
    const isActive = activeId === item.id;

    return (
      <div key={item.id} className="relative group">
        <button
          onClick={() => scrollToSection(item.id)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            isActive
              ? "bg-gradient-to-r from-blue-600/25 to-blue-500/10 text-blue-400 font-semibold border border-blue-500/40 shadow-sm shadow-blue-500/10"
              : item.isSecondary
              ? "text-slate-400 hover:text-slate-200 hover:bg-[#151c2e]"
              : "text-slate-300 hover:text-white hover:bg-[#161e31]"
          )}
          aria-label={item.label}
        >
          <div
            className={cn(
              "flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200",
              "group-hover:scale-110",
              isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
            )}
          >
            <Icon className="w-4 h-4" />
          </div>

          {/* Label in expanded mode or mobile */}
          {(!collapsed || isMobile) && (
            <span className="truncate flex-1 tracking-wide">{item.label}</span>
          )}

          {/* Active indicator bar */}
          {isActive && (!collapsed || isMobile) && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
          )}
        </button>

        {/* Floating Tooltip in collapsed desktop mode */}
        {collapsed && !isMobile && (
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#151c2d] border border-[#2b3954] text-white text-xs rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {item.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Bar with Drawer Toggle Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#07090e]/90 backdrop-blur-md border-b border-[#1c2436] px-4 flex items-center justify-between z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-[#121726] border border-[#222d44] text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open portfolio navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs font-mono text-blue-400 font-semibold tracking-wider">
          PORTFOLIO NAVIGATION
        </span>

        <button
          onClick={() => scrollToSection("contact")}
          className="px-3 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm"
        >
          Contact
        </button>
      </div>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] h-full bg-[#0a0d15] border-r border-[#1c2436] p-4 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c2436]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    RS
                  </div>
                  <span className="text-xs font-bold text-white tracking-wider font-mono">
                    SECTIONS
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161e31]"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Primary Navigation */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1">
                  Primary
                </div>
                {primaryItems.map((item) => renderNavItem(item, true))}
              </div>

              {/* Secondary Navigation */}
              {secondaryItems.length > 0 && (
                <div className="pt-3 border-t border-[#182133] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1">
                    Secondary
                  </div>
                  {secondaryItems.map((item) => renderNavItem(item, true))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1c2436] text-[11px] text-slate-500 font-mono">
              BTech CSE • AI/ML • Cyber
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 bottom-0 z-30 flex-col justify-between",
          "bg-[#090c14]/95 backdrop-blur-xl border-r border-[#1c2436] p-3 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Header with Expand/Collapse Toggle Button */}
          <div
            className={cn(
              "flex items-center pb-3 border-b border-[#1c2436] mb-3",
              collapsed ? "justify-center" : "justify-between px-1"
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-600/30">
                  RS
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white tracking-wider">
                    NAVIGATION
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Recruiter View</span>
                </div>
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={handleToggleCollapse}
              className="p-1.5 rounded-lg bg-[#121827] border border-[#222d44] text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {/* Navigation Links (Scrollable if necessary) */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            {/* Primary Navigation */}
            <div className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                  Main Portfolio
                </div>
              )}
              {primaryItems.map((item) => renderNavItem(item, false))}
            </div>

            {/* Secondary Navigation */}
            {secondaryItems.length > 0 && (
              <div className="pt-3 border-t border-[#182133] space-y-1">
                {!collapsed && (
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                    Additional Focus
                  </div>
                )}
                {secondaryItems.map((item) => renderNavItem(item, false))}
              </div>
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="pt-3 border-t border-[#1c2436] mt-auto">
            {!collapsed ? (
              <div className="px-2 py-1 text-[11px] text-slate-400 font-mono">
                BTech CSE Student
              </div>
            ) : (
              <div className="flex justify-center text-[10px] text-slate-400 font-mono">
                3D
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
