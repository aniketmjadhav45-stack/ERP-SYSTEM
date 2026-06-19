import { Role, Tenant, UserProfile, Lead, Contact, Attendance, LeaveRequest, PayrollRecord, Project, Task, Invoice, Expense, Product, Supplier, AutomationRule, AutomationLog } from "./types";

// Multi-tenant initial definitions
export const defaultTenants: Tenant[] = [
  { id: "tenant_acme", name: "Tata Agro Pvt Ltd", domain: "tataagro.erp.co.in", plan: "Enterprise", createdAt: "2024-01-10" },
  { id: "tenant_nebula", name: "Reliance Infra Ltd", domain: "relinfra.erp.co.in", plan: "Growth", createdAt: "2025-03-15" },
  { id: "tenant_quantum", name: "Birla Spun Pipes Ltd", domain: "birlaspun.erp.co.in", plan: "Scale-up", createdAt: "2026-06-01" }
];

// 10 Departments
export const defaultDepartments = [
  "Information Technology",
  "Finance & Accounts",
  "Human Resources",
  "Global Sales",
  "Marketing",
  "Engineering",
  "Operations",
  "Legal & Compliance",
  "Procurement",
  "Quality Assurance"
];

// 5 Branches
export const defaultBranches = [
  "Mumbai HQ",
  "Bengaluru Tech Park",
  "New Delhi Corporate Office",
  "Chennai Unit",
  "Pune R&D Center"
];

// 10 Teams
export const defaultTeams = [
  "Core Platform",
  "Tax Compliance",
  "Talent Acquisition",
  "Enterprise Sales",
  "Digital Marketing",
  "Logistics & Dispatch",
  "Security Auditing",
  "Quality Excellence",
  "Plant Automation",
  "R&D Lab 1"
];

const IndianFirstNames = [
  "Amit", "Rajiv", "Aditi", "Sameer", "Neha", "Priya", "Vikram", "Rohan", "Sanjay", "Karan", 
  "Ananya", "Devendra", "Deepak", "Aravind", "Meera", "Shreya", "Abhishek", "Vijay", "Sandhya", "Suresh", 
  "Dinesh", "Nisha", "Manish", "Sunita", "Tarun", "Ketan", "Rohit", "Vivek", "Pallavi", "Pooja"
];

const IndianLastNames = [
  "Sharma", "Verma", "Swamy", "Deshmukh", "Singhal", "Panday", "Johar", "Patel", "Mehta", "Iyer", 
  "Joshi", "Chawla", "Shenoy", "Gupta", "Bose", "Menon", "Reddy", "Nair", "Kulkarni", "Jadhav"
];

// Generate exactly 50 employees/user profiles
const generateUsers = (): UserProfile[] => {
  const users: UserProfile[] = [];
  
  // -- TATA AGRO (tenant_acme) --
  users.push({
    id: "EMP-001",
    email: "admin@tataagro.co.in",
    name: "Aniket Jadhav",
    role: Role.ADMIN,
    tenantId: "tenant_acme",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Executive Management",
    phone: "+91 98200 45678",
    salary: 180005,
    skills: ["Company Governance", "Strategic Administration"]
  });

  users.push({
    id: "EMP-002",
    email: "manager@tataagro.co.in",
    name: "Vikram Malhotra",
    role: Role.MANAGER,
    tenantId: "tenant_acme",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Information Technology",
    phone: "+91 98800 66666",
    salary: 150000,
    skills: ["Infrastructure Operations", "Team Leadership"]
  });

  users.push({
    id: "EMP-003",
    email: "employee@tataagro.co.in",
    name: "Rahul Verma",
    role: Role.EMPLOYEE,
    tenantId: "tenant_acme",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Engineering Development",
    phone: "+91 97700 88888",
    salary: 95000,
    skills: ["Software Engineering", "Product Implementation"]
  });

  // -- RELIANCE INFRA (tenant_nebula) --
  users.push({
    id: "EMP-004",
    email: "admin@relinfra.co.in",
    name: "Amit Sharma",
    role: Role.ADMIN,
    tenantId: "tenant_nebula",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Corporate Admin",
    phone: "+91 98211 44556",
    salary: 190000,
    skills: ["Infrastructure Planning", "Corporate Finance"]
  });

  users.push({
    id: "EMP-005",
    email: "manager@relinfra.co.in",
    name: "Priya Sen",
    role: Role.MANAGER,
    tenantId: "tenant_nebula",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Human Resources",
    phone: "+91 91200 44556",
    salary: 140000,
    skills: ["Personnel Management", "Conflict Resolution"]
  });

  users.push({
    id: "EMP-006",
    email: "employee@relinfra.co.in",
    name: "Sameer Patel",
    role: Role.EMPLOYEE,
    tenantId: "tenant_nebula",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Operations",
    phone: "+91 96200 11223",
    salary: 80000,
    skills: ["Ground Support", "Reporting"]
  });

  // -- BIRLA SPUN PIPES (tenant_quantum) --
  users.push({
    id: "EMP-007",
    email: "admin@birlaspun.co.in",
    name: "Kumar Birla",
    role: Role.ADMIN,
    tenantId: "tenant_quantum",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Executive Committee",
    phone: "+91 99300 22114",
    salary: 210000,
    skills: ["Heavy Operations", "Industrial Systems"]
  });

  users.push({
    id: "EMP-008",
    email: "manager@birlaspun.co.in",
    name: "Meera Nair",
    role: Role.MANAGER,
    tenantId: "tenant_quantum",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Quality Control",
    phone: "+91 95400 33221",
    salary: 155000,
    skills: ["Standard Verification", "Regulatory Compliance"]
  });

  users.push({
    id: "EMP-009",
    email: "employee@birlaspun.co.in",
    name: "Karan Joshi",
    role: Role.EMPLOYEE,
    tenantId: "tenant_quantum",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80",
    department: "Plant Operations",
    phone: "+91 91100 55555",
    salary: 85000,
    skills: ["Facility Support", "Machine Operations"]
  });

  return users;
};

export const defaultUsers: UserProfile[] = generateUsers();

// Leads pipeline elements
export const defaultLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Homi Bhabha",
    company: "Tata Motors Commercial",
    email: "hb@tatamotors.com",
    phone: "+91 22 6656 1212",
    value: 7500000,
    status: "Qualified",
    assignedTo: "Alex Mercer",
    createdAt: "2026-05-12",
    updatedAt: "2026-06-15",
    notes: "Requires complete custom payroll automation matching Indian PF regulations and Form-16 exports.",
    timeline: [
      { id: "tl_1", type: "email", text: "Sent custom e-payroll brochure and tax compliance sheet.", date: "2026-06-15" },
      { id: "tl_2", type: "meeting", text: "Completed product demonstration deck with finance specialists.", date: "2026-06-10" }
    ]
  },
  {
    id: "lead_2",
    name: "Mukesh Ambani",
    company: "Reliance Retail",
    email: "mukesh@ril.com",
    phone: "+91 22 3550 4400",
    value: 23500000,
    status: "Proposal",
    assignedTo: "Alex Mercer",
    createdAt: "2026-04-01",
    updatedAt: "2026-06-17",
    notes: "High capacity multi-warehouse inventory scheduler with automated reorder dispatch to Swaraj vendors.",
    timeline: [
      { id: "tl_4", type: "status", text: "Promoted to Proposal by Alex Mercer", date: "2026-06-17" }
    ]
  },
  {
    id: "lead_3",
    name: "Narayan Murthy",
    company: "Infosys Mysuru",
    email: "nmurthy@infosys.com",
    phone: "+91 80 2852 0261",
    value: 920000,
    status: "Contacted",
    assignedTo: "Sarah Jenkins",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-03",
    notes: "Reviewing lightweight team performance scorecard tracking options. Budget defined in Q3.",
    timeline: [
      { id: "tl_6", type: "call", text: "Cold discovery call completed. Customer was dynamic but compliant.", date: "2026-06-03" }
    ]
  }
];

// Add extra dynamic leads to round up CRM if needed
for (let i = 4; i <= 15; i++) {
  const compNames = ["Airtel Towers", "Wipro Cloud", "Delhi Metro Corp", "MRF Tyres Chennai", "Grasim Textile"];
  defaultLeads.push({
    id: `lead_${i}`,
    name: `${IndianFirstNames[i % IndianFirstNames.length]} ${IndianLastNames[i % IndianLastNames.length]}`,
    company: compNames[i % compNames.length] + ` Unit ${i}`,
    email: `contact${i}@${compNames[i % compNames.length].toLowerCase().replace(/\s/g, "")}.in`,
    phone: `+91 99000 ${10000 + i * 500}`,
    value: 1200000 + (i % 5) * 600000,
    status: i % 3 === 0 ? "Qualified" : i % 3 === 1 ? "New" : "Negotiation",
    assignedTo: "Alex Mercer",
    createdAt: "2026-05-18",
    updatedAt: "2026-06-18",
    notes: "Automated Lead Captured via website portal.",
    timeline: [{ id: `tl_auto_${i}`, type: "status", text: "Inbound Lead Synced", date: "2026-06-18" }]
  });
}

export const defaultContacts: Contact[] = [
  { id: "c_1", name: "Rajesh Gokhale", role: "VP Operations", company: "Hindalco Industries Ltd", email: "procurement@hindalco.adityabirla.com", phone: "+91 22 4900 8822", lastContactDate: "2026-06-15" },
  { id: "c_2", name: "Sudha Murthy", role: "MD Foundation", company: "Infosys Mysore Campus", email: "facilities.mysore@infosys.com", phone: "+91 821 2400 901", lastContactDate: "2026-06-12" },
  { id: "c_3", name: "Anil Ambani", role: "Chairman Corp", company: "Reliance Infra Ltd", email: "contact@relinfra.com", phone: "+91 79 3500 4400", lastContactDate: "2026-06-08" }
];

export const defaultAttendance: Attendance[] = [
  { id: "att_1", userId: "user_employee", userName: "Jared Leto", date: "2026-06-17", clockIn: "08:58", clockOut: "17:34", status: "present", hoursWorked: 8.6 },
  { id: "att_2", userId: "user_employee", userName: "Jared Leto", date: "2026-06-16", clockIn: "09:12", clockOut: "17:05", status: "present", hoursWorked: 7.9 },
  { id: "att_3", userId: "user_employee", userName: "Jared Leto", date: "2026-06-15", clockIn: "08:45", clockOut: "18:00", status: "present", hoursWorked: 9.25 },
  { id: "att_4", userId: "user_sales", userName: "Alex Mercer", date: "2026-06-17", clockIn: "09:00", clockOut: "17:00", status: "remote", hoursWorked: 8.0 },
  { id: "att_5", userId: "user_manager", userName: "Clara Oswald", date: "2026-06-17", clockIn: "08:55", clockOut: "18:12", status: "present", hoursWorked: 9.2 }
];

export const defaultLeaves: LeaveRequest[] = [
  { id: "le_1", userId: "user_employee", userName: "Jared Leto", leaveType: "Sick", startDate: "2026-06-10", endDate: "2026-06-11", status: "Approved", reason: "Severe root canal dental rest.", requestedAt: "2026-06-08" },
  { id: "le_2", userId: "user_manager", userName: "Clara Oswald", leaveType: "Annual", startDate: "2026-07-20", endDate: "2026-07-31", status: "Pending", reason: "Summer vacation with system automated backup.", requestedAt: "2026-06-14" },
  { id: "le_3", userId: "user_sales", userName: "Alex Mercer", leaveType: "Personal", startDate: "2026-06-25", endDate: "2026-06-25", status: "Approved", reason: "Family commitment out of state.", requestedAt: "2026-06-12" }
];

export const defaultPayroll: PayrollRecord[] = [
  { id: "pay_1", userId: "user_employee", userName: "Jared Leto", month: "June 2026", baseSalary: 75000, bonus: 5000, deductions: 2800, netPay: 77200, status: "Draft" },
  { id: "pay_2", userId: "user_employee", userName: "Jared Leto", month: "May 2026", baseSalary: 75000, bonus: 0, deductions: 2800, netPay: 72200, status: "Paid", paymentDate: "2026-05-30" },
  { id: "pay_3", userId: "user_sales", userName: "Alex Mercer", month: "June 2026", baseSalary: 62000, bonus: 18000, deductions: 2100, netPay: 77900, status: "Approved" },
  { id: "pay_4", userId: "user_manager", userName: "Clara Oswald", month: "June 2026", baseSalary: 121000, bonus: 12000, deductions: 3500, netPay: 129500, status: "Draft" }
];

// Generate exactly 20 Projects
const generateProjects = (): Project[] => {
  const projs: Project[] = [];
  const clientNamesPool = [
    "Hindalco Industries Ltd", "Infosys Mysore Campus", "Godrej Properties", 
    "Tata Motors Commercial", "Reliance Retail", "Wipro Cloud Solutions"
  ];
  
  const statusPool: ("Planning" | "In Progress" | "On Hold" | "Completed")[] = [
    "In Progress", "Planning", "Completed", "On Hold", "In Progress"
  ];

  const projectTopics = [
    "ERP Localization Core", "GSTR Tax Filing Pipeline", "B2B Dispatch Scheduling", "HRMS Leave Automation",
    "Smart Warehouse SKU Radar", "Chennai Fab Solar Grid", "MCA Filing Optimizer", "E-Invoicing Direct API",
    "Bengal Precision Calibration", "Tata Agro R&D Ledger", "Adani Solar Power Phase-IV", "Mumbai HQ Network Refit",
    "Noida Server Safe Migrations", "Pune Depot R&D Hub", "Wipro Cloud Safe Sync", "Gujarat Freight Line Opt",
    "PF Slip Form-16 Exporter", "ICICI Core Settlement Connect", "Airtel BHIM Gateway Node", "Reliance Retail Checkout Pro"
  ];

  for (let i = 0; i < 20; i++) {
    const idx = i;
    const progressVal = idx % 4 === 0 ? 100 : idx % 3 === 0 ? 0 : 25 + (idx * 3.5) % 70;
    
    projs.push({
      id: `proj_${idx + 1}`,
      name: projectTopics[idx % projectTopics.length],
      description: `Comprehensive integration and logistics setup for our Indian partner division mapped under corporate compliance guidelines.`,
      clientName: clientNamesPool[idx % clientNamesPool.length],
      startDate: "2026-05-10",
      endDate: "2026-11-30",
      budget: 450000 + (idx * 135000),
      status: progressVal === 100 ? "Completed" : progressVal === 0 ? "Planning" : statusPool[idx % statusPool.length],
      progress: Math.floor(progressVal),
      milestones: ["Kickoff Signoff", "Database Index Setup", "API Token Verified", "Deployment Production Ready"]
    });
  }
  return projs;
};

export const defaultProjects: Project[] = generateProjects();

// Generate exactly 200 Tasks mapped across projects and people
const generateTasks = (): Task[] => {
  const tArr: Task[] = [];
  const taskKeywords = [
    "Optimize partition index", "Configure GSTIN verification payload", "Validate PAN verification callback", 
    "Verify PF rules compliance", "Draft MCA corporate filing", "Submit Form-16 to test board", 
    "Calibrate optical bridge node", "Audit warehouse stock SKU limit", "Design BHIM UPI payment form", 
    "Implement SSL credential validation", "Authorize manager expense limits", "Refactor Express API controllers",
    "Build beautiful clickup visual boards", "Test multi-branch latency speeds", "Export CSV payroll logs",
    "Assemble team scorecard values", "Implement auto birthday reminder trigger", "Verify Aadhaar documentation checklist",
    "Test GSTR-1 excel import script", "Draft Swaraj Castings steel request"
  ];

  const priorityPool: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low", "Medium"];
  const statusPool: ("Backlog" | "In Progress" | "In Review" | "Completed")[] = ["Completed", "In Progress", "In Review", "Backlog"];

  for (let i = 0; i < 200; i++) {
    const projIdx = (i % 20) + 1;
    const assignee = defaultUsers[i % defaultUsers.length];
    const taskStatus = i % 5 === 0 ? "Completed" as const : statusPool[i % statusPool.length];
    
    tArr.push({
      id: `task_${i + 1}`,
      projectId: `proj_${projIdx}`,
      title: `${taskKeywords[i % taskKeywords.length]} #${i + 101}`,
      description: `Logistical action block to optimize and complete deliverable parameters under supervisory board rules.`,
      status: taskStatus,
      priority: priorityPool[i % priorityPool.length],
      dueDate: `2026-06-${20 + (i % 10)}`,
      assignedTo: assignee.name,
      subtasks: [
        { id: `st_${i}_1`, title: "Review corporate spec", completed: true },
        { id: `st_${i}_2`, title: "Execute staging build run", completed: i % 2 === 0 }
      ],
      createdAt: "2026-06-01"
    });
  }
  return tArr;
};

export const defaultTasks: Task[] = generateTasks();

export const defaultInvoices: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2026-0012",
    clientName: "Hindalco Industries Ltd",
    clientEmail: "billing@hindalco.com",
    issueDate: "2026-06-01",
    dueDate: "2026-06-30",
    items: [
      { description: "Enterprise Cloud ERP licenses", quantity: 60, unitPrice: 150, amount: 9000 },
      { description: "Custom MCA compliance setup", quantity: 1, unitPrice: 1620, amount: 1620 }
    ],
    taxRate: 18, // standard GST rate 18%
    discount: 500,
    total: 11442,
    status: "Sent"
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2026-0010",
    clientName: "Infosys Mysore Campus",
    clientEmail: "accounts@infosys.com",
    issueDate: "2026-05-15",
    dueDate: "2026-06-15",
    items: [
      { description: "Onboarding module customization", quantity: 12, unitPrice: 45, amount: 540 },
      { description: "Core database partition indexer", quantity: 1, unitPrice: 2500, amount: 2500 }
    ],
    taxRate: 18,
    discount: 0,
    total: 3587,
    status: "Paid"
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-2026-0008",
    clientName: "Reliance Retail",
    clientEmail: "finance@ril.com",
    issueDate: "2026-04-20",
    dueDate: "2026-05-20",
    items: [
      { description: "Supply Chain optimization consultation Services", quantity: 1, unitPrice: 5000, amount: 5000 }
    ],
    taxRate: 18,
    discount: 1000,
    total: 4720,
    status: "Overdue"
  }
];

export const defaultExpenses: Expense[] = [
  { id: "exp_1", category: "Software", amount: 1240, date: "2026-06-14", merchant: "Amazon Web Services (AWS)", status: "Approved", approvedBy: "Sophia Reynolds", description: "Multi-tenant container node compute hours" },
  { id: "exp_2", category: "Travel", amount: 680, date: "2026-06-11", merchant: "Chhatrapati Shivaji Domestic Terminal", status: "Pending", description: "Business presentation client meet at Reliance HQ" },
  { id: "exp_3", category: "Office Supplies", amount: 245, date: "2026-06-03", merchant: "Lamington Road Tech Supplies", status: "Approved", approvedBy: "Sophia Reynolds", description: "Printers ink, routers, CAT-6 optic patch cables" }
];

export const defaultProducts: Product[] = [
  { id: "prod_1", sku: "ERP-M1-SYS", name: "Premium Enterprise License Host", category: "Core Software", stock: 1500, minStock: 200, unitPrice: 450, costPrice: 120, supplierId: "sup_1", supplierName: "Vandex Technical", location: "Mumbai HQ Gateway" },
  { id: "prod_2", sku: "ERP-RXT-G2", name: "Automation System Pipeline Gateway Node", category: "Hardware Transceiver", stock: 14, minStock: 25, unitPrice: 1250, costPrice: 600, supplierId: "sup_2", supplierName: "Swaraj Castings India", location: "Chennai Depot Warehouse Zone A" },
  { id: "prod_3", sku: "CAB-OPT-10G", name: "Optical Fiber Bridge Transceiver 12-Lane", category: "Networking Accessories", stock: 320, minStock: 100, unitPrice: 85, costPrice: 32, supplierId: "sup_2", supplierName: "Swaraj Castings India", location: "Bengaluru Tech Park Zone B" }
];

// Generate exactly 25 Vendors/Suppliers
const generateSuppliers = (): Supplier[] => {
  const suppliers: Supplier[] = [
    { id: "sup_1", name: "Vandex Technical", contactName: "Alice Cooper", email: "acooper@vandex.com", phone: "+91 22 304 9844", productsSupplied: ["Premium Enterprise License Host", "Data Sharding Nodes"] },
    { id: "sup_2", name: "Swaraj Castings India", contactName: "Kurt Coburn", email: "koburn@logisilicon.de", phone: "+91 79 8924370", productsSupplied: ["Automation System Pipeline Gateway Node", "Optical Fiber Bridge Transceiver 12-Lane"] }
  ];

  const vendorNames = [
    "Bengal Precision Tooling", "Gujarat Petro-Packaging", "Siliguri Tea Sorters", "Coimbatore Motor Works", 
    "Ahmedabad Cotton Weaves", "Hyderabad Semiconductors", "Noida Optic Fibers", "Pune Metal Smelters", 
    "Nashik Agro-Boxes", "Salem Steel Foundries", "Odisha Ore Supplies", "Jamshedpur Heavy Parts", 
    "Ranchi Coal Washers", "Ludhiyana Bolts & Gears", "Meerut Cardboard Boxes", "Ernakulam Marine Cables", 
    "Bhopal Electronics Ltd", "Rajkot Machine Toolings", "Surat Diamond Sorters", "Visakhapatnam Shipping Hub",
    "Gwalior Cable Yards", "Faridabad Castings Unit", "Kanpur Leather Works"
  ];

  for (let i = 0; i < vendorNames.length; i++) {
    suppliers.push({
      id: `VEN-12-${100 + i}`,
      name: vendorNames[i],
      contactName: `${IndianFirstNames[i % IndianFirstNames.length]} ${IndianLastNames[i % IndianLastNames.length]}`,
      email: `procurement@${vendorNames[i].toLowerCase().replace(/\s/g, "")}.co.in`,
      phone: `+91 99011 ${22000 + i * 111}`,
      productsSupplied: ["Industrial Raw Chemicals", "Packaging Cartons", "Logistics Shipping Shuttles"]
    });
  }

  return suppliers;
};

export const defaultSuppliers: Supplier[] = generateSuppliers();

export const defaultAutomationRules: AutomationRule[] = [
  { id: "rule_1", name: "Auto Task on Qualified Lead", trigger: "lead_status_changed", condition: "status === 'Qualified'", action: "create_task", actionPayload: { title: "Formulate Custom ERP proposal", description: "Draft the RFP outline based on customer requirements.", assignedTo: "Alex Mercer" }, active: true },
  { id: "rule_2", name: "Notify Finance on Low Stock", trigger: "inventory_low", condition: "stock < minStock", action: "send_email", actionPayload: { to: "finance@tataagro.co.in", subject: "Critical Warning: Supply restock recommended immediately", body: "A gateway node element is below minimum reorder threshold." }, active: true },
  { id: "rule_3", name: "Auto Approve Dental Sick Leaves", trigger: "leave_request_submitted", condition: "leaveType === 'Sick' && reason.includes('dental')", action: "update_status", actionPayload: { status: "Approved" }, active: false }
];

export const defaultAutomationLogs: AutomationLog[] = [
  { id: "log_1", ruleName: "Auto Task on Qualified Lead", triggerEvent: "Lead Status Changed (Tata Motors Commercial changed to Qualified)", actionTaken: "Created task 'Formulate Custom ERP proposal' assigned to Alex Mercer", timestamp: "2026-06-15 14:10:02", status: "Success" },
  { id: "log_2", ruleName: "Notify Finance on Low Stock", triggerEvent: "Inventory Alert (Automation System Pipeline Gateway Node stock is 14, min is 25)", actionTaken: "Dispatched warning email to Sophia Reynolds (Finance)", timestamp: "2026-06-17 09:30:15", status: "Success" }
];
