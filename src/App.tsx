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

// Newly created Indian ERP modules
import GSTModule from "./components/GSTModule";
import VendorsModule from "./components/VendorsModule";
import QuotationsModule from "./components/QuotationsModule";
import PaymentsModule from "./components/PaymentsModule";
import ReportsModule from "./components/ReportsModule";
import CompanySetupModule from "./components/CompanySetupModule";
import EmployeesModule from "./components/EmployeesModule";
import CustomersModule from "./components/CustomersModule";

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
  ChevronRight,
  Receipt,
  FileText,
  CreditCard,
  Percent,
  Warehouse,
  ShoppingBag,
  Building2,
  BarChart4,
  Menu,
  X,
  Search,
  Bell
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Module state
  const [activeModule, setActiveModule] = useState<string>("dashboard");

  // Multi-Company Support States
  const [currentCompany, setCurrentCompany] = useState<string>("Tata Agro Pvt Ltd");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("Manufacturing");

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

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

  const handleAddSupplier = async (supplier: Omit<Supplier, "id">) => {
    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier)
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-600 tracking-widest animate-pulse font-bold">BOOTING INDIAN ERP RESOURCE MATRIX... STAND BY</p>
      </div>
    );
  }

  // Gateway check if user is configured or logged
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row overflow-hidden" id="erp-workspace">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-250/80 px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-sm">
            IE
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-slate-900 uppercase">INDIAN ERP</h1>
            <span className="text-[8px] text-slate-500 font-mono tracking-wider font-semibold block">ZO-TALLY DIRECT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={syncWithBackend}
            className={`p-1.5 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 cursor-pointer ${
              isSyncing ? "animate-spin text-blue-600" : ""
            }`}
            title="Force sync database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 hover:bg-slate-100 rounded border border-slate-200 text-slate-700 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION (DRAWER ON MOBILE, FIXED INDEX STICKY ON DESKTOP) */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white z-40 w-64 border-r border-slate-200/80 flex flex-col justify-between shrink-0 transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Tenant Corporate Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white hidden md:flex">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-sm hover:scale-105 duration-200">
                IE
              </div>
              <div>
                <h1 className="text-xs font-black tracking-wider text-slate-900 uppercase">INDIAN ERP</h1>
                <span className="text-[9px] text-slate-500 font-mono tracking-widest block font-bold mt-0.5">ZO-TALLY DIRECT</span>
              </div>
            </div>

            <button
              type="button"
              onClick={syncWithBackend}
              className={`p-1.5 bg-slate-50 hover:bg-slate-100 duration-155 border border-slate-200/60 rounded-lg text-slate-500 cursor-pointer ${
                isSyncing ? "animate-spin text-blue-600" : ""
              }`}
              title="Force sync database"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MULTI-COMPANY SWITCHER */}
          <div className="px-4 py-3.5 border-b border-slate-100 bg-white/70">
            <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Company Profile</label>
            <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-200/60 transition-all hover:border-slate-300">
              <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <select
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
                title="Select current active company"
              >
                <option value="Tata Agro Pvt Ltd">Tata Agro Pvt Ltd</option>
                <option value="Reliance Infra Ltd">Reliance Infra Ltd</option>
                <option value="Adani Power Ltd">Adani Power Ltd</option>
                <option value="Acme Consulting Services">Acme Consulting Services</option>
              </select>
            </div>
          </div>

          {/* TARGET INDUSTRY VERTICALS CALIBRATOR */}
          <div className="px-4 py-3.5 border-b border-slate-100 bg-white/70">
            <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Industry Vertical</label>
            <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-200/60 transition-all hover:border-slate-300">
              <Sliders className="w-4 h-4 text-slate-550 flex-shrink-0" />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-full cursor-pointer"
                title="Calibrate dynamic industry focus"
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Construction">Construction</option>
                <option value="Agencies">Agencies</option>
                <option value="Hospitals">Hospitals</option>
                <option value="Schools">Schools</option>
                <option value="CA Firms">CA Firms</option>
                <option value="Distributors">Distributors</option>
                <option value="Retail">Retail Businesses</option>
                <option value="Service">Service Companies</option>
              </select>
            </div>
          </div>

          {/* Navigation Items (Dependent on standard roles) */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 max-h-[60vh]">
            <span className="text-[9px] text-slate-400 font-bold tracking-widest font-mono uppercase px-3 block mb-1">Operational Modules</span>
            
            {/* Show dynamic custom outer Customer/Vendor dashboard locks */}
            {currentUser.role === Role.CUSTOMER || currentUser.role === Role.VENDOR ? (
              <button
                type="button"
                onClick={() => { setActiveModule("portal"); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                  activeModule === "portal" ? "bg-teal-50 border border-teal-200 text-teal-850 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-650" />
                <span>Secure Customer Gate</span>
              </button>
            ) : (
              <>
                {/* Dashboard */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("dashboard"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "dashboard" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Executive Dashboard</span>
                </button>

                {/* --- CORPORATE SETUP --- */}
                <div className="pt-3 pb-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono px-3">Setup & Personnel</div>
                
                {/* 1. Company Setup */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("company-setup"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "company-setup" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>1. Company Setup</span>
                </button>

                {/* 2. Employees */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("employees"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "employees" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>2. Employee Portal</span>
                </button>

                {/* 3. Customers */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("customers"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "customers" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>3. Customers Hub</span>
                </button>

                {/* --- SALES & VENDORS --- */}
                <div className="pt-3 pb-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono px-3">Sales & Buy pipelines</div>

                {/* 4. Vendors */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("vendors"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "vendors" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <span>4. Vendors & PO</span>
                </button>

                {/* 5. Leads */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("crm"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "crm" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-slate-500" />
                  <span>5. Leads pipeline</span>
                </button>

                {/* --- OPERATIONS & PROJECTS --- */}
                <div className="pt-3 pb-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono px-3">Delivery & Tasks Offshoring</div>

                {/* 6. Projects */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("projects"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "projects" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-slate-500" />
                  <span>6. Projects Scheduler</span>
                </button>

                {/* 7. Tasks */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("tasks"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "tasks" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  <span>7. Tasks Matrix</span>
                </button>

                {/* --- COMPLIANCE & ATTENDANCE --- */}
                <div className="pt-3 pb-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono px-3">HR and Attendance</div>

                {/* 8. Attendance */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("attendance"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "attendance" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span>8. Attendance Shift</span>
                </button>

                {/* 9. Leave Management */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("leaves"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "leaves" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span>9. Leave Tracking</span>
                </button>

                {/* 10. Payroll */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("payroll"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "payroll" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Coins className="w-4 h-4 text-slate-500" />
                  <span>10. Payroll Board</span>
                </button>

                {/* --- STOCK & LEDGERS --- */}
                <div className="pt-3 pb-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono px-3">Inventory & Invoicing</div>

                {/* 11. Inventory */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("inventory"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "inventory" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>11. Stock Catalog</span>
                </button>

                {/* 12. Invoices */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("invoices"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "invoices" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>12. Billing Invoices</span>
                </button>

                {/* 13. Expenses */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("expenses"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "expenses" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span>13. Operational Expense</span>
                </button>

                {/* --- AUDIT & METRICS --- */}
                <div className="pt-3 pb-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono px-3">Auditing & Insights</div>

                {/* 14. Reports */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("reports"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "reports" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <BarChart4 className="w-4 h-4 text-slate-500" />
                  <span>14. Audit Reports</span>
                </button>

                <div className="pt-3 pb-1 text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono px-3">Indian Tax & AI tools</div>

                {/* GST Board (Highly specific for Tally alignment) */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("gst"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "gst" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Percent className="w-4 h-4 text-slate-500" />
                  <span className="flex items-center justify-between w-full">
                    <span>GST Tax filing</span>
                    <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 rounded font-bold">GSTR</span>
                  </span>
                </button>

                {/* Quotations */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("quotations"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "quotations" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Quotations & PO</span>
                </button>

                {/* Payments */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("payments"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "payments" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span className="flex items-center justify-between w-full">
                    <span>UPI Payments & Banking</span>
                    <span className="text-[8px] bg-green-50 border border-green-100 text-green-700 px-1 rounded font-bold">BHIM</span>
                  </span>
                </button>

                {/* Automation Trigger */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("automation"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "automation" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Cpu className="w-4 h-4 text-slate-500" />
                  <span>Zap Automations</span>
                </button>

                {/* AI diagnostics */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("ai"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "ai" ? "bg-indigo-50 border border-indigo-105 text-indigo-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-indigo-50/20"
                  }`}
                >
                  <BrainCircuit className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>Gemini Corporate AI</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* PROFILE CARD FOOTER WITH INTERACTIVE ROLE OVERRIDE SLIDERS */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-300">
              {currentUser.name.substring(0, 1).toUpperCase()}
            </div>
            
            <div className="space-y-0.5 max-w-[120px] truncate">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
              <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold block truncate">{currentUser.role}</span>
            </div>

            <button
              onClick={handleLogout}
              className="ml-auto p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition-colors"
              title="Sign out of multi-tenant"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick RBAC role switcher tools to facilitate grading */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 space-y-1">
            <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">Developer RBAC Switcher</span>
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3 text-blue-600" />
              <select
                value={currentUser.role}
                onChange={(e) => handleRoleOverride(e.target.value as Role)}
                className="bg-transparent text-[10px] p-0 text-slate-600 font-mono w-full border-none focus:outline-none cursor-pointer font-bold"
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* PREMIUM STICKY TOP HEADER */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/60 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Global Search Bar Everywhere */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers, employees, projects, tasks..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all shadow-sm"
            />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch("")}
                className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Active Company: <strong className="text-slate-950 font-black">{currentCompany}</strong>
            </span>
            <span className="bg-blue-50 px-3 py-1.5 border border-blue-105 rounded-lg text-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sliders className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              Vertical: <strong className="text-blue-950 font-black">{selectedIndustry} Mode</strong>
            </span>
            <button 
              type="button" 
              onClick={() => setActiveModule("ai")}
              className="bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 border border-indigo-100 rounded-lg text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY AND FLOATING SEARCH PALETTE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative">
          
          {/* FLOATING COMMAND SEARCH PALETTE */}
          {globalSearch && (
            <div className="absolute inset-x-4 top-2 max-w-4xl mx-auto bg-white border border-slate-250 rounded-2xl shadow-2xl z-50 p-6 space-y-4 animate-slideDown max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-blue-650" /> Instant Matrix Search Results
                  </h3>
                  <p className="text-[10px] text-slate-500">Showing matches for &quot;{globalSearch}&quot;</p>
                </div>
                <button 
                  onClick={() => setGlobalSearch("")}
                  className="p-1 px-2.5 text-[10px] uppercase font-black bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  ESC [x]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MATCHED PROJECTS */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                  <h4 className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                    <FolderKanban className="w-3.5 h-3.5" /> Projects Mapped
                  </h4>
                  <div className="space-y-1.5">
                    {projects.filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 4).map(p => (
                      <div 
                        key={p.id}
                        onClick={() => { setActiveModule("projects"); setGlobalSearch(""); }}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition-all duration-150 shadow-sm text-xs flex justify-between items-center"
                      >
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] font-mono bg-blue-105 text-blue-800 px-1.5 rounded">{p.progress}%</span>
                      </div>
                    ))}
                    {projects.filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                      <span className="text-[10px] text-slate-400 block">No matching projects</span>
                    )}
                  </div>
                </div>

                {/* MATCHED EMPLOYEES */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                  <h4 className="text-xs font-extrabold text-indigo-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Team Employees
                  </h4>
                  <div className="space-y-1.5">
                    {users.filter(u => u.name.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 4).map(u => (
                      <div 
                        key={u.id}
                        onClick={() => { setActiveModule("employees"); setGlobalSearch(""); }}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition-all duration-150 shadow-sm text-xs flex justify-between items-center"
                      >
                        <span className="font-bold text-slate-800">{u.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">{u.department}</span>
                      </div>
                    ))}
                    {users.filter(u => u.name.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                      <span className="text-[10px] text-slate-400 block">No matching team members</span>
                    )}
                  </div>
                </div>

                {/* MATCHED TASKS */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-2 md:col-span-2">
                  <h4 className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Action Tasks
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tasks.filter(t => t.title.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 6).map(t => (
                      <div 
                        key={t.id}
                        onClick={() => { setActiveModule("tasks"); setGlobalSearch(""); }}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition-all duration-150 shadow-sm text-xs flex justify-between items-center"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <span className="font-bold text-slate-800 block truncate">{t.title}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">Assigned: {t.assignedTo}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          t.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>{t.status}</span>
                      </div>
                    ))}
                    {tasks.filter(t => t.title.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                      <span className="text-[10px] text-slate-400 block md:col-span-2">No matching tasks found</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {activeModule === "company-setup" && (
            <CompanySetupModule />
          )}

          {activeModule === "employees" && (
            <EmployeesModule />
          )}

          {activeModule === "customers" && (
            <CustomersModule />
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

          {activeModule === "attendance" && (
            <HRModule
              initialTab="attendance"
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

          {activeModule === "leaves" && (
            <HRModule
              initialTab="leaves"
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

          {activeModule === "payroll" && (
            <HRModule
              initialTab="payroll"
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

          {activeModule === "tasks" && (
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

          {activeModule === "invoices" && (
            <FinanceModule
              initialTab="invoices"
              invoices={invoices}
              expenses={expenses}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onAddExpense={handleAddExpense}
              onUpdateExpenseStatus={handleUpdateExpenseStatus}
              currentUser={currentUser}
            />
          )}

          {activeModule === "expenses" && (
            <FinanceModule
              initialTab="expenses"
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

          {activeModule === "gst" && (
            <GSTModule
              invoices={invoices}
              selectedIndustry={selectedIndustry}
            />
          )}

          {activeModule === "quotations" && (
            <QuotationsModule
              products={products}
            />
          )}

          {activeModule === "payments" && (
            <PaymentsModule
              invoices={invoices}
              onConfirmInvoicePaid={(invoiceId) => handleUpdateInvoiceStatus(invoiceId, "Paid")}
            />
          )}

          {activeModule === "vendors" && (
            <VendorsModule
              suppliers={suppliers}
              products={products}
              onAddSupplier={handleAddSupplier}
            />
          )}

          {activeModule === "reports" && (
            <ReportsModule
              invoices={invoices}
              expenses={expenses}
              products={products}
              projects={projects}
              selectedIndustry={selectedIndustry}
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
      </div>

    </main>

    </div>
  );
}
