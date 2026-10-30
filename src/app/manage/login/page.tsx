"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/manage";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Invalid email or password.");
        setLoading(false);
        return;
      }

      // Successful login -> Navigate to manage dashboard
      router.push(from);
      router.refresh();
    } catch {
      setErrorMessage("Network or server connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-3xl bg-[#090e1c]/90 border border-[#1b253e] p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
      {/* Cyber Corner Accents */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

      {/* Header */}
      <div className="text-center space-y-2 pb-6 border-b border-[#162038]">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
            ADMIN CONSOLE // RESTRICTED ACCESS
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Portfolio Manager
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Sign in with your administrator credentials to manage records, certificates, and portfolio content.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs font-mono flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 block">
            Administrator Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060a14] border border-[#1d2a45] focus:border-cyan-500 focus:outline-none text-white text-sm font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#060a14] border border-[#1d2a45] focus:border-cyan-500 focus:outline-none text-white text-sm font-mono placeholder:text-slate-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Authenticate &amp; Access Dashboard</span>
            </>
          )}
        </Button>
      </form>

      {/* Footer note */}
      <div className="mt-6 pt-4 border-t border-[#141b2c] text-center">
        <span className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>TLS ENCRYPTED &bull; BCRYPT VERIFICATION &bull; JWT SESSION</span>
        </span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md z-10 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO PUBLIC PORTFOLIO</span>
          </Link>
        </div>

        {/* Wrapped with Suspense boundary */}
        <Suspense
          fallback={
            <div className="rounded-3xl bg-[#090e1c]/90 border border-[#1b253e] p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono">Loading authentication console...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
