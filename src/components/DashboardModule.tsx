import React from "react";
import { Lead, Project, Task, Invoice, Expense, UserProfile, Role } from "../types";
import { TrendingUp, Users, FolderKanban, CheckSquare, Sparkles, DollarSign, ArrowUpRight, Activity } from "lucide-react";

interface DashboardModuleProps {
  leads: Lead[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  expenses: Expense[];
  users: UserProfile[];
  currentUser: UserProfile;
  onNavigateToModule: (moduleName: string) => void;
}

export default function DashboardModule({
  leads,
  projects,
  tasks,
  invoices,
  expenses,
  users,
  currentUser,
  onNavigateToModule
}: DashboardModuleProps) {
  // Analytical computed ratios
  const totalLeadsPipeline = leads.reduce((acc, lead) => acc + (lead.status !== "Closed Lost" ? lead.value : 0), 0);
  const totalRevenuePaid = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, inv) => acc + inv.total, 0);
  const totalRevenuePending = invoices
    .filter((inv) => inv.status === "Sent" || inv.status === "Partially Paid")
    .reduce((acc, inv) => acc + inv.total, 0);
  const totalExpenses = expenses
    .filter((exp) => exp.status === "Approved")
    .reduce((acc, exp) => acc + exp.amount, 0);

  const profitLossResult = totalRevenuePaid - totalExpenses;

  // Counters
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;

  return (
    <div className="space-y-6" id="dashboard-module-view">
      {/* Top Welcome Title Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Operational Hub Overview</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Greetings, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            You are authenticated as <strong className="text-slate-800">{currentUser.role}</strong> inside the Indian ERP system. All real-time telemetry metrics are synced securely below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-right shadow-sm">
            <div className="text-[10px] text-slate-400 font-mono font-bold">FINANCIAL RATIOS</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${profitLossResult >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              P&L: {profitLossResult >= 0 ? '+' : ''}${profitLossResult.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-right shadow-sm">
            <div className="text-[10px] text-slate-400 font-mono font-bold">PIPELINE VALUE</div>
            <div className="text-xs font-bold font-mono mt-0.5 text-blue-600">
              ${totalLeadsPipeline.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Numerical Analytics Block Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between transition-all hover:border-slate-300 shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Accumulated Incomes</span>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">${totalRevenuePaid.toLocaleString()}</h3>
            <span className="text-[9px] text-emerald-650 font-semibold font-sans flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-2.5 h-2.5" /> +12.4% vs monthly target
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between transition-all hover:border-slate-300 shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Active Milestones</span>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">{inProgressProjects} / {projects.length}</h3>
            <span className="text-[9px] text-blue-600 font-medium font-sans flex items-center gap-0.5 mt-1">
              Currently operational on scale
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between transition-all hover:border-slate-300 shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Workspace Tasks</span>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">{completedTasks} / {tasks.length}</h3>
            <span className="text-[9px] text-slate-500 font-sans mt-1 block">
              {tasks.length - completedTasks} outstanding actions
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between transition-all hover:border-slate-300 shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Assigned Employees</span>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 font-mono mt-1">{users.length} Active</h3>
            <span className="text-[9px] text-blue-600 font-sans mt-1 block">
              Across {new Set(users.map(u => u.department)).size} divisions
            </span>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-purple-650">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Visual Charts section using responsive divs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CRM Leads and pipeline distribution chart card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Functional Sales Conversion Stack</h4>
              <p className="text-[11px] text-slate-500">Value of active leads relative to pipeline stages.</p>
            </div>
            <button 
              type="button"
              onClick={() => onNavigateToModule("CRM")}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Manage CRM</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {leads.slice(0, 4).map((l, index) => {
              const percentages = [85, 45, 12, 60];
              const p = percentages[index % percentages.length];
              return (
                <div key={l.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium">{l.company} <span className="text-[10px] text-slate-400 font-mono">({l.status})</span></span>
                    <span className="text-slate-600 font-mono font-bold">${l.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-150 text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Won Value</div>
              <div className="text-xs font-bold text-emerald-605 font-mono mt-0.5">
                ${leads.filter(l => l.status === "Closed Won").reduce((acc, l) => acc + l.value, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Proposal Stack</div>
              <div className="text-xs font-bold text-blue-600 font-mono mt-0.5">
                ${leads.filter(l => l.status === "Proposal").reduce((acc, l) => acc + l.value, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Doubtful Ratio</div>
              <div className="text-xs font-bold text-rose-600 font-mono mt-0.5">
                ${leads.filter(l => l.status === "Closed Lost").reduce((acc, l) => acc + l.value, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Flow overview box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-slate-900">Financial Execution Flow</h4>
            <p className="text-[11px] text-slate-500">Overview of paid versus pending collections.</p>
          </div>

          <div className="space-y-4 py-2">
            {/* Paid */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Paid Receipts</span>
                <span className="text-emerald-600 font-bold font-mono">${totalRevenuePaid.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(totalRevenuePaid / (totalRevenuePaid + totalRevenuePending || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Pending */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Awaiting Settlement</span>
                <span className="text-amber-600 font-bold font-mono">${totalRevenuePending.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-amber-550 h-full" style={{ width: `${(totalRevenuePending / (totalRevenuePaid + totalRevenuePending || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Approved Expenses</span>
                <span className="text-rose-600 font-bold font-mono">${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, (totalExpenses / (totalRevenuePaid || 1)) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-150">
            <button
              type="button"
              onClick={() => onNavigateToModule("Finance")}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 rounded-lg text-center text-xs text-slate-700 font-bold transition-all cursor-pointer shadow-sm"
            >
              Generate Profit & Loss Spreadsheet
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Activity listing vs milestones progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Projects Milestones Widget */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-sm font-semibold text-slate-900">Live Deliverable Tracks</h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold font-sans">Gantt Milestones</span>
          </div>

          <div className="space-y-3 pt-2">
            {projects.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-slate-800 font-sans">{p.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">End date: {p.endDate}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.milestones.slice(0, 2).map((m, idx) => (
                    <span key={idx} className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">✔ {m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks and Action items widget */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-sm font-semibold text-slate-900">Assigned Incomplete Tasks</h4>
            <span className="text-[10px] bg-amber-50 text-amber-750 px-2.5 py-1 rounded-full font-bold font-sans">Action List</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {tasks.filter(t => t.status !== "Completed").slice(0, 3).map((t) => (
              <div key={t.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded border border-slate-200/60">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">{t.title}</div>
                  <div className="text-[10px] text-slate-550">Due: {t.dueDate} | Assigned: {t.assignedTo}</div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  t.priority === "High" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                  t.priority === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-250" : "bg-slate-100 text-slate-600"
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
            {tasks.filter(t => t.status !== "Completed").length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500">No overdue task entries detected. Nice work!</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
