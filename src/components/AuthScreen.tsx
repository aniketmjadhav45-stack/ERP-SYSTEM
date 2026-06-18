import React, { useState } from "react";
import { Role, Tenant, UserProfile } from "../types";
import { defaultTenants, defaultUsers } from "../data";
import { Building2, ShieldAlert, Key, UserCheck, Sparkles } from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, tenant: Tenant) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [selectedTenant, setSelectedTenant] = useState<Tenant>(defaultTenants[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePresetLogin = (user: UserProfile) => {
    // Find matching tenant
    const tenant = defaultTenants.find(t => t.id === user.tenantId) || defaultTenants[0];
    onLoginSuccess(user, tenant);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please supply a valid workspace email address.");
      return;
    }
    // Match email in default users
    const matchedUser = defaultUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      onLoginSuccess(matchedUser, selectedTenant);
    } else {
      // Create temporary employee profile if not matched
      const tempUser: UserProfile = {
        id: "user_temp_" + Date.now(),
        email: email,
        name: email.split("@")[0].toUpperCase(),
        role: Role.EMPLOYEE,
        tenantId: selectedTenant.id,
        department: "General Operations",
        phone: "+1 (555) 011-9999"
      };
      onLoginSuccess(tempUser, selectedTenant);
    }
  };

  const handleGoogleLoginSimulate = () => {
    setIsGoogleLogin(true);
    setTimeout(() => {
      // Login with standard executive Sarah Jenkins
      const defaultExecutive = defaultUsers[0]; // Sarah Jenkins (Super Admin)
      onLoginSuccess(defaultExecutive, selectedTenant);
      setIsGoogleLogin(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white" id="auth-container">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        
        {/* Left Brand Area */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 to-slate-950 p-8 flex flex-col justify-between border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-xl font-sans tracking-tight text-white bg-clip-text">
                CLOUD<span className="text-indigo-400">ERP</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-100 leading-snug tracking-tight mb-4">
              Modern SaaS Resource Orchestration Engine.
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consolidate sales CRM pipelines, dynamic HR payroll systems, agile milestones checks, inventory supplier alerts, invoices, and server-side Gemini intelligence in a single interface.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-300 font-mono tracking-wider uppercase">Active Ingress Terminal</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Host: Cloud Run Context Gateway
            </p>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Access Your Workspace</h2>
            <p className="text-xs text-slate-400">Select business tenant domain and authenticate credentials.</p>
          </div>

          {/* Tenant Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">Tenant Node</label>
            <div className="grid grid-cols-2 gap-3">
              {defaultTenants.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedTenant(t)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedTenant.id === t.id
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">{t.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{t.domain}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Authentication Options tab/form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Workspace Email</label>
              <input
                type="email"
                placeholder="e.g., manager@acme.erp.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-200 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-200 transition-all"
              />
            </div>

            {errorMessage && (
              <div className="bg-red-950/50 border border-red-900 p-2 text-[11px] text-red-300 rounded flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Email Login</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLoginSimulate}
                disabled={isGoogleLogin}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <span className="text-[10px] uppercase font-mono">G</span>
                <span>{isGoogleLogin ? "Connecting..." : "Google Log In"}</span>
              </button>
            </div>
          </form>

          {/* Quick Role Presets Selector - Extremely useful for preview testing */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 mb-2">
              <Sparkles className="w-3 text-indigo-400" />
              <span>Developer Quick Logins (Select Role Perspective)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {defaultUsers.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => handlePresetLogin(u)}
                  className="bg-slate-900/80 hover:bg-indigo-950/40 text-[10px] text-slate-300 border border-slate-800 hover:border-indigo-500 px-2 py-1 rounded transition-all flex items-center gap-1 cursor-pointer font-mono"
                >
                  <UserCheck className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
                  <span>{u.role} ({u.name.split(" ")[0]})</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
