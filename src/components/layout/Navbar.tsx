"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Shield, Terminal, ArrowRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "About", href: "#about" },
  { name: "Journey", href: "#journey" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Certificates", href: "#certificates" },
  { name: "Practice Lab", href: "#practice" },
  { name: "GitHub", href: "#github" },
  { name: "Resume", href: "#resume" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Determine active section via scroll position
      const sectionIds = ["hero", "about", "journey", "skills", "projects", "certificates", "practice", "github", "resume", "contact"];
      const scrollY = window.scrollY;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#06080e]/90 backdrop-blur-md border-b border-[#1b253b] shadow-lg shadow-black/40 py-3"
          : "bg-[#06080e]/60 backdrop-blur-sm border-b border-[#1b253b]/50 py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1px] shadow-sm shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-shadow">
            <div className="w-full h-full bg-[#080c16] rounded-[7px] flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                RS
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              <span>Rahul Sehrawat</span>
              <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse" />
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              BTech CSE &bull; AI/ML &bull; Cyber
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 relative",
                  isActive
                    ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 shadow-xs shadow-cyan-500/20"
                    : "text-slate-300 hover:text-white hover:bg-[#12192a]"
                )}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Contact Me CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 hover:shadow-cyan-500/30 transition-all border border-cyan-400/30"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Me</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-[#0e1424] border border-[#202d48] text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#1b253b] bg-[#070b14]/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          <div className="grid grid-cols-1 gap-1">
            {NAV_ITEMS.map((item) => {
              const sectionId = item.href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-mono font-medium transition-colors flex items-center justify-between",
                    isActive
                      ? "text-cyan-400 bg-cyan-950/50 border border-cyan-800/60"
                      : "text-slate-300 hover:text-white hover:bg-[#12192a]"
                  )}
                >
                  <span>{item.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                </a>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#1a2338]">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Me</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
