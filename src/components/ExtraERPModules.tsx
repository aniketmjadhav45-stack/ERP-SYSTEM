import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Search, Download, Plus, Edit, Trash2, CheckCircle2, 
  MapPin, Phone, Mail, FileText, Settings, ShieldAlert, Sliders, Bell, 
  Clock, Check, X, Calendar, Sparkles, RefreshCw, Layers, Cpu, Send, Info
} from "lucide-react";
import { UserProfile, Role } from "../types";
import { getHeaders } from "../utils/apiHelpers";

// Dynamic types for additional records
export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  employeesCount: number;
  openTasks: number;
  monthlyBudget: number;
  approved: boolean;
  createdBy: string;
  createdAt: string;
  department: string;
  branch: string;
}

export interface Branch {
  id: string;
  name: string;
  state: string;
  gstin: string;
  manager: string;
  employeesCount: number;
  monthlyRent: number;
  status: "Active" | "Maintenance";
  createdBy: string;
  createdAt: string;
  branch: string;
  department: string;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  teamLead: string;
  membersCount: number;
  activeProject: string;
  priority: "High" | "Medium" | "Low";
  status: "Active" | "On Hold";
  createdBy: string;
  createdAt: string;
  branch: string;
}

interface ExtraModulesProps {
  users: UserProfile[];
  currentUser: UserProfile;
  activeSubTab?: string;
}

// -------------------------------------------------------------
// DEPARTMENTS MODULE
// -------------------------------------------------------------
export function DepartmentsModule({ users, currentUser }: ExtraModulesProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [head, setHead] = useState("");
  const [budget, setBudget] = useState(500000);
  const [selectedBranch, setSelectedBranch] = useState("Mumbai HQ");

  useEffect(() => {
    fetchDepartments();
  }, [currentUser]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments", {
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Unauthorized or server error fetching departments");
      const data = await res.json();
      setDepartments(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Code,Head,Employees,Budget,Approved,CreatedBy,CreatedAt\n";
    departments.forEach(d => {
      csvContent += `${d.id},"${d.name}",${d.code},"${d.head}",${d.employeesCount || 0},${d.monthlyBudget || d.budget},true,"${d.createdBy || 'System'}","${d.createdAt}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "erp_departments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: getHeaders(currentUser),
        body: JSON.stringify({
          name,
          code: code.toUpperCase(),
          head: head || "Not Assigned",
          employeesCount: 0,
          openTasks: 0,
          monthlyBudget: budget,
          approved: true,
          department: name,
          branch: selectedBranch
        })
      });

      if (!res.ok) throw new Error("Failed to register corporate department");
      const newDep = await res.json();
      setDepartments([newDep, ...departments]);
      setIsFormOpen(false);
      setStep(1);
      setName("");
      setCode("");
      setHead("");
      setBudget(500000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Could not drop department from active directory");
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = departments.filter(d => 
    (d.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (d.code?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (d.head?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="departments-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Corporate Departments</h2>
          <p className="text-xs text-slate-500">Track company structural divisions, monthly budgets and assigned heads.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex gap-3 max-w-md bg-white">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search departments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* RENDER TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Dept Code</th>
                <th className="p-4">Department Name</th>
                <th className="p-4">HOD / Division Leader</th>
                <th className="p-4 text-right">Employees</th>
                <th className="p-4 text-right font-sans">Monthly Budget</th>
                <th className="p-4">Approval Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-700">{d.code}</td>
                  <td className="p-4 font-bold text-slate-900">{d.name}</td>
                  <td className="p-4">{d.head}</td>
                  <td className="p-4 text-right text-slate-500 font-mono font-bold">{d.employeesCount} Staff</td>
                  <td className="p-4 text-right font-mono text-emerald-700">₹ {d.monthlyBudget.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">Approved</span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(d.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-rose-50"
                      title="Remove Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-STEP PROFESSIONAL DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl p-6 space-y-4 animate-slideUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Add Corporate Department</h3>
                <p className="text-[10px] text-slate-400">Professional multi-step configuration manager.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Step {step} of 2</span>
                <span>{step === 1 ? "Basic Details" : "Operational Capital"}</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full">
                <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: step === 1 ? "50%" : "100%" }} />
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Department Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Legal Compliance"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Dept Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. LGL"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Branch HQ</label>
                    <select 
                      value={selectedBranch}
                      onChange={e => setSelectedBranch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                    >
                      <option value="Mumbai HQ">Mumbai HQ</option>
                      <option value="Bengaluru Tech Park">Bengaluru Tech Park</option>
                      <option value="Kolkata Hub">Kolkata Hub</option>
                      <option value="New Delhi Center">New Delhi Center</option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { if(name && code) setStep(2); }} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg"
                  >
                    Continue to budget setup
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Head of Department (HOD)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sanjay Singhal"
                      value={head}
                      onChange={e => setHead(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Monthly Budget (INR)</label>
                    <input 
                      type="number" 
                      placeholder="500000"
                      value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-2 text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg"
                    >
                      Finalize Registry
                    </button>
                  </div>
                </div>
              )}
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// BRANCHES MODULE
// -------------------------------------------------------------
export function BranchesModule({ currentUser }: ExtraModulesProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [gstin, setGstin] = useState("");
  const [manager, setManager] = useState("");
  const [rent, setRent] = useState(150000);

  useEffect(() => {
    fetchBranches();
  }, [currentUser]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/branches", {
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Could not access branches register");
      const data = await res.json();
      setBranches(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gstin) return;

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: getHeaders(currentUser),
        body: JSON.stringify({
          name,
          state,
          gstin: gstin.toUpperCase(),
          manager: manager || "Unassigned",
          employeesCount: 0,
          monthlyRent: rent,
          status: "Active",
          branch: name,
          department: "General Administration"
        })
      });

      if (!res.ok) throw new Error("Could not create branch on server");
      const newBranch = await res.json();
      setBranches([newBranch, ...branches]);
      setIsFormOpen(false);
      setName("");
      setGstin("");
      setManager("");
      setRent(150000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirm deletion of this office branch?")) return;
    try {
      const res = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Branch deletion blocked by server");
      setBranches(branches.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = branches.filter(b => 
    (b.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (b.state?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (b.gstin?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="branches-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Offices & Branches</h2>
          <p className="text-xs text-slate-500">Coordinate multi-office infrastructure and provincial GST Registries.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      <div className="flex gap-3 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search branches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(b => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-all shadow-sm relative overflow-hidden flex flex-col justify-between">
            <span className={`absolute top-0 right-0 px-2.5 py-0.5 text-[8px] font-black uppercase rounded-bl-lg tracking-widest border-l border-b ${
              b.status === "Active" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"
            }`}>
              {b.status}
            </span>

            <div className="space-y-2">
              <div className="text-[10px] text-blue-600 font-mono font-bold">{b.id}</div>
              <h4 className="text-sm font-extrabold text-slate-900">{b.name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.state}, India</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/70 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">GSTIN Registry</span>
                <span className="font-mono font-bold text-slate-800">{b.gstin}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Staffing size</span>
                <span className="font-bold text-slate-900">{b.employeesCount || 10} Employees</span>
              </div>
              <div className="col-span-2 pt-1 font-sans">
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Estimated overhead</span>
                <span className="font-bold text-emerald-700 font-mono">₹ {b.monthlyRent.toLocaleString()} / mo</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl p-6 space-y-4 animate-slideUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Add Enterprise Branch</h3>
                <p className="text-[10px] text-slate-400">Connect regional branch office locations.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Branch Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Hyderabad Hitech City"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Indian State</label>
                  <select 
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Delhi">Delhi</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Branch GSTIN Registration</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={15}
                    placeholder="e.g. 36AAAAC1234A1Z0"
                    value={gstin}
                    onChange={e => setGstin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Office Administrator / Manager</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Vikram Malhotra"
                    value={manager}
                    onChange={e => setManager(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow"
                >
                  Confirm Branch Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// TEAMS MODULE
// -------------------------------------------------------------
export function TeamsModule({ currentUser }: ExtraModulesProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [dept, setDept] = useState("Finance & Accounts");
  const [lead, setLead] = useState("");
  const [activeProject, setActiveProject] = useState("");

  useEffect(() => {
    fetchTeams();
  }, [currentUser]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Could not access active functional teams register");
      const data = await res.json();
      setTeams(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load teams list");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: getHeaders(currentUser),
        body: JSON.stringify({
          name,
          department: dept,
          teamLead: lead || "TBD",
          membersCount: 1,
          activeProject: activeProject || "Internal Operations",
          priority: "Medium",
          status: "Active",
          branch: "Mumbai HQ"
        })
      });

      if (!res.ok) throw new Error("Could not register functional team on server");
      const newTeam = await res.json();
      setTeams([newTeam, ...teams]);
      setIsFormOpen(false);
      setName("");
      setLead("");
      setActiveProject("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirm deletion of this high-performance team?")) return;
    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: "DELETE",
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Team deletion blocked by server");
      setTeams(teams.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = teams.filter(t => 
    (t.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (t.department?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (t.teamLead?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="teams-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Functional Teams</h2>
          <p className="text-xs text-slate-500">Form and deploy high-performance cross-functional tactical workforces.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Team
        </button>
      </div>

      <div className="flex gap-3 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-505 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Team Identifier</th>
              <th className="p-4">Department Division</th>
              <th className="p-4">Team Leader</th>
              <th className="p-4 text-center">Assigned Members</th>
              <th className="p-4">Deploy Milestone Project</th>
              <th className="p-4">Operation State</th>
              <th className="p-4">Priority Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900">{t.name}</td>
                <td className="p-4 text-slate-500 font-bold">{t.department}</td>
                <td className="p-4 font-semibold text-slate-800">{t.teamLead}</td>
                <td className="p-4 text-center text-slate-700 font-mono font-bold">{t.membersCount} Crew</td>
                <td className="p-4 text-blue-700 font-semibold">{t.activeProject}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    t.status === "Active" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-slate-100 text-slate-600"
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    t.priority === "High" ? "bg-rose-50 text-rose-800" : "bg-blue-50 text-blue-800"
                  }`}>
                    {t.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl p-6 space-y-4 animate-slideUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Form Cross-Disciplinary Team</h3>
                <p className="text-[10px] text-slate-400">Establish a new task force unit.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs text-sans">Close</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Team Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Maharashtra Audit Taskforce"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lead Department</label>
                  <select 
                    value={dept}
                    onChange={e => setDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations & Logistics">Operations & Logistics</option>
                    <option value="Sales">Sales & CRM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Team Leader</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Priya Sharma"
                    value={lead}
                    onChange={e => setLead(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Active Milestone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mumbai Airport Storage Setup"
                    value={activeProject}
                    onChange={e => setActiveProject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow"
                >
                  Commission Team Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// NOTIFICATIONS MODULE
// -------------------------------------------------------------
export function NotificationsModule() {
  const [inbox, setInbox] = useState([
    { id: "1", type: "probation", msg: "Probation Alert: Vivek Deshmukh's initial contract is expiring in 14 days.", date: "Today", unread: true },
    { id: "2", type: "birthday", msg: "Auto Birthday Reminder: Today is Priya Sharma's birthday. Automated email dispatch compiled.", date: "Today", unread: true },
    { id: "3", type: "followup", msg: "CRM Lead Auto Follow-up: Maharashtra Mills lead has had no activity for 7 days. Automated follow-up sent.", date: "Yesterday", unread: false },
    { id: "4", type: "due_date", msg: "Task Overdue Warning: Audit GSTR-1 Maharashtra Maharashtra branch needs filing.", date: "2 days ago", unread: false },
    { id: "5", type: "probation", msg: "Probation Alert: Deepa Nair cleared initially. Probation approved automatically.", date: "3 days ago", unread: false }
  ]);

  const [simMessage, setSimMessage] = useState<string | null>(null);

  const triggerSimul = (type: string) => {
    let text = "";
    if (type === "reminder") text = "Auto Reminder: GST e-Way bills Maharashtra regional node sync overdue by 2.4 Hrs.";
    else if (type === "birthday") text = "Auto Birthday Reminder: Vikram Malhotra celebrates today. Email greetings formulated.";
    else if (type === "probation") text = "Auto Probation Alert: Junior Developer Neha Goel's 6-month probation expires tomorrow.";
    else if (type === "followup") text = "Auto Follow-up Alert: Reliance Infra CRM proposal follow-up email has been auto-dispatched.";
    else text = "Auto Notification Alert: System state compiled securely.";

    const newNotification = {
      id: "sim_" + Date.now(),
      type,
      msg: text,
      date: "Just Now",
      unread: true
    };

    setInbox([newNotification, ...inbox]);
    setSimMessage(`Simulated Automation Event Fired: "${text}"`);
    setTimeout(() => setSimMessage(null), 5000);
  };

  const markAllRead = () => {
    setInbox(inbox.map(i => ({ ...i, unread: false })));
  };

  const clearInbox = () => {
    setInbox([]);
  };

  return (
    <div className="space-y-6" id="notifications-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Notification Center & Automation alerts</h2>
          <p className="text-xs text-slate-500">Examine automated reminders, alerts and real-time triggers simulated across divisions.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={markAllRead}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-slate-100 transition-all"
          >
            Mark all read
          </button>
          <button 
            onClick={clearInbox}
            className="bg-white border border-rose-200 text-rose-600 font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-rose-50 transition-all"
          >
            Clear Inbox
          </button>
        </div>
      </div>

      {simMessage && (
        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <Info className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs text-emerald-800 font-semibold">{simMessage}</span>
        </div>
      )}

      {/* AUTOMATION TRIGGER ACTION CENTER */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-sm">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-blue-600" /> Simulated Auto-Alert Action center
        </h4>
        <p className="text-xs text-slate-500">Indian ERP rules auto-calculate dates. Press below to simulate background rule triggers instantly:</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => triggerSimul("birthday")} 
            className="bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 p-3 rounded-xl transition-all font-bold text-xs text-slate-750 cursor-pointer text-center"
          >
            🎁 Trigger Birthday Reminder
          </button>
          <button 
            onClick={() => triggerSimul("probation")} 
            className="bg-slate-50 hover:bg-amber-50 hover:text-amber-750 hover:border-amber-300 border border-slate-200 p-3 rounded-xl transition-all font-bold text-xs text-slate-750 cursor-pointer text-center"
          >
            ⚖ Trigger Probation Alert
          </button>
          <button 
            onClick={() => triggerSimul("followup")} 
            className="bg-slate-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 border border-slate-200 p-3 rounded-xl transition-all font-bold text-xs text-slate-755 cursor-pointer text-center"
          >
            📧 Trigger CRM Follow-up
          </button>
          <button 
            onClick={() => triggerSimul("reminder")} 
            className="bg-slate-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 p-3 rounded-xl transition-all font-bold text-xs text-slate-755 cursor-pointer text-center"
          >
            ⏰ Trigger General Reminder
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS FEED */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {inbox.map(i => (
          <div key={i.id} className={`p-4 flex items-start gap-3.5 transition-all ${i.unread ? "bg-slate-50/70" : "bg-white"}`}>
            <span className={`p-2 rounded-xl text-xs shrink-0 ${
              i.type === "birthday" ? "bg-pink-50 text-pink-600" :
              i.type === "probation" ? "bg-amber-50 text-amber-700" :
              i.type === "followup" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
            }`}>
              {i.type === "birthday" ? "🎁" : i.type === "probation" ? "⚖" : i.type === "followup" ? "📧" : "⏰"}
            </span>

            <div className="space-y-1 flex-1">
              <p className={`text-xs text-slate-800 ${i.unread ? "font-bold" : "font-medium"}`}>{i.msg}</p>
              <span className="text-[10px] text-slate-400 font-mono italic block">{i.date}</span>
            </div>

            {i.unread && (
              <span className="w-2 h-2 bg-blue-650 rounded-full mt-2 shrink-0 animate-ping" />
            )}
          </div>
        ))}
        {inbox.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400 font-medium">Your alert ledger is clean. No notifications found.</div>
        )}
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// SETTINGS MODULE
// -------------------------------------------------------------
export interface SettingsProps {
  currentUser: UserProfile;
  onChangeRole: (newRole: Role) => void;
}

export function SettingsModule({ currentUser, onChangeRole }: SettingsProps) {
  const [themeMode] = useState("Premium White Only");
  const [remindersOn, setRemindersOn] = useState(true);
  const [complianceAlerts, setComplianceAlerts] = useState(true);
  const [tenantName, setTenantName] = useState("ZOHO-TALLY Multi Tenant");

  return (
    <div className="space-y-6" id="settings-view">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Configuration & Settings</h2>
        <p className="text-xs text-slate-500">Fine-tune system roles, access policies, compliance thresholds and notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ACCESS MANAGEMENT (RBAC) */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Access Roles & Testing Policies</h4>
            <p className="text-xs text-slate-500">Instantly override current session role to preview role-based view filters (RBAC).</p>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">Current Identity</span>
              <strong className="text-slate-900 block text-sm mt-1">{currentUser.name}</strong>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold uppercase mt-1 inline-block">{currentUser.role}</span>
            </div>

            <select
              value={currentUser.role}
              onChange={(e) => onChangeRole(e.target.value as Role)}
              className="bg-white border border-slate-250 font-sans text-xs p-2 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring focus:ring-blue-200 cursor-pointer"
            >
              <option value={Role.SUPER_ADMIN}>Super Admin Override</option>
              <option value={Role.ADMIN}>Admin Role</option>
              <option value={Role.HR}>HR Specialist</option>
              <option value={Role.MANAGER}>Manager</option>
              <option value={Role.FINANCE}>Finance Auditor</option>
              <option value={Role.SALES}>Sales Associate</option>
              <option value={Role.EMPLOYEE}>Standard Employee</option>
              <option value={Role.CUSTOMER}>Customer Portal</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 bg-blue-50/20 p-3 rounded-lg border border-blue-50 text-[11px] leading-relaxed">
            🚩 <strong>Super Admin & Admin</strong> roles are granted full write permissions to invoices, GST filers, leaves, and employee profiles. <strong>Customer & Vendor</strong> roles are partitioned inside secure portal environments.
          </div>
        </div>

        {/* COMPLIANCE & NOTIFICATIONS POLICIES */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-4 shadow-sm font-semibold text-xs text-slate-700">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Compliance Rulesets</h4>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block font-sans">Automatic birthday email greeting templates</span>
                <p className="text-[10px] text-slate-500 font-medium">Sends automated templated wishes via HR desk.</p>
              </div>
              <input 
                type="checkbox" 
                checked={remindersOn} 
                onChange={e => setRemindersOn(e.target.checked)} 
                className="w-4 h-4 text-blue-650 tracking-wider shadow"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block font-sans">Indian GSTR-1, e-Way, GSTR-3B audit controls</span>
                <p className="text-[10px] text-slate-500 font-medium font-sans">Auto alerts when tax compliance reaches deadline.</p>
              </div>
              <input 
                type="checkbox" 
                checked={complianceAlerts} 
                onChange={e => setComplianceAlerts(e.target.checked)} 
                className="w-4 h-4 text-blue-650 tracking-wider shadow"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Theme Visual Preference</span>
                <p className="text-[10px] text-slate-400">Strict corporate preference.</p>
              </div>
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">{themeMode}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
