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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white" id="auth-container">
      
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        
        {/* Left Brand Area */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 to-blue-800 p-8 flex flex-col justify-between border-r border-slate-200 text-white">
          <div>
            <div className="flex items-center gap-2 mb-8 animate-fadeIn">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Building2 className="w-6 h-6 text-blue-700" />
              </div>
              <span className="font-extrabold text-xl font-sans tracking-tight text-white">
                INDIAN<span className="text-blue-200">ERP</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white leading-snug tracking-tight mb-4">
              Modern SaaS Resource Orchestration Engine.
            </h1>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              Consolidate sales CRM pipelines, dynamic HR payroll systems, agile milestones checks, inventory supplier alerts, invoices, and server-side Gemini intelligence in a single interface.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-blue-600/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-blue-50 font-mono tracking-wider uppercase">Active Ingress Terminal</span>
            </div>
            <p className="text-[10px] text-blue-200 font-mono">
              Host: Cloud Run Context Gateway
            </p>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded inline-block mb-3">ZO-TALLY STYLE CONSOLE</span>
            <h2 className="text-lg font-bold text-slate-900 leading-none">Access Your Workspace</h2>
            <p className="text-xs text-slate-500 mt-1.5">Select business tenant domain and authenticate credentials.</p>
          </div>

          {/* Tenant Selector */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Active Tenant Name</label>
            <div className="grid grid-cols-2 gap-3">
              {defaultTenants.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedTenant(t)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedTenant.id === t.id
                      ? "border-blue-600 bg-blue-50/50 text-slate-905"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-350"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{t.domain}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Authentication Options tab/form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-705 mb-1.5">Workspace Email</label>
              <input
                type="email"
                placeholder="e.g., manager@acme.erp.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-800 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-705 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-800 transition-all font-sans"
              />
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 p-2 text-[11px] text-rose-800 rounded-lg flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Email Login</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLoginSimulate}
                disabled={isGoogleLogin}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <span className="text-[10px] uppercase font-mono">G</span>
                <span>{isGoogleLogin ? "Connecting..." : "Google Log In"}</span>
              </button>
            </div>
          </form>

          {/* Quick Role Presets Selector - Extremely useful for preview testing */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-25">
              <Sparkles className="w-3 text-blue-600" />
              <span>Developer Quick Logins (Select Role Perspective)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {defaultUsers.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => handlePresetLogin(u)}
                  className="bg-slate-50 hover:bg-blue-50 text-[10px] text-slate-700 border border-slate-200 hover:border-blue-500 px-2 py-1 rounded transition-all flex items-center gap-1 cursor-pointer font-mono font-medium"
                >
                  <UserCheck className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
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
