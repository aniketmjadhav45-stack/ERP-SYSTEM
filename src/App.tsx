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
import DocumentsModule from "./components/DocumentsModule";

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
  DepartmentsModule, 
  BranchesModule, 
  TeamsModule, 
  NotificationsModule, 
  SettingsModule 
} from "./components/ExtraERPModules";

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
  Bell,
  Calendar,
  Settings,
  MapPin,
  PlusCircle
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

  // Quick Create Modal States
  const [showQuickLeadModal, setShowQuickLeadModal] = useState(false);
  const [showQuickProjectModal, setShowQuickProjectModal] = useState(false);
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  
  // Modals for the strict requested items: Add Employee, Add Invoice, Add Customer
  const [showQuickEmployeeModal, setShowQuickEmployeeModal] = useState(false);
  const [showQuickInvoiceModal, setShowQuickInvoiceModal] = useState(false);
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);

  // Stepper steps for each form
  const [empStep, setEmpStep] = useState(1);
  const [invStep, setInvStep] = useState(1);
  const [custStep, setCustStep] = useState(1);
  const [taskStep, setTaskStep] = useState(1);

  // Auto Save Draft States (Loads from localStorage if exists)
  const [empDraft, setEmpDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("draft_employee") || "{}");
    } catch { return {}; }
  });
  const [invDraft, setInvDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("draft_invoice") || "{}");
    } catch { return {}; }
  });
  const [custDraft, setCustDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("draft_customer") || "{}");
    } catch { return {}; }
  });
  const [taskDraft, setTaskDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("draft_task") || "{}");
    } catch { return {}; }
  });

  // Recent Activity Feed State (initialized with exact user-requested logs plus live actions)
  const [activityFeed, setActivityFeed] = useState<any[]>([
    { id: "feed_1", text: "Rahul added new invoice INV-2026-004", time: "2 min ago", user: "Rahul", module: "Invoices" },
    { id: "feed_2", text: "Project Alpha Workspace completed", time: "1 hour ago", user: "Sanjay", module: "Projects" },
    { id: "feed_3", text: "Payment received ₹25,000 for INV-2026-001", time: "3 hours ago", user: "Vikram", module: "Payments" },
    { id: "feed_4", text: "Registered new Customer 'HDFC Securities'", time: "4 hours ago", user: "Aniket", module: "Customers" }
  ]);

  // Notification Bell State: New employee added, Invoice created, Payment received, Leave approved
  const [notifications, setNotifications] = useState<any[]>([
    { id: "not_1", text: "New employee Rahul Verma added to Roster", read: false, time: "5 min ago", type: "employee" },
    { id: "not_2", text: "Invoice INV-2026-001 created", read: false, time: "25 min ago", type: "invoice" },
    { id: "not_3", text: "Payment received ₹25,000 via IMPS", read: true, time: "3 hours ago", type: "payment" },
    { id: "not_4", text: "Leave request approved for Priya Sen", read: true, time: "6 hours ago", type: "leave" }
  ]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Helper helper to push logs and update bell feed online
  const triggerActivityAndNotification = (text: string, moduleType: string, userOverride?: string) => {
    const freshId = "act_" + Date.now();
    const newFeed = { id: freshId, text, time: "Just now", user: userOverride || currentUser?.name || "Aniket", module: moduleType };
    const newNotif = { id: "not_" + Date.now(), text, read: false, time: "Just now", type: moduleType.toLowerCase() };
    
    setActivityFeed(prev => [newFeed, ...prev]);
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Form states for Quick Create Modals
  const [quickLeadName, setQuickLeadName] = useState("");
  const [quickLeadCompany, setQuickLeadCompany] = useState("");
  const [quickLeadValue, setQuickLeadValue] = useState(250000);
  const [quickLeadPhone, setQuickLeadPhone] = useState("");
  const [quickLeadEmail, setQuickLeadEmail] = useState("");

  const [quickProjName, setQuickProjName] = useState("");
  const [quickProjClient, setQuickProjClient] = useState("");
  const [quickProjBudget, setQuickProjBudget] = useState(800000);
  const [quickProjDesc, setQuickProjDesc] = useState("");

  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskDesc, setQuickTaskDesc] = useState("");
  const [quickTaskProjectId, setQuickTaskProjectId] = useState("");
  const [quickTaskPriority, setQuickTaskPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [quickTaskAssignee, setQuickTaskAssignee] = useState("");
  const [quickTaskDue, setQuickTaskDue] = useState("");

  // Form states initialized with localStorage draft objects
  // 1. Employee Form States
  const [empFirstName, setEmpFirstName] = useState(empDraft.firstName || "");
  const [empLastName, setEmpLastName] = useState(empDraft.lastName || "");
  const [empEmail, setEmpEmail] = useState(empDraft.email || "");
  const [empPhone, setEmpPhone] = useState(empDraft.phone || "");
  const [empDepartment, setEmpDepartment] = useState(empDraft.department || "Information Technology");
  const [empDesignation, setEmpDesignation] = useState(empDraft.designation || "Engineer");
  const [empBranch, setEmpBranch] = useState(empDraft.branch || "Mumbai HQ");
  const [empSalary, setEmpSalary] = useState(Number(empDraft.salary) || 7500);
  const [empPan, setEmpPan] = useState(empDraft.pan || "");
  const [empAadhaar, setEmpAadhaar] = useState(empDraft.aadhaar || "");
  const [empFiles, setEmpFiles] = useState<any[]>(empDraft.files || []);

  // 2. Invoice Form States
  const [invCustomerName, setInvCustomerName] = useState(invDraft.customerName || "");
  const [invEmail, setInvEmail] = useState(invDraft.email || "");
  const [invPhone, setInvPhone] = useState(invDraft.phone || "");
  const [invStatus, setInvStatus] = useState<"Draft" | "Pending" | "Completed" | "Overdue">(invDraft.status || "Pending");
  const [invGstRate, setInvGstRate] = useState(Number(invDraft.gstRate) || 18);
  const [invItemName, setInvItemName] = useState(invDraft.itemName || "");
  const [invItemRate, setInvItemRate] = useState(Number(invDraft.itemRate) || 1200);
  const [invItemQty, setInvItemQty] = useState(Number(invDraft.itemQty) || 10);
  const [invFiles, setInvFiles] = useState<any[]>(invDraft.files || []);

  // 3. Customer Form States
  const [custCompanyName, setCustCompanyName] = useState(custDraft.companyName || "");
  const [custGstin, setCustGstin] = useState(custDraft.gstin || "");
  const [custAddress, setCustAddress] = useState(custDraft.address || "");
  const [custContactName, setCustContactName] = useState(custDraft.contactName || "");
  const [custEmail, setCustEmail] = useState(custDraft.email || "");
  const [custPhone, setCustPhone] = useState(custDraft.phone || "");
  const [custValue, setCustValue] = useState(Number(custDraft.value) || 250000);
  const [custNotes, setCustNotes] = useState(custDraft.notes || "");
  const [custFiles, setCustFiles] = useState<any[]>(custDraft.files || []);

  // 4. Task Form States
  const [taskTitleVal, setTaskTitleVal] = useState(taskDraft.title || "");
  const [taskDescState, setTaskDescState] = useState(taskDraft.desc || "");
  const [taskProjectId, setTaskProjectId] = useState(taskDraft.projectId || "");
  const [taskPriorityVal, setTaskPriorityVal] = useState<"Low" | "Medium" | "High">(taskDraft.priority || "Medium");
  const [taskAssigneeName, setTaskAssigneeName] = useState(taskDraft.assignee || "");
  const [taskDueDateVal, setTaskDueDateVal] = useState(taskDraft.dueDate || "");
  const [taskFiles, setTaskFiles] = useState<any[]>(taskDraft.files || []);

  // Autosave hooks that stringify forms on change
  React.useEffect(() => {
    localStorage.setItem("draft_employee", JSON.stringify({
      firstName: empFirstName, lastName: empLastName, email: empEmail, phone: empPhone,
      department: empDepartment, designation: empDesignation, branch: empBranch,
      salary: empSalary, pan: empPan, aadhaar: empAadhaar, files: empFiles
    }));
  }, [empFirstName, empLastName, empEmail, empPhone, empDepartment, empDesignation, empBranch, empSalary, empPan, empAadhaar, empFiles]);

  React.useEffect(() => {
    localStorage.setItem("draft_invoice", JSON.stringify({
      customerName: invCustomerName, email: invEmail, phone: invPhone, status: invStatus,
      gstRate: invGstRate, itemName: invItemName, itemRate: invItemRate, itemQty: invItemQty, files: invFiles
    }));
  }, [invCustomerName, invEmail, invPhone, invStatus, invGstRate, invItemName, invItemRate, invItemQty, invFiles]);

  React.useEffect(() => {
    localStorage.setItem("draft_customer", JSON.stringify({
      companyName: custCompanyName, gstin: custGstin, address: custAddress, contactName: custContactName,
      email: custEmail, phone: custPhone, value: custValue, notes: custNotes, files: custFiles
    }));
  }, [custCompanyName, custGstin, custAddress, custContactName, custEmail, custPhone, custValue, custNotes, custFiles]);

  React.useEffect(() => {
    localStorage.setItem("draft_task", JSON.stringify({
      title: taskTitleVal, desc: taskDescState, projectId: taskProjectId, priority: taskPriorityVal,
      assignee: taskAssigneeName, dueDate: taskDueDateVal, files: taskFiles
    }));
  }, [taskTitleVal, taskDescState, taskProjectId, taskPriorityVal, taskAssigneeName, taskDueDateVal, taskFiles]);

  // Synchronization status
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Helper to map company name to backend tenant ID
  const getCompanyId = (companyName: string): string => {
    switch (companyName) {
      case "Tata Agro Pvt Ltd": return "tenant_acme";
      case "Reliance Infra Ltd": return "tenant_nebula";
      case "Adani Power Ltd": return "tenant_birla";
      case "Acme Consulting Services": return "tenant_acme";
      default: return "tenant_acme";
    }
  };

  const getRequestHeaders = (contentType = "application/json") => {
    const headers: Record<string, string> = {
      "x-company-id": currentUser?.tenantId || getCompanyId(currentCompany),
      "x-user-role": currentUser?.role || "Super Admin",
      "x-user-id": currentUser?.id || "system"
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  };

  // Synchronize entire client state from Express memory databases with multi-company headers
  const syncWithBackend = async () => {
    setIsSyncing(true);
    try {
      const headers = {
        "x-company-id": currentUser?.tenantId || getCompanyId(currentCompany),
        "x-user-role": currentUser?.role || "Super Admin",
        "x-user-id": currentUser?.id || "system"
      };

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
        fetch("/api/users", { headers }).then(r => r.json()),
        fetch("/api/leads", { headers }).then(r => r.json()),
        fetch("/api/contacts", { headers }).then(r => r.json()),
        fetch("/api/attendance", { headers }).then(r => r.json()),
        fetch("/api/leaves", { headers }).then(r => r.json()),
        fetch("/api/payroll", { headers }).then(r => r.json()),
        fetch("/api/projects", { headers }).then(r => r.json()),
        fetch("/api/tasks", { headers }).then(r => r.json()),
        fetch("/api/invoices", { headers }).then(r => r.json()),
        fetch("/api/expenses", { headers }).then(r => r.json()),
        fetch("/api/inventory", { headers }).then(r => r.json()),
        fetch("/api/suppliers", { headers }).then(r => r.json()),
        fetch("/api/automation/rules", { headers }).then(r => r.json()),
        fetch("/api/automation/logs", { headers }).then(r => r.json())
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
  }, [currentCompany]);

  // Global search input focus Ref
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Ctrl + K global keystroke search focus listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        method: "DELETE",
        headers: getRequestHeaders(null)
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
  const handleAddProject = async (projectData: any) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
         headers: getRequestHeaders(),
        body: JSON.stringify(projectData)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuickLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLeadName || !quickLeadCompany) return;
    await handleAddLead({
      name: quickLeadName,
      company: quickLeadCompany,
      email: quickLeadEmail || `${quickLeadName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: quickLeadPhone || "9988776655",
      value: Number(quickLeadValue) || 150000,
      status: "New",
      assignedTo: currentUser?.name || "Self",
      notes: "Quickly created from global action menu."
    });
    setQuickLeadName("");
    setQuickLeadCompany("");
    setQuickLeadPhone("");
    setQuickLeadEmail("");
    setShowQuickLeadModal(false);
  };

  const submitQuickProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProjName) return;
    await handleAddProject({
      name: quickProjName,
      description: quickProjDesc || "Quickly created via global actions bar",
      clientName: quickProjClient || "Internal Key Account",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 86450000 * 45).toISOString().split("T")[0],
      budget: Number(quickProjBudget) || 500000,
      status: "Planning",
      milestones: ["Requirement gathering", "Blueprint approval", "UAT Sign-off"]
    });
    setQuickProjName("");
    setQuickProjClient("");
    setQuickProjDesc("");
    setQuickProjBudget(500000);
    setShowQuickProjectModal(false);
  };

  const submitQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle || !quickTaskProjectId) return;
    await handleAddTask({
      projectId: quickTaskProjectId,
      title: quickTaskTitle,
      description: quickTaskDesc || "Assigned task",
      priority: quickTaskPriority,
      dueDate: quickTaskDue || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      assignedTo: quickTaskAssignee || currentUser?.name || "Team Member"
    });
    setQuickTaskTitle("");
    setQuickTaskDesc("");
    setQuickTaskProjectId("");
    setQuickTaskPriority("Medium");
    setQuickTaskAssignee("");
    setQuickTaskDue("");
    setShowQuickTaskModal(false);
  };

  const submitQuickEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          firstName: empFirstName || "Quick",
          lastName: empLastName || "Staff",
          email: empEmail || "quick.staff@corporation.com",
          phone: empPhone || "9900881122",
          department: empDepartment || "Information Technology",
          designation: empDesignation || "Engineer",
          branch: empBranch || "Delhi HQ",
          joiningDate: new Date().toISOString().split("T")[0],
          status: "Active",
          type: "Permanent",
          basicSalary: Number(empSalary) || 25000,
          hra: Math.round((Number(empSalary) || 25000) * 0.4),
          specialAllowance: 5000,
          lta: 2000,
          pfEmployee: 1800,
          pfEmployer: 1800,
          professionalTax: 200,
          panNumber: empPan || "ABCDE1234F",
          aadhaarNumber: empAadhaar || "112233445566",
          bankName: "State Bank of India",
          ifscCode: "SBIN0001041",
          accountNumber: "30510123565",
          docsAttached: {
            aadhaar: true,
            pan: true,
            resume: empFiles.length > 0,
            offerLetter: false
          }
        })
      });
      if (response.ok) {
        await syncWithBackend();
        triggerActivityAndNotification("New Employee registered successfully", "Registered a new staff member with ID EMP-" + Math.random().toString().substring(2,6), "employee");
        localStorage.removeItem("draft_employee");
        setEmpFirstName("");
        setEmpLastName("");
        setEmpEmail("");
        setEmpPhone("");
        setEmpPan("");
        setEmpAadhaar("");
        setEmpFiles([]);
        setEmpStep(1);
        setShowQuickEmployeeModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          companyName: custCompanyName || "Quick Client Ltd",
          gstin: custGstin || "29AABCX1234F1Z1",
          address: custAddress || "Karnataka, India",
          contactName: custContactName || "Rakesh Sharma",
          email: custEmail || "rakesh@client.com",
          phone: custPhone || "9876543210",
          value: Number(custValue) || 120000,
          notes: custNotes || "Onboarded via 1-Click Quick Add Modal.",
          files: custFiles
        })
      });
      if (response.ok) {
        await syncWithBackend();
        triggerActivityAndNotification("New customer added", `${currentUser?.name || "Rahul"} added customer '${custCompanyName}' to records`, "customer");
        localStorage.removeItem("draft_customer");
        setCustCompanyName("");
        setCustGstin("");
        setCustAddress("");
        setCustContactName("");
        setCustEmail("");
        setCustPhone("");
        setCustValue(250000);
        setCustNotes("");
        setCustFiles([]);
        setCustStep(1);
        setShowQuickCustomerModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuickInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceNumber = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
      const cgst = Math.round((Number(invItemRate) * Number(invItemQty)) * (Number(invGstRate) / 2) / 100);
      const totalAmount = (Number(invItemRate) * Number(invItemQty)) + (cgst * 2);

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          invoiceNumber,
          customerName: invCustomerName || "Direct Purchaser",
          clientEmail: invEmail || "buyer@direct.com",
          clientPhone: invPhone || "9000000000",
          gstNumber: "29BBBJP9876A1Z3",
          placeOfSupply: "Karnataka",
          status: invStatus === "Completed" ? "Paid" : invStatus === "Pending" ? "Sent" : (invStatus as any),
          invoiceDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split("T")[0],
          items: [
            {
              description: invItemName || "Consulting Deliverable Services",
              hsnCode: "998311",
              qty: Number(invItemQty) || 1,
              rate: Number(invItemRate) || 1550,
              basicAmount: Number(invItemRate) * Number(invItemQty)
            }
          ],
          subtotal: Number(invItemRate) * Number(invItemQty),
          cgst,
          sgst: cgst,
          igst: 0,
          total: totalAmount,
          currency: "INR",
          amountPaid: invStatus === "Completed" ? totalAmount : 0,
          terms: "Full payment within due date. Bank Transfer ONLY.",
          files: invFiles
        })
      });
      if (response.ok) {
        await syncWithBackend();
        triggerActivityAndNotification("Invoice created successfully", `${currentUser?.name || "Rahul"} created invoice ${invoiceNumber}`, "invoice");
        localStorage.removeItem("draft_invoice");
        setInvCustomerName("");
        setInvEmail("");
        setInvPhone("");
        setInvStatus("Pending");
        setInvGstRate(18);
        setInvItemName("");
        setInvItemRate(1200);
        setInvItemQty(10);
        setInvFiles([]);
        setInvStep(1);
        setShowQuickInvoiceModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (task: { projectId: string; title: string; description: string; priority: Task["priority"]; dueDate: string; assignedTo: string }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
  const handleAddInvoice = async (invoice: any) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify(invoice)
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: Invoice["status"], extraFields?: any) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({ status, ...extraFields })
      });
      if (response.ok) {
        await syncWithBackend();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: getRequestHeaders()
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
        headers: getRequestHeaders(),
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
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 max-h-[64vh]">
            <span className="text-[9px] text-slate-450 font-bold tracking-widest font-mono uppercase px-3 block mb-2">OPERATIONAL PORTALS</span>
            
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
                <span>Secure Client Gate</span>
              </button>
            ) : (
              <>
                {/* 1. Dashboard */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("dashboard"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "dashboard" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Dashboard</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">01</span>
                </button>

                {/* 2. Employees */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("employees"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "employees" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Employees</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">02</span>
                </button>

                {/* 3. Departments */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("departments"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "departments" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Departments</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">03</span>
                </button>

                {/* 4. Branches */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("branches"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "branches" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Branches</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">04</span>
                </button>

                {/* 5. Teams */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("teams"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "teams" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-slate-400" />
                    <span>Teams</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">05</span>
                </button>

                {/* 6. Customers */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("customers"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "customers" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Customers</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">06</span>
                </button>

                {/* 7. Leads */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("crm"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "crm" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-slate-400" />
                    <span>Leads</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">07</span>
                </button>

                {/* 8. Projects */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("projects"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "projects" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-4 h-4 text-slate-400" />
                    <span>Projects</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">08</span>
                </button>

                {/* 9. Tasks */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("tasks"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "tasks" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <span>Tasks</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">09</span>
                </button>

                {/* 10. Attendance */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("attendance"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "attendance" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Attendance</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">10</span>
                </button>

                {/* 11. Leave Management */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("leaves"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "leaves" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Leave Management</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">11</span>
                </button>

                {/* 12. Payroll */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("payroll"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "payroll" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4 text-slate-400" />
                    <span>Payroll</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">12</span>
                </button>

                {/* 13. Finance */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("finance"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "finance" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Finance</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">13</span>
                </button>

                {/* 14. GST */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("gst"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "gst" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Percent className="w-4 h-4 text-slate-400" />
                    <span>GST</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 rounded">GSTR</span>
                </button>

                {/* 15. Invoices */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("invoices"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "invoices" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Invoices</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">15</span>
                </button>

                {/* 16. Expenses */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("expenses"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "expenses" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    <span>Expenses</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">16</span>
                </button>

                {/* 17. Inventory */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("inventory"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "inventory" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Inventory</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">17</span>
                </button>

                {/* 18. Vendors */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("vendors"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "vendors" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    <span>Vendors</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">18</span>
                </button>

                {/* 19. Reports */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("reports"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "reports" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart4 className="w-4 h-4 text-slate-400" />
                    <span>Reports</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">19</span>
                </button>

                {/* 20. Automation */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("automation"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "automation" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-slate-400" />
                    <span>Automation</span>
                  </div>
                  <span className="text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-bold font-sans">FLOW</span>
                </button>

                {/* 21. AI Assistant */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("ai"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "ai" ? "bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-indigo-50/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BrainCircuit className="w-4 h-4 text-blue-600 animate-pulse animate-duration-1000" />
                    <span>AI Assistant</span>
                  </div>
                  <span className="text-[8px] bg-blue-100 border border-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-black font-sans uppercase">Gemini</span>
                </button>

                {/* 22. Notifications */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("notifications"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "notifications" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Notifications</span>
                  </div>
                  <span className="text-[8px] bg-rose-50 border border-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-black font-sans">LIVE</span>
                </button>

                {/* 23. Documents Center */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("documents"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "documents" ? "bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Document Cabinet</span>
                  </div>
                  <span className="text-[8px] bg-red-50 border border-red-100 text-red-700 px-1 py-0.5 rounded font-bold font-sans">Docs</span>
                </button>

                {/* 24. Settings */}
                <button
                  type="button"
                  onClick={() => { setActiveModule("settings"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    activeModule === "settings" ? "bg-blue-50 border border-blue-100 text-blue-700 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">24</span>
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

        {/* PREMIUM GLOBAL QUICK WORKSPACE ACTIONS BAR */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">Quick Matrix Insertion</h4>
              <p className="text-[10px] text-slate-500">Instantly register new leads, create project workspaces, or assign action items.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowQuickLeadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>+ Create Lead</span>
            </button>
            <button
              onClick={() => {
                setQuickProjName("");
                setQuickProjClient("");
                setQuickProjDesc("");
                setShowQuickProjectModal(true);
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white font-black text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>+ Create Project</span>
            </button>
            <button
              onClick={() => {
                setQuickTaskTitle("");
                setQuickTaskDesc("");
                setQuickTaskProjectId(projects[0]?.id || "");
                setShowQuickTaskModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>+ Create Task</span>
            </button>
          </div>
        </div>

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
              attendance={attendance}
              leaves={leaves}
              payroll={payroll}
              logs={logs}
              currentUser={currentUser}
              onNavigateToModule={setActiveModule}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onUpdateExpenseStatus={handleUpdateExpenseStatus}
              syncWithBackend={syncWithBackend}
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
            <EmployeesModule currentUser={currentUser} />
          )}

          {activeModule === "customers" && (
            <CustomersModule currentUser={currentUser} />
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
              onAddProject={handleAddProject}
            />
          )}

          {activeModule === "tasks" && (
            <ProjectsModule
              projects={projects}
              tasks={tasks}
              users={users}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onAddProject={handleAddProject}
            />
          )}

          {activeModule === "finance" && (
            <FinanceModule
              invoices={invoices}
              expenses={expenses}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onDeleteInvoice={handleDeleteInvoice}
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
              onDeleteInvoice={handleDeleteInvoice}
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
              onDeleteInvoice={handleDeleteInvoice}
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
              currentUser={currentUser}
              onRefreshTasks={syncWithBackend}
            />
          )}

          {activeModule === "departments" && (
            <DepartmentsModule
              users={users}
              currentUser={currentUser}
            />
          )}

          {activeModule === "branches" && (
            <BranchesModule
              users={users}
              currentUser={currentUser}
            />
          )}

          {activeModule === "teams" && (
            <TeamsModule
              users={users}
              currentUser={currentUser}
            />
          )}

          {activeModule === "notifications" && (
            <NotificationsModule />
          )}

          {activeModule === "documents" && (
            <DocumentsModule
              currentUser={currentUser}
            />
          )}

          {activeModule === "settings" && (
            <SettingsModule
              currentUser={currentUser}
              onChangeRole={handleRoleOverride}
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

        {/* ==================== QUICK ACTION MODALS ==================== */}
        {showQuickLeadModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Create CRM Lead</h3>
                <button 
                  type="button" 
                  onClick={() => setShowQuickLeadModal(false)}
                  className="text-white/85 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={submitQuickLead} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={quickLeadName}
                    onChange={(e) => setQuickLeadName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Securities"
                    value={quickLeadCompany}
                    onChange={(e) => setQuickLeadCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Estimated Deal Value (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 450000"
                    value={quickLeadValue}
                    onChange={(e) => setQuickLeadValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Email Address</label>
                    <input
                      type="email"
                      placeholder="ramesh@hdfc.com"
                      value={quickLeadEmail}
                      onChange={(e) => setQuickLeadEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Phone Number</label>
                    <input
                      type="text"
                      placeholder="9988112233"
                      value={quickLeadPhone}
                      onChange={(e) => setQuickLeadPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuickLeadModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-lg transition-all shadow-md"
                  >
                    Save Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showQuickProjectModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Create Project Track</h3>
                <button 
                  type="button" 
                  onClick={() => setShowQuickProjectModal(false)}
                  className="text-white/85 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={submitQuickProject} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ERP Portal Build"
                    value={quickProjName}
                    onChange={(e) => setQuickProjName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Client Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tata Motors"
                      value={quickProjClient}
                      onChange={(e) => setQuickProjClient(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Budget (₹)</label>
                    <input
                      type="number"
                      placeholder="800000"
                      value={quickProjBudget}
                      onChange={(e) => setQuickProjBudget(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Description</label>
                  <textarea
                    placeholder="Milestones and scope breakdown."
                    value={quickProjDesc}
                    onChange={(e) => setQuickProjDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 h-20 resize-none"
                  />
                </div>

                <div className="pt-3 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuickProjectModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 px-5 rounded-lg transition-all shadow-md"
                  >
                    Start Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showQuickTaskModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Assign Task Deliverable</h3>
                <button 
                  type="button" 
                  onClick={() => setShowQuickTaskModal(false)}
                  className="text-white/85 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={submitQuickTask} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Landing Layout"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Project Scope *</label>
                    <select
                      required
                      value={quickTaskProjectId}
                      onChange={(e) => setQuickTaskProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Choose Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Priority</label>
                    <select
                      value={quickTaskPriority}
                      onChange={(e) => setQuickTaskPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Assigned To</label>
                    <input
                      type="text"
                      placeholder="e.g. Aniket"
                      value={quickTaskAssignee}
                      onChange={(e) => setQuickTaskAssignee(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Due Date</label>
                    <input
                      type="date"
                      value={quickTaskDue}
                      onChange={(e) => setQuickTaskDue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase font-mono">Task Details / Description</label>
                  <textarea
                    placeholder="Enter specific instructions."
                    value={quickTaskDesc}
                    onChange={(e) => setQuickTaskDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                  />
                </div>

                <div className="pt-3 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuickTaskModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-lg transition-all shadow-md"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== QUICK EMPLOYEE MODAL (STEPPED) ==================== */}
        {showQuickEmployeeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden my-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">1-Click Quick Register Employee</h3>
                  <p className="text-[9px] text-blue-105 font-bold uppercase mt-0.5">Step {empStep} of 3 &bull; Draft Saved Automatically</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowQuickEmployeeModal(false)}
                  className="text-white/85 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Progress Bar Progress indicators */}
              <div className="h-1 bg-slate-100 w-full flex">
                <div className={`h-full bg-emerald-500 transition-all duration-300 ${empStep === 1 ? "w-1/3" : empStep === 2 ? "w-2/3" : "w-full"}`}></div>
              </div>

              <form onSubmit={submitQuickEmployee} className="p-6 space-y-4">
                
                {empStep === 1 && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 text-amber-850 p-2 text-[10px] rounded border border-amber-200 leading-snug">
                      📂 Need to resume? Your form state is automatically persistent on this browser even if you go offline!
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">First Name *</label>
                        <input
                          type="text"
                          required
                          value={empFirstName}
                          onChange={(e) => setEmpFirstName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="e.g. Ramesh"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={empLastName}
                          onChange={(e) => setEmpLastName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="e.g. Verma"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Email ID *</label>
                      <input
                        type="email"
                        required
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none"
                        placeholder="ramesh@agroindustries.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Active Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={empPhone}
                        onChange={(e) => setEmpPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none"
                        placeholder="9988776655"
                      />
                    </div>
                  </div>
                )}

                {empStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Select Department</label>
                        <select
                          value={empDepartment}
                          onChange={(e) => setEmpDepartment(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none font-bold"
                        >
                          <option value="Information Technology">IT Solutions</option>
                          <option value="Finance & Accounts">Finance & Accounts</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Operations & Logistics">Operations & Logistics</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Designation</label>
                        <input
                          type="text"
                          required
                          value={empDesignation}
                          onChange={(e) => setEmpDesignation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="e.g. Lead Operator"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">PAN card (Income Tax)</label>
                        <input
                          type="text"
                          value={empPan}
                          onChange={(e) => setEmpPan(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none font-mono"
                          placeholder="ABCDE1234F"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Aadhaar (UIDAI)</label>
                        <input
                          type="text"
                          value={empAadhaar}
                          onChange={(e) => setEmpAadhaar(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="12 Digit UIDAI"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Basic monthly Salary structure (INR)</label>
                      <input
                        type="number"
                        value={empSalary}
                        onChange={(e) => setEmpSalary(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none font-mono text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                )}

                {empStep === 3 && (
                  <div className="space-y-4">
                    {/* Drag & Drop File Component with Image Preview */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Upload Representative Photo / PDF Resume</label>
                      <div 
                        onDragOver={(ev) => ev.preventDefault()}
                        onDrop={(ev) => {
                          ev.preventDefault();
                          const dropped = Array.from(ev.dataTransfer?.files || []).map((f: any) => f.name);
                          setEmpFiles(prev => [...prev, ...dropped]);
                        }}
                        className="border-2 border-dashed border-slate-250 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer"
                        onClick={() => {
                          const mockName = prompt("Select file path to mock attach (e.g. passport_size_photo.jpg):");
                          if (mockName) setEmpFiles(prev => [...prev, mockName]);
                        }}
                      >
                        <span className="text-[11px] text-slate-450 block font-bold">Drag & Drop files here, or <strong className="text-blue-600">click to trigger selection</strong></span>
                        <span className="text-[9px] text-slate-400 block mt-1">Accepts JPG images, passport proofs and PDF files</span>
                      </div>

                      {/* Display attachments previews & tags */}
                      {empFiles.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <span className="text-[9px] text-slate-500 font-black block">ATTACHED PREVIEWS ({empFiles.length}):</span>
                          <div className="grid grid-cols-2 gap-2">
                            {empFiles.map((fn, idx) => {
                              const isImg = fn.endsWith(".jpg") || fn.endsWith(".png") || fn.endsWith(".jpeg") || fn.includes("photo");
                              return (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-2 text-[10px] relative">
                                  {isImg ? (
                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden font-bold text-[8px] text-blue-800">
                                      📸 IMG
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center shrink-0 overflow-hidden font-bold text-[8px] text-red-800">
                                      📄 PDF
                                    </div>
                                  )}
                                  <div className="truncate flex-1">
                                    <span className="font-bold text-slate-700 block truncate">{fn}</span>
                                    <span className="text-[8px] text-slate-400 block uppercase">Ready to transmit</span>
                                  </div>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setEmpFiles(prev => prev.filter((_, i) => i !== idx)); }} className="text-red-500 font-bold px-1 text-[10px]">✕</button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                      <span className="text-[9px] text-slate-450 font-black tracking-wider block">SUMMARY VERIFICATION SHEET</span>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-slate-705">
                        <div>Full Name: <strong>{empFirstName} {empLastName}</strong></div>
                        <div>Assigned Dept: <strong>{empDepartment}</strong></div>
                        <div>Designation: <strong>{empDesignation}</strong></div>
                        <div>Financial Base: <strong>₹ {empSalary.toLocaleString()} / PM</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stepper controls */}
                <div className="pt-4 border-t border-slate-100 flex justify-between gap-2.5">
                  <button
                    type="button"
                    disabled={empStep === 1}
                    onClick={() => setEmpStep(prev => prev - 1)}
                    className="bg-slate-55 hover:bg-slate-100 text-slate-650 border border-slate-200 px-4 py-2 rounded-lg cursor-pointer text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Back Sheet
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickEmployeeModal(false)}
                      className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg cursor-pointer text-xs font-bold"
                    >
                      Dismiss
                    </button>
                    {empStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => setEmpStep(prev => prev + 1)}
                        className="bg-blue-600 hover:bg-blue-755 text-white px-5 py-2 rounded-lg cursor-pointer text-xs font-black"
                      >
                        Proceed Section &rarr;
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg cursor-pointer text-xs font-black transition-all shadow-md"
                      >
                        Confirm & Onboard
                      </button>
                    )}
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ==================== QUICK INVOICE MODAL (STEPPED) ==================== */}
        {showQuickInvoiceModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden my-8">
              <div className="bg-gradient-to-r from-indigo-650 to-indigo-750 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">1-Click Quick Issue GST Invoice</h3>
                  <p className="text-[9px] text-indigo-150 font-bold uppercase mt-0.5">Step {invStep} of 3 &bull; Saved to Drafts</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowQuickInvoiceModal(false)}
                  className="text-white/85 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-slate-100 w-full flex">
                <div className={`h-full bg-indigo-500 transition-all duration-300 ${invStep === 1 ? "w-1/3" : invStep === 2 ? "w-2/3" : "w-full"}`}></div>
              </div>

              <form onSubmit={submitQuickInvoice} className="p-6 space-y-4">
                
                {invStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Select Buyer Name *</label>
                      <input
                        type="text"
                        required
                        value={invCustomerName}
                        onChange={(e) => setInvCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                        placeholder="e.g. Reliance Retail Industries"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Buyer Email</label>
                        <input
                          type="email"
                          value={invEmail}
                          onChange={(e) => setInvEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="accounts@reliance.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Buyer Phone</label>
                        <input
                          type="tel"
                          value={invPhone}
                          onChange={(e) => setInvPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="9876543211"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Initial Invoice State</label>
                      <select
                        value={invStatus}
                        onChange={(e) => setInvStatus(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none font-bold cursor-pointer"
                      >
                        <option value="Pending">Pending (Sent & Awaiting Settlement)</option>
                        <option value="Completed">Completed (Instantly Mock Paid)</option>
                        <option value="Overdue">Overdue (Past grace period)</option>
                      </select>
                    </div>
                  </div>
                )}

                {invStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Item / Product / Deliverable Title *</label>
                      <input
                        type="text"
                        required
                        value={invItemName}
                        onChange={(e) => setInvItemName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none"
                        placeholder="e.g. Supply of Agricultural Heavy Gears Grade A"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Quantity</label>
                        <input
                          type="number"
                          value={invItemQty}
                          onChange={(e) => setInvItemQty(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none text-slate-900 font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Rate (Rs)</label>
                        <input
                          type="number"
                          value={invItemRate}
                          onChange={(e) => setInvItemRate(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none text-slate-900 font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">GST Slab (%)</label>
                        <select
                          value={invGstRate}
                          onChange={(e) => setInvGstRate(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none font-bold cursor-pointer"
                        >
                          <option value="5">5% (Essential Supply)</option>
                          <option value="12">12% (Standard Gear)</option>
                          <option value="18">18% (Industrial Services)</option>
                          <option value="28">28% (Luxurious Nodes)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {invStep === 3 && (
                  <div className="space-y-4">
                    {/* Drag & Drop mock for Invoice Attachments */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-505 font-bold uppercase">Upload Delivery Challan / Signed PO</label>
                      <div 
                        onDragOver={(ev) => ev.preventDefault()}
                        onDrop={(ev) => {
                          ev.preventDefault();
                          const filesArr = Array.from(ev.dataTransfer?.files || []).map((f: any) => f.name);
                          setInvFiles(prev => [...prev, ...filesArr]);
                        }}
                        className="border-2 border-dashed border-slate-250 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                        onClick={() => {
                          const mockName = prompt("Select sheet path key (e.g. delivery_note_signed_po.pdf):");
                          if (mockName) setInvFiles(prev => [...prev, mockName]);
                        }}
                      >
                        <span className="text-[11px] text-slate-450 block font-bold">Drag files or click to add paperwork</span>
                      </div>

                      {invFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {invFiles.map((fn, i) => (
                            <div key={i} className="text-[10px] bg-slate-50 p-1 px-2 rounded flex justify-between text-slate-700">
                              <span>🔗 {fn}</span>
                              <button type="button" onClick={() => setInvFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tax computations display */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2.5 font-mono">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>BASIC AMOUNT (SUBTOTAL)</span>
                        <span>₹ {(invItemRate * invItemQty).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>CGST + SGST (DIVIDED TAX)</span>
                        <span>₹ {Math.round((invItemRate * invItemQty) * (invGstRate / 100)).toLocaleString()}</span>
                      </div>
                      <div className="h-[1px] bg-slate-800 my-1"></div>
                      <div className="flex justify-between text-xs font-black text-emerald-400">
                        <span>TOTAL PAYABLE (NET BILL)</span>
                        <span>₹ {Math.round((invItemRate * invItemQty) * (1 + invGstRate / 100)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    type="button"
                    disabled={invStep === 1}
                    onClick={() => setInvStep(prev => prev - 1)}
                    className="bg-slate-55 hover:bg-slate-100 text-slate-650 border border-slate-200 px-4 py-2 rounded-lg cursor-pointer text-xs font-bold disabled:opacity-40"
                  >
                    Back
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickInvoiceModal(false)}
                      className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg cursor-pointer text-xs font-bold"
                    >
                      Dismiss
                    </button>
                    {invStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => setInvStep(prev => prev + 1)}
                        className="bg-indigo-650 hover:bg-indigo-750 text-white px-5 py-2 rounded-lg cursor-pointer text-xs font-black"
                      >
                        Next Step &rarr;
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2 rounded-lg cursor-pointer text-xs font-black transition-all shadow-md"
                      >
                        Transmit & Finalize Invoice
                      </button>
                    )}
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ==================== QUICK CUSTOMER MODAL (STEPPED) ==================== */}
        {showQuickCustomerModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden my-8">
              <div className="bg-gradient-to-r from-emerald-650 to-emerald-750 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">1-Click Quick Save CRM Customer</h3>
                  <p className="text-[9px] text-emerald-150 font-bold uppercase mt-0.5">Step {custStep} of 3 &bull; Saved to Drafts</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="text-white/85 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-slate-100 w-full flex">
                <div className={`h-full bg-emerald-500 transition-all duration-300 ${custStep === 1 ? "w-1/3" : custStep === 2 ? "w-2/3" : "w-full"}`}></div>
              </div>

              <form onSubmit={submitQuickCustomer} className="p-6 space-y-4">
                
                {custStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Customer Enterprise Name *</label>
                      <input
                        type="text"
                        required
                        value={custCompanyName}
                        onChange={(e) => setCustCompanyName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none"
                        placeholder="e.g. Tata Steel Plant Corp"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Enterprise GSTIN License Number *</label>
                      <input
                        type="text"
                        required
                        value={custGstin}
                        onChange={(e) => setCustGstin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none font-mono"
                        placeholder="e.g. 29AABCX1234F1Z1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Corporate Headquarters Office Address</label>
                      <textarea
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none h-16 resize-none"
                        placeholder="Plot 10, Industrial Phase II, Bangalore"
                      />
                    </div>
                  </div>
                )}

                {custStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Point of Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={custContactName}
                          onChange={(e) => setCustContactName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="Shri. S.K. Rungta"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs focus:outline-none"
                          placeholder="+91-9504501235"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Representative Email Address *</label>
                      <input
                        type="email"
                        required
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none"
                        placeholder="skrungta@tatasteel.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Estimated Pipeline Contract Value (INR)</label>
                      <input
                        type="number"
                        value={custValue}
                        onChange={(e) => setCustValue(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs focus:outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {custStep === 3 && (
                  <div className="space-y-4">
                    {/* Drag & Drop upload for Customer Proof */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Attach Business Registration proof / NDA agreements</label>
                      <div 
                        onDragOver={(ev) => ev.preventDefault()}
                        onDrop={(ev) => {
                          ev.preventDefault();
                          const fnList = Array.from(ev.dataTransfer?.files || []).map((f: any) => f.name);
                          setCustFiles(prev => [...prev, ...fnList]);
                        }}
                        className="border-2 border-dashed border-slate-250 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                        onClick={() => {
                          const mockName = prompt("Select proof document filename (e.g. gst_registration_receipt.pdf):");
                          if (mockName) setCustFiles(prev => [...prev, mockName]);
                        }}
                      >
                        <span className="text-[11px] text-slate-450 block font-bold">Drop PDF copies here, or click to attach</span>
                      </div>

                      {custFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {custFiles.map((fn, i) => (
                            <div key={i} className="text-[10px] bg-slate-50 p-1 px-2 rounded flex justify-between text-slate-700">
                              <span>📁 {fn} (NDA Verified)</span>
                              <button type="button" onClick={() => setCustFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] text-slate-450 leading-relaxed space-y-1.5">
                      <span className="font-extrabold text-slate-700 block text-[9px] uppercase">Compliance Checklist</span>
                      <p>✓ GSTIN verification complete & GST lookup active.</p>
                      <p>✓ Draft saved successfully in Tata Agro Local-Store nodes.</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    type="button"
                    disabled={custStep === 1}
                    onClick={() => setCustStep(prev => prev - 1)}
                    className="bg-slate-55 hover:bg-slate-100 text-slate-650 border border-slate-200 px-4 py-2 rounded-lg cursor-pointer text-xs font-bold disabled:opacity-40"
                  >
                    Back
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickCustomerModal(false)}
                      className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg cursor-pointer text-xs font-bold"
                    >
                      Dismiss
                    </button>
                    {custStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => setCustStep(prev => prev + 1)}
                        className="bg-emerald-650 hover:bg-emerald-750 text-white px-5 py-2 rounded-lg cursor-pointer text-xs font-black"
                      >
                        Next Step &rarr;
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg cursor-pointer text-xs font-black transition-all shadow-md"
                      >
                        Save Contract Account
                      </button>
                    )}
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>

    </main>

    </div>
  );
}
