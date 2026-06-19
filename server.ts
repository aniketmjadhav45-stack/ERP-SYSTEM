import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

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

// In-Memory Mutable Databases (per-session state)
let dbLeads = [...defaultLeads];
let dbContacts = [...defaultContacts];
let dbAttendance = [...defaultAttendance];
let dbLeaves = [...defaultLeaves];
let dbPayroll = [...defaultPayroll];
let dbProjects = [...defaultProjects];
let dbTasks = [...defaultTasks];
let dbInvoices = [...defaultInvoices];
let dbExpenses = [...defaultExpenses];
let dbProducts = [...defaultProducts];
let dbSuppliers = [...defaultSuppliers];
let dbRules = [...defaultAutomationRules];
let dbLogs = [...defaultAutomationLogs];
let dbUsers = [...defaultUsers];

// Lazy-initialization helper for Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

// JSON Middleware
app.use(express.json());

// Helper to trigger automations matching event trigger
function triggerAutomations(triggerEvent: string, eventInfo: string, dataPayload: Record<string, any>) {
  const matchingRules = dbRules.filter(r => r.active && r.trigger === triggerEvent);
  matchingRules.forEach(rule => {
    let fired = false;
    // Simple condition check simulation
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
          projectId: dbProjects[0]?.id || "proj_1",
          title: rule.actionPayload.title || "Review lead: " + (dataPayload.name || ""),
          description: rule.actionPayload.description || "",
          status: "Backlog" as const,
          priority: "High" as const,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          assignedTo: rule.actionPayload.assignedTo || "Alex Mercer",
          subtasks: [],
          createdAt: new Date().toISOString().split("T")[0]
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
        ruleName: rule.name,
        triggerEvent: `${rule.trigger.replace("_", " ")} (${eventInfo})`,
        actionTaken: actionMsg,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        status: "Success"
      });
    }
  });
}

// REST API Definition
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date() });
});

// Users
app.get("/api/users", (req, res) => {
  res.json(dbUsers);
});

app.post("/api/users", (req, res) => {
  const newUser = { id: "user_" + Date.now(), ...req.body };
  dbUsers.push(newUser);
  res.status(201).json(newUser);
});

// CRM Leads Code
app.get("/api/leads", (req, res) => {
  res.json(dbLeads);
});

app.post("/api/leads", (req, res) => {
  const newLead = {
    id: "lead_" + Date.now(),
    name: req.body.name || "Unnamed Lead",
    company: req.body.company || "Unnamed Company",
    email: req.body.email || "",
    phone: req.body.phone || "",
    value: Number(req.body.value) || 0,
    status: req.body.status || "New",
    assignedTo: req.body.assignedTo || "Alex Mercer",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    notes: req.body.notes || "",
    timeline: [{ id: "tl_" + Date.now(), type: "status" as const, text: "Lead profile created", date: new Date().toISOString().split("T")[0] }]
  };
  dbLeads.unshift(newLead);
  res.status(201).json(newLead);
});

app.put("/api/leads/:id", (req, res) => {
  const index = dbLeads.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    const originalStatus = dbLeads[index].status;
    dbLeads[index] = {
      ...dbLeads[index],
      ...req.body,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    const currentStatus = dbLeads[index].status;

    // Check Trigger status changed
    if (originalStatus !== currentStatus) {
      dbLeads[index].timeline.unshift({
        id: "tl_" + Date.now(),
        type: "status",
        text: `Status updated to ${currentStatus}`,
        date: new Date().toISOString().split("T")[0]
      });

      triggerAutomations("lead_status_changed", `${dbLeads[index].company} (${currentStatus})`, dbLeads[index]);
    }
    res.json(dbLeads[index]);
  } else {
    res.status(404).json({ error: "Lead not found" });
  }
});

app.delete("/api/leads/:id", (req, res) => {
  dbLeads = dbLeads.filter(l => l.id !== req.params.id);
  res.json({ success: true });
});

// CRM Contacts
app.get("/api/contacts", (req, res) => {
  res.json(dbContacts);
});

app.post("/api/contacts", (req, res) => {
  const newContact = {
    id: "con_" + Date.now(),
    name: req.body.name || "New Contact",
    role: req.body.role || "",
    company: req.body.company || "",
    email: req.body.email || "",
    phone: req.body.phone || "",
    lastContactDate: new Date().toISOString().split("T")[0]
  };
  dbContacts.unshift(newContact);
  res.status(201).json(newContact);
});

// HR Attendance
app.get("/api/attendance", (req, res) => {
  res.json(dbAttendance);
});

app.post("/api/attendance", (req, res) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);

  // Check if already checked in today
  const existingIndex = dbAttendance.findIndex(a => a.userId === req.body.userId && a.date === todayStr);

  if (existingIndex !== -1) {
    // Clock-out
    dbAttendance[existingIndex].clockOut = timeStr;
    const cin = dbAttendance[existingIndex].clockIn.split(":");
    const hours = (now.getHours() - Number(cin[0])) + (now.getMinutes() - Number(cin[1])) / 60;
    dbAttendance[existingIndex].hoursWorked = Number(hours.toFixed(2));
    res.json(dbAttendance[existingIndex]);
  } else {
    // Clock-in
    const record = {
      id: "att_" + Date.now(),
      userId: req.body.userId,
      userName: req.body.userName,
      date: todayStr,
      clockIn: timeStr,
      status: "present" as const,
      hoursWorked: 0
    };
    dbAttendance.unshift(record);
    res.status(201).json(record);
  }
});

// HR Leave Requests
app.get("/api/leaves", (req, res) => {
  res.json(dbLeaves);
});

app.post("/api/leaves", (req, res) => {
  const newLeave = {
    id: "le_" + Date.now(),
    userId: req.body.userId,
    userName: req.body.userName,
    leaveType: req.body.leaveType,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    reason: req.body.reason,
    status: "Pending" as const,
    requestedAt: new Date().toISOString().split("T")[0]
  };
  dbLeaves.unshift(newLeave);

  // Trigger automation log
  triggerAutomations("leave_request_submitted", `${newLeave.userName} (${newLeave.leaveType})`, newLeave);

  res.status(201).json(newLeave);
});

app.put("/api/leaves/:id", (req, res) => {
  const index = dbLeaves.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    dbLeaves[index].status = req.body.status;
    res.json(dbLeaves[index]);
  } else {
    res.status(444).json({ error: "Leave not found" });
  }
});

// HR Payroll Records
app.get("/api/payroll", (req, res) => {
  res.json(dbPayroll);
});

app.post("/api/payroll", (req, res) => {
  const newRecord = {
    id: "pay_" + Date.now(),
    ...req.body,
    netPay: Number(req.body.baseSalary) + Number(req.body.bonus) - Number(req.body.deductions)
  };
  dbPayroll.unshift(newRecord);
  res.status(201).json(newRecord);
});

app.put("/api/payroll/:id", (req, res) => {
  const index = dbPayroll.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    dbPayroll[index] = { ...dbPayroll[index], ...req.body };
    if (req.body.status === "Paid") {
      dbPayroll[index].paymentDate = new Date().toISOString().split("T")[0];
    }
    res.json(dbPayroll[index]);
  } else {
    res.status(404).json({ error: "Payroll record not found" });
  }
});

// Projects Management
app.get("/api/projects", (req, res) => {
  res.json(dbProjects);
});

app.post("/api/projects", (req, res) => {
  const newProj = {
    id: "proj_" + Date.now(),
    name: req.body.name,
    description: req.body.description,
    clientName: req.body.clientName || "Direct Division",
    startDate: req.body.startDate || new Date().toISOString().split("T")[0],
    endDate: req.body.endDate,
    budget: Number(req.body.budget) || 0,
    status: "Planning" as const,
    progress: 0,
    milestones: req.body.milestones || []
  };
  dbProjects.unshift(newProj);
  res.status(201).json(newProj);
});

app.get("/api/tasks", (req, res) => {
  res.json(dbTasks);
});

app.post("/api/tasks", (req, res) => {
  const newTask = {
    id: "task_" + Date.now(),
    projectId: req.body.projectId,
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "Backlog",
    priority: req.body.priority || "Medium",
    dueDate: req.body.dueDate,
    assignedTo: req.body.assignedTo || "Unassigned",
    subtasks: req.body.subtasks || [],
    createdAt: new Date().toISOString().split("T")[0]
  };
  dbTasks.unshift(newTask);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const index = dbTasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    dbTasks[index] = { ...dbTasks[index], ...req.body };
    res.json(dbTasks[index]);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// Finance Invoices
app.get("/api/invoices", (req, res) => {
  res.json(dbInvoices);
});

app.post("/api/invoices", (req, res) => {
  const newInv = {
    id: "inv_" + Date.now(),
    invoiceNumber: "INV-2026-" + Math.floor(1000 + Math.random() * 9000),
    clientName: req.body.clientName,
    clientEmail: req.body.clientEmail,
    issueDate: req.body.issueDate || new Date().toISOString().split("T")[0],
    dueDate: req.body.dueDate,
    items: req.body.items || [],
    taxRate: Number(req.body.taxRate) || 0,
    discount: Number(req.body.discount) || 0,
    total: Number(req.body.total) || 0,
    status: req.body.status || "Draft"
  };
  dbInvoices.unshift(newInv);
  res.status(201).json(newInv);
});

app.put("/api/invoices/:id", (req, res) => {
  const index = dbInvoices.findIndex(i => i.id === req.params.id);
  if (index !== -1) {
    dbInvoices[index] = { ...dbInvoices[index], ...req.body };
    res.json(dbInvoices[index]);
  } else {
    res.status(404).json({ error: "Invoice not found" });
  }
});

// Finance Expenses
app.get("/api/expenses", (req, res) => {
  res.json(dbExpenses);
});

app.post("/api/expenses", (req, res) => {
  const newExp = {
    id: "exp_" + Date.now(),
    category: req.body.category,
    amount: Number(req.body.amount),
    merchant: req.body.merchant,
    date: req.body.date || new Date().toISOString().split("T")[0],
    status: "Pending" as const,
    description: req.body.description || ""
  };
  dbExpenses.unshift(newExp);
  res.status(201).json(newExp);
});

app.put("/api/expenses/:id", (req, res) => {
  const index = dbExpenses.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    dbExpenses[index] = { ...dbExpenses[index], ...req.body };
    res.json(dbExpenses[index]);
  } else {
    res.status(404).json({ error: "Expense not found" });
  }
});

// Inventory Products
app.get("/api/inventory", (req, res) => {
  res.json(dbProducts);
});

app.post("/api/inventory", (req, res) => {
  const newProd = {
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
  dbProducts.push(newProd);

  // Low stock check
  if (newProd.stock < newProd.minStock) {
    triggerAutomations("inventory_low", `${newProd.name} (stock is ${newProd.stock})`, newProd);
  }

  res.status(201).json(newProd);
});

app.put("/api/inventory/:id", (req, res) => {
  const index = dbProducts.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    dbProducts[index] = { ...dbProducts[index], ...req.body };

    // Stock level changed trigger alert
    if (dbProducts[index].stock < dbProducts[index].minStock) {
      triggerAutomations("inventory_low", `${dbProducts[index].name} (stock is ${dbProducts[index].stock})`, dbProducts[index]);
    }

    res.json(dbProducts[index]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.get("/api/suppliers", (req, res) => {
  res.json(dbSuppliers);
});

app.post("/api/suppliers", (req, res) => {
  const newSupplier = {
    id: "sup_" + Date.now(),
    name: req.body.name,
    contactName: req.body.contactName || "Liaison Officer",
    email: req.body.email,
    phone: req.body.phone || "+91 22 2345 6789",
    productsSupplied: req.body.productsSupplied || []
  };
  dbSuppliers.push(newSupplier);
  res.status(201).json(newSupplier);
});

// Automation Rules
app.get("/api/automation/rules", (req, res) => {
  res.json(dbRules);
});

app.put("/api/automation/rules/:id", (req, res) => {
  const index = dbRules.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    dbRules[index] = { ...dbRules[index], ...req.body };
    res.json(dbRules[index]);
  } else {
    res.status(404).json({ error: "Rule not found" });
  }
});

app.get("/api/automation/logs", (req, res) => {
  res.json(dbLogs);
});

// Server-Side Gemini endpoint
app.post("/api/ai/process", async (req, res) => {
  const { mode, payload } = req.body;

  try {
    const ai = getGeminiClient();

    let sysInstruction = "You are an intelligent ERP Business Assistant. Offer dynamic outputs in clear Markdown. Be highly functional and structure layouts neatly.";
    let prompt = "";

    if (mode === "generate_report") {
      sysInstruction = "You are a professional CFO and Operations Report Analyst. Provide high-density, structured corporate review summaries.";
      prompt = `Generate a modern business operations review based on current status metrics:
- Active Projects: ${JSON.stringify(dbProjects.map(p => ({ n: p.name, st: p.status, pr: p.progress })))}
- Total Lead Pipeline Value: $${dbLeads.reduce((acc, l) => acc + (l.status !== "Closed Lost" ? l.value : 0), 0)}
- Latest low stock items alert: ${JSON.stringify(dbProducts.filter(p => p.stock < p.minStock).map(p => p.name))}
- Total Unpaid Invoices Amount: $${dbInvoices.filter(i => i.status !== "Paid").reduce((acc, i) => acc + i.total, 0)}

Create three distinct sections with high markdown design presentation:
1. EXECUTIVE RATIOS (Provide computed estimates like Burn Rate and Run Rate).
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
      prompt = `Using this current sales pipeline representation: ${JSON.stringify(dbLeads.map(l => ({ name: l.name, company: l.company, val: l.value, status: l.status })))}
Predict the incoming cash flow for the next 4 quarters. Offer a probability projection percentage per deal, identify major threats, and outline recommended conversion accelerators.`;
    } else if (mode === "create_tasks") {
      sysInstruction = `You are a task decompiling system. Analyze natural language requests and output a JSON array of specific actionable subtasks. Ensure the JSON maps format: [ { "title": "string", "description": "string", "priority": "High"|"Medium"|"Low", "assignedTo": "Jared Leto"|"Alex Mercer"|"Clara Oswald" } ]. Output ONLY pure raw JSON code without markdown formatting blocks.`;
      prompt = `Decompile the request: "${payload.naturalText || "Alex needs to draft a formal Wayne Corp proposal by Friday, while Jared checks database partitioning schema load times."}"`;
    } else {
      prompt = `Direct Prompt: "${payload.customPrompt || "Offer helpful general advice on ERP workflow optimizations."}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction
      }
    });

    const textOutput = response.text || "";

    // If task creation of AI was requested, let's parse and automatically create real tasks inside the server's db!
    if (mode === "create_tasks") {
      try {
        // Clean markdown block wrappers if model wrapped it
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
            const taskObj = {
              id: "task_" + Date.now() + "_" + Math.floor(Math.random() * 100),
              projectId: dbProjects[0]?.id || "proj_1",
              title: t.title || "AI Created Task",
              description: t.description || "Synthesized automatically via AI Assistant",
              status: "Backlog" as const,
              priority: t.priority || "Medium",
              dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
              assignedTo: t.assignedTo || "Jared Leto",
              subtasks: [],
              createdAt: new Date().toISOString().split("T")[0]
            };
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
        // Fallback: create single generic task
        const singleTask = {
          id: "task_" + Date.now(),
          projectId: dbProjects[0]?.id || "proj_1",
          title: "Verify Unstructured Task Request",
          description: payload.naturalText,
          status: "Backlog" as const,
          priority: "High" as const,
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          assignedTo: "Jared Leto",
          subtasks: [],
          createdAt: new Date().toISOString().split("T")[0]
        };
        dbTasks.unshift(singleTask);
        return res.json({
          output: `### AI Extraction Fallback\n\nI was unable to output perfect JSON but created 1 fallback check list item:\n- **${singleTask.title}** assigned to Jesse/Jared.`,
          success: true
        });
      }
    }

    res.json({ output: textOutput, success: true });
  } catch (err: any) {
    console.error("Gemini server error: ", err);
    res.status(500).json({
      error: err.message || "Failed to contact local AI infrastructure services",
      backupOutput: "### ERP Mock Assistant Mode\n\nConfigure `GEMINI_API_KEY` to unlock live AI-powered predictions.\n\n*Suggested Sales Probability Metrics:*\n- Jessica Jones: 85% probability (Qualified status)\n- Thomas Wayne: 45% (Proposal submitted)\n- Arthur Dent: 15% (Contact stage)\n\n*Estimated forecast incoming next Q: $143,200.*"
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
