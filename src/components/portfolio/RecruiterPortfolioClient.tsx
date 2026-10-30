"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Cpu,
  Brain,
  Code2,
  ExternalLink,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  ArrowRight,
  Download,
  X,
  CheckCircle2,
  Lock,
  FileText,
  Trophy,
  Terminal,
  ChevronUp,
  Copy,
  Check,
  Send,
  Sparkles,
  Layers,
  Network,
  Binary,
  Radio,
  FileCode,
  Database,
  Wifi,
  Globe,
  Key,
  Bug,
  Cloud,
  GitBranch,
  ShieldCheck,
  Activity,
  FolderGit2,
  CheckCheck,
  ShieldAlert,
  Server,
  FileSearch,
  BookOpen,
  FolderKanban,
  Inbox,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { CyberShieldScene } from "@/components/3d/CyberShieldScene";
import { Card3D } from "@/components/ui/card-3d";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  PublicPortfolioData,
  PublicProjectDTO,
  PublicCertificateDTO,
  PublicSkillCategoryDTO,
} from "@/lib/portfolio-data";

// ─── Cybersecurity Practice Lab Cards ───
interface PracticeArea {
  id: string;
  tag: string;
  title: string;
  icon: React.ElementType;
  description: string;
  points: string[];
}

const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: "wapt",
    tag: "WEB DEFENSE",
    title: "Web Application Security Testing",
    icon: Shield,
    description:
      "Hands-on exploration of web application attack surfaces and defensive controls in authorized lab environments.",
    points: [
      "Interception and inspection of HTTP/HTTPS traffic using Burp Suite Proxy and Repeater",
      "Analyzing session cookies, token handling, and HttpOnly/SameSite configurations",
      "Practicing input sanitization tests for Cross-Site Scripting (XSS) and SQL Injection",
      "Auditing HTTP response headers against OWASP secure configuration baselines",
    ],
  },
  {
    id: "http-analysis",
    tag: "PROTOCOL MECHANICS",
    title: "HTTP Request & Response Analysis",
    icon: Globe,
    description:
      "Deep examination of stateless web communications, verbs, response codes, and header security.",
    points: [
      "Analyzing REST API payloads, JSON body serialization, and URL parameter encoding",
      "Inspecting TLS handshakes, cipher negotiation, and HTTPS certificate chains",
      "Evaluating caching directives (Cache-Control, Pragma) to prevent credential exposure",
      "Testing response code handling (200, 301, 401, 403, 500) for information leakage",
    ],
  },
  {
    id: "cookie-security",
    tag: "IDENTITY & SESSIONS",
    title: "Cookie and Session Security",
    icon: Key,
    description:
      "Practical analysis of state maintenance across client-server interactions and authentication tokens.",
    points: [
      "Examining session fixation vectors and regeneration of session identifiers after login",
      "Enforcing `HttpOnly` flags to mitigate JavaScript DOM access during XSS execution",
      "Configuring `SameSite=Strict` and `Secure` attributes to prevent Cross-Site Request Forgery",
      "Auditing JSON Web Token (JWT) header signing algorithms and expiration claims",
    ],
  },
  {
    id: "security-headers",
    tag: "DEFENSE IN DEPTH",
    title: "Security Headers Auditing",
    icon: Layers,
    description:
      "Auditing and configuring defense-in-depth HTTP headers to harden modern web applications.",
    points: [
      "Implementing strict Content Security Policy (CSP) directives to constrain script sources",
      "Configuring HTTP Strict Transport Security (HSTS) with long max-age and preload directives",
      "Defeating clickjacking via `X-Frame-Options: DENY` and CSP `frame-ancestors`",
      "Preventing MIME-sniffing exploits using `X-Content-Type-Options: nosniff`",
    ],
  },
  {
    id: "xss-sqli",
    tag: "INJECTION DEFENSE",
    title: "XSS and SQL Injection Concepts",
    icon: Lock,
    description:
      "Studying input validation vulnerabilities and secure remediation through parameterization.",
    points: [
      "Understanding Reflected and Stored Cross-Site Scripting attack vectors in practice labs",
      "Studying context-aware output encoding to neutralize malicious user-supplied payloads",
      "Demonstrating SQL injection mechanics and authentication bypass vulnerabilities",
      "Applying parameterized queries and prepared statements to eliminate SQL injection",
    ],
  },
  {
    id: "linux-admin",
    tag: "SYSTEM SECURITY",
    title: "Linux Administration & Hardening",
    icon: Terminal,
    description:
      "Configuring user privileges, file permissions, and directory structures in Linux and Kali Linux.",
    points: [
      "Auditing standard Linux file permissions (UGO/rwx) and special bits (SUID, SGID, Sticky)",
      "Managing sudo privilege separation and restricted user accounts",
      "Investigating system logs (`/var/log/auth.log`, `syslog`, `journalctl`) for anomaly detection",
      "Automating maintenance and reconnaissance tasks using structured Bash shell scripts",
    ],
  },
  {
    id: "networking-packets",
    tag: "PACKET ANALYSIS",
    title: "Networking and Packet Analysis",
    icon: Network,
    description:
      "Analyzing low-level packet framing, TCP 3-way handshakes, and network traffic flows in Wireshark.",
    points: [
      "Capturing and dissecting live TCP, UDP, ARP, and ICMP packets in local virtual networks",
      "Inspecting TCP flags (SYN, ACK, FIN, RST) to verify stateful session handshakes",
      "Performing IPv4 subnetting calculations and routing path verification",
      "Building Python socket utilities to analyze raw Ethernet and transport headers",
    ],
  },
  {
    id: "authorized-vuln",
    tag: "VULNERABILITY ASSESSMENT",
    title: "Authorized Vulnerability Assessment",
    icon: Bug,
    description:
      "Executing structured vulnerability scanning in authorized, controlled development environments.",
    points: [
      "Running automated passive and active vulnerability scans using OWASP ZAP",
      "Triage and verification of scanner alerts to eliminate false-positive findings",
      "Documenting proof-of-concept steps and risk severity rankings using CVSS criteria",
      "Drafting technical remediation recommendations aligned with secure development standards",
    ],
  },
];

interface Props {
  initialData: PublicPortfolioData;
}

export function RecruiterPortfolioClient({ initialData }: Props) {
  const [data] = useState<PublicPortfolioData>(initialData);

  const [selectedProject, setSelectedProject] = useState<PublicProjectDTO | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<PublicCertificateDTO | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(data.profile.photoUrl || "/profile.png");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("All");

  // Terminal Typing Animation State
  const [terminalText, setTerminalText] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const TERMINAL_COMMANDS = [
    "whoami --role 'BTech CSE (AI & ML) Student'",
    "nmap -sV --script vuln 127.0.0.1",
    "python3 -m socket_server --lan --port 8080",
    "wireshark -k -i eth0 -f 'tcp port 443'",
    "curl -I https://rahulsehrawat.com/api/public",
  ];

  useEffect(() => {
    const currentCommand = TERMINAL_COMMANDS[commandIndex];
    const typingSpeed = isDeleting ? 30 : 60;
    const pauseDelay = isDeleting ? 400 : 2000;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentCommand.length) {
        setTerminalText(currentCommand.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (!isDeleting && charIndex === currentCommand.length) {
        setTimeout(() => setIsDeleting(true), pauseDelay);
      } else if (isDeleting && charIndex > 0) {
        setTerminalText(currentCommand.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setCommandIndex((prev) => (prev + 1) % TERMINAL_COMMANDS.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, commandIndex]);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    hp: "", // Honeypot field
  });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCopyEmail = (emailToCopy: string) => {
    navigator.clipboard.writeText(emailToCopy);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContact(true);
    setContactFeedback(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        setContactFeedback({
          type: "success",
          message: resData.message || "Thank you! Your message has been sent successfully.",
        });
        setContactForm({ name: "", email: "", subject: "", message: "", hp: "" });
      } else {
        setContactFeedback({
          type: "error",
          message: resData.error || "Unable to send message. Please try again later.",
        });
      }
    } catch {
      setContactFeedback({
        type: "error",
        message: "Network error occurred. Please reach out directly via email.",
      });
    } finally {
      setSubmittingContact(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter skills by selected category
  const filteredSkills =
    selectedSkillCategory === "All"
      ? data.skills
      : data.skills.filter((c) => c.title === selectedSkillCategory);

  const allCategoryTitles = ["All", ...data.skills.map((c) => c.title)];

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Dynamic Background Noise and Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.12),rgba(255,255,255,0))]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Global Fixed Navbar */}
      <Navbar />

      <div className="relative z-10">
        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1: HERO & TERMINAL GREETING
           ════════════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="min-h-[92vh] pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Greeting, Credentials & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Security Terminal Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tracking-wide">STATUS // ACTIVE B.TECH CSE (AI &amp; ML) STUDENT</span>
              </div>

              {/* Headline & Identity */}
              <div className="space-y-3">
                <div className="text-sm font-mono text-cyan-400 tracking-wider">
                  $ cat identity.md
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Hi, I am{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                    {data.profile.fullName}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl font-medium text-slate-300 leading-relaxed max-w-2xl">
                  {data.profile.headline}
                </p>
              </div>

              {/* Bio Summary */}
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                {data.profile.about.split("\n\n")[0]}
              </p>

              {/* Interactive Terminal Typing Prompt */}
              <div className="p-3.5 rounded-xl bg-[#090d18] border border-[#1e2a44] font-mono text-xs text-slate-300 shadow-inner flex items-center gap-2">
                <span className="text-cyan-400 select-none">rahul@sgt-university:~$</span>
                <span className="text-slate-100">{terminalText}</span>
                <span className="w-2 h-4 bg-cyan-400 animate-pulse" />
              </div>

              {/* Hero Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  onClick={() => scrollToSection("projects")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 text-sm"
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>View Projects</span>
                </Button>

                <Button
                  onClick={() => scrollToSection("contact")}
                  variant="outline"
                  className="bg-[#0b101d] border-[#22304e] hover:bg-[#131c33] text-slate-200 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Me</span>
                </Button>

                <a
                  href="/uploads/resumes/resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#0b101d] border border-cyan-800/40 text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Resume</span>
                </a>
              </div>

              {/* Verified Links & Location Metadata */}
              <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
                {data.profile.githubUrl && (
                  <a
                    href={data.profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {data.profile.linkedinUrl && (
                  <a
                    href={data.profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{data.profile.location}</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Holographic Cyber Shield */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-[420px] aspect-square rounded-3xl bg-gradient-to-b from-[#0c1322] to-[#070b14] border border-[#1c2946] p-4 relative shadow-2xl shadow-blue-950/50 flex flex-col items-center justify-center overflow-hidden">
                <CyberShieldScene />

                {/* Status Float Banner */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#080d1a]/85 backdrop-blur-md border border-[#223356] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">Security Clearance // Verified</span>
                  </div>
                  <span className="text-emerald-400 font-bold">2025–2029</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-24">
          {/* ════════════════════════════════════════════════════════════════════
              SECTION 2: ABOUT & ACADEMIC IDENTITY
             ════════════════════════════════════════════════════════════════════ */}
          <section id="about" className="space-y-8 scroll-mt-28">
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  01 // BIOGRAPHY &amp; ASPIRATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  About &amp; Academic Focus
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                AI/ML Engineering &bull; Cybersecurity &bull; Practical Systems
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-5 text-slate-300 text-sm sm:text-base leading-relaxed">
                {data.profile.about.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}

                {/* Key Technical Interests Badges */}
                <div className="pt-2">
                  <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider block mb-2 font-semibold">
                    Core Technical Interests
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.profile.techInterests
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 rounded-lg bg-[#0e1526] border border-[#1e2e4f] text-cyan-300 text-xs font-mono"
                        >
                          {interest}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Academic Profile Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-2xl bg-[#090e1a] border border-[#1b2742] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Undergraduate Education</h3>
                      <p className="text-xs text-slate-400 font-mono">B.Tech CSE (AI &amp; ML)</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-slate-300 pt-2 border-t border-[#18233a]">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Institution:</span>
                      <span className="text-white font-semibold text-right">SGT University, Gurugram</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Expected Graduation:</span>
                      <span className="text-cyan-400 font-semibold">2029</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Primary Languages:</span>
                      <span className="text-white">Python, C, C++, SQL</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-white text-right">{data.profile.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 3: REAL PROJECTS (DYNAMIC)
             ════════════════════════════════════════════════════════════════════ */}
          <section id="projects" className="space-y-8 scroll-mt-28">
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  02 // REPOSITORIES &amp; SYSTEMS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Engineered Projects
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Single source of truth from database ({data.projects.length} verified project{data.projects.length === 1 ? "" : "s"})
              </span>
            </div>

            {/* Empty State */}
            {data.projects.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#090e1a] border border-[#1b2742] text-center space-y-3">
                <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Projects Currently Published</h3>
                <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                  New project repositories are currently being configured in the admin dashboard. Check back shortly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.projects.map((project, idx) => (
                  <Card3D
                    key={project.id}
                    maxRotation={4}
                    spotlightColor="rgba(59, 130, 246, 0.15)"
                    className="p-6 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-5 flex flex-col justify-between cursor-pointer group"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="space-y-4">
                      {/* Terminal Header */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-400 font-semibold">
                          PROJECT // 0{idx + 1}
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full font-medium border text-[11px]",
                            project.status === "Completed"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          )}
                        >
                          STATUS: {project.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Project Name & Tagline */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                          {project.name}
                        </h3>
                        <p className="text-xs font-mono text-cyan-400/90 mt-1">
                          {project.tagline}
                        </p>
                      </div>

                      {/* Problem Statement Preview */}
                      <div className="p-3.5 rounded-xl bg-[#060a14] border border-[#162035] space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                          Problem Statement
                        </span>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                          {project.problemStatement}
                        </p>
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                        {project.summary}
                      </p>
                    </div>

                    {/* Technologies & Links */}
                    <div className="space-y-3 pt-2 border-t border-[#18233a]">
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-1 rounded bg-[#10172a] border border-[#1e2c4a] text-cyan-300 font-mono font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>Codebase</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">Proprietary / In Dev</span>
                        )}

                        <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>
            )}
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 4: VERIFIED CERTIFICATES (DYNAMIC)
             ════════════════════════════════════════════════════════════════════ */}
          <section id="certificates" className="space-y-8 scroll-mt-28">
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold">
                  03 // CREDENTIALS &amp; CERTIFICATIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Certifications &amp; Achievements
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Official credentials with external verification &bull; {data.certificates.length} verified
              </span>
            </div>

            {data.certificates.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#090e1a] border border-[#1b2742] text-center space-y-3">
                <Award className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Certificates Published</h3>
                <p className="text-xs font-mono text-slate-400">
                  Certificates are currently being reviewed in the management console.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.certificates.map((cert) => (
                  <Card3D
                    key={cert.id}
                    maxRotation={4}
                    spotlightColor="rgba(168, 85, 247, 0.15)"
                    className="p-6 rounded-2xl bg-[#0a0e1c] border border-[#1f2742] space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-purple-400 font-bold">{cert.issuer}</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug">{cert.title}</h3>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                          <span>{cert.issueDate}</span>
                          {cert.credentialId && (
                            <>
                              <span>&bull;</span>
                              <span className="text-purple-300">ID: {cert.credentialId}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{cert.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cert.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300 font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1b253b] flex items-center justify-between gap-3">
                      {(cert.pdfUrl || cert.imageUrl) ? (
                        <button
                          onClick={() => setSelectedCertificate(cert)}
                          className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1.5 font-semibold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">Document on file</span>
                      )}

                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </Card3D>
                ))}
              </div>
            )}
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 5: TECHNICAL SKILLS HIERARCHY (DYNAMIC)
             ════════════════════════════════════════════════════════════════════ */}
          <section id="skills" className="space-y-8 scroll-mt-28">
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  04 // SKILLS MATRIX
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Technical Competencies
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Categorized practical proficiencies &bull; Continuous learning
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {allCategoryTitles.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedSkillCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all",
                    selectedSkillCategory === cat
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                      : "bg-[#0a0f1d] text-slate-400 hover:text-white border border-[#1c273e]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Skills Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSkills.map((category) => (
                <div
                  key={category.title}
                  className="p-6 rounded-2xl bg-[#090e1c] border border-[#1a253e] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#182236] pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                        {category.tag}
                      </span>
                      <h3 className="text-lg font-bold text-white">{category.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {category.skills.length} skills
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{category.description}</p>

                  <div className="space-y-2 pt-1">
                    {category.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="p-2.5 rounded-xl bg-[#060a14] border border-[#152035] flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-sm font-semibold text-white block">{skill.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">{skill.note}</span>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 border",
                            skill.status === "Project Experience" || skill.status === "Proficient"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : skill.status === "Practicing"
                              ? "bg-blue-950 text-blue-300 border-blue-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          )}
                        >
                          {skill.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 6: PRACTICE AREAS (CYBERSECURITY TERMINAL)
             ════════════════════════════════════════════════════════════════════ */}
          <section id="practice" className="space-y-8 scroll-mt-28">
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  05 // HANDS-ON SECURITY LABS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Cybersecurity Practice Areas
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Ethical exploration &bull; Protocol diagnostics &bull; OWASP baselines
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PRACTICE_AREAS.map((area) => {
                const Icon = area.icon;
                return (
                  <Card3D
                    key={area.id}
                    maxRotation={4}
                    spotlightColor="rgba(16, 185, 129, 0.12)"
                    className="p-5 rounded-2xl bg-[#090e1a] border border-[#19263e] space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                          {area.tag}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug">{area.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{area.description}</p>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-[#162136] text-[11px] font-mono text-slate-300">
                      {area.points.slice(0, 2).map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">&bull;</span>
                          <span className="line-clamp-2">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </Card3D>
                );
              })}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 7: CONTACT FORM & INQUIRIES
             ════════════════════════════════════════════════════════════════════ */}
          <section id="contact" className="space-y-8 scroll-mt-28">
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  06 // INITIATE TRANSMISSION
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Contact &amp; Connect
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Rate-limited &bull; CSRF-protected &bull; Encrypted dispatch
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Info Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white">Let&apos;s Build Together</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Open to discussions regarding cybersecurity internships, AI/ML engineering collaborations, and research inquiries.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#090e1c] border border-[#1b2742] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Direct Email:</span>
                    <button
                      onClick={() => handleCopyEmail(data.profile.email)}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="text-sm font-mono text-white font-semibold break-all">
                    {data.profile.email}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-[#18233a]">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{data.profile.location}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs font-mono text-slate-300 space-y-2">
                  <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Security Telemetry Notice</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Messages are validated via Zod schema, sanitized to neutralize script injection, and throttled via distributed rate limiting to mitigate spam.
                  </p>
                </div>
              </div>

              {/* Right Form Column */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleContactSubmit}
                  className="p-6 sm:p-8 rounded-2xl bg-[#090e1c] border border-[#1b2742] space-y-5"
                >
                  {/* Honeypot field (hidden from legitimate users) */}
                  <input
                    type="text"
                    name="hp"
                    value={contactForm.hp}
                    onChange={(e) => setContactForm({ ...contactForm, hp: e.target.value })}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {contactFeedback && (
                    <div
                      className={cn(
                        "p-4 rounded-xl text-xs font-mono flex items-start gap-2.5",
                        contactFeedback.type === "success"
                          ? "bg-emerald-950/50 border border-emerald-800 text-emerald-300"
                          : "bg-red-950/50 border border-red-800 text-red-300"
                      )}
                    >
                      {contactFeedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      )}
                      <span>{contactFeedback.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1.5">
                        Your Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Alex Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a14] border border-[#1b2740] text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1.5">
                        Your Email <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="alex@mit.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a14] border border-[#1b2740] text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      Subject <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Engineering Opportunity / Security Collaboration"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a14] border border-[#1b2740] text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      Message <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#060a14] border border-[#1b2740] text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingContact}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
                  >
                    {submittingContact ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmitting Secure Packet...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#172033] py-12 bg-[#05070d] text-center space-y-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="text-cyan-400 font-bold">{data.profile.fullName}</span>
              <span>&bull;</span>
              <span>BTech CSE (AI &amp; ML)</span>
              <span>&bull;</span>
              <span>SGT University</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <Link href="/manage" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Admin Login</span>
              </Link>
              <span>&bull;</span>
              <span>&copy; {new Date().getFullYear()} All Rights Reserved</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PROJECT DETAILS MODAL
         ════════════════════════════════════════════════════════════════════ */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0f1d] border border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-950/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#1b263e] pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                  {selectedProject.status} // {selectedProject.tagline}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">{selectedProject.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl bg-[#141b2c] hover:bg-[#1f2a44] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Problem Statement
                </h4>
                <p className="leading-relaxed bg-[#060a14] p-3.5 rounded-xl border border-[#162035]">
                  {selectedProject.problemStatement}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Engineered Solution &amp; Contribution
                </h4>
                <p className="leading-relaxed bg-[#060a14] p-3.5 rounded-xl border border-[#162035]">
                  {selectedProject.solution}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Technologies Applied
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded bg-[#10172a] border border-[#1e2c4a] text-cyan-300 text-xs font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1b263e] flex items-center justify-between gap-3">
              {selectedProject.githubUrl ? (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold flex items-center gap-2 shadow-md transition-all"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Inspect Codebase Repository</span>
                </a>
              ) : (
                <span className="text-xs font-mono text-slate-500">Repository link private or in development</span>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedProject(null)}
                className="text-xs font-mono"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CERTIFICATE VIEWER MODAL
         ════════════════════════════════════════════════════════════════════ */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0a0f1d] border border-purple-500/40 p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#1b263e] pb-4">
              <div>
                <span className="text-xs font-mono text-purple-400 font-semibold uppercase">
                  Verified Credential Document
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedCertificate.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedCertificate.issuer} &bull; {selectedCertificate.issueDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="p-2 rounded-xl bg-[#141b2c] hover:bg-[#1f2a44] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Area */}
            <div className="w-full min-h-[400px] bg-[#06080e] rounded-2xl border border-[#1b253b] overflow-hidden flex items-center justify-center">
              {selectedCertificate.pdfUrl ? (
                <iframe
                  src={selectedCertificate.pdfUrl}
                  className="w-full h-[500px] border-none"
                  title={selectedCertificate.title}
                />
              ) : selectedCertificate.imageUrl ? (
                <img
                  src={selectedCertificate.imageUrl}
                  alt={selectedCertificate.title}
                  className="max-w-full max-h-[500px] object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-sm font-mono text-slate-400">Document available on request</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              {selectedCertificate.verificationUrl && (
                <a
                  href={selectedCertificate.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Verify at Official Portal</span>
                </a>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedCertificate(null)}
                className="text-xs font-mono"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
