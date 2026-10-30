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
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { CyberShieldScene } from "@/components/3d/CyberShieldScene";
import { Card3D } from "@/components/ui/card-3d";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Real Projects Interface & User's Genuine Projects ───
interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  problemStatement: string;
  solution: string;
  technologies: string[];
  status: "Completed" | "In Active Development" | "Prototype";
  githubUrl: string;
  demoUrl?: string;
  coreFeatures: string[];
  architectureDetails: string[];
  technicalHighlights: string[];
}

const FEATURED_PROJECTS: ProjectItem[] = [
  {
    id: "nexclass",
    name: "NEXCLASS – Smart Classroom Management System",
    tagline: "Centralized Intelligent Classroom Platform & Student Workflow Hub",
    summary:
      "A centralized digital campus platform designed to unify student attendance verification, real-time seat reservation with capacity thresholds, and student engagement analytics into one cohesive interface.",
    problemStatement:
      "Traditional physical classrooms rely on disjointed paper registers, manual headcount sheets, and uncoordinated seating allocations. This friction causes administrative bottlenecks, inaccurate records, and zero longitudinal visibility into student classroom engagement.",
    solution:
      "Architecting a full-stack digital classroom management system integrating automated attendance verification workflows, room capacity seat booking, student progress telemetry, and role-based administrative portals.",
    technologies: ["Next.js", "React", "Python", "Tailwind CSS", "Prisma", "SQLite", "AI Analytics"],
    status: "In Active Development",
    githubUrl: "https://github.com/rsherawat2007-create",
    coreFeatures: [
      "Digital student attendance verification with tamper-resistant audit logs",
      "Interactive classroom seating matrix with real-time capacity and occupancy limits",
      "Student participation analytics and engagement telemetry dashboard",
      "Centralized administrative portal coordinating department lecture allocations",
    ],
    architectureDetails: [
      "Frontend: Next.js 16 App Router with responsive Tailwind CSS components",
      "State & Logic: React hooks with optimistic UI updates for instant reservation feedback",
      "Backend & Data: Node.js server routes with Prisma ORM querying relational schemas",
      "Analytics: Python scripts for student attendance pattern evaluation and reporting",
    ],
    technicalHighlights: [
      "Optimized query schemas to minimize latency during peak morning lecture check-ins",
      "Role-based permission separation for instructors, students, and campus administrators",
      "Scalable database indexes preventing race conditions during concurrent seat booking",
    ],
  },
  {
    id: "tictactoe-lan",
    name: "Tic Tac Toe LAN – Network Multiplayer Game",
    tagline: "Two-Player Multi-Threaded Socket Game over Local Area Network",
    summary:
      "A real-time network multiplayer game engineered from first principles in Python, featuring client-server socket communication, multi-threaded connection handling, and a Tkinter desktop GUI.",
    problemStatement:
      "Building responsive multiplayer games over raw TCP sockets without high-level gaming engines requires low-latency packet framing, strict turn sequence validation, and handling sudden client disconnects gracefully.",
    solution:
      "Engineered a multi-threaded client-server architecture in Python handling TCP/IP socket connections, real-time board state synchronization, bidirectional move validation, and connection heartbeat monitoring with Tkinter interface.",
    technologies: ["Python", "Socket Programming", "TCP/IP", "Client-Server Architecture", "Threading", "Tkinter"],
    status: "Completed",
    githubUrl: "https://github.com/rsherawat2007-create",
    coreFeatures: [
      "2-Player matchmaking over local area network (LAN) using private IPv4 subnets",
      "Multi-threaded server coordinating simultaneous client socket communication",
      "Bidirectional move verification enforcing legal turns and board boundaries",
      "Graceful disconnect and sudden packet-loss handling preventing server hangs",
    ],
    architectureDetails: [
      "Networking Layer: Python `socket` library configured with `SOCK_STREAM` (TCP)",
      "Concurrency: `threading.Thread` spawning dedicated worker threads per connected client",
      "GUI Layer: Tkinter desktop interface with event-driven board square click bindings",
      "Protocol: Custom lightweight string-encoded packet protocol for move updates and game state",
    ],
    technicalHighlights: [
      "Validated with cross-machine testing on local Wi-Fi subnet across multiple endpoints",
      "Zero third-party game engine dependencies—built entirely with standard library Python",
      "Robust state machine preventing out-of-turn play, double clicks, or desynchronized game boards",
    ],
  },
  {
    id: "security-management",
    name: "Security Management System – Premise Security Records",
    tagline: "Python Security Record Management using Linked Lists, Stacks & Queues",
    summary:
      "A practical premise checkpoint application engineered to record, verify, and audit visitor entries utilizing singly linked lists, an action stack for undo operations, and circular queues for gate intake.",
    problemStatement:
      "Premise security checkpoints require fast logging of visitor entries, verification searches, memory-conscious record maintenance, and action undo capability without complex external server dependencies.",
    solution:
      "Built a robust record management tool utilizing custom linked-list data structures in Python to track visitor credentials, handle timestamped check-ins, maintain action history via stacks, and manage entry queues with circular buffers.",
    technologies: ["Python", "Data Structures", "Linked Lists", "Action Stack", "Circular Queue", "SQLite", "Security Auditing"],
    status: "Completed",
    githubUrl: "https://github.com/rsherawat2007-create",
    coreFeatures: [
      "Dynamic singly linked list node structure storing visitor entry credentials",
      "LIFO action stack enabling instant undo operations for accidental entry logs",
      "Circular queue managing checkpoint gate visitor intake to prevent memory overflow",
      "SQLite database persistence ensuring log durability and historical query indexing",
      "Analytics dashboard summarizing peak gate volume and visitor dwell duration",
    ],
    architectureDetails: [
      "Data Structures: Custom `Node`, `LinkedList`, `Stack`, and `CircularQueue` classes in Python",
      "Storage: SQLite relational database storing permanent audit logs with UTC timestamps",
      "Search Engine: Linear and binary search routines for instantaneous visitor pass lookups",
      "Export: Structured CSV/JSON audit reports for campus security review compliance",
    ],
    technicalHighlights: [
      "Implemented dynamic memory management and pointer traversal without opaque external packages",
      "LIFO stack guarantees atomic rollback of administrative entries without database corruption",
      "Modular design separating data structures, persistence layer, and terminal interface",
    ],
  },
  {
    id: "contact-management",
    name: "Contact Management System",
    tagline: "Data-Driven Address Organization with Custom Linked Lists & File Handling",
    summary:
      "A memory-efficient contact management application applying custom linked-list data structures in Python to store, insert, update, search, and delete records with persistent file serialization.",
    problemStatement:
      "Managing structured contact records without high-level database abstractions requires implementing foundational dynamic memory allocation, pointer traversal, and reliable disk serialization.",
    solution:
      "Developed custom dynamic linked-list structures in Python to insert contacts in alphabetical order, execute rapid key lookups, perform in-place updates, and serialize records to disk storage.",
    technologies: ["Python", "Data Structures", "Linked Lists", "Algorithms", "File Handling", "Serialization"],
    status: "Completed",
    githubUrl: "https://github.com/rsherawat2007-create",
    coreFeatures: [
      "Singly linked list with head pointer manipulation and dynamic node reallocation",
      "Alphabetical insertion routine maintaining sorted order upon record creation",
      "Search routines matching exact name queries and substring contact phone numbers",
      "In-place record mutation and safe node deletion with pointer reconnection",
      "Persistent file serialization saving contact databases to local storage across runs",
    ],
    architectureDetails: [
      "Core Structure: Pointer-based `ContactNode` chaining name, phone, email, and tags",
      "Persistence: File I/O handler reading and writing formatted structured records on startup/exit",
      "Complexity: O(1) front insertion, O(N) search and sorted insertion with zero memory leakage",
    ],
    technicalHighlights: [
      "Provides deep foundational mastery of pointer traversal and memory management in Python",
      "Clean separation of data model, traversal algorithms, and persistent file storage",
      "Zero external database dependencies—operates purely on dynamic memory structures and files",
    ],
  },
];

// ─── Technical Skills Hierarchy & Realistic Statuses ───
type SkillStatus = "Learning" | "Practicing" | "Project Experience" | "Proficient";

interface SkillItem {
  name: string;
  status: SkillStatus;
  note: string;
}

interface SkillCategory {
  title: string;
  tag: string;
  description: string;
  skills: SkillItem[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Programming",
    tag: "LANGUAGES & RUNTIMES",
    description: "Core algorithmic foundations, backend scripting, and systems programming.",
    skills: [
      { name: "Python", status: "Project Experience", note: "Socket programming, linked lists, automation scripts" },
      { name: "C", status: "Practicing", note: "Pointers, memory management, low-level data structures" },
      { name: "C++", status: "Practicing", note: "Object-oriented programming, standard template library" },
      { name: "SQL", status: "Learning", note: "Relational queries, schema design, database normalization" },
    ],
  },
  {
    title: "Cybersecurity",
    tag: "DEFENSE & PENETRATION TESTING",
    description: "Defensive concepts, web application penetration testing, and practical tool mastery.",
    skills: [
      { name: "Networking Fundamentals", status: "Project Experience", note: "Certified 82.45% - TCP/IP, OSI model, subnetting, routing" },
      { name: "Linux", status: "Project Experience", note: "Certified 69.05% - CLI navigation, permissions, bash scripting" },
      { name: "Kali Linux", status: "Practicing", note: "Security toolchain, terminal navigation, reconnaissance workflows" },
      { name: "Web Application Security", status: "Learning", note: "HTTP request/response analysis, OWASP testing methodology" },
      { name: "Burp Suite", status: "Learning", note: "Proxy interception, repeater, automated crawl workflows" },
      { name: "OWASP ZAP", status: "Learning", note: "Automated vulnerability scanning and security auditing" },
      { name: "Wireshark", status: "Practicing", note: "Packet inspection, protocol analysis, TCP handshakes" },
      { name: "OWASP Top 10", status: "Learning", note: "Access control failures, injection, cryptographic failures" },
      { name: "Ethical Hacking Fundamentals", status: "Project Experience", note: "Certified 73.68% - Reconnaissance, vulnerability assessment" },
    ],
  },
  {
    title: "AI / ML",
    tag: "DATA SCIENCE & PREDICTIVE MODELS",
    description: "Foundational predictive modeling, mathematical intuition, and Microsoft Azure AI.",
    skills: [
      { name: "Machine Learning Fundamentals", status: "Learning", note: "Supervised vs. unsupervised paradigms, loss functions" },
      { name: "NumPy", status: "Practicing", note: "Multi-dimensional arrays, matrix operations, vectorized math" },
      { name: "Pandas", status: "Practicing", note: "Dataframes, dataset cleaning, feature transformation" },
      { name: "Decision Trees", status: "Learning", note: "Information gain, Gini impurity, classification rules" },
      { name: "Azure AI Fundamentals", status: "Project Experience", note: "Microsoft Certified AI-900 (Credential: w6JFG-48DB)" },
    ],
  },
  {
    title: "Development Tools",
    tag: "ENVIRONMENTS & UTILITIES",
    description: "Day-to-day tools for source control, web interfaces, and distributed systems.",
    skills: [
      { name: "Git", status: "Project Experience", note: "Branching, commit history, merge conflicts, CLI workflows" },
      { name: "GitHub", status: "Project Experience", note: "Repository management, pull requests, open-source workflow" },
      { name: "VS Code", status: "Proficient", note: "Primary IDE with extensions for Python, C/C++, and Next.js" },
      { name: "Socket Programming", status: "Project Experience", note: "TCP sockets, multi-client concurrency, packet framing" },
      { name: "Next.js", status: "Project Experience", note: "App Router, server/client components, API routes" },
      { name: "React", status: "Project Experience", note: "Component lifecycle, state hooks, interactive interfaces" },
      { name: "Tailwind CSS", status: "Project Experience", note: "Utility-first design, cyber dark theme, responsive layouts" },
    ],
  },
];

// ─── Real Verified Certificates & Achievements ───
interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  verificationUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  score?: string;
  validUntil?: string;
  skills: string[];
  description: string;
}

const ALL_CERTIFICATES: CertificateItem[] = [
  {
    id: "ideathon-8",
    title: "IDEATHON 8.0: Second Position Winner (IoT Track)",
    issuer: "ACIC SGTU Community Innovation Centre (NITI Aayog & Atal Innovation Mission)",
    issueDate: "October 2025",
    credentialId: "ACICSGTU/Ideathon 8.0/25/120",
    imageUrl: "/uploads/certificates/acic-sgtu-ideathon-8-winner-2nd-place.jpg",
    skills: ["Internet of Things (IoT)", "Embedded Systems", "Hardware Prototyping", "Pitching"],
    description:
      "Secured 2nd Position in the national-level Ideathon 8.0 organized by ACIC SGTU Community Innovation Centre under NITI Aayog's Atal Innovation Mission, competing in the Internet of Things (IoT) track.",
  },
  {
    id: "synergy-2025",
    title: "SYNERGY 2025: Project Showcase (NEXUS)",
    issuer: "SGT University (School of Engineering & Technology - SOET)",
    issueDate: "26th – 27th November 2025",
    credentialId: "SGTU/2915/2025",
    imageUrl: "/uploads/certificates/sgt-university-synergy-2025-nexus.jpg",
    skills: ["Artificial Intelligence", "Future Tech", "Smart Innovation", "Healthcare AI"],
    description:
      "Selected to showcase and demonstrate technical project 'NEXUS' at the 8th Edition of Synergy Techno Fest (Inter-University & Inter-College) in the Future Tech & AI innovation category.",
  },
  {
    id: "azure-fundamentals",
    title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    issuer: "Microsoft (Certiport)",
    issueDate: "December 17, 2025",
    credentialId: "yqSa-Dw8X",
    verificationUrl: "https://verify.certiport.com",
    pdfUrl: "/uploads/certificates/microsoft-certified-azure-fundamentals.pdf",
    skills: ["Cloud Concepts", "Azure Architecture", "Cloud Security", "Governance"],
    description:
      "Demonstrated foundational knowledge of cloud concepts, core Azure services, cloud management tools, and security and governance fundamentals. Verified via Certiport.",
  },
  {
    id: "azure-ai-fundamentals",
    title: "Microsoft Certified: Azure AI Fundamentals (AI-900)",
    issuer: "Microsoft (Certiport)",
    issueDate: "May 11, 2026",
    credentialId: "w6JFG-48DB",
    verificationUrl: "https://verify.certiport.com",
    pdfUrl: "/uploads/certificates/microsoft-certified-azure-ai-fundamentals.pdf",
    skills: ["AI Workloads", "Machine Learning on Azure", "Computer Vision", "NLP"],
    description:
      "Demonstrated foundational understanding of artificial intelligence, machine learning workloads, computer vision, and natural language processing solutions on Microsoft Azure. Verified via Certiport.",
  },
  {
    id: "asd-linux",
    title: "Linux Course Completion",
    issuer: "ASD Academy (ASDN Cybernetics Inc. &bull; ISO 27001:2022)",
    issueDate: "17 Jul 2026",
    validUntil: "17 Jul 2027",
    credentialId: "CERT-2026-000301",
    verificationUrl: "https://skilltrack.top/verify.php",
    pdfUrl: "/uploads/certificates/linux-course-completion-asd-academy.pdf",
    score: "69.05%",
    skills: ["Linux CLI", "System Administration", "Bash Scripting", "Permissions & Hardening"],
    description:
      "Successfully completed 1-month practical training in Linux system administration, core terminal utilities, permissions, process management, and shell scripting with an overall performance score of 69.05%. ISO 27001:2022 ISMS/24M01833 certified program.",
  },
  {
    id: "asd-networking",
    title: "Networking Course Completion",
    issuer: "ASD Academy (ASDN Cybernetics Inc. &bull; ISO 27001:2022)",
    issueDate: "15 Aug 2026",
    validUntil: "15 Aug 2027",
    credentialId: "CERT-2026-000957",
    verificationUrl: "https://skilltrack.top/verify.php",
    pdfUrl: "/uploads/certificates/networking-course-completion-asd-academy.pdf",
    score: "82.45%",
    skills: ["Computer Networking", "TCP/IP Suite", "Subnetting", "OSI Model", "Protocols & Routing"],
    description:
      "Successfully completed 1-month comprehensive training in computer networking, TCP/IP architecture, IP addressing and subnetting, routing, and protocol mechanics with an outstanding performance score of 82.45%. ISO 27001:2022 ISMS/24M01833 certified program.",
  },
  {
    id: "asd-wifi-pentesting",
    title: "WiFi Pentesting Course Completion",
    issuer: "ASD Academy (ASDN Cybernetics Inc. &bull; ISO 27001:2022)",
    issueDate: "15 Aug 2026",
    validUntil: "15 Aug 2027",
    credentialId: "CERT-2026-000608",
    verificationUrl: "https://skilltrack.top/verify.php",
    pdfUrl: "/uploads/certificates/wifi-pentesting-course-completion-asd-academy.pdf",
    skills: ["Wireless Security", "WiFi Auditing", "WPA/WPA2 Analysis", "Packet Capture", "Network Hardening"],
    description:
      "Successfully completed 1-month practical training in wireless network security assessment, 802.11 protocol auditing, handshake captures, authentication testing, and wireless defensive hardening. ISO 27001:2022 ISMS/24M01833 certified program.",
  },
  {
    id: "asd-ethical-hacking",
    title: "Ethical Hacking Course Completion",
    issuer: "ASD Academy (ASDN Cybernetics Inc. &bull; ISO 27001:2022)",
    issueDate: "15 Oct 2026",
    validUntil: "15 Oct 2027",
    credentialId: "CERT-2026-001596",
    verificationUrl: "https://skilltrack.top/verify.php",
    pdfUrl: "/uploads/certificates/ethical-hacking-course-completion-asd-academy.pdf",
    score: "73.68%",
    skills: ["Ethical Hacking", "Network Recon", "Penetration Testing", "OWASP Top 10", "Vulnerability Assessment"],
    description:
      "Successfully completed 1-month hands-on training in ethical hacking methodologies, network reconnaissance, vulnerability assessment, and web application penetration testing with an overall performance score of 73.68%. ISO 27001:2022 ISMS/24M01833 certified program.",
  },
];

// ─── Learning Journey Timeline Milestones ───
interface TimelineMilestone {
  date: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
}

const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    date: "August 2025 – Present",
    tag: "ACADEMIC FOUNDATION",
    title: "B.Tech in Computer Science & Engineering (AI & ML)",
    subtitle: "SGT University, Budhera, Gurugram (Expected 2029)",
    description:
      "Enrolled in undergraduate degree program focusing on computer science fundamentals, algorithm design, operating systems, and computer architecture. Building foundation in C and Python.",
    skills: ["Data Structures", "Algorithms", "C Programming", "Python", "Computer Systems"],
  },
  {
    date: "October 2025",
    tag: "INNOVATION & COMPETITION",
    title: "2nd Position Winner – IDEATHON 8.0: NextGen Solutions",
    subtitle: "ACIC SGTU Community Innovation Centre (NITI Aayog Atal Innovation Mission)",
    description:
      "Pitched and demonstrated an engineered Internet of Things (IoT) prototype. Awarded 2nd Position in the IoT track under national innovation center leadership.",
    skills: ["Internet of Things (IoT)", "Embedded Systems", "Hardware Prototyping", "Technical Pitching"],
  },
  {
    date: "November 2025",
    tag: "TECHNO FEST EXHIBITION",
    title: "Project Showcase: NEXUS @ SYNERGY 2025 (8th Edition)",
    subtitle: "SGT University – School of Engineering & Technology (SOET)",
    description:
      "Selected to showcase technical project 'NEXUS' in the Inter-University & Inter-College Techno Fest under the AI in Healthcare and Future Tech innovation domain.",
    skills: ["Artificial Intelligence", "Future Tech", "Technical Presentation", "Exhibition"],
  },
  {
    date: "December 2025",
    tag: "CLOUD CERTIFICATION",
    title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    subtitle: "Microsoft & Certiport (Credential: yqSa-Dw8X)",
    description:
      "Validated foundational knowledge of cloud concepts, Azure architecture components, core cloud compute and networking services, security, privacy, and compliance.",
    skills: ["Cloud Architecture", "Azure Core Services", "Cloud Security", "Identity & Governance"],
  },
  {
    date: "May 2026",
    tag: "AI CERTIFICATION",
    title: "Microsoft Certified: Azure AI Fundamentals (AI-900)",
    subtitle: "Microsoft & Certiport (Credential: w6JFG-48DB)",
    description:
      "Validated fundamental understanding of artificial intelligence, machine learning workloads, computer vision, natural language processing, and conversational AI services on Microsoft Azure.",
    skills: ["Machine Learning Workloads", "Computer Vision", "Natural Language Processing", "Azure Cognitive Services"],
  },
  {
    date: "July 2026",
    tag: "SYSTEMS & CLI",
    title: "Linux Course Completion (Score: 69.05%)",
    subtitle: "ASD Academy (ISO 27001:2022 &bull; Cert: CERT-2026-000301)",
    description:
      "Completed 1-month practical training in Linux system administration, terminal command execution, user and group permission management, bash shell scripting, and process diagnostics.",
    skills: ["Linux CLI", "Bash Scripting", "System Administration", "File Permissions"],
  },
  {
    date: "August 2026",
    tag: "NETWORKING & DEFENSE",
    title: "Networking (Score: 82.45%) & WiFi Pentesting Completion",
    subtitle: "ASD Academy (ISO 27001:2022 &bull; Certs: CERT-2026-000957 & CERT-2026-000608)",
    description:
      "Mastered TCP/IP protocols, CIDR subnetting, OSI layers, and packet framing with an 82.45% score. Completed companion training in 802.11 wireless security analysis, handshake captures, and defensive hardening.",
    skills: ["TCP/IP", "Subnetting", "OSI Model", "WiFi Pentesting", "Packet Analysis"],
  },
  {
    date: "October 2026",
    tag: "ETHICAL HACKING",
    title: "Ethical Hacking Course Completion (Score: 73.68%)",
    subtitle: "ASD Academy (ISO 27001:2022 &bull; Cert: CERT-2026-001596)",
    description:
      "Completed 1-month hands-on course covering network reconnaissance, vulnerability identification, web application testing methodologies, and OWASP Top 10 mitigation with a 73.68% score.",
    skills: ["Ethical Hacking", "Vulnerability Assessment", "OWASP Top 10", "Penetration Testing"],
  },
  {
    date: "Present",
    tag: "ACTIVE ENGINEERING",
    title: "NEXCLASS Development & Active WAPT Security Practice",
    subtitle: "Independent Engineering & Lab Practice",
    description:
      "Actively developing the NEXCLASS digital classroom architecture while deepening practical testing skills across Burp Suite, OWASP ZAP, and machine learning pipelines for network telemetry.",
    skills: ["Next.js", "Python", "WAPT Labs", "AI/ML Pipelines", "Socket Systems"],
  },
];

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

// ─── GitHub Repositories Interface ───
interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  languageColor: string;
  repoUrl: string;
  isPrivate?: boolean;
  topics: string[];
}

const GITHUB_REPOS: GitHubRepo[] = [
  {
    name: "NEXCLASS",
    description:
      "Smart classroom management platform unifying attendance verification, seat reservation, and student engagement telemetry.",
    language: "TypeScript",
    languageColor: "#3178c6",
    repoUrl: "https://github.com/rsherawat2007-create",
    topics: ["nextjs", "react", "tailwindcss", "prisma", "ai-analytics"],
  },
  {
    name: "Tic-Tac-Toe-LAN",
    description:
      "Two-player local area network multiplayer game built with Python TCP sockets, multi-threading, and Tkinter GUI.",
    language: "Python",
    languageColor: "#3572a5",
    repoUrl: "https://github.com/rsherawat2007-create",
    topics: ["socket-programming", "tcp-ip", "client-server", "threading", "tkinter"],
  },
  {
    name: "Security-Management-System",
    description:
      "Premise security record management tool using custom singly linked lists, an action stack for undo operations, and circular queues.",
    language: "Python",
    languageColor: "#3572a5",
    repoUrl: "https://github.com/rsherawat2007-create",
    topics: ["data-structures", "linked-lists", "stack", "circular-queue", "sqlite"],
  },
  {
    name: "Contact-Management-System",
    description:
      "Address organization system using dynamic linked lists with alphabetized insertion, search queries, and persistent file handling.",
    language: "Python",
    languageColor: "#3572a5",
    repoUrl: "https://github.com/rsherawat2007-create",
    topics: ["data-structures", "linked-lists", "algorithms", "file-handling"],
  },
];

export default function RecruiterPortfolioPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>("/profile.png");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("All");

  // Terminal Typing Animation State
  const [terminalText, setTerminalText] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const TERMINAL_COMMANDS = [
    "python socket_server.py --host 192.168.1.50 --port 8080",
    "burpsuite --audit-target https://target.lab/auth",
    "python -m nexclass.core --verify-attendance",
    "wireshark -k -i eth0 -f \"tcp port 8080\"",
    "python -m ai_model --train decision_tree --evaluate",
  ];

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    hp: "", // Honeypot field for bot spam protection
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Authentic User Profile Data
  const name = "Rahul Sehrawat";
  const headline = "Computer Science Student | Cybersecurity | AI/ML";
  const positioning = "Building intelligent systems and exploring cybersecurity through practical engineering.";
  const supportingDesc = "I build practical software projects, explore cybersecurity, work with networking technologies, and develop intelligent applications using Python and AI/ML.";
  const email = "rsherawat2007@gmail.com";
  const location = "Mankrola, Gurugram, Haryana, India";
  const institution = "SGT University, Budhera, Gurugram";
  const academicAffiliation = "B.Tech CSE (AI & ML) &bull; SGT University (Expected 2029)";
  const githubUrl = "https://github.com/rsherawat2007-create";
  const linkedinUrl = "https://www.linkedin.com/in/rahul-sehrawat-6433aa2ab/?isSelfProfile=true";

  // Terminal Typing Animation Effect
  useEffect(() => {
    const currentCmd = TERMINAL_COMMANDS[commandIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (charIndex < currentCmd.length) {
        timer = setTimeout(() => {
          setTerminalText(currentCmd.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 45);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setTerminalText(currentCmd.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 25);
      } else {
        setIsDeleting(false);
        setCommandIndex((commandIndex + 1) % TERMINAL_COMMANDS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, commandIndex]);

  // Load custom profile photo from localStorage or fallback
  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem("portfolio_user_photo");
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
        return;
      }
    } catch {
      // ignore
    }

    const img = new Image();
    img.src = "/profile.png";
    img.onload = () => setProfilePhoto("/profile.png");
  }, []);

  // Skill Icon Resolver
  const getSkillIcon = (skillName: string) => {
    const lower = skillName.toLowerCase();
    if (lower.includes("python")) return <FileCode className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes("c++") || lower.includes(" c ") || lower === "c") return <Binary className="w-3.5 h-3.5 text-blue-400" />;
    if (lower.includes("sql")) return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes("network")) return <Network className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes("linux") || lower.includes("bash")) return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes("wapt") || lower.includes("web app")) return <Shield className="w-3.5 h-3.5 text-blue-400" />;
    if (lower.includes("burp") || lower.includes("zap")) return <Bug className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.includes("wireshark")) return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes("http") || lower.includes("headers")) return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes("cookie") || lower.includes("session")) return <Key className="w-3.5 h-3.5 text-purple-400" />;
    if (lower.includes("xss") || lower.includes("injection") || lower.includes("owasp")) return <Lock className="w-3.5 h-3.5 text-rose-400" />;
    if (lower.includes("wifi")) return <Wifi className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes("machine learning") || lower.includes("ai")) return <Brain className="w-3.5 h-3.5 text-purple-400" />;
    if (lower.includes("tree") || lower.includes("forest")) return <GitBranch className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes("numpy") || lower.includes("pandas") || lower.includes("preprocessing")) return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes("azure")) return <Cloud className="w-3.5 h-3.5 text-blue-400" />;
    if (lower.includes("git")) return <GitBranch className="w-3.5 h-3.5 text-orange-400" />;
    if (lower.includes("socket")) return <Radio className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes("next") || lower.includes("react")) return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes("vs code")) return <Code2 className="w-3.5 h-3.5 text-blue-400" />;
    return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
  };

  const getStatusBadge = (status: SkillStatus) => {
    switch (status) {
      case "Proficient":
        return "bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-xs shadow-emerald-500/10";
      case "Project Experience":
        return "bg-blue-950/80 text-blue-300 border border-blue-700/80 shadow-xs shadow-blue-500/10";
      case "Practicing":
        return "bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 shadow-xs shadow-cyan-500/10";
      case "Learning":
        return "bg-amber-950/80 text-amber-300 border border-amber-700/80 shadow-xs shadow-amber-500/10";
    }
  };

  const getStatusDot = (status: SkillStatus) => {
    switch (status) {
      case "Proficient":
        return "bg-emerald-400";
      case "Project Experience":
        return "bg-blue-400";
      case "Practicing":
        return "bg-cyan-400";
      case "Learning":
        return "bg-amber-400";
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFormStatus({
          type: "success",
          text: data.data?.message || "Thank you for reaching out! Your message has been received.",
        });
        setFormData({ name: "", email: "", subject: "", message: "", hp: "" });
      } else {
        setFormStatus({
          type: "error",
          text: data.error || "Failed to send message. Please email directly.",
        });
      }
    } catch {
      setFormStatus({
        type: "error",
        text: "Network error. Please email directly at rsherawat2007@gmail.com",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-[#f1f5f9] selection:bg-cyan-500/30 selection:text-white relative font-sans">
      {/* Background Cyber Grid & Glows */}
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none opacity-20 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-radial-gradient pointer-events-none z-0" />

      {/* ════════════════════════════════════════════════════════════════════
          FIXED TOP NAVIGATION
         ════════════════════════════════════════════════════════════════════ */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 pt-20 sm:pt-24 pb-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28 sm:space-y-36">

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 1: HERO SECTION
             ════════════════════════════════════════════════════════════════════ */}
          <section id="hero" className="pt-6 sm:pt-12 scroll-mt-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
              
              {/* Left Column: Greeting, Headline, Description & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Academic Status Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1424] border border-[#202e4c] text-xs font-mono text-cyan-400 shadow-sm shadow-cyan-500/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">B.Tech CSE (AI &amp; ML)</span>
                  <span className="text-slate-600">//</span>
                  <span className="text-cyan-400">SGT University &bull; Expected 2029</span>
                </div>

                {/* Name & Headline */}
                <div className="space-y-2.5">
                  <div className="text-xs sm:text-sm font-mono text-slate-400 tracking-wider uppercase">
                    Developer &bull; Systems &bull; Security
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                      Rahul
                    </span>{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                      Sehrawat
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl font-mono text-cyan-300/95 font-medium pt-1">
                    {headline}
                  </p>
                </div>

                {/* Positioning Statement & Supporting Description */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0b101d]/90 border border-[#1b253b] backdrop-blur-sm space-y-3.5 shadow-xl">
                  <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed italic border-l-2 border-cyan-400 pl-3">
                    &ldquo;{positioning}&rdquo;
                  </p>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {supportingDesc}
                  </p>

                  {/* Animated Terminal Command Preview */}
                  <div className="mt-3 pt-3 border-t border-[#182033] flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="text-emerald-400 font-bold shrink-0">student@sgtu:~$</span>
                    <span className="text-cyan-300 truncate">{terminalText}</span>
                    <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse shrink-0" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/25 border border-cyan-400/30"
                  >
                    <span>Explore Projects</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="/uploads/resumes/resume.pdf"
                    download="Rahul_Sehrawat_Resume.pdf"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e1424] hover:bg-[#151e36] border border-[#23314f] text-slate-200 hover:text-white font-mono text-xs sm:text-sm transition-colors shadow-md"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Resume</span>
                  </a>

                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e1424] hover:bg-[#151e36] border border-[#23314f] text-slate-200 hover:text-white font-mono text-xs sm:text-sm transition-colors shadow-md"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>

                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e1424] hover:bg-[#151e36] border border-[#23314f] text-slate-200 hover:text-white font-mono text-xs sm:text-sm transition-colors shadow-md"
                  >
                    <LinkedinIcon className="w-4 h-4 text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Prominent Portrait in Cyber Frame */}
              <div className="lg:col-span-5 flex justify-center">
                <Card3D
                  maxRotation={6}
                  spotlightColor="rgba(6, 182, 212, 0.18)"
                  className="w-full max-w-sm sm:max-w-md p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#0d1424] to-[#070a12] border border-[#1f2c48] shadow-2xl relative group"
                >
                  {/* Cyber Corner Accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

                  {/* Top Bar inside frame */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-3 border-b border-[#182338]">
                    <span className="text-cyan-400 font-semibold tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>IDENT // RAHUL SEHRAWAT</span>
                    </span>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>

                  {/* Photo Container */}
                  <div className="relative rounded-2xl overflow-hidden my-3 border border-[#23314f] bg-[#070b14] aspect-square shadow-inner">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Rahul Sehrawat"
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0c1222] to-[#06080e] text-slate-400">
                        <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
                          RS
                        </span>
                        <span className="text-xs font-mono text-slate-400 mt-2">Rahul Sehrawat</span>
                      </div>
                    )}

                    {/* Subtle Scanline Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="pt-2 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                      <span className="text-slate-200 font-medium">OPEN TO INTERNSHIPS</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">SGT UNIVERSITY</span>
                  </div>
                </Card3D>
              </div>

            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 2: ABOUT ME
             ════════════════════════════════════════════════════════════════════ */}
          <section id="about" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  01 // ACADEMIC &amp; ENGINEERING PROFILE
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  About Me
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Foundations, practical learning, and engineering ambitions
              </span>
            </div>

            {/* About Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Biography Narrative */}
              <div className="lg:col-span-7 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                <div className="p-6 rounded-2xl bg-[#0b101e] border border-[#1b253b] space-y-4">
                  <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Computer Science Student @ SGT University</span>
                  </h3>
                  <p>
                    I am an undergraduate Computer Science and Engineering student specializing in <strong className="text-white">Artificial Intelligence and Machine Learning</strong> at <strong className="text-cyan-300 font-medium">SGT University</strong> (Budhera, Gurugram), graduating in 2029.
                  </p>
                  <p>
                    My technical curiosity focuses on building practical software systems and understanding the mechanics of cybersecurity. I believe genuine engineering competence begins with foundational principles: implementing dynamic linked lists and action stacks in Python, programming multi-threaded TCP client-server sockets, and studying network packet behavior through Wireshark.
                  </p>
                  <p>
                    In the security domain, I actively explore web application security testing through hands-on laboratory practice—analyzing HTTP requests and responses, cookie flags, security headers, and common vulnerability classes following the OWASP Top 10 methodology.
                  </p>
                  <p className="text-slate-400 text-sm">
                    My long-term ambition is to grow into a skilled software engineer and security researcher capable of designing secure, scalable distributed applications while maintaining transparent, verifiable engineering standards.
                  </p>
                </div>
              </div>

              {/* Verified Highlight Summary Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-[#0c1222] border border-[#1f2b45] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase">
                    <GraduationCap className="w-4 h-4" />
                    <span>Education</span>
                  </div>
                  <p className="text-white font-semibold text-sm">SGT University, Gurugram</p>
                  <p className="text-xs text-slate-400">B.Tech CSE (AI &amp; ML) &bull; Class of 2029</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1222] border border-[#1f2b45] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-semibold uppercase">
                    <Award className="w-4 h-4" />
                    <span>Verified Certifications</span>
                  </div>
                  <p className="text-white font-semibold text-sm">6 Industry Credentials</p>
                  <p className="text-xs text-slate-400">Microsoft Azure (AZ-900, AI-900) &amp; ASD Academy ISO 27001</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0c1222] border border-[#1f2b45] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
                    <Trophy className="w-4 h-4" />
                    <span>Competition Honors</span>
                  </div>
                  <p className="text-white font-semibold text-sm">2nd Position @ IDEATHON 8.0</p>
                  <p className="text-xs text-slate-400">IoT Track &bull; ACIC SGTU &amp; NITI Aayog Atal Innovation Mission</p>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 3: LEARNING JOURNEY TIMELINE
             ════════════════════════════════════════════════════════════════════ */}
          <section id="journey" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  02 // MILESTONES &amp; PROGRESSION
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Learning Journey
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Chronological academic, certification, and project milestones
              </span>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#1c2742] space-y-10 my-4 ml-2 sm:ml-4">
              {TIMELINE_MILESTONES.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Glowing Node Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#06080e] border-2 border-cyan-400 group-hover:bg-cyan-400 group-hover:scale-125 transition-all shadow-md shadow-cyan-500/30" />

                  {/* Milestone Card */}
                  <Card3D
                    maxRotation={3}
                    spotlightColor="rgba(6, 182, 212, 0.12)"
                    className="p-5 sm:p-6 rounded-2xl bg-[#0a0f1d] border border-[#1b2742] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                        {item.tag}
                      </span>
                      <span className="text-xs font-mono text-slate-400 px-2.5 py-0.5 rounded-full bg-[#121a2d] border border-[#1e2a44] self-start sm:self-auto">
                        {item.date}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-mono text-slate-400 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2.5 py-0.5 rounded bg-[#10172a] border border-[#1e2c4a] text-cyan-300 font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Card3D>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 4: TECHNICAL SKILLS
             ════════════════════════════════════════════════════════════════════ */}
          <section id="skills" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  03 // CAPABILITIES MATRIX
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Technical Skills
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Honest Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Proficient</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Project Exp</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Practicing</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Learning</span>
                </span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { id: "All", label: "All Categories", count: 25 },
                { id: "Programming", label: "Programming", count: 4 },
                { id: "Cybersecurity", label: "Cybersecurity", count: 9 },
                { id: "AI / ML", label: "AI / ML", count: 5 },
                { id: "Development Tools", label: "Development Tools", count: 7 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSkillCategory(tab.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer flex items-center gap-2",
                    selectedSkillCategory === tab.id
                      ? "bg-cyan-950/80 border border-cyan-500/80 text-cyan-300 shadow-md shadow-cyan-500/20"
                      : "bg-[#0a0f1d] border border-[#1b2742] text-slate-400 hover:text-white hover:bg-[#121a30]"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#060912] text-[10px] text-slate-400 border border-[#1b2640]">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Skills Grid */}
            <div className={cn(
              "grid gap-6 transition-all duration-300",
              selectedSkillCategory === "All" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            )}>
              {(selectedSkillCategory === "All"
                ? SKILL_CATEGORIES
                : SKILL_CATEGORIES.filter((c) => c.title === selectedSkillCategory)
              ).map((category) => (
                <Card3D
                  key={category.title}
                  maxRotation={3}
                  spotlightColor="rgba(6, 182, 212, 0.12)"
                  className="p-6 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 font-semibold uppercase tracking-wider">{category.tag}</span>
                      <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#10172a] border border-[#1c2842]">
                        {category.skills.length} Competencies
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/70 flex items-center justify-center text-cyan-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <span>{category.title}</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* 2-Column Grid of Sleek Interactive Tech Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#162035]">
                    {category.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="group relative p-3 rounded-xl bg-[#080d1a] border border-[#19253d] hover:border-cyan-400/50 hover:bg-[#0e1628] transition-all duration-200 flex flex-col justify-between gap-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-md bg-[#111a30] border border-[#1e2e4e] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {getSkillIcon(skill.name)}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-white tracking-tight group-hover:text-cyan-300 transition-colors truncate">
                              {skill.name}
                            </span>
                          </div>

                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-mono font-medium shrink-0 flex items-center gap-1",
                            getStatusBadge(skill.status)
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", getStatusDot(skill.status))} />
                            <span>{skill.status}</span>
                          </span>
                        </div>

                        {skill.note && (
                          <p className="text-[11px] font-mono text-slate-400 pl-8 leading-relaxed line-clamp-1 group-hover:text-slate-300 group-hover:line-clamp-none transition-all">
                            {skill.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card3D>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 5: FEATURED PROJECTS
             ════════════════════════════════════════════════════════════════════ */}
          <section id="projects" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                  04 // CODE IMPLEMENTATIONS &amp; SYSTEMS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Featured Projects
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Detailed software architectures and source implementations
              </span>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURED_PROJECTS.map((project, idx) => (
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
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  {/* Technologies & Inspect Prompt */}
                  <div className="space-y-3 pt-2 border-t border-[#18233a]">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 rounded bg-[#10172a] border border-[#1e2c4a] text-cyan-300 font-mono font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                      <span>Click card to inspect architecture</span>
                      <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 6: CERTIFICATIONS AND ACHIEVEMENTS
             ════════════════════════════════════════════════════════════════════ */}
          <section id="certificates" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold">
                  05 // VERIFIED CREDENTIALS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Certifications &amp; Achievements
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Official credentials with external verification &amp; original documents
              </span>
            </div>

            {/* Certificate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ALL_CERTIFICATES.map((cert) => (
                <Card3D
                  key={cert.id}
                  maxRotation={4}
                  spotlightColor="rgba(168, 85, 247, 0.15)"
                  className="p-6 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header Row: Issuer & Status */}
                    <div className="flex items-center justify-between text-xs font-mono gap-2 flex-wrap">
                      <span className="text-purple-400 font-bold truncate max-w-[280px]">
                        {cert.issuer}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800 font-medium">
                        Verified
                      </span>
                    </div>

                    {/* Certificate Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {cert.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {cert.description}
                    </p>

                    {/* Skills Covered */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cert.skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2.5 py-0.5 rounded bg-[#10172a] border border-[#1e2c4a] text-cyan-300 font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Thumbnail if image is present */}
                    {cert.imageUrl && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCertificate(cert)}
                          className="w-full text-left block relative rounded-xl overflow-hidden border border-[#222e44] hover:border-purple-500/50 group transition-all cursor-pointer"
                        >
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            className="w-full h-44 object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-2.5">
                            <span className="text-xs font-mono text-white flex items-center gap-1.5 group-hover:text-purple-300">
                              <Award className="w-3.5 h-3.5 text-purple-400" />
                              <span>Click to Inspect Full Certificate</span>
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer: Date, Credential ID, View & Verify Actions */}
                  <div className="pt-4 border-t border-[#18233a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="space-y-0.5 text-slate-400">
                      <div>Issued: <strong className="text-slate-200">{cert.issueDate}</strong></div>
                      {cert.credentialId && (
                        <div>Cert ID: <span className="text-cyan-400">{cert.credentialId}</span></div>
                      )}
                      {cert.score && (
                        <div>Score: <span className="text-emerald-400 font-bold">{cert.score}</span></div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                      {cert.pdfUrl && (
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1e2840] border border-[#25334e] text-purple-300 hover:text-white transition-colors text-xs font-medium"
                          title="View PDF"
                        >
                          <FileText className="w-3 h-3 text-purple-400" />
                          <span>View PDF</span>
                        </a>
                      )}

                      {cert.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedCertificate(cert)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1e2840] border border-[#25334e] text-purple-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-purple-400" />
                          <span>View Image</span>
                        </button>
                      )}

                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1e2840] border border-[#25334e] text-slate-200 hover:text-white transition-colors text-xs font-medium"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 7: CYBERSECURITY PRACTICE LAB
             ════════════════════════════════════════════════════════════════════ */}
          <section id="practice" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  06 // HANDS-ON SECURITY LABS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Cybersecurity Practice Lab
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LAB ENVIRONMENT ONLY &bull; 100% AUTHORIZED</span>
              </div>
            </div>

            {/* Practice Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRACTICE_AREAS.map((area) => {
                const IconComponent = area.icon;
                return (
                  <Card3D
                    key={area.id}
                    maxRotation={4}
                    spotlightColor="rgba(16, 185, 129, 0.12)"
                    className="p-5 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">{area.tag}</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug">
                        {area.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {area.description}
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-[#18233a] text-[11px] text-slate-300 font-mono">
                      {area.points.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">&bull;</span>
                          <span className="leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </Card3D>
                );
              })}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 8: GITHUB INTEGRATION
             ════════════════════════════════════════════════════════════════════ */}
          <section id="github" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  07 // OPEN SOURCE &amp; CODE REPOSITORIES
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  GitHub Integration
                </h2>
              </div>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>github.com/rsherawat2007-create</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* GitHub Repository Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GITHUB_REPOS.map((repo) => (
                <Card3D
                  key={repo.name}
                  maxRotation={4}
                  spotlightColor="rgba(59, 130, 246, 0.12)"
                  className="p-6 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-white font-bold text-base">
                        <FolderGit2 className="w-4 h-4 text-cyan-400" />
                        <span>{repo.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#11192e] border border-[#202e50] text-slate-300">
                        Public Repository
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {repo.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {repo.topics.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded bg-[#10172a] border border-[#1c2844] text-cyan-300 font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#18233a] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: repo.languageColor }}
                      />
                      <span className="text-slate-300">{repo.language}</span>
                    </div>

                    <a
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1e2840] border border-[#25334e] text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-medium"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Inspect Code</span>
                    </a>
                  </div>
                </Card3D>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 9: RESUME SECTION
             ════════════════════════════════════════════════════════════════════ */}
          <section id="resume" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  08 // CURRICULUM VITAE
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Resume
                </h2>
              </div>
              <a
                href="/uploads/resumes/resume.pdf"
                download="Rahul_Sehrawat_Resume.pdf"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-semibold shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>

            {/* Resume Summary Card */}
            <Card3D
              maxRotation={2}
              spotlightColor="rgba(16, 185, 129, 0.12)"
              className="p-6 sm:p-8 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#18233a] pb-5">
                <div>
                  <h3 className="text-2xl font-bold text-white font-mono">{name}</h3>
                  <p className="text-sm font-mono text-cyan-400 mt-0.5">{headline}</p>
                  <p className="text-xs text-slate-400 mt-1">{academicAffiliation}</p>
                </div>
                <div className="text-xs font-mono text-slate-400 space-y-1">
                  <div>Email: <span className="text-slate-200">{email}</span></div>
                  <div>Location: <span className="text-slate-200">{location}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Core Technical Foundations
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Python &bull; C &bull; C++ &bull; SQL &bull; TCP/IP Sockets &bull; Wireshark &bull; Linux/Kali Linux &bull; Web App Security &bull; Burp Suite &bull; OWASP ZAP &bull; OWASP Top 10 &bull; Machine Learning &bull; NumPy &bull; Pandas &bull; Next.js &bull; Git/GitHub
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    Honors &amp; Verified Certifications
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    IDEATHON 8.0 2nd Position Winner (IoT) &bull; SYNERGY 2025 Project Showcase (NEXUS) &bull; Microsoft Azure Fundamentals (AZ-900) &bull; Microsoft Azure AI Fundamentals (AI-900) &bull; Linux Certified &bull; Networking Certified (82.45%) &bull; Ethical Hacking Certified (73.68%)
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#18233a] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
                <span>Authentic verified records &bull; Up to date for 2026</span>
                <div className="flex items-center gap-3">
                  <a
                    href="/uploads/resumes/resume.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View PDF in New Tab</span>
                  </a>
                </div>
              </div>
            </Card3D>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              SECTION 10: CONTACT SECTION & WORKING FORM
             ════════════════════════════════════════════════════════════════════ */}
          <section id="contact" className="space-y-8 scroll-mt-28">
            {/* Section Header */}
            <div className="border-b border-[#1b253b] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  09 // INITIATE TRANSMISSION
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Contact Me
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Direct inquiry, collaboration &amp; internship opportunities
              </span>
            </div>

            {/* Contact Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Direct Info & Social Channels */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-5">
                  <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>Direct Communication</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    I am actively seeking technical internships, research assistantships, and project collaborations in Artificial Intelligence, Machine Learning, and Cybersecurity. Feel free to reach out directly.
                  </p>

                  <div className="space-y-3 pt-2 text-xs font-mono">
                    {/* Email with copy button */}
                    <div className="p-3 rounded-xl bg-[#070b16] border border-[#1a253c] flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-200 select-all">{email}</span>
                      </div>
                      <button
                        onClick={handleCopyEmail}
                        className="px-2 py-1 rounded bg-[#10172a] hover:bg-[#1a2540] text-cyan-400 border border-[#202e4c] transition-colors shrink-0"
                        title="Copy Email"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Location */}
                    <div className="p-3 rounded-xl bg-[#070b16] border border-[#1a253c] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-slate-200">{location}</span>
                    </div>

                    {/* University */}
                    <div className="p-3 rounded-xl bg-[#070b16] border border-[#1a253c] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200">{institution}</span>
                    </div>
                  </div>

                  {/* Profile Buttons */}
                  <div className="pt-2 flex flex-col gap-2.5">
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e1424] hover:bg-[#151f38] border border-[#23314f] text-slate-200 hover:text-white font-mono text-xs transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4 text-blue-400" />
                      <span>Connect on LinkedIn</span>
                    </a>

                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e1424] hover:bg-[#151f38] border border-[#23314f] text-slate-200 hover:text-white font-mono text-xs transition-colors"
                    >
                      <GithubIcon className="w-4 h-4 text-slate-300" />
                      <span>Explore GitHub Repositories</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Working Interactive Terminal Form */}
              <div className="lg:col-span-7">
                <Card3D
                  maxRotation={3}
                  spotlightColor="rgba(6, 182, 212, 0.15)"
                  className="p-6 sm:p-7 rounded-2xl bg-[#0a0f1d] border border-[#1e2a44] space-y-5"
                >
                  <div className="flex items-center justify-between text-xs font-mono border-b border-[#18233a] pb-3">
                    <span className="text-cyan-400 font-semibold flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>DISPATCH TRANSMISSION</span>
                    </span>
                    <span className="text-slate-400">Validated Input Only</span>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4 text-sm font-mono">
                    {/* Bot Honeypot */}
                    <input
                      type="text"
                      name="hp"
                      value={formData.hp}
                      onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                      style={{ display: "none" }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 block">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Dr. Alex Mercer"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b16] border border-[#1f2b45] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 block">Your Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="alex@domain.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b16] border border-[#1f2b45] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 block">Subject</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Inquiry / Internship Opportunity / Project Collaboration"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b16] border border-[#1f2b45] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 block">Message</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Detail your message, project specifications, or collaboration proposal..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b16] border border-[#1f2b45] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-xs resize-none"
                      />
                    </div>

                    {formStatus && (
                      <div
                        className={cn(
                          "p-3 rounded-xl border text-xs leading-relaxed",
                          formStatus.type === "success"
                            ? "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                            : "bg-red-950/80 border-red-700 text-red-300"
                        )}
                      >
                        {formStatus.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-mono font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                      {formLoading ? (
                        <span>Transmitting...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Transmit Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </Card3D>
              </div>

            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════════
              FOOTER
             ════════════════════════════════════════════════════════════════════ */}
          <footer className="pt-10 border-t border-[#18233a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-semibold">{name}</span>
              <span>&bull;</span>
              <span>BTech CSE @ SGT University (Class of 2029)</span>
            </div>

            <div className="flex items-center gap-6">
              <span>&copy; {new Date().getFullYear()} Rahul Sehrawat. All rights reserved.</span>
              
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Back to Top"
              >
                <span>TOP</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>

              <Link
                href="/manage"
                className="text-slate-600 hover:text-slate-400 transition-colors"
                title="Private Portfolio Content Manager"
              >
                <Lock className="w-3.5 h-3.5" />
              </Link>
            </div>
          </footer>

        </div>
      </main>

      {/* ─── Project Details Architecture Modal ─── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#0a0f1d] p-6 sm:p-7 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-xs sm:text-sm font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Architecture &bull; {selectedProject.status}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">{selectedProject.name}</h3>
              <p className="text-xs sm:text-sm font-mono text-cyan-400/90 mt-1">{selectedProject.tagline}</p>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-slate-200">
              <div className="p-4 rounded-xl bg-[#080d1a] border border-[#1c2742] space-y-1.5">
                <span className="text-slate-400 font-mono uppercase text-xs sm:text-sm block font-bold">
                  Problem Statement
                </span>
                <p className="leading-relaxed text-sm text-slate-300">{selectedProject.problemStatement}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#080d1a] border border-[#1c2742] space-y-1.5">
                <span className="text-emerald-400 font-mono uppercase text-xs sm:text-sm block font-bold">
                  Proposed Solution &amp; Architecture
                </span>
                <p className="leading-relaxed text-sm text-slate-300">{selectedProject.solution}</p>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase text-xs sm:text-sm block font-bold mb-2">
                  Core Features
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  {selectedProject.coreFeatures.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase text-xs sm:text-sm block font-bold mb-2">
                  Technical Architecture
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  {selectedProject.architectureDetails.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-blue-400 font-bold">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase text-xs sm:text-sm block font-bold mb-2">
                  Technologies Applied
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-lg bg-[#11192e] border border-[#202f50] text-xs font-mono text-cyan-300 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#18233a] flex items-center justify-between">
              {selectedProject.githubUrl ? (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-mono font-semibold"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Inspect Code on GitHub &rarr;</span>
                </a>
              ) : <div />}

              <Button
                variant="outline"
                onClick={() => setSelectedProject(null)}
                className="border-[#202f50] text-slate-300 hover:bg-[#151f38]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Certificate Inspection Lightbox Modal ─── */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-purple-500/30 bg-[#0a0f1d] p-6 sm:p-7 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-colors z-10"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-purple-400 uppercase tracking-wider font-semibold">
                <Award className="w-4 h-4 text-purple-400" />
                <span>{selectedCertificate.issuer}</span>
                <span className="text-emerald-400 font-bold">&bull; VERIFIED</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">{selectedCertificate.title}</h3>
              <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
                Issued: <span className="text-slate-200">{selectedCertificate.issueDate}</span>
                {selectedCertificate.credentialId && ` • Credential ID: ${selectedCertificate.credentialId}`}
                {selectedCertificate.score && ` • Score: ${selectedCertificate.score}`}
              </p>
            </div>

            {/* Full Image Preview if available */}
            {selectedCertificate.imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-[#222e44] bg-[#050811] shadow-2xl">
                <img
                  src={selectedCertificate.imageUrl}
                  alt={selectedCertificate.title}
                  className="w-full h-auto max-h-[62vh] object-contain mx-auto"
                />
              </div>
            ) : selectedCertificate.pdfUrl ? (
              <div className="rounded-xl border border-[#222e44] bg-[#070b14] p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-700/60 flex items-center justify-center mx-auto text-purple-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Official Signed PDF Document</h4>
                  <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                    This credential is officially archived as a signed digital PDF certificate with authentic tamper-evident serialization.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={selectedCertificate.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors shadow-lg shadow-purple-600/25"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Original PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : null}

            {/* Description & Competencies */}
            <div className="space-y-4 text-sm text-slate-300">
              <p className="leading-relaxed bg-[#080d1a] border border-[#18233a] p-4 rounded-xl">
                {selectedCertificate.description}
              </p>

              <div>
                <span className="text-xs font-mono uppercase text-slate-400 font-bold block mb-2">
                  Verified Competencies &amp; Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCertificate.skills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-lg bg-[#11192e] border border-[#202f50] text-xs font-mono text-cyan-300 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-[#18233a] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {selectedCertificate.imageUrl && (
                  <a
                    href={selectedCertificate.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Full-Resolution Image</span>
                  </a>
                )}
                {selectedCertificate.pdfUrl && (
                  <a
                    href={selectedCertificate.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Official PDF</span>
                  </a>
                )}
                {selectedCertificate.verificationUrl && (
                  <a
                    href={selectedCertificate.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Verify at External Portal</span>
                  </a>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setSelectedCertificate(null)}
                className="border-[#202f50] text-slate-300 hover:bg-[#151f38]"
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
