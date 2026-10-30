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
  ArrowLeft,
  Save,
  RotateCcw,
  AlertCircle,
  LogOut,
  Loader2,
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
    about:
      "I am a BTech Computer Science and Engineering student specializing in Artificial Intelligence and Machine Learning, with a strong interest in Cybersecurity and Web Application Security Testing.\n\nI am building my technical foundation through programming, computer networking, Linux, machine learning, and hands-on practice with security tools such as Burp Suite and OWASP ZAP. I enjoy exploring how technology works, solving technical problems, and developing projects that combine practical engineering with innovative ideas.\n\nMy goal is to grow into a skilled professional at the intersection of AI/ML and cybersecurity by continuously learning, building real-world projects, and improving my problem-solving abilities. I believe in learning by doing, documenting my progress, and keeping my work authentic and verifiable.",
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
  const [newCert, setNewCert] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    credentialId: "",
    verificationUrl: "",
    skillsCovered: "",
    notes: "",
    isVerified: true,
    fileUrl: "",
  });
  const [showAddCert, setShowAddCert] = useState(false);

  // ─── Projects State ───
  const [projects, setProjects] = useState<any[]>([]);
  const [newProject, setNewProject] = useState({
    name: "",
    summary: "",
    problemStatement: "",
    myContribution: "",
    technologies: "",
    status: "in_development",
    githubUrl: "https://github.com/rsherawat2007-create",
    demoUrl: "",
    isPublic: true,
  });
  const [showAddProject, setShowAddProject] = useState(false);

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
        // Sort chronologically by issue date
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

  const checkResume = async () => {
    try {
      const res = await fetch("/uploads/resumes/resume.pdf", { method: "HEAD" });
      setHasResume(res.ok);
    } catch {
      setHasResume(false);
    }
  };

  // ─── Save Handlers ───
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

  const handleFileUpload = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (res.status === 401) {
      handleAuthExpired();
      throw new Error("Session expired. Please log in again.");
    }
    const data = await res.json();
    if (data.success) {
      return data.data.url;
    }
    throw new Error(data.error || "Upload failed");
  };

  const addCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCert.title,
          issuer: newCert.issuer,
          issueDate: newCert.issueDate ? new Date(newCert.issueDate).toISOString() : new Date().toISOString(),
          credentialId: newCert.credentialId || null,
          verificationUrl: newCert.verificationUrl || null,
          skillsCovered: newCert.skillsCovered || null,
          notes: newCert.notes || null,
          isVerified: newCert.isVerified,
          isPublic: true,
        }),
      });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Certificate added successfully!");
        setNewCert({
          title: "",
          issuer: "",
          issueDate: "",
          credentialId: "",
          verificationUrl: "",
          skillsCovered: "",
          notes: "",
          isVerified: true,
          fileUrl: "",
        });
        setShowAddCert(false);
        fetchCertificates();
      } else {
        showNotification("error", data.error || "Failed to add certificate.");
      }
    } catch {
      showNotification("error", "Error adding certificate.");
    } finally {
      setSaving(false);
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

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProject.name,
          summary: newProject.summary,
          problemStatement: newProject.problemStatement,
          myContribution: newProject.myContribution,
          technologies: newProject.technologies,
          status: newProject.status,
          githubUrl: newProject.githubUrl,
          demoUrl: newProject.demoUrl,
          isPublic: newProject.isPublic,
        }),
      });
      if (res.status === 401) {
        handleAuthExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showNotification("success", "Project saved successfully!");
        setShowAddProject(false);
        fetchProjects();
      } else {
        showNotification("error", data.error || "Failed to add project.");
      }
    } catch {
      showNotification("error", "Error adding project.");
    } finally {
      setSaving(false);
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await handleFileUpload(file, "resumes");
      setResumeUrl(url);
      setHasResume(true);
      showNotification("success", "Resume PDF uploaded successfully!");
    } catch (err: any) {
      showNotification("error", err.message || "Resume upload failed.");
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Verifying Administrator Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#1c2436] bg-[#0c101a]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Portfolio</span>
          </Link>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-cyan-500/20">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Portfolio Content Manager
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {adminUser && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#141b2c] border border-[#222d44] text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{adminUser.email}</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2c] border border-[#222d44] text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1a2338] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preview Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-xs font-medium text-red-300 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 text-sm font-medium ${
              statusMsg.type === "success"
                ? "bg-emerald-950/90 border-emerald-700 text-emerald-300"
                : "bg-red-950/90 border-red-700 text-red-300"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
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
            { id: "projects", label: "Real Projects", icon: FolderKanban },
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
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm"
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
                <h2 className="text-xl font-bold text-white">Personal Profile Details</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Updates saved here reflect directly on your public portfolio hero and contact sections.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Professional Headline</label>
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">
                    Short Biography &amp; Technical Mission
                  </label>
                  <textarea
                    rows={6}
                    value={profile.about}
                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Location / City</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Professional Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={profile.githubUrl}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Technical Interests</label>
                  <input
                    type="text"
                    value={profile.techInterests}
                    onChange={(e) => setProfile({ ...profile, techInterests: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1b2336] flex justify-end">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Profile Details"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === "education" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Education &amp; Academic Background</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure your university, degree, semester, and address for recruiter clarity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">University / College</label>
                  <input
                    type="text"
                    value={education.institution}
                    onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Degree Title</label>
                  <input
                    type="text"
                    value={education.qualification}
                    onChange={(e) => setEducation({ ...education, qualification: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Specialization</label>
                  <input
                    type="text"
                    value={education.specialization}
                    onChange={(e) => setEducation({ ...education, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Current Semester / Year</label>
                  <input
                    type="text"
                    value={education.semester}
                    onChange={(e) => setEducation({ ...education, semester: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Start Year</label>
                  <input
                    type="text"
                    value={education.startDate}
                    onChange={(e) => setEducation({ ...education, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Expected Graduation Year</label>
                  <input
                    type="text"
                    value={education.endDate}
                    onChange={(e) => setEducation({ ...education, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">
                    Campus Address &amp; Academic Notes
                  </label>
                  <textarea
                    rows={3}
                    value={education.notes}
                    onChange={(e) => setEducation({ ...education, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#222d44] text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1b2336] flex justify-end">
                <Button
                  onClick={saveEducation}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Education"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Certificates &amp; Achievements</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Uploaded certificates are sorted chronologically by issue date and displayed with verified badges.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddCert(!showAddCert)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddCert ? "Cancel" : "Add Certificate"}</span>
                </Button>
              </div>

              {/* Form to add a certificate */}
              {showAddCert && (
                <form
                  onSubmit={addCertificate}
                  className="p-5 rounded-2xl bg-[#080b12] border border-blue-500/30 space-y-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    New Certificate Entry
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Certificate Title</label>
                      <input
                        type="text"
                        required
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                        placeholder="e.g. Ethical Hacking"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Issuing Organization</label>
                      <input
                        type="text"
                        required
                        value={newCert.issuer}
                        onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                        placeholder="e.g. Microsoft or ASD Academy"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Issue Date</label>
                      <input
                        type="date"
                        required
                        value={newCert.issueDate}
                        onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Credential ID (if any)</label>
                      <input
                        type="text"
                        value={newCert.credentialId}
                        onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                        placeholder="e.g. CERT-2026-001596 or w6JFG-48DB"
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
                      <label className="text-xs font-mono text-slate-300 block mb-1">Description &amp; Score</label>
                      <textarea
                        rows={2}
                        value={newCert.notes}
                        onChange={(e) => setNewCert({ ...newCert, notes: e.target.value })}
                        placeholder="Performance score or key topics verified"
                        className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-[#222d44] text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddCert(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
                      Save Certificate
                    </Button>
                  </div>
                </form>
              )}

              {/* List of current certificates */}
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl bg-[#080b12] border border-[#1d273a] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold">{cert.issuer}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ""}
                        </span>
                        {cert.credentialId && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                            ID: {cert.credentialId}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white">{cert.title}</h4>
                      {cert.notes && <p className="text-xs text-slate-400 max-w-xl">{cert.notes}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-slate-300 hover:text-white transition-colors"
                          title="Open Verification Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteCertificate(cert.id)}
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-950 text-red-400 transition-colors"
                        title="Delete"
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
                  <h2 className="text-xl font-bold text-white">Featured Projects</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your genuine codebases: NEXCLASS, Tic Tac Toe LAN, Contact Management, and Security Management.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddProject ? "Cancel" : "Add Project"}</span>
                </Button>
              </div>

              {/* Add Project Form */}
              {showAddProject && (
                <form
                  onSubmit={addProject}
                  className="p-5 rounded-2xl bg-[#080b12] border border-blue-500/30 space-y-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    New Project Record
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono text-slate-300 block mb-1">Project Name</label>
                      <input
                        type="text"
                        required
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
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
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">GitHub Repository URL</label>
                      <input
                        type="url"
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
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
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddProject(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
                      Save Project
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
                        onClick={() => deleteProject(proj.id)}
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-950 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RESUME PDF */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Resume Management</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your real resume PDF. The public &ldquo;Download Resume&rdquo; button on the homepage will immediately link to this file.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-[#080b12] border-2 border-dashed border-[#222d44] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    {hasResume ? "Active Resume File Loaded" : "No Resume Uploaded Yet"}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Upload your latest resume in PDF format (up to 10MB).
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <label
                    htmlFor="resume-upload-input"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Resume PDF</span>
                  </label>
                  <input
                    id="resume-upload-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />

                  {hasResume && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141b2c] hover:bg-[#1a2338] text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>Preview / Download</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
