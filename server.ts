import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

// Extend Express Request types to define multi-tenant metadata
declare global {
  namespace Express {
    interface Request {
      companyId?: string;
      userRole?: string;
      userId?: string;
    }
  }
}

// Load environment variables
dotenv.config();

// Initial database imports
import {
  defaultLeads,
  defaultContacts,
  defaultAttendance,
  defaultLeaves,
  defaultPayroll,
  defaultProjects,
  defaultTasks,
  defaultInvoices,
  defaultExpenses,
  defaultProducts,
  defaultSuppliers,
  defaultAutomationRules,
  defaultAutomationLogs,
  defaultUsers
} from "./src/data";
import { Role } from "./src/types";

// In-Memory Mutable Databases (Isolated per tenant)
let dbLeads: any[] = [];
let dbContacts: any[] = [];
let dbAttendance: any[] = [];
let dbLeaves: any[] = [];
let dbPayroll: any[] = [];
let dbProjects: any[] = [];
let dbTasks: any[] = [];
let dbInvoices: any[] = [];
let dbExpenses: any[] = [];
let dbProducts: any[] = [];
let dbSuppliers: any[] = [];
let dbRules: any[] = [];
let dbLogs: any[] = [];
let dbUsers = [...defaultUsers]; // Users already have tenantId distribution in defaultUsers

// Newly Added Multi-Tenant Modules DB
let dbDepartments: any[] = [];
let dbBranches: any[] = [];
let dbTeams: any[] = [];
let dbEmployees: any[] = [];
let dbCustomers: any[] = [];
let dbVendors: any[] = [];
let dbDocuments: any[] = [];

// Seeding helper to copy default arrays and inject required audit and tenant isolation fields
function seedTenantData<T>(defaults: T[], tenantId: string): T[] {
  return defaults.map((item: any, idx: number) => {
    const rawId = item.id || `se_idx_${idx}`;
    return {
      ...item,
      id: `${tenantId}_${rawId}`,
      company_id: tenantId,
      tenantId: tenantId, // both mappings to support components using different fields
      created_by: "system_seeder",
      updated_by: "system_seeder",
      created_at: new Date("2026-06-01T12:00:00Z").toISOString(),
      updated_at: new Date("2026-06-18T18:00:00Z").toISOString(),
    };
  });
}

// Seed sandbox corporate data across 3 Demo Companies (Companies A, B, and C)
const demoTenants = ["tenant_acme", "tenant_nebula", "tenant_quantum"];
demoTenants.forEach(tId => {
  dbLeads.push(...seedTenantData(defaultLeads, tId));
  dbContacts.push(...seedTenantData(defaultContacts, tId));
  dbAttendance.push(...seedTenantData(defaultAttendance, tId));
  dbLeaves.push(...seedTenantData(defaultLeaves, tId));
  dbPayroll.push(...seedTenantData(defaultPayroll, tId));
  dbProjects.push(...seedTenantData(defaultProjects, tId));
  dbTasks.push(...seedTenantData(defaultTasks, tId));
  dbInvoices.push(...seedTenantData(defaultInvoices, tId));
  dbExpenses.push(...seedTenantData(defaultExpenses, tId));
  dbProducts.push(...seedTenantData(defaultProducts, tId));
  dbSuppliers.push(...seedTenantData(defaultSuppliers, tId));
  dbRules.push(...seedTenantData(defaultAutomationRules, tId));
  dbLogs.push(...seedTenantData(defaultAutomationLogs, tId));

  // 1. Departments Seed for this tenant
  dbDepartments.push(...seedTenantData([
    { name: "Information Technology", code: "DEPT-IT", totalMembers: 12, head: "Marcus Fletcher", status: "Active" },
    { name: "Finance & Accounts", code: "DEPT-FIN", totalMembers: 6, head: "Sophia Reynolds", status: "Active" },
    { name: "Human Resources", code: "DEPT-HR", totalMembers: 4, head: "Devon Alistair", status: "Active" },
    { name: "Marketing & Strategy", code: "DEPT-MKT", totalMembers: 5, head: "Sarah Jenkins", status: "Active" }
  ], tId));

  // 2. Branches Seed for this tenant
  dbBranches.push(...seedTenantData([
    { name: `${tId === "tenant_acme" ? "Tata Agro HQ" : tId === "tenant_nebula" ? "Jio Park Terminal" : "Quantum Pipe Forge"}`, code: "BR-MUM-01", city: "Mumbai", gstNumber: "27AAAKT8851B1Z2", manager: "Sarah Jenkins", status: "Active" },
    { name: "Bengaluru Tech Hub", code: "BR-BLR-02", city: "Bengaluru", gstNumber: "29AAAKT9944C1ZA", manager: "Marcus Fletcher", status: "Active" },
    { name: "Hyderabad R&D Depot", code: "BR-HYD-03", city: "Hyderabad", gstNumber: "36AAAKT1122D1ZF", manager: "Clara Oswald", status: "Active" }
  ], tId));

  // 3. Teams Seed for this tenant
  dbTeams.push(...seedTenantData([
    { name: "Platform Infrastructure Group", department: "Information Technology", lead: "Marcus Fletcher", status: "Active", sprintVelocity: 42 },
    { name: "Tax Auditing Division", department: "Finance & Accounts", lead: "Sophia Reynolds", status: "Active", sprintVelocity: 35 },
    { name: "Global Talent Hunters", department: "Human Resources", lead: "Devon Alistair", status: "Active", sprintVelocity: 28 }
  ], tId));

  // 4. Employees Database List Seed for this tenant
  dbEmployees.push(...seedTenantData([
    { firstName: "Aravind", lastName: "Swamy", mobile: "+91 98450 11223", email: `aravind@${tId === "tenant_acme" ? "tataagro.in" : tId === "tenant_nebula" ? "relinfra.co.in" : "birlaspun.co.in"}`, gender: "Male", dob: "1988-05-15", bloodGroup: "O+", type: "Permanent", department: "Information Technology", designation: "Infrastructure Lead", branch: `${tId === "tenant_acme" ? "Tata Agro HQ" : tId === "tenant_nebula" ? "Jio Park Terminal" : "Quantum Pipe Forge"}`, manager: "Marcus Fletcher", joiningDate: "2021-08-01", location: "Mumbai", status: "Active", aadhaarNumber: "4567 8901 2345", panNumber: "ASWPM1100C", uanNumber: "100987654321", pfNumber: "MH/BAN/0012345/000/0101", bankName: "HDFC Bank Ltd", accountNumber: "5010043219807", ifscCode: "HDFC0000060", basicSalary: 65000, hra: 32500, bonus: 10000, ctc: 1350000, docsAttached: { aadhaar: true, pan: true, resume: true, offerLetter: true } },
    { firstName: "Priya", lastName: "Sharma", mobile: "+91 91220 88776", email: `priya@${tId === "tenant_acme" ? "tataagro.in" : tId === "tenant_nebula" ? "relinfra.co.in" : "birlaspun.co.in"}`, gender: "Female", dob: "1994-11-22", bloodGroup: "A+", type: "Permanent", department: "Finance & Accounts", designation: "Payroll Auditor", branch: "Bengaluru Tech Hub", manager: "Sophia Reynolds", joiningDate: "2023-01-15", location: "Bengaluru", status: "Active", aadhaarNumber: "8899 0011 2233", panNumber: "PRYSP4433D", uanNumber: "101234567890", pfNumber: "KN/BLR/0098765/000/0102", bankName: "ICICI Bank Ltd", accountNumber: "000401567821", ifscCode: "ICIC0000004", basicSalary: 52000, hra: 26050, bonus: 8000, ctc: 1080000, docsAttached: { aadhaar: true, pan: true, resume: true, offerLetter: true } }
  ], tId));

  // 5. Customers Seed for this tenant
  dbCustomers.push(...seedTenantData([
    { companyName: `${tId === "tenant_acme" ? "Tata Motors Ltd" : tId === "tenant_nebula" ? "Jio Infocomm" : "Aditya Birla Group"}`, contactPerson: "Rajesh Gokhale", email: `procurement@${tId}.in`, mobile: "+91 22 4900 8822", gstNumber: "27AAACG1111X1Z2", address: "Century Bhavan, Worli, Mumbai, Maharashtra", notes: "Enterprise landscaping client. Automatic GSTR-1 matching in GST module.", status: "Key Account", acquisitionValue: 850000 },
    { companyName: `${tId === "tenant_acme" ? "Aero India" : tId === "tenant_nebula" ? "Digital Rel Services" : "Birla Carbon"}`, contactPerson: "Sudha Murthy", email: `facilities@${tId}.co.in`, mobile: "+91 821 2400 901", gstNumber: "29AAACI9911C1ZA", address: "Hootagalli Sector 2, Mysuru, Karnataka", notes: "Regular orders and high consistency.", status: "Active", acquisitionValue: 450000 }
  ], tId));

  // 6. Vendors Seed for this tenant
  dbVendors.push(...seedTenantData([
    { name: "Kirloskar Engines Ltd", contactName: "Sanjay Kirloskar", email: "sanjay@kirloskar.com", phone: "+91 20 2581 0341", productsSupplied: ["Industrial Pipe Gears", "Coupler Seals"], address: "Karve Road, Pune, Maharashtra", gstNumber: "27AAACK1100F1ZD", status: "Active" },
    { name: "L&T Heavy Engineering", contactName: "Vikram Mehta", email: "vmehta@larsentoubro.com", phone: "+91 22 6705 9000", productsSupplied: ["Piping Joint Rings", "Heavy Pumps"], address: "Powai, Mumbai, Maharashtra", gstNumber: "27AAAAL1450H1Z8", status: "Active" }
  ], tId));

  // 7. Saved/Uploaded Documents Seed for this tenant
  dbDocuments.push(...seedTenantData([
    { name: "Corporate Incorporation Certificate.pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileSize: 185, fileFormat: "pdf", category: "Compliance Document" },
    { name: "GSTIN_Registration_Certificate.pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", fileSize: 342, fileFormat: "pdf", category: "Compliance Document" }
  ], tId));
});

// Lazy initialize Google Gen AI
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in Server environment variables");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// CENTRAL WORKSPACE SECURE MULTI-TENANT & RBAC INTERCEPTOR (Issues 1 & 2)
app.use((req, res, next) => {
  const companyId = req.headers["x-company-id"] as string;
  const userRole = req.headers["x-user-role"] as string;
  const userId = req.headers["x-user-id"] as string;

  // Skip static assets or public/health routes
  if (req.path.startsWith("/assets") || req.path === "/api/health") {
    return next();
  }

  // Fallback default values
  req.companyId = companyId || "tenant_acme";
  req.userRole = userRole || "Employee";
  req.userId = userId || "system";

  const path = req.path;

  // STRICT RBAC PERMISSION ROUTE VERIFICATIONS (Issue 2)
  if (userRole === "HR") {
    const isHrRoute = 
      path.includes("/users") || 
      path.includes("/employees") || 
      path.includes("/departments") || 
      path.includes("/branches") || 
      path.includes("/teams") || 
      path.includes("/leaves") || 
      path.includes("/payroll") || 
      path.includes("/attendance") ||
      path.includes("/documents") ||
      path.includes("/ai");
    
    if (!isHrRoute && (path.includes("/leads") || path.includes("/contacts") || path.includes("/customers") || path.includes("/vendors") || path.includes("/invoices") || path.includes("/expenses") || path.includes("/projects") || path.includes("/tasks") || path.includes("/inventory") || path.includes("/suppliers") || path.includes("/automation"))) {
      return res.status(403).json({ error: "Access Denied: HR Specialist lacks access permissions to Finance, CRM, or Sales pipelines." });
    }
  }

  if (userRole === "Finance") {
    const isFinanceRoute = 
      path.includes("/payroll") || 
      path.includes("/invoices") || 
      path.includes("/expenses") || 
      path.includes("/inventory") || 
      path.includes("/suppliers") || 
      path.includes("/vendors") ||
      path.includes("/documents") ||
      path.includes("/ai");
    
    if (!isFinanceRoute && (path.includes("/leads") || path.includes("/contacts") || path.includes("/users") || path.includes("/employees") || path.includes("/departments") || path.includes("/branches") || path.includes("/teams") || path.includes("/projects") || path.includes("/tasks") || path.includes("/leaves") || path.includes("/attendance") || path.includes("/automation"))) {
      return res.status(403).json({ error: "Access Denied: Finance Auditor lacks access permissions to HRMS profile rosters or CRM Leads." });
    }
  }

  if (userRole === "Employee") {
    const isAllowedEmployeeRoute = 
      path.includes("/projects") || 
      path.includes("/tasks") || 
      path.includes("/attendance") || 
      path.includes("/leaves") || 
      path.includes("/users") || 
      path.includes("/documents") ||
      path.includes("/ai");
    
    if (!isAllowedEmployeeRoute && (path.includes("/leads") || path.includes("/contacts") || path.includes("/customers") || path.includes("/vendors") || path.includes("/invoices") || path.includes("/expenses") || path.includes("/inventory") || path.includes("/suppliers") || path.includes("/automation") || path.includes("/payroll") || path.includes("/employees") || path.includes("/departments") || path.includes("/branches") || path.includes("/teams"))) {
      return res.status(403).json({ error: "Access Denied: Standard Employee holds primitive read privileges. Private corporate accounts are blocked." });
    }
  }

  next();
});

// MULTI-TENANT QUERY & AUDIT INJECTION HELPERS (Issue 1 & 5)
function getIsolatedData<T extends { company_id?: string; tenantId?: string }>(records: T[], req: express.Request): T[] {
  const reqCompanyId = req.headers["x-company-id"] as string || "tenant_acme";
  const userRole = req.headers["x-user-role"] as string || "Employee";

  // Block unauthorized cross-tenant requests. Filter by the active requested header company.
  return records.filter(r => {
    const itemCompany = r.company_id || r.tenantId;
    return itemCompany === reqCompanyId;
  });
}

function injectAuditFields<T>(record: T, req: express.Request, isNew = true): T {
  const now = new Date().toISOString();
  const userId = req.headers["x-user-id"] as string || "system";
  const companyId = req.headers["x-company-id"] as string || "tenant_acme";

  const auditObj: any = {
    company_id: companyId,
    tenantId: companyId,
    updated_by: userId,
    updated_at: now
  };

  if (isNew) {
    auditObj.created_by = userId;
    auditObj.created_at = now;
  }

  return { ...record, ...auditObj };
}

// REST API DEFINITION WITH AUTOMATIC AUDIT AND COMPANY FILTERS

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Users Roster
app.get("/api/users", (req, res) => {
  // Let's filter user profile registry by company_id correctly!
  const results = getIsolatedData(dbUsers, req);
  res.json(results);
});

app.post("/api/users", (req, res) => {
  let newUser = { id: "user_" + Date.now(), ...req.body };
  newUser = injectAuditFields(newUser, req, true);
  dbUsers.push(newUser);
  res.status(201).json(newUser);
});

// CRM Leads code with triggers
app.get("/api/leads", (req, res) => {
  const results = getIsolatedData(dbLeads, req);
  res.json(results);
});

app.post("/api/leads", (req, res) => {
  let newLead = {
    id: "lead_" + Date.now(),
    name: req.body.name || "Unnamed Lead",
    company: req.body.company || "Unnamed Company",
    email: req.body.email || "",
    phone: req.body.phone || "",
    value: Number(req.body.value) || 0,
    status: req.body.status || "New",
    assignedTo: req.body.assignedTo || "Alex Mercer",
    notes: req.body.notes || "",
    timeline: [{ id: "tl_" + Date.now(), type: "status" as const, text: "Lead profile created", date: new Date().toISOString().split("T")[0] }]
  };
  newLead = injectAuditFields(newLead, req, true);
  dbLeads.unshift(newLead);

  triggerAutomations("lead_status_changed", `${newLead.company} (Created)`, newLead, req);
  res.status(201).json(newLead);
});

app.put("/api/leads/:id", (req, res) => {
  const index = dbLeads.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    // Assert tenant check before update
    if (dbLeads[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied: Cross-company update blocked." });
    }
    const originalStatus = dbLeads[index].status;
    let updated = { ...dbLeads[index], ...req.body };
    updated = injectAuditFields(updated, req, false);

    const currentStatus = updated.status;
    if (originalStatus !== currentStatus) {
      updated.timeline = updated.timeline || [];
      updated.timeline.unshift({
        id: "tl_" + Date.now(),
        type: "status",
        text: `Status updated to ${currentStatus}`,
        date: new Date().toISOString().split("T")[0]
      });
      triggerAutomations("lead_status_changed", `${updated.company} (${currentStatus})`, updated, req);
    }

    dbLeads[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Lead not found" });
  }
});

app.delete("/api/leads/:id", (req, res) => {
  const index = dbLeads.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    if (dbLeads[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied: Cross-company delete blocked." });
    }
    dbLeads = dbLeads.filter(l => l.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Lead not found" });
  }
});

// Contacts Module
app.get("/api/contacts", (req, res) => {
  res.json(getIsolatedData(dbContacts, req));
});

app.post("/api/contacts", (req, res) => {
  let newContact = {
    id: "con_" + Date.now(),
    name: req.body.name || "New Contact",
    role: req.body.role || "",
    company: req.body.company || "",
    email: req.body.email || "",
    phone: req.body.phone || "",
    lastContactDate: new Date().toISOString().split("T")[0]
  };
  newContact = injectAuditFields(newContact, req, true);
  dbContacts.unshift(newContact);
  res.status(201).json(newContact);
});

// HRMS Attendance Endpoint
app.get("/api/attendance", (req, res) => {
  let results = getIsolatedData(dbAttendance, req);
  // If user is Employee role, restrict attendance view to their own! (Issue 2 Employee restriction)
  if (req.userRole === "Employee") {
    results = results.filter(a => a.userId === req.userId);
  }
  res.json(results);
});

app.post("/api/attendance", (req, res) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);
  const targetUserId = req.body.userId || req.userId;

  const existingIndex = dbAttendance.findIndex(a => a.userId === targetUserId && a.date === todayStr && a.company_id === req.companyId);

  if (existingIndex !== -1) {
    dbAttendance[existingIndex].clockOut = timeStr;
    const cin = dbAttendance[existingIndex].clockIn.split(":");
    const hours = (now.getHours() - Number(cin[0])) + (now.getMinutes() - Number(cin[1])) / 60;
    dbAttendance[existingIndex].hoursWorked = Number(hours.toFixed(2));
    dbAttendance[existingIndex] = injectAuditFields(dbAttendance[existingIndex], req, false);
    res.json(dbAttendance[existingIndex]);
  } else {
    let record = {
      id: "att_" + Date.now(),
      userId: targetUserId,
      userName: req.body.userName || "System User",
      date: todayStr,
      clockIn: timeStr,
      status: "present" as const,
      hoursWorked: 0
    };
    record = injectAuditFields(record, req, true);
    dbAttendance.unshift(record);
    res.status(201).json(record);
  }
});

// HRMS Leave Requests Endpoints
app.get("/api/leaves", (req, res) => {
  let results = getIsolatedData(dbLeaves, req);
  // If user is Employee role, restrict leaves view to their own! (Issue 2 Employee restriction)
  if (req.userRole === "Employee") {
    results = results.filter(l => l.userId === req.userId);
  }
  res.json(results);
});

app.post("/api/leaves", (req, res) => {
  let newLeave = {
    id: "le_" + Date.now(),
    userId: req.body.userId || req.userId,
    userName: req.body.userName || "Requestor",
    leaveType: req.body.leaveType,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    reason: req.body.reason,
    status: "Pending" as const,
    requestedAt: new Date().toISOString().split("T")[0]
  };
  newLeave = injectAuditFields(newLeave, req, true);
  dbLeaves.unshift(newLeave);

  triggerAutomations("leave_request_submitted", `${newLeave.userName} (${newLeave.leaveType})`, newLeave, req);
  res.status(201).json(newLeave);
});

app.put("/api/leaves/:id", (req, res) => {
  const index = dbLeaves.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    if (dbLeaves[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied: Cross-company action blocked." });
    }
    let updated = { ...dbLeaves[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbLeaves[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Leave request not found" });
  }
});

// HRMS Payroll Endpoints
app.get("/api/payroll", (req, res) => {
  res.json(getIsolatedData(dbPayroll, req));
});

app.post("/api/payroll", (req, res) => {
  let record = {
    id: "pay_" + Date.now(),
    userId: req.body.userId,
    userName: req.body.userName,
    month: req.body.month,
    basicSalary: Number(req.body.basicSalary),
    allowances: Number(req.body.allowances),
    deductions: Number(req.body.deductions),
    netPaid: Number(req.body.netPaid),
    status: req.body.status || "Pending"
  };
  record = injectAuditFields(record, req, true);
  dbPayroll.unshift(record);
  res.status(201).json(record);
});

app.put("/api/payroll/:id", (req, res) => {
  const index = dbPayroll.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    if (dbPayroll[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied: Cross-company action blocked." });
    }
    let updated = { ...dbPayroll[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbPayroll[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Payroll record not found" });
  }
});

// Projects Board Endpoints
app.get("/api/projects", (req, res) => {
  res.json(getIsolatedData(dbProjects, req));
});

app.post("/api/projects", (req, res) => {
  let project = {
    id: "proj_" + Date.now(),
    name: req.body.name || "Unnamed Project",
    status: req.body.status || "Planning",
    progress: Number(req.body.progress) || 0,
    client: req.body.client || "Self-Initiative",
    startDate: req.body.startDate || new Date().toISOString().split("T")[0],
    budget: Number(req.body.budget) || 0,
    color: req.body.color || "blue"
  };
  project = injectAuditFields(project, req, true);
  dbProjects.push(project);
  res.status(201).json(project);
});

app.put("/api/projects/:id", (req, res) => {
  const index = dbProjects.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    if (dbProjects[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied." });
    }
    let updated = { ...dbProjects[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbProjects[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});

// Tasks Board Endpoints
app.get("/api/tasks", (req, res) => {
  res.json(getIsolatedData(dbTasks, req));
});

app.post("/api/tasks", (req, res) => {
  let task = {
    id: "task_" + Date.now(),
    projectId: req.body.projectId,
    title: req.body.title || "Untitled Task",
    description: req.body.description || "",
    status: req.body.status || "Backlog",
    priority: req.body.priority || "Medium",
    dueDate: req.body.dueDate || "",
    assignedTo: req.body.assignedTo || "Alex Mercer",
    subtasks: req.body.subtasks || []
  };
  task = injectAuditFields(task, req, true);
  dbTasks.unshift(task);
  res.status(201).json(task);
});

app.put("/api/tasks/:id", (req, res) => {
  const index = dbTasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    if (dbTasks[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied." });
    }
    let updated = { ...dbTasks[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbTasks[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// Invoices Finance Endpoints
app.get("/api/invoices", (req, res) => {
  res.json(getIsolatedData(dbInvoices, req));
});

app.post("/api/invoices", (req, res) => {
  let invoice = {
    id: req.body.invoiceNumber || "INV-" + new Date().getFullYear() + "-" + Math.floor(1001 + Math.random() * 8999),
    customerName: req.body.customerName || "Walk-in Client",
    email: req.body.email || "",
    phone: req.body.phone || "",
    status: req.body.status || "Draft",
    items: req.body.items || [],
    gstRate: Number(req.body.gstRate) || 18,
    cgst: Number(req.body.cgst) || 0,
    sgst: Number(req.body.sgst) || 0,
    igst: Number(req.body.igst) || 0,
    subtotal: Number(req.body.subtotal) || 0,
    total: Number(req.body.total) || 0,
    dueDate: req.body.dueDate || new Date(Date.now() + 864 * 10 * 1000 * 100).toISOString().split("T")[0],
    ...req.body
  };
  invoice = injectAuditFields(invoice, req, true);
  dbInvoices.unshift(invoice);
  res.status(201).json(invoice);
});

app.put("/api/invoices/:id", (req, res) => {
  const index = dbInvoices.findIndex(i => i.id === req.params.id);
  if (index !== -1) {
    if (dbInvoices[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied." });
    }
    let updated = { ...dbInvoices[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbInvoices[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Invoice not found" });
  }
});

// Expenses Finance Endpoints
app.get("/api/expenses", (req, res) => {
  res.json(getIsolatedData(dbExpenses, req));
});

app.post("/api/expenses", (req, res) => {
  let expense = {
    id: "exp_" + Date.now(),
    category: req.body.category,
    amount: Number(req.body.amount) || 0,
    merchant: req.body.merchant || "Vendor Store",
    date: req.body.date || new Date().toISOString().split("T")[0],
    status: req.body.status || "Pending",
    description: req.body.description || "",
    fileUrl: req.body.fileUrl || "" // Supabase file storage url placeholder
  };
  expense = injectAuditFields(expense, req, true);
  dbExpenses.unshift(expense);
  res.status(201).json(expense);
});

app.put("/api/expenses/:id", (req, res) => {
  const index = dbExpenses.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    if (dbExpenses[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied." });
    }
    let updated = { ...dbExpenses[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbExpenses[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Expense not found" });
  }
});

// Inventory stock
app.get("/api/inventory", (req, res) => {
  res.json(getIsolatedData(dbProducts, req));
});

app.post("/api/inventory", (req, res) => {
  let product = {
    id: "prod_" + Date.now(),
    sku: req.body.sku || "SKU-" + Math.floor(100 + Math.random() * 900),
    name: req.body.name,
    category: req.body.category || "General",
    stock: Number(req.body.stock) || 0,
    minStock: Number(req.body.minStock) || 0,
    unitPrice: Number(req.body.unitPrice) || 0,
    costPrice: Number(req.body.costPrice) || 0,
    supplierId: req.body.supplierId || "",
    supplierName: req.body.supplierName || "Default Supplier",
    location: req.body.location || "Aisle 1"
  };
  product = injectAuditFields(product, req, true);
  dbProducts.push(product);

  if (product.stock < product.minStock) {
    triggerAutomations("inventory_low", `${product.name} (stock is ${product.stock})`, product, req);
  }
  res.status(201).json(product);
});

app.put("/api/inventory/:id", (req, res) => {
  const index = dbProducts.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    if (dbProducts[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied." });
    }
    let updated = { ...dbProducts[index], ...req.body };
    updated = injectAuditFields(updated, req, false);

    if (updated.stock < updated.minStock) {
      triggerAutomations("inventory_low", `${updated.name} (stock is ${updated.stock})`, updated, req);
    }
    dbProducts[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Suppliers / Vendors
app.get("/api/suppliers", (req, res) => {
  res.json(getIsolatedData(dbSuppliers, req));
});

app.post("/api/suppliers", (req, res) => {
  let supplier = {
    id: "sup_" + Date.now(),
    name: req.body.name,
    contactName: req.body.contactName || "Liaison Officer",
    email: req.body.email,
    phone: req.body.phone || "+91 22 2345 6789",
    productsSupplied: req.body.productsSupplied || []
  };
  supplier = injectAuditFields(supplier, req, true);
  dbSuppliers.push(supplier);
  res.status(201).json(supplier);
});

// MULTI-TENANT EXTRA ERP MODULES (Departments, Branches, Teams, Employees, Customers, Vendors, Documents)

app.get("/api/departments", (req, res) => {
  res.json(getIsolatedData(dbDepartments, req));
});

app.post("/api/departments", (req, res) => {
  let dept = { id: "dept_" + Date.now(), ...req.body };
  dept = injectAuditFields(dept, req, true);
  dbDepartments.push(dept);
  res.status(201).json(dept);
});

app.delete("/api/departments/:id", (req, res) => {
  const idx = dbDepartments.findIndex(d => d.id === req.params.id);
  if (idx !== -1) {
    if (dbDepartments[idx].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    dbDepartments = dbDepartments.filter(d => d.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Department not found" });
  }
});

app.get("/api/branches", (req, res) => {
  res.json(getIsolatedData(dbBranches, req));
});

app.post("/api/branches", (req, res) => {
  let branch = { id: "branch_" + Date.now(), ...req.body };
  branch = injectAuditFields(branch, req, true);
  dbBranches.push(branch);
  res.status(201).json(branch);
});

app.delete("/api/branches/:id", (req, res) => {
  const idx = dbBranches.findIndex(b => b.id === req.params.id);
  if (idx !== -1) {
    if (dbBranches[idx].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    dbBranches = dbBranches.filter(b => b.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Branch not found" });
  }
});

app.get("/api/teams", (req, res) => {
  res.json(getIsolatedData(dbTeams, req));
});

app.post("/api/teams", (req, res) => {
  let team = { id: "team_" + Date.now(), ...req.body };
  team = injectAuditFields(team, req, true);
  dbTeams.push(team);
  res.status(201).json(team);
});

app.delete("/api/teams/:id", (req, res) => {
  const idx = dbTeams.findIndex(t => t.id === req.params.id);
  if (idx !== -1) {
    if (dbTeams[idx].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    dbTeams = dbTeams.filter(t => d => d.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Team not found" });
  }
});

app.get("/api/employees", (req, res) => {
  res.json(getIsolatedData(dbEmployees, req));
});

app.post("/api/employees", (req, res) => {
  let emp = {
    id: "EMP-" + new Date().getFullYear() + "-" + Math.floor(1001 + Math.random() * 8999),
    ...req.body
  };
  emp = injectAuditFields(emp, req, true);
  dbEmployees.unshift(emp);
  res.status(201).json(emp);
});

app.put("/api/employees/:id", (req, res) => {
  const index = dbEmployees.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    if (dbEmployees[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    let updated = { ...dbEmployees[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbEmployees[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

app.delete("/api/employees/:id", (req, res) => {
  const idx = dbEmployees.findIndex(e => e.id === req.params.id);
  if (idx !== -1) {
    if (dbEmployees[idx].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    dbEmployees = dbEmployees.filter(e => e.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

app.get("/api/customers", (req, res) => {
  res.json(getIsolatedData(dbCustomers, req));
});

app.post("/api/customers", (req, res) => {
  let cust = {
    id: "CUST-" + new Date().getFullYear() + "-" + Math.floor(1001 + Math.random() * 8999),
    ...req.body
  };
  cust = injectAuditFields(cust, req, true);
  dbCustomers.unshift(cust);
  res.status(201).json(cust);
});

app.put("/api/customers/:id", (req, res) => {
  const index = dbCustomers.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    if (dbCustomers[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    let updated = { ...dbCustomers[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbCustomers[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Customer not found" });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const idx = dbCustomers.findIndex(c => c.id === req.params.id);
  if (idx !== -1) {
    if (dbCustomers[idx].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    dbCustomers = dbCustomers.filter(c => c.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Customer not found" });
  }
});

// Vendors Endpoints
app.get("/api/vendors", (req, res) => {
  res.json(getIsolatedData(dbVendors, req));
});

app.post("/api/vendors", (req, res) => {
  let v = { id: "vend_" + Date.now(), ...req.body };
  v = injectAuditFields(v, req, true);
  dbVendors.unshift(v);
  res.status(201).json(v);
});

app.delete("/api/vendors/:id", (req, res) => {
  const index = dbVendors.findIndex(v => v.id === req.params.id);
  if (index !== -1) {
    if (dbVendors[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied" });
    }
    dbVendors = dbVendors.filter(v => v.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Vendor not found" });
  }
});

// Documents / Compliance Attachment Center
app.get("/api/documents", (req, res) => {
  res.json(getIsolatedData(dbDocuments, req));
});

app.post("/api/documents", (req, res) => {
  let doc = {
    id: "doc_" + Date.now(),
    name: req.body.name || "Untitled Document.pdf",
    fileUrl: req.body.fileUrl || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500",
    fileSize: req.body.fileSize || 120, // in KB
    fileFormat: req.body.fileFormat || "pdf",
    category: req.body.category || "Compliance Document"
  };
  doc = injectAuditFields(doc, req, true);
  dbDocuments.unshift(doc);
  res.status(201).json(doc);
});

app.delete("/api/documents/:id", (req, res) => {
  const index = dbDocuments.findIndex(d => d.id === req.params.id);
  if (index !== -1) {
    if (dbDocuments[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied: Cross-tenant operations blocked." });
    }
    dbDocuments = dbDocuments.filter(d => d.id !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Document not found." });
  }
});


// Automation Core Engine and Rules
app.get("/api/automation/rules", (req, res) => {
  res.json(getIsolatedData(dbRules, req));
});

app.put("/api/automation/rules/:id", (req, res) => {
  const index = dbRules.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    if (dbRules[index].company_id !== req.companyId) {
      return res.status(403).json({ error: "Access Denied." });
    }
    let updated = { ...dbRules[index], ...req.body };
    updated = injectAuditFields(updated, req, false);
    dbRules[index] = updated;
    res.json(updated);
  } else {
    res.status(404).json({ error: "Rule not found" });
  }
});

app.get("/api/automation/logs", (req, res) => {
  res.json(getIsolatedData(dbLogs, req));
});

// Helper to trigger automated workflow transitions matching trigger events
function triggerAutomations(triggerEvent: string, eventInfo: string, dataPayload: Record<string, any>, req: express.Request) {
  const matchingRules = dbRules.filter(r => r.company_id === req.companyId && r.active && r.trigger === triggerEvent);
  matchingRules.forEach(rule => {
    let fired = false;
    if (triggerEvent === "inventory_low") {
      const stock = Number(dataPayload.stock);
      const minStock = Number(dataPayload.minStock);
      if (stock < minStock) fired = true;
    } else if (triggerEvent === "lead_status_changed") {
      if (!rule.condition || dataPayload.status === "Qualified") {
        fired = true;
      }
    } else if (triggerEvent === "leave_request_submitted") {
      fired = true;
    } else {
      fired = true;
    }

    if (fired) {
      const logId = "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      let actionMsg = "";

      if (rule.action === "create_task") {
        const newTask = {
          id: "task_" + Date.now(),
          projectId: dbProjects.find(p => p.company_id === req.companyId)?.id || "proj_1",
          title: rule.actionPayload.title || "Review lead: " + (dataPayload.name || ""),
          description: rule.actionPayload.description || "",
          status: "Backlog" as const,
          priority: "High" as const,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          assignedTo: rule.actionPayload.assignedTo || "Alex Mercer",
          subtasks: [],
          company_id: req.companyId,
          tenantId: req.companyId,
          created_by: "system_automation",
          updated_by: "system_automation",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        dbTasks.unshift(newTask);
        actionMsg = `Created Task '${newTask.title}' and assigned to '${newTask.assignedTo}'`;
      } else if (rule.action === "send_email") {
        actionMsg = `Dispatched Email Notification to '${rule.actionPayload.to || "recipient"}' saying: "${rule.actionPayload.subject}"`;
      } else if (rule.action === "update_status") {
        actionMsg = `Auto-approved request and set status to '${rule.actionPayload.status || "Approved"}'`;
      } else {
        actionMsg = `Executed action: ${rule.action}`;
      }

      dbLogs.unshift({
        id: logId,
        company_id: req.companyId,
        tenantId: req.companyId,
        ruleName: rule.name,
        triggerEvent: `${rule.trigger.replace("_", " ")} (${eventInfo})`,
        actionTaken: actionMsg,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        status: "Success",
        created_by: "system_automation",
        updated_by: "system_automation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });
}

// Server-Side Gemini AI Cognitive processing route (includes grounding vectors & direct task generators)
app.post("/api/ai/process", async (req, res) => {
  const { mode, payload } = req.body;

  try {
    const ai = getGeminiClient();

    let sysInstruction = "You are an intelligent ERP Business Assistant. Offer dynamic outputs in clear Markdown. Be highly functional and structure layouts neatly.";
    let prompt = "";

    // Pull tenant-isolated databases to contextualize Gemini forecasts perfectly
    const tenantLeads = getIsolatedData(dbLeads, req);
    const tenantProjects = getIsolatedData(dbProjects, req);
    const tenantInvoices = getIsolatedData(dbInvoices, req);
    const tenantProducts = getIsolatedData(dbProducts, req);

    if (mode === "generate_report") {
      sysInstruction = "You are a professional CFO and Operations Report Analyst. Provide high-density, structured corporate review summaries.";
      prompt = `Generate a modern business operations review based on current status metrics:
- Active Projects: ${JSON.stringify(tenantProjects.map(p => ({ n: p.name, st: p.status, pr: p.progress })))}
- Total Lead Pipeline Value: ₹${tenantLeads.reduce((acc, l) => acc + (l.status !== "Closed Lost" ? l.value : 0), 0)}
- Latest low stock items alert: ${JSON.stringify(tenantProducts.filter(p => p.stock < p.minStock).map(p => p.name))}
- Total Unpaid Invoices Amount: ₹${tenantInvoices.filter(i => i.status !== "Paid").reduce((acc, i) => acc + i.total, 0)}

Create three distinct sections with high markdown design presentation:
1. EXECUTIVE RATIOS (Provide computed Indian corporate estimates like Burn Rate, Run Rate, and GST liability forecasts).
2. OPERATIONAL FRICTIONS.
3. ADAPTIVE ADVICE.`;
    } else if (mode === "meeting_summaries") {
      sysInstruction = "You are a corporate board secretary. Condense unstructured conversation logs into clean, action-oriented, professional action plan lists.";
      prompt = `Analyze the unstructured meeting notes text below and provide a beautiful, organized Markdown structure with Meeting Title, High-level Actions, and specific Assigned Owners:
-----
${payload.notesText || "The sales team discussed Jessica Jones deal, ALEX needs to finalize proposal specs. Jared mentioned the index partition issues are taking longer than expected. Sophia wants to approve delta expenses on Friday."}
-----`;
    } else if (mode === "predict_sales") {
      sysInstruction = "You are an advanced statistical revenue forecasting engine. Formulate visual ASCII-like markdown data tables showing predictions.";
      prompt = `Using this current sales pipeline representation: ${JSON.stringify(tenantLeads.map(l => ({ name: l.name, company: l.company, val: l.value, status: l.status })))}
Predict the incoming corporate cash flows for the next 4 fiscal quarters. Offer a probability projection percentage per deal, identify major threats, and outline recommended conversion accelerators.`;
    } else if (mode === "create_tasks") {
      sysInstruction = `You are a task decompiling system. Analyze natural language requests and output a JSON array of specific actionable subtasks. Ensure the JSON maps format: [ { "title": "string", "description": "string", "priority": "High"|"Medium"|"Low", "assignedTo": "Alex Mercer"|"Sarah Jenkins"|"Priya Sharma" } ]. Output ONLY pure raw JSON code without markdown formatting blocks.`;
      prompt = `Decompile the request: "${payload.naturalText || "Alex needs to draft a formal Wayne Corp proposal by Friday, while Priya checks payroll allocations."}"`;
    } else {
      prompt = `Direct Prompt: "${payload.customPrompt || "Offer helpful general advice on ERP workflow optimizations."}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction
      }
    });

    const textOutput = response.text || "";

    if (mode === "create_tasks") {
      try {
        let jsonStr = textOutput.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.endsWith("```")) {
          jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }
        jsonStr = jsonStr.trim();

        const tasksParsed = JSON.parse(jsonStr);
        if (Array.isArray(tasksParsed)) {
          const addedTasks: any[] = [];
          tasksParsed.forEach((t: any) => {
            const defaultProjId = tenantProjects[0]?.id || "proj_1";
            let taskObj = {
              id: "task_" + Date.now() + "_" + Math.floor(Math.random() * 100),
              projectId: defaultProjId,
              title: t.title || "AI Created Task",
              description: t.description || "Synthesized automatically via AI Assistant",
              status: "Backlog" as const,
              priority: t.priority || "Medium",
              dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
              assignedTo: t.assignedTo || "Alex Mercer",
              subtasks: []
            };
            taskObj = injectAuditFields(taskObj, req, true);
            dbTasks.unshift(taskObj);
            addedTasks.push(taskObj);
          });
          return res.json({
            output: `### AI Insights System\n\nSuccessfully decompiled the instructions and automatically instantiated **${addedTasks.length} real interactive tasks** directly inside the Project Management board!\n\n#### Created Tasks:\n` + addedTasks.map(t => `- **${t.title}** assigned to _${t.assignedTo}_ (Priority: ${t.priority})`).join("\n"),
            success: true
          });
        }
      } catch (parseErr) {
        console.error("AI Task JSON parsing error:", parseErr);
        let singleTask = {
          id: "task_" + Date.now(),
          projectId: "proj_1",
          title: "Verify Unstructured Task Request",
          description: payload.naturalText,
          status: "Backlog" as const,
          priority: "High" as const,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          assignedTo: "Alex Mercer",
          subtasks: []
        };
        singleTask = injectAuditFields(singleTask, req, true);
        dbTasks.unshift(singleTask);
        return res.json({
          output: `### AI Extraction Fallback\n\nI was unable to output perfect JSON but created 1 fallback check list item:\n- **${singleTask.title}** assigned to Alex.`,
          success: true
        });
      }
    }

    res.json({ output: textOutput, success: true });
  } catch (err: any) {
    console.error("Gemini server error: ", err);
    res.status(500).json({
      error: err.message || "Failed to contact local AI infrastructure services",
      backupOutput: "### ERP Mock Assistant Mode\n\nConfigure `GEMINI_API_KEY` to unlock live AI-powered predictions.\n\n*Suggested Sales Probability Metrics:*\n- Jessica Jones: 85% probability (Qualified status)\n- Thomas Wayne: 45% (Proposal submitted)\n- Arthur Dent: 15% (Contact stage)\n\n*Estimated forecast incoming next Q: ₹14,30,000.*"
    });
  }
});

// Vite server integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
