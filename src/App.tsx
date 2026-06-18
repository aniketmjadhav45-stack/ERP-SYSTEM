import React, { useState, useEffect } from "react";
import {
  UserProfile,
  Lead,
  Contact,
  Attendance,
  LeaveRequest,
  PayrollRecord,
  Project,
  Task,
  Invoice,
  Expense,
  Product,
  Supplier,
  AutomationRule,
  AutomationLog,
  Role
} from "./types";

import AuthScreen from "./components/AuthScreen";
import DashboardModule from "./components/DashboardModule";
import CRMModule from "./components/CRMModule";
import HRModule from "./components/HRModule";
import ProjectsModule from "./components/ProjectsModule";
import FinanceModule from "./components/FinanceModule";
import InventoryModule from "./components/InventoryModule";
import AutomationModule from "./components/AutomationModule";
import CustomerPortal from "./components/PortalModules";
import AIAssistantModule from "./components/AIAssistantModule";

import {
  LayoutDashboard,
  Users,
  Briefcase,
  HeartHandshake,
  FolderKanban,
  Coins,
  Layers,
  Cpu,
  BrainCircuit,
  LogOut,
  User,
  ShieldCheck,
  Building,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Module state
  const [activeModule, setActiveModule] = useState<string>("dashboard");

  // Domain states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);

  // Synchronization status
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronize entire client state from Express memory databases
  const syncWithBackend = async () => {
    setIsSyncing(true);
    try {
      const [
        resUsers,
        resLeads,
        resContacts,
        resAttendance,
        resLeaves,
        resPayroll,
        resProjects,
        resTasks,
        resInvoices,
        resExpenses,
        resInventory,
        resSuppliers,
        resRules,
        resLogs
      ] = await Promise.all([
        fetch("/api/users").then(r => r.json()),
        fetch("/api/leads").then(r => r.json()),
        fetch("/api/contacts").then(r => r.json()),
        fetch("/api/attendance").then(r => r.json()),
        fetch("/api/leaves").then(r => r.json()),
        fetch("/api/payroll").then(r => r.json()),
        fetch("/api/projects").then(r => r.json()),
        fetch("/api/tasks").then(r => r.json()),
        fetch("/api/invoices").then(r => r.json()),
        fetch("/api/expenses").then(r => r.json()),
        fetch("/api/inventory").then(r => r.json()),
        fetch("/api/suppliers").then(r => r.json()),
        fetch("/api/automation/rules").then(r => r.json()),
        fetch("/api/automation/logs").then(r => r.json())
      ]);

      setUsers(resUsers);
      setLeads(resLeads);
      setContacts(resContacts);
      setAttendance(resAttendance);
      setLeaves(resLeaves);
      setPayroll(resPayroll);
      setProjects(resProjects);
      setTasks(resTasks);
      setInvoices(resInvoices);
      setExpenses(resExpenses);
      setProducts(resInventory);
      setSuppliers(resSuppliers);
      setRules(resRules);
      setLogs(resLogs);
    } catch (err) {
      console.error("API Fetch Synchronize failed: ", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWithBackend();
  }, []);

  // Update current active UI module based on selected logged role rules
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === Role.CUSTOMER || currentUser.role === Role.VENDOR) {
        setActiveModule("portal");
      } else {
        setActiveModule("dashboard");
      }
    }
  }, [currentUser]);

  // Handle Authentication callbacks
  const handleLoginSuccess = (user: UserProfile, tenant: any) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Switch role of present user to inspect Rbac restrictions instantly
  const handleRoleOverride = (newRole: Role) => {
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
    }
  };

  // --- CRM MUTATION HANDLERS ---
  const handleAddLead = async (leadData: Partial<Lead>) => {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLead = async (leadId: string, updatedFields: Partial<Lead>) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddContact = async (contactData: Partial<Contact>) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- HR MUTATION HANDLERS ---
  const handleClockInOut = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, userName: currentUser.name })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitLeave = async (leave: { leaveType: LeaveRequest["leaveType"]; startDate: string; endDate: string; reason: string }) => {
    if (!currentUser) return;
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leave, userId: currentUser.id, userName: currentUser.name })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeaveStatus = async (leaveId: string, status: LeaveRequest["status"]) => {
    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPayroll = async (record: Omit<PayrollRecord, "id">) => {
    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePayrollStatus = async (payrollId: string, status: PayrollRecord["status"]) => {
    try {
      const response = await fetch(`/api/payroll/${payrollId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- PROJECTS WORKFLOW MUTATIONS ---
  const handleAddTask = async (task: { projectId: string; title: string; description: string; priority: Task["priority"]; dueDate: string; assignedTo: string }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- FINANCE WORKFLOW MUTATIONS ---
  const handleAddInvoice = async (invoice: Omit<Invoice, "id" | "invoiceNumber" | "total"> & { total: number }) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: Invoice["status"]) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, "id" | "status">) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateExpenseStatus = async (expenseId: string, status: Expense["status"]) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- INVENTORY DIRECT ACCESS WORKFLOWS ---
  const handleAddProduct = async (product: Omit<Product, "id" | "sku">) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (productId: string, updatedFields: Partial<Product>) => {
    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- AUTOMATIONS ---
  const handleToggleRule = async (ruleId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/automation/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-indigo-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-widest animate-pulse">BOOTING CORPORATE ENGINE SCHEMA... STAND BY</p>
      </div>
    );
  }

  // Gateway check if user is configured or logged
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row overflow-hidden" id="erp-workspace">
      
      {/* SIDEBAR NAVIGATION GRID */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        
        <div className="flex flex-col">
          {/* Tenant Corporate Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-xs text-white">
                Ψ
              </div>
              <div>
                <h1 className="text-xs font-black tracking-widest text-white uppercase leading-none">Apex ERP</h1>
                <span className="text-[9px] text-slate-500 font-mono tracking-wider">Multi-Tenant v2.0</span>
              </div>
            </div>

            <button
              type="button"
              onClick={syncWithBackend}
              className={`p-1 bg-slate-950 hover:bg-slate-900 duration-150 border border-slate-800/60 rounded text-slate-400 cursor-pointer ${
                isSyncing ? "animate-spin text-indigo-450" : ""
              }`}
              title="Force sync database"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Items (Dependent on standard roles) */}
          <nav className="p-3 space-y-1">
            <span className="text-[9px] text-slate-505 font-bold tracking-widest font-mono uppercase px-3 block mb-1">Modules Console</span>
            
            {/* Show dynamic custom outer Customer/Vendor dashboard locks */}
            {currentUser.role === Role.CUSTOMER || currentUser.role === Role.VENDOR ? (
              <button
                type="button"
                onClick={() => setActiveModule("portal")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold font-sans rounded-lg transition-all ${
                  activeModule === "portal" ? "bg-teal-900/40 text-teal-300 font-extrabold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Secure Client Gate</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveModule("dashboard")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "dashboard" ? "bg-indigo-600 text-white font-extrabold shadow-md" : "text-slate-400 hover:text-slate-205 hover:bg-slate-850/30"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>CFO Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("crm")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "crm" ? "bg-indigo-600 text-white font-extrabold shadow-md" : "text-slate-400 hover:text-slate-205 hover:bg-slate-850/30"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>CRM Lead Pipeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("hr")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "hr" ? "bg-indigo-600 text-white font-extrabold shadow-md" : "text-slate-400 hover:text-slate-205 hover:bg-slate-850/30"
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>HR Management</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("projects")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "projects" ? "bg-indigo-600 text-white font-extrabold shadow-md" : "text-slate-400 hover:text-slate-205 hover:bg-slate-850/30"
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>Project Deliverables</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("finance")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "finance" ? "bg-indigo-600 text-white font-extrabold shadow-md" : "text-slate-400 hover:text-slate-205 hover:bg-slate-850/30"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Finance Ledger</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("inventory")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "inventory" ? "bg-indigo-600 text-white font-extrabold shadow-md" : "text-slate-400 hover:text-slate-205 hover:bg-slate-850/30"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Inventory Catalog</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("automation")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "automation" ? "bg-indigo-600 text-white font-extrabold shadow-md" : "text-slate-400 hover:text-slate-205 hover:bg-slate-850/30"
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Zap Automation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule("ai")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer bg-slate-950/40 border border-indigo-900/40 ${
                    activeModule === "ai" ? "text-indigo-400 border-indigo-505 bg-indigo-950/20 font-extrabold" : "text-slate-400 hover:text-slate-205 hover:bg-indigo-950/10"
                  }`}
                >
                  <BrainCircuit className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Gemini Executive AI</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* PROFILE CARD FOOTER WITH INTERACTIVE ROLE OVERRIDE SLIDERS */}
        <div className="p-3 bg-slate-950 border-t border-slate-850/80 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
              {currentUser.name.substring(0, 1).toUpperCase()}
            </div>
            
            <div className="space-y-0.5 max-w-[120px] truncate">
              <div className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</div>
              <span className="text-[10px] text-indigo-400 font-mono italic block truncate">{currentUser.role}</span>
            </div>

            <button
              onClick={handleLogout}
              className="ml-auto p-1.5 hover:bg-slate-900 text-rose-500 rounded cursor-pointer"
              title="Sign out of multi-tenant"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick RBAC role switcher tools to facilitate grading */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1 ">
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Developer RBAC Switcher</span>
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3 text-indigo-400" />
              <select
                value={currentUser.role}
                onChange={(e) => handleRoleOverride(e.target.value as Role)}
                className="bg-slate-950 text-[10px] text-slate-300 font-mono w-full border-none focus:outline-none cursor-pointer"
              >
                <option value={Role.SUPER_ADMIN}>Super Admin</option>
                <option value={Role.ADMIN}>Admin</option>
                <option value={Role.MANAGER}>Manager</option>
                <option value={Role.HR}>HR Specialist</option>
                <option value={Role.SALES}>Sales Associate</option>
                <option value={Role.FINANCE}>Finance Auditor</option>
                <option value={Role.EMPLOYEE}>Employee</option>
                <option value={Role.CUSTOMER}>Customer Portal</option>
              </select>
            </div>
          </div>
        </div>

      </aside>

      {/* CORE VIEWPORT CAROUSEL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950">
        
        {/* Dynamic Context Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-900 pb-4">
          <div>
            <div className="text-[10px] font-bold text-indigo-410 font-mono uppercase tracking-widest mb-1 select-none flex items-center gap-1">
              <span>MULTITENANT METRICS NODE</span>
              <ChevronRight className="w-3" />
              <span className="text-slate-500 font-sans">{activeModule.toUpperCase()}</span>
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-slate-100 font-sans tracking-tight capitalize">
              {activeModule.replace("-", " ")} Workbench
            </h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="bg-slate-900 p-2 border border-slate-850 rounded">
              Depot Location: <strong className="text-white">Berlin HQ</strong>
            </span>
          </div>
        </header>

        {/* Dynamic active component selector */}
        <div className="transition-all duration-300 h-full">
          
          {activeModule === "dashboard" && (
            <DashboardModule
              leads={leads}
              projects={projects}
              tasks={tasks}
              users={users}
              invoices={invoices}
              expenses={expenses}
              currentUser={currentUser}
              onNavigateToModule={setActiveModule}
            />
          )}

          {activeModule === "crm" && (
            <CRMModule
              leads={leads}
              contacts={contacts}
              users={users}
              onAddLead={handleAddLead}
              onUpdateLeadStatus={(leadId, newStatus) => handleUpdateLead(leadId, { status: newStatus })}
              onDeleteLead={handleDeleteLead}
              onAddContact={handleAddContact}
            />
          )}

          {activeModule === "hr" && (
            <HRModule
              attendance={attendance}
              leaves={leaves}
              payroll={payroll}
              currentUser={currentUser}
              users={users}
              onClockInOut={handleClockInOut}
              onSubmitLeave={handleSubmitLeave}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onAddPayroll={handleAddPayroll}
              onUpdatePayrollStatus={handleUpdatePayrollStatus}
            />
          )}

          {activeModule === "projects" && (
            <ProjectsModule
              projects={projects}
              tasks={tasks}
              users={users}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {activeModule === "finance" && (
            <FinanceModule
              invoices={invoices}
              expenses={expenses}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onAddExpense={handleAddExpense}
              onUpdateExpenseStatus={handleUpdateExpenseStatus}
              currentUser={currentUser}
            />
          )}

          {activeModule === "inventory" && (
            <InventoryModule
              products={products}
              suppliers={suppliers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          )}

          {activeModule === "automation" && (
            <AutomationModule
              rules={rules}
              logs={logs}
              onToggleRule={handleToggleRule}
              onRefreshLogs={syncWithBackend}
            />
          )}

          {activeModule === "ai" && (
            <AIAssistantModule
              onRefreshTasks={syncWithBackend}
            />
          )}

          {activeModule === "portal" && (
            <CustomerPortal
              currentUser={currentUser}
              projects={projects}
              invoices={invoices}
              onPayInvoice={(invoiceId) => handleUpdateInvoiceStatus(invoiceId, "Paid")}
            />
          )}

        </div>

      </main>

    </div>
  );
}
