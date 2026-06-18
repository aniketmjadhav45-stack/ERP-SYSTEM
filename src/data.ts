import { Role, Tenant, UserProfile, Lead, Contact, Attendance, LeaveRequest, PayrollRecord, Project, Task, Invoice, Expense, Product, Supplier, AutomationRule, AutomationLog } from "./types";

export const defaultTenants: Tenant[] = [
  { id: "tenant_acme", name: "Acme Enterprises Ltd", domain: "acme.erp.com", plan: "Enterprise", createdAt: "2024-01-10" },
  { id: "tenant_nebula", name: "Nebula Digital Systems", domain: "nebula.erp.com", plan: "Growth", createdAt: "2025-03-15" }
];

export const defaultUsers: UserProfile[] = [
  { id: "user_super", email: "super@acme.erp.com", name: "Sarah Jenkins", role: Role.SUPER_ADMIN, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80", department: "Executive Board", phone: "+1 (555) 019-2834" },
  { id: "user_admin", email: "admin@acme.erp.com", name: "Marcus Fletcher", role: Role.ADMIN, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80", department: "Operations", phone: "+1 (555) 012-3456" },
  { id: "user_manager", email: "manager@acme.erp.com", name: "Clara Oswald", role: Role.MANAGER, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&q=80", department: "Product Team", phone: "+1 (555) 013-4567" },
  { id: "user_hr", email: "hr@acme.erp.com", name: "Devon Alistair", role: Role.HR, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80", department: "Human Resources", phone: "+1 (555) 014-5678" },
  { id: "user_sales", email: "sales@acme.erp.com", name: "Alex Mercer", role: Role.SALES, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80", department: "Global Sales", phone: "+1 (555) 015-6789" },
  { id: "user_finance", email: "finance@acme.erp.com", name: "Sophia Reynolds", role: Role.FINANCE, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&q=80", department: "Treasury Team", phone: "+1 (555) 016-7890" },
  { id: "user_employee", email: "employee@acme.erp.com", name: "Jared Leto", role: Role.EMPLOYEE, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces&q=80", department: "Engineering", phone: "+1 (555) 017-8901", salary: 7500, skills: ["React", "TypeScript", "Node.js"] },
  { id: "user_customer", email: "customer@example.net", name: "David Miller", role: Role.CUSTOMER, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80", department: "External Core", phone: "+1 (555) 018-9012" },
  { id: "user_vendor", email: "contractors@vandex.com", name: "Vandex Supplies", role: Role.VENDOR, tenantId: "tenant_acme", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces&q=80", department: "External Logistics", phone: "+1 (555) 019-0123" }
];

export const defaultLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Jessica Jones",
    company: "Marvelous Tech Corp",
    email: "jj@marveltech.com",
    phone: "+1 (555) 234-9090",
    value: 75000,
    status: "Qualified",
    assignedTo: "Alex Mercer",
    createdAt: "2026-05-12",
    updatedAt: "2026-06-15",
    notes: "Very interested in dynamic integrations and automated financial reporting modules. Budget approved.",
    timeline: [
      { id: "tl_1", type: "email", text: "Sent technical spec document.", date: "2026-06-15" },
      { id: "tl_2", type: "meeting", text: "Demo call completed. Evaluated payroll and timesheet workflow.", date: "2026-06-10" },
      { id: "tl_3", type: "call", text: "Initial discovery session. Formulating custom quote.", date: "2026-05-18" }
    ]
  },
  {
    id: "lead_2",
    name: "Thomas Wayne",
    company: "Wayne Enterprises",
    email: "ceo@waynecorp.com",
    phone: "+1 (555) 999-bat1",
    value: 350000,
    status: "Proposal",
    assignedTo: "Alex Mercer",
    createdAt: "2026-04-01",
    updatedAt: "2026-06-17",
    notes: "Requires a massive custom inventory management tracking system mapped across 12 satellite storage depots.",
    timeline: [
      { id: "tl_4", type: "status", text: "Status changed to Proposal by Alex Mercer", date: "2026-06-17" },
      { id: "tl_5", type: "meeting", text: "Formal RFP submitted and under executive review.", date: "2026-06-02" }
    ]
  },
  {
    id: "lead_3",
    name: "Arthur Dent",
    company: "Megadodo Publications",
    email: "guide@hitchhiker.org",
    phone: "+44 20 7946 0958",
    value: 42000,
    status: "Contacted",
    assignedTo: "Sarah Jenkins",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-03",
    notes: "Evaluating general project milestones templates and email automation systems. Needs standard SaaS layout.",
    timeline: [
      { id: "tl_6", type: "call", text: "Called for initial setup overview. Promised template checklists.", date: "2026-06-03" }
    ]
  }
];

export const defaultContacts: Contact[] = [
  { id: "c_1", name: "Jessica Jones", role: "VP Operations", company: "Marvelous Tech Corp", email: "jj@marveltech.com", phone: "+1 (555) 234-9090", lastContactDate: "2026-06-15" },
  { id: "c_2", name: "Lucius Fox", role: "CTO", company: "Wayne Enterprises", email: "lfox@waynecorp.com", phone: "+1 (555) 999-1234", lastContactDate: "2026-06-12" },
  { id: "c_3", name: "Trillian Astro", role: "Head of Communications", company: "Megadodo Publications", email: "trillian@megadodo.org", phone: "+44 20 7946 0199", lastContactDate: "2026-06-08" }
];

export const defaultAttendance: Attendance[] = [
  { id: "att_1", userId: "user_employee", userName: "Jared Leto", date: "2026-06-17", clockIn: "08:58", clockOut: "17:34", status: "present", hoursWorked: 8.6 },
  { id: "att_2", userId: "user_employee", userName: "Jared Leto", date: "2026-06-16", clockIn: "09:12", clockOut: "17:05", status: "present", hoursWorked: 7.9 },
  { id: "att_3", userId: "user_employee", userName: "Jared Leto", date: "2026-06-15", clockIn: "08:45", clockOut: "18:00", status: "present", hoursWorked: 9.25 },
  { id: "att_4", userId: "user_sales", userName: "Alex Mercer", date: "2026-06-17", clockIn: "09:00", clockOut: "17:00", status: "remote", hoursWorked: 8.0 },
  { id: "att_5", userId: "user_manager", userName: "Clara Oswald", date: "2026-06-17", clockIn: "08:55", clockOut: "18:12", status: "present", hoursWorked: 9.2 }
];

export const defaultLeaves: LeaveRequest[] = [
  { id: "le_1", userId: "user_employee", userName: "Jared Leto", leaveType: "Sick", startDate: "2026-06-10", endDate: "2026-06-11", status: "Approved", reason: "Severe dental procedure followed by wisdom teeth rest.", requestedAt: "2026-06-08" },
  { id: "le_2", userId: "user_manager", userName: "Clara Oswald", leaveType: "Annual", startDate: "2026-07-20", endDate: "2026-07-31", status: "Pending", reason: "Extended summer break with system automation offloaded to deputy.", requestedAt: "2026-06-14" },
  { id: "le_3", userId: "user_sales", userName: "Alex Mercer", leaveType: "Personal", startDate: "2026-06-25", endDate: "2026-06-25", status: "Approved", reason: "Family commitment out of city.", requestedAt: "2026-06-12" }
];

export const defaultPayroll: PayrollRecord[] = [
  { id: "pay_1", userId: "user_employee", userName: "Jared Leto", month: "June 2026", baseSalary: 7500, bonus: 500, deductions: 280, netPay: 7720, status: "Draft" },
  { id: "pay_2", userId: "user_employee", userName: "Jared Leto", month: "May 2026", baseSalary: 7500, bonus: 0, deductions: 280, netPay: 7220, status: "Paid", paymentDate: "2026-05-30" },
  { id: "pay_3", userId: "user_sales", userName: "Alex Mercer", month: "June 2026", baseSalary: 6200, bonus: 1800, deductions: 210, netPay: 7790, status: "Approved" },
  { id: "pay_4", userId: "user_manager", userName: "Clara Oswald", month: "June 2026", baseSalary: 9100, bonus: 1200, deductions: 350, netPay: 9950, status: "Draft" }
];

export const defaultProjects: Project[] = [
  {
    id: "proj_1",
    name: "Enterprise ERP Upgrade",
    description: "Multi-tenant deployment of core accounting and real-time CRM updates for global rollout.",
    clientName: "Wayne Enterprises",
    startDate: "2026-05-10",
    endDate: "2026-11-30",
    budget: 180000,
    status: "In Progress",
    progress: 45,
    milestones: ["Requirements sign-off", "Prototype interface complete", "Database migration done", "User testing alpha"]
  },
  {
    id: "proj_2",
    name: "Automated Supply Chain Integration",
    description: "Designing real-time triggers mapping product SKUs directly with low-stock warnings and vendor purchase generation.",
    clientName: "Marvelous Tech Corp",
    startDate: "2026-06-01",
    endDate: "2026-09-15",
    budget: 95000,
    status: "In Progress",
    progress: 20,
    milestones: ["API specification matching", "Inventory module integration", "Vendor secure sign-on", "Deploy production pipeline"]
  }
];

export const defaultTasks: Task[] = [
  {
    id: "task_1",
    projectId: "proj_1",
    title: "Database Indexing & Sharding Strategy",
    description: "Address latency during massive transaction queries. Implement partition tags based on tenantId filters.",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-06-25",
    assignedTo: "Jared Leto",
    subtasks: [
      { id: "st_1", title: "Analyze telemetry logs", completed: true },
      { id: "st_2", title: "Implement compound columns", completed: false },
      { id: "st_3", title: "Run parallel queries test suite", completed: false }
    ],
    createdAt: "2026-06-10"
  },
  {
    id: "task_2",
    projectId: "proj_1",
    title: "Secure Google OpenID Integration",
    description: "Migrate client callbacks into robust server-side verified token assertions. Formulate mock payload overrides.",
    status: "Completed",
    priority: "Medium",
    dueDate: "2026-06-18",
    assignedTo: "Jared Leto",
    subtasks: [
      { id: "st_4", title: "Expose secure express callback route", completed: true },
      { id: "st_5", title: "Formulate claims structure matching roles", completed: true }
    ],
    createdAt: "2026-06-12"
  },
  {
    id: "task_3",
    projectId: "proj_2",
    title: "Supplier Stock Alert Automation Rule",
    description: "Build visual conditions interface enabling notifications when quantity drops below stock reorder threshold.",
    status: "Backlog",
    priority: "High",
    dueDate: "2026-07-02",
    assignedTo: "Clara Oswald",
    subtasks: [
      { id: "st_6", title: "Bind products schema with rules conditions", completed: false },
      { id: "st_7", title: "Create custom webhook dispatch triggers", completed: false }
    ],
    createdAt: "2026-06-14"
  }
];

export const defaultInvoices: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2026-0012",
    clientName: "Wayne Enterprises",
    clientEmail: "billing@waynecorp.com",
    issueDate: "2026-06-01",
    dueDate: "2026-06-30",
    items: [
      { description: "System Architecture Consulting, Phase 1", quantity: 60, unitPrice: 150, amount: 9000 },
      { description: "Dedicated Dev Container Host Pro", quantity: 3, unitPrice: 400, amount: 1200 }
    ],
    taxRate: 10,
    discount: 500,
    total: 10620,
    status: "Sent"
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2026-0010",
    clientName: "Marvelous Tech Corp",
    clientEmail: "finance@marveltech.com",
    issueDate: "2026-05-15",
    dueDate: "2026-06-15",
    items: [
      { description: "ERP Onboarding & Pilot License Pack", quantity: 12, unitPrice: 45, amount: 540 },
      { description: "Custom UI Branding Integration Suite", quantity: 1, unitPrice: 2500, amount: 2500 }
    ],
    taxRate: 15,
    discount: 0,
    total: 3496,
    status: "Paid"
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-2026-0008",
    clientName: "Vandex Supplies",
    clientEmail: "claims@vandex.com",
    issueDate: "2026-04-20",
    dueDate: "2026-05-20",
    items: [
      { description: "Logistics Optimization Modules Installation", quantity: 1, unitPrice: 5000, amount: 5000 }
    ],
    taxRate: 8,
    discount: 1000,
    total: 4200,
    status: "Overdue"
  }
];

export const defaultExpenses: Expense[] = [
  { id: "exp_1", category: "Software", amount: 1240, date: "2026-06-14", merchant: "Google Cloud Platform", status: "Approved", approvedBy: "Sophia Reynolds", description: "Storage buckets & LLM pipeline infrastructure token limits" },
  { id: "exp_2", category: "Travel", amount: 680, date: "2026-06-11", merchant: "Delta Express Lines", status: "Pending", description: "RFP presentation trip flights for Wayne Enterprises custom pipeline" },
  { id: "exp_3", category: "Office Supplies", amount: 245, date: "2026-06-03", merchant: "Staples Global Inc", status: "Approved", approvedBy: "Sophia Reynolds", description: "Ergonomic workspace accessories & accessories stack" }
];

export const defaultProducts: Product[] = [
  { id: "prod_1", sku: "ERP-M1-SYS", name: "Premium Enterprise License Host", category: "Core Software", stock: 1500, minStock: 200, unitPrice: 450, costPrice: 120, supplierId: "sup_1", supplierName: "Vandex Technical", location: "US-East Cloud Gateway" },
  { id: "prod_2", sku: "ERP-RXT-G2", name: "Automation System Pipeline Gateway Node", category: "Hardware Transceiver", stock: 14, minStock: 25, unitPrice: 1250, costPrice: 600, supplierId: "sup_2", supplierName: "LogiSilicon Parts", location: "Berlin Warehouse Zone B" },
  { id: "prod_3", sku: "CAB-OPT-10G", name: "Optical Fiber Bridge Transceiver 12-Lane", category: "Networking Accessories", stock: 320, minStock: 100, unitPrice: 85, costPrice: 32, supplierId: "sup_2", supplierName: "LogiSilicon Parts", location: "Berlin Warehouse Zone A" }
];

export const defaultSuppliers: Supplier[] = [
  { id: "sup_1", name: "Vandex Technical", contactName: "Alice Cooper", email: "acooper@vandex.com", phone: "+1 (555) 304-9844", productsSupplied: ["Premium Enterprise License Host", "Data Sharding Nodes"] },
  { id: "sup_2", name: "LogiSilicon Parts", contactName: "Kurt Coburn", email: "koburn@logisilicon.de", phone: "+49 30 8924370", productsSupplied: ["Automation System Pipeline Gateway Node", "Optical Fiber Bridge Transceiver 12-Lane"] }
];

export const defaultAutomationRules: AutomationRule[] = [
  { id: "rule_1", name: "Auto Task on Qualified Lead", trigger: "lead_status_changed", condition: "status === 'Qualified'", action: "create_task", actionPayload: { title: "Formulate Custom ERP proposal", description: "Draft the RFP outline based on customer requirements.", assignedTo: "Alex Mercer" }, active: true },
  { id: "rule_2", name: "Notify Finance on Low Stock", trigger: "inventory_low", condition: "stock < minStock", action: "send_email", actionPayload: { to: "finance@acme.erp.com", subject: "Critical Warning: Supply restock recommended immediately", body: "A gateway node element is below minimum reorder threshold." }, active: true },
  { id: "rule_3", name: "Auto Approve Dental Sick Leaves", trigger: "leave_request_submitted", condition: "leaveType === 'Sick' && reason.includes('dental')", action: "update_status", actionPayload: { status: "Approved" }, active: false }
];

export const defaultAutomationLogs: AutomationLog[] = [
  { id: "log_1", ruleName: "Auto Task on Qualified Lead", triggerEvent: "Lead Status Changed (Marvelous Tech Corp changed to Qualified)", actionTaken: "Created task 'Formulate Custom ERP proposal' assigned to Alex Mercer", timestamp: "2026-06-15 14:10:02", status: "Success" },
  { id: "log_2", ruleName: "Notify Finance on Low Stock", triggerEvent: "Inventory Alert (Automation System Pipeline Gateway Node stock is 14, min is 25)", actionTaken: "Dispatched warning email to Sophia Reynolds (Finance)", timestamp: "2026-06-17 09:30:15", status: "Success" }
];
