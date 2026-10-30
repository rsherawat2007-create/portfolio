"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  GraduationCap,
  Award,
  FolderKanban,
  Cpu,
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  ExternalLink,
  Eye,
  EyeOff,
  ArrowLeft,
  Save,
  RotateCcw,
  AlertCircle,
  LogOut,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortfolioManagerPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string } | null>(null);

  const [activeTab, setActiveTab] = useState<
    "profile" | "education" | "certificates" | "projects" | "skills" | "resume"
  >("profile");

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ─── Profile State ───
  const [profile, setProfile] = useState({
    fullName: "Rahul Sehrawat",
    headline: "BTech CSE (AI & ML) Student | Cybersecurity & Web Security",
    about: "",
    location: "Mankrola, Gurugram, Haryana, India",
    email: "rsherawat2007@gmail.com",
    githubUrl: "https://github.com/rsherawat2007-create",
    linkedinUrl: "https://www.linkedin.com/in/rahul-sehrawat-6433aa2ab/?isSelfProfile=true",
    techInterests: "Ethical Hacking, AI/ML, Web Application Security, Network Defense",
  });

  // ─── Education State ───
  const [education, setEducation] = useState({
    institution: "SGT University",
    qualification: "Bachelor of Technology (B.Tech)",
    specialization: "Computer Science and Engineering (AI & ML)",
    semester: "2nd / 3rd Semester",
    startDate: "2025",
    endDate: "2029",
    notes: "Campus Address: Budhera, Gurugram-Badli Road, Gurugram, Haryana 122505. Current Residence: Mankrola, Gurugram.",
  });

  // ─── Certificates State ───
  const [certificates, setCertificates] = useState<any[]>([]);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [newCert, setNewCert] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    credentialId: "",
    verificationUrl: "",
    skillsCovered: "",
    notes: "",
    isVerified: true,
    isPublic: true,
  });
  const [showAddCert, setShowAddCert] = useState(false);

  // ─── Projects State ───
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    category: "",
    summary: "",
    problemStatement: "",
    myContribution: "",
    technologies: "",
    status: "in_development",
    githubUrl: "",
    demoUrl: "",
    isPublic: true,
  });
  const [showAddProject, setShowAddProject] = useState(false);

  // ─── Skills State ───
  const [skills, setSkills] = useState<any[]>([]);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "Programming",
    status: "practiced",
    notes: "",
    isPublic: true,
  });
  const [showAddSkill, setShowAddSkill] = useState(false);

  // ─── Resume State ───
  const [resumeUrl, setResumeUrl] = useState<string>("/uploads/resumes/resume.pdf");
  const [hasResume, setHasResume] = useState(false);

  // 1. Authenticate administrator session on mount
  useEffect(() => {
    async function verifyAdminAuth() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/manage/login?from=/manage");
          return;
        }

        const authData = await authRes.json();
        if (!authData.success || !authData.user) {
          router.push("/manage/login?from=/manage");
          return;
        }

        setAdminUser(authData.user);
        setCheckingAuth(false);

        // Fetch management data only after verified authentication
        fetchProfile();
        fetchEducation();
        fetchCertificates();
        fetchProjects();
        fetchSkills();
        checkResume();
      } catch {
        router.push("/manage/login?from=/manage");
      }
    }

    verifyAdminAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/manage/login");
    router.refresh();
  };

  const handleAuthExpired = () => {
    showNotification("error", "Session expired. Redirecting to login...");
    setTimeout(() => {
      router.push("/manage/login?from=/manage");
    }, 1200);
  };

  const showNotification = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setProfile((prev) => ({
          ...prev,
          fullName: data.data.fullName || prev.fullName,
          headline: data.data.headline || prev.headline,
          about: data.data.about || prev.about,
          location: data.data.location || prev.location,
          email: data.data.email || prev.email,
          githubUrl: data.data.githubUrl || prev.githubUrl,
          linkedinUrl: data.data.linkedinUrl || prev.linkedinUrl,
          techInterests: data.data.techInterests || prev.techInterests,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEducation = async () => {
    try {
      const res = await fetch("/api/education");
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const item = data.data[0];
        setEducation({
          institution: item.institution || "SGT University",
          qualification: item.qualification || "Bachelor of Technology (B.Tech)",
          specialization: item.specialization || "Computer Science and Engineering (AI & ML)",
          semester: item.semester || "2nd / 3rd Semester",
          startDate: item.startDate ? new Date(item.startDate).getFullYear().toString() : "2025",
          endDate: item.endDate ? new Date(item.endDate).getFullYear().toString() : "2029",
          notes: item.notes || "",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates");
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const sorted = data.data.sort(
          (a: any, b: any) => new Date(b.issueDate || 0).getTime() - new Date(a.issueDate || 0).getTime()
        );
        setCertificates(sorted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSkills(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkResume = async () => {
    try {
      const res = await fetch("/uploads/resumes/resume.pdf", { method: "HEAD" });
      setHasResume(res.ok);
    } catch {
      setHasResume(false);
    }
  };

  // ─── Profile Handlers ───
  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Profile updated successfully! Public view updated.");
      } else {
        showNotification("error", data.error || "Failed to update profile.");
      }
    } catch {
      showNotification("error", "Network error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Education Handlers ───
  const saveEducation = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution: education.institution,
          qualification: education.qualification,
          specialization: education.specialization,
          semester: education.semester,
          notes: education.notes,
          startDate: new Date(`${education.startDate}-08-01`).toISOString(),
          endDate: new Date(`${education.endDate}-06-01`).toISOString(),
          isPublic: true,
        }),
      });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Education details saved!");
      } else {
        showNotification("error", data.error || "Failed to save education.");
      }
    } catch {
      showNotification("error", "Error saving education.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Certificate Handlers ───
  const saveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingCertId ? "PATCH" : "POST";
      const url = editingCertId ? `/api/certificates/${editingCertId}` : "/api/certificates";

      const payload = {
        title: newCert.title,
        issuer: newCert.issuer,
        issueDate: newCert.issueDate ? new Date(newCert.issueDate).toISOString() : new Date().toISOString(),
        credentialId: newCert.credentialId || null,
        verificationUrl: newCert.verificationUrl || null,
        skillsCovered: newCert.skillsCovered || null,
        notes: newCert.notes || null,
        isVerified: newCert.isVerified,
        isPublic: newCert.isPublic,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showNotification(
          "success",
          editingCertId ? "Certificate updated successfully!" : "Certificate added successfully!"
        );
        resetCertForm();
        fetchCertificates();
      } else {
        showNotification("error", data.error || "Failed to save certificate.");
      }
    } catch {
      showNotification("error", "Error saving certificate.");
    } finally {
      setSaving(false);
    }
  };

  const resetCertForm = () => {
    setNewCert({
      title: "",
      issuer: "",
      issueDate: "",
      credentialId: "",
      verificationUrl: "",
      skillsCovered: "",
      notes: "",
      isVerified: true,
      isPublic: true,
    });
    setEditingCertId(null);
    setShowAddCert(false);
  };

  const startEditCert = (cert: any) => {
    setNewCert({
      title: cert.title,
      issuer: cert.issuer || "",
      issueDate: cert.issueDate ? cert.issueDate.split("T")[0] : "",
      credentialId: cert.credentialId || "",
      verificationUrl: cert.verificationUrl || "",
      skillsCovered: cert.skillsCovered || "",
      notes: cert.notes || "",
      isVerified: cert.isVerified ?? true,
      isPublic: cert.isPublic ?? true,
    });
    setEditingCertId(cert.id);
    setShowAddCert(true);
  };

  const toggleCertPublish = async (cert: any) => {
    try {
      const res = await fetch(`/api/certificates/${cert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !cert.isPublic }),
      });
      if (res.ok) {
        showNotification("success", cert.isPublic ? "Certificate unpublished." : "Certificate published!");
        fetchCertificates();
      }
    } catch {
      showNotification("error", "Failed to update publication status.");
    }
  };

  const deleteCertificate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      if (res.ok) {
        showNotification("success", "Certificate removed.");
        fetchCertificates();
      }
    } catch {
      showNotification("error", "Failed to delete certificate.");
    }
  };

  // ─── Project Handlers ───
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingProjectId ? "PATCH" : "POST";
      const url = editingProjectId ? `/api/projects/${editingProjectId}` : "/api/projects";

      // Validate repository URL per Requirement 4
      let cleanRepoUrl = newProject.githubUrl.trim();
      if (cleanRepoUrl === "https://github.com/rsherawat2007-create" || cleanRepoUrl === "https://github.com/rsherawat2007-create/") {
        cleanRepoUrl = "";
      }

      const payload = {
        name: newProject.name,
        category: newProject.category || null,
        summary: newProject.summary || null,
        problemStatement: newProject.problemStatement || null,
        myContribution: newProject.myContribution || null,
        technologies: newProject.technologies || null,
        status: newProject.status,
        githubUrl: cleanRepoUrl || null,
        demoUrl: newProject.demoUrl.trim() || null,
        isPublic: newProject.isPublic,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showNotification(
          "success",
          editingProjectId ? "Project updated successfully!" : "Project created successfully!"
        );
        resetProjectForm();
        fetchProjects();
      } else {
        showNotification("error", data.error || "Failed to save project.");
      }
    } catch {
      showNotification("error", "Error saving project.");
    } finally {
      setSaving(false);
    }
  };

  const resetProjectForm = () => {
    setNewProject({
      name: "",
      category: "",
      summary: "",
      problemStatement: "",
      myContribution: "",
      technologies: "",
      status: "in_development",
      githubUrl: "",
      demoUrl: "",
      isPublic: true,
    });
    setEditingProjectId(null);
    setShowAddProject(false);
  };

  const startEditProject = (proj: any) => {
    setNewProject({
      name: proj.name,
      category: proj.category || "",
      summary: proj.summary || "",
      problemStatement: proj.problemStatement || "",
      myContribution: proj.myContribution || "",
      technologies: proj.technologies || "",
      status: proj.status || "in_development",
      githubUrl: proj.githubUrl || "",
      demoUrl: proj.demoUrl || "",
      isPublic: proj.isPublic ?? true,
    });
    setEditingProjectId(proj.id);
    setShowAddProject(true);
  };

  const toggleProjectPublish = async (proj: any) => {
    try {
      const res = await fetch(`/api/projects/${proj.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !proj.isPublic }),
      });
      if (res.ok) {
        showNotification("success", proj.isPublic ? "Project unpublished from public view." : "Project published live!");
        fetchProjects();
      }
    } catch {
      showNotification("error", "Failed to update publication status.");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      if (res.ok) {
        showNotification("success", "Project removed.");
        fetchProjects();
      }
    } catch {
      showNotification("error", "Failed to delete project.");
    }
  };

  // ─── Skills Handlers ───
  const saveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingSkillId ? "PATCH" : "POST";
      const url = editingSkillId ? `/api/skills/${editingSkillId}` : "/api/skills";

      const payload = {
        name: newSkill.name,
        category: newSkill.category,
        status: newSkill.status,
        notes: newSkill.notes || null,
        isPublic: newSkill.isPublic,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showNotification("success", editingSkillId ? "Skill updated!" : "Skill created!");
        resetSkillForm();
        fetchSkills();
      } else {
        showNotification("error", data.error || "Failed to save skill.");
      }
    } catch {
      showNotification("error", "Error saving skill.");
    } finally {
      setSaving(false);
    }
  };

  const resetSkillForm = () => {
    setNewSkill({
      name: "",
      category: "Programming",
      status: "practiced",
      notes: "",
      isPublic: true,
    });
    setEditingSkillId(null);
    setShowAddSkill(false);
  };

  const startEditSkill = (skill: any) => {
    setNewSkill({
      name: skill.name,
      category: skill.category || "Programming",
      status: skill.status || "practiced",
      notes: skill.notes || "",
      isPublic: skill.isPublic ?? true,
    });
    setEditingSkillId(skill.id);
    setShowAddSkill(true);
  };

  const toggleSkillPublish = async (skill: any) => {
    try {
      const res = await fetch(`/api/skills/${skill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !skill.isPublic }),
      });
      if (res.ok) {
        showNotification("success", skill.isPublic ? "Skill hidden." : "Skill published!");
        fetchSkills();
      }
    } catch {
      showNotification("error", "Failed to update skill.");
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      if (res.ok) {
        showNotification("success", "Skill deleted.");
        fetchSkills();
      }
    } catch {
      showNotification("error", "Failed to delete skill.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-sm font-mono text-slate-400">Verifying administrator session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-[#1b2336] bg-[#090d18]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-[#111726] hover:bg-[#182136] text-slate-400 hover:text-white transition-colors"
            title="Return to Public Portfolio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>PORTFOLIO MANAGER</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  AUTHENTICATED
                </span>
              </h1>
              <span className="text-[11px] text-slate-400 font-mono">
                Logged in as: {adminUser?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#111726] hover:bg-[#182136] text-slate-300 hover:text-white border border-[#222d44] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/30 border-red-900/40 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`fixed top-16 right-4 z-50 p-4 rounded-xl text-xs font-mono border shadow-2xl flex items-center gap-2.5 transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-950/90 border-emerald-700 text-emerald-200"
              : "bg-red-950/90 border-red-700 text-red-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar Tabs */}
        <aside className="w-full md:w-60 shrink-0 space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500 px-3 py-2">
            Manage Content
          </div>
          {[
            { id: "profile", label: "Personal Profile", icon: User },
            { id: "education", label: "Education & Campus", icon: GraduationCap },
            { id: "certificates", label: "Certificates & Uploads", icon: Award },
            { id: "projects", label: "Projects & Repos", icon: FolderKanban },
            { id: "skills", label: "Technical Skills", icon: Cpu },
            { id: "resume", label: "Resume PDF", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#121827]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Pane */}
        <main className="flex-1 min-w-0 bg-[#0c101a] border border-[#1b2336] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Personal Profile</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Updates here reflect dynamically on the homepage hero, about, and metadata sections.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Headline</label>
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Biography / About</label>
                  <textarea
                    rows={6}
                    value={profile.about}
                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={profile.githubUrl}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Technical Interests (Comma Separated)</label>
                  <input
                    type="text"
                    value={profile.techInterests}
                    onChange={(e) => setProfile({ ...profile, techInterests: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#1b2336]">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === "education" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Education &amp; Academic Timeline</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your academic enrollment details and campus information.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Institution</label>
                  <input
                    type="text"
                    value={education.institution}
                    onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Degree / Qualification</label>
                  <input
                    type="text"
                    value={education.qualification}
                    onChange={(e) => setEducation({ ...education, qualification: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Specialization</label>
                  <input
                    type="text"
                    value={education.specialization}
                    onChange={(e) => setEducation({ ...education, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Current Semester</label>
                  <input
                    type="text"
                    value={education.semester}
                    onChange={(e) => setEducation({ ...education, semester: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Expected Graduation Year</label>
                  <input
                    type="text"
                    value={education.endDate}
                    onChange={(e) => setEducation({ ...education, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Campus Notes &amp; Highlights</label>
                  <textarea
                    rows={3}
                    value={education.notes}
                    onChange={(e) => setEducation({ ...education, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080b12] border border-[#222d44] text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#1b2336]">
                <Button
                  onClick={saveEducation}
                  disabled={saving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Education Details</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Certificates &amp; Credentials</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage official certifications, verification links, and publication visibility.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (showAddCert) resetCertForm();
                    else setShowAddCert(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddCert ? "Cancel" : "Add Certificate"}</span>
                </Button>
              </div>

              {/* Add/Edit Certificate Form */}
              {showAddCert && (
                <form
                  onSubmit={saveCertificate}
                  className="p-5 rounded-2xl bg-[#080b12] border border-purple-500/30 space-y-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {editingCertId ? "Edit Certificate Record" : "New Certificate Record"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Issuing Organization *</label>
                      <input
                        type="text"
                        required
                        value={newCert.issuer}
                        onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={newCert.issueDate}
                        onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Credential ID</label>
                      <input
                        type="text"
                        value={newCert.credentialId}
                        onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Verification URL</label>
                      <input
                        type="url"
                        value={newCert.verificationUrl}
                        onChange={(e) => setNewCert({ ...newCert, verificationUrl: e.target.value })}
                        placeholder="https://verify.certiport.com or https://skilltrack.top/verify.php"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Skills Covered (comma separated)</label>
                      <input
                        type="text"
                        value={newCert.skillsCovered}
                        onChange={(e) => setNewCert({ ...newCert, skillsCovered: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Description / Notes</label>
                      <textarea
                        rows={2}
                        value={newCert.notes}
                        onChange={(e) => setNewCert({ ...newCert, notes: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="certIsPublic"
                        checked={newCert.isPublic}
                        onChange={(e) => setNewCert({ ...newCert, isPublic: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600 bg-[#0c101a] border-[#222d44]"
                      />
                      <label htmlFor="certIsPublic" className="text-xs font-mono text-slate-300 cursor-pointer">
                        Published (visible to public visitors)
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={resetCertForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-500 text-white">
                      {editingCertId ? "Update Certificate" : "Save Certificate"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Certificates List */}
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl bg-[#080b12] border border-[#1d273a] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-purple-400 font-bold">{cert.issuer}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ""}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            cert.isPublic
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : "bg-amber-950 text-amber-400 border-amber-800"
                          }`}
                        >
                          {cert.isPublic ? "LIVE" : "DRAFT"}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{cert.title}</h4>
                      {cert.notes && <p className="text-xs text-slate-400 max-w-xl">{cert.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => toggleCertPublish(cert)}
                        className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-slate-300 hover:text-white transition-colors"
                        title={cert.isPublic ? "Unpublish from public view" : "Publish to live portfolio"}
                      >
                        {cert.isPublic ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <button
                        onClick={() => startEditCert(cert)}
                        className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-slate-300 hover:text-white transition-colors"
                        title="Edit Certificate"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCertificate(cert.id)}
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-950 text-red-400 transition-colors"
                        title="Delete Certificate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REAL PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Featured Projects &amp; Repositories</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage codebases. Each project must have its own repository URL or be marked private.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (showAddProject) resetProjectForm();
                    else setShowAddProject(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddProject ? "Cancel" : "Add Project"}</span>
                </Button>
              </div>

              {/* Add/Edit Project Form */}
              {showAddProject && (
                <form
                  onSubmit={saveProject}
                  className="p-5 rounded-2xl bg-[#080b12] border border-cyan-500/30 space-y-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {editingProjectId ? "Edit Project Record" : "New Project Record"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Project Name *</label>
                      <input
                        type="text"
                        required
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Category / Tagline</label>
                      <input
                        type="text"
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                        placeholder="e.g. Systems & Socket Programming"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Status</label>
                      <select
                        value={newProject.status}
                        onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      >
                        <option value="in_development">In Progress / Active Development</option>
                        <option value="completed">Completed</option>
                        <option value="planned">Planned / Prototype</option>
                        <option value="testing">Testing & Verification</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">
                        Specific Repository URL (Do NOT use profile URL)
                      </label>
                      <input
                        type="url"
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                        placeholder="https://github.com/rsherawat2007-create/nexclass"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Live Demo URL (Optional)</label>
                      <input
                        type="url"
                        value={newProject.demoUrl}
                        onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                        placeholder="https://demo.example.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Technologies (Comma Separated)</label>
                      <input
                        type="text"
                        value={newProject.technologies}
                        onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                        placeholder="Next.js, Python, TCP Sockets, Tailwind CSS"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Problem Statement</label>
                      <textarea
                        rows={2}
                        value={newProject.problemStatement}
                        onChange={(e) => setNewProject({ ...newProject, problemStatement: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Solution &amp; Contribution</label>
                      <textarea
                        rows={3}
                        value={newProject.myContribution}
                        onChange={(e) => setNewProject({ ...newProject, myContribution: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="projectIsPublic"
                        checked={newProject.isPublic}
                        onChange={(e) => setNewProject({ ...newProject, isPublic: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-600 bg-[#0c101a] border-[#222d44]"
                      />
                      <label htmlFor="projectIsPublic" className="text-xs font-mono text-slate-300 cursor-pointer">
                        Published (visible to public visitors)
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={resetProjectForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                      {editingProjectId ? "Update Project" : "Save Project"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Projects List */}
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-xl bg-[#080b12] border border-[#1d273a] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                          {proj.status}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            proj.isPublic
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : "bg-amber-950 text-amber-400 border-amber-800"
                          }`}
                        >
                          {proj.isPublic ? "LIVE" : "DRAFT"}
                        </span>
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                          >
                            <span>Repo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white">{proj.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {proj.problemStatement || proj.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => toggleProjectPublish(proj)}
                        className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-slate-300 hover:text-white transition-colors"
                        title={proj.isPublic ? "Unpublish from public view" : "Publish to live portfolio"}
                      >
                        {proj.isPublic ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <button
                        onClick={() => startEditProject(proj)}
                        className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-slate-300 hover:text-white transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-950 text-red-400 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Technical Skills Management</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage practical competencies across Programming, Cybersecurity, AI/ML, and Tools.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (showAddSkill) resetSkillForm();
                    else setShowAddSkill(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddSkill ? "Cancel" : "Add Skill"}</span>
                </Button>
              </div>

              {/* Add/Edit Skill Form */}
              {showAddSkill && (
                <form
                  onSubmit={saveSkill}
                  className="p-5 rounded-2xl bg-[#080b12] border border-emerald-500/30 space-y-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {editingSkillId ? "Edit Skill Record" : "New Skill Record"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Skill Name *</label>
                      <input
                        type="text"
                        required
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        placeholder="e.g. Wireshark"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Category *</label>
                      <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      >
                        <option value="Programming">Programming</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="AI / ML">AI / ML</option>
                        <option value="Development Tools">Development Tools</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Status</label>
                      <select
                        value={newSkill.status}
                        onChange={(e) => setNewSkill({ ...newSkill, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      >
                        <option value="demonstrated">Demonstrated / Project Experience</option>
                        <option value="practiced">Practicing</option>
                        <option value="learning">Learning</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Notes / Practical Context</label>
                      <input
                        type="text"
                        value={newSkill.notes}
                        onChange={(e) => setNewSkill({ ...newSkill, notes: e.target.value })}
                        placeholder="e.g. Packet inspection, protocol analysis"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="skillIsPublic"
                        checked={newSkill.isPublic}
                        onChange={(e) => setNewSkill({ ...newSkill, isPublic: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 bg-[#0c101a] border-[#222d44]"
                      />
                      <label htmlFor="skillIsPublic" className="text-xs font-mono text-slate-300 cursor-pointer">
                        Published (visible to public visitors)
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={resetSkillForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                      {editingSkillId ? "Update Skill" : "Save Skill"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Skills List */}
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-xl bg-[#080b12] border border-[#1d273a] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{skill.name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101728] text-cyan-400 border border-[#1d2c46]">
                          {skill.category}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            skill.isPublic
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : "bg-amber-950 text-amber-400 border-amber-800"
                          }`}
                        >
                          {skill.isPublic ? "LIVE" : "DRAFT"}
                        </span>
                      </div>
                      {skill.notes && <p className="text-xs text-slate-400 mt-1">{skill.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSkillPublish(skill)}
                        className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-slate-300 hover:text-white transition-colors"
                        title={skill.isPublic ? "Hide from public view" : "Publish to live portfolio"}
                      >
                        {skill.isPublic ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                      </button>
                      <button
                        onClick={() => startEditSkill(skill)}
                        className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-slate-300 hover:text-white transition-colors"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-950 text-red-400 transition-colors"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RESUME PDF */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Curriculum Vitae / Resume</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your latest engineering resume. Visitors can download or preview it directly.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#080b12] border border-[#1d273a] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Current Active Resume</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Location: /uploads/resumes/resume.pdf
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="/uploads/resumes/resume.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-medium bg-[#141c2e] hover:bg-[#1d2842] text-white border border-[#22304c] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Preview Current Document</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
