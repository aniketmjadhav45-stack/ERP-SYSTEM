/**
 * Cloud ERP Domain Model TypeScript Type Definitions
 */

export enum Role {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  MANAGER = "Manager",
  HR = "HR",
  SALES = "Sales",
  FINANCE = "Finance",
  EMPLOYEE = "Employee",
  CUSTOMER = "Customer",
  VENDOR = "Vendor"
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: "Growth" | "Enterprise" | "Scale-up";
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  salary?: number;
  skills?: string[];
  attendanceStatus?: "present" | "absent" | "remote" | "leave";
}

// CRM TYPES
export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
  assignedTo: string; // UserProfile Name or ID
  createdAt: string;
  updatedAt: string;
  notes: string;
  timeline: {
    id: string;
    type: "call" | "email" | "meeting" | "status";
    text: string;
    date: string;
  }[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  lastContactDate: string;
}

// HR TYPES
export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  clockOut?: string; // HH:MM
  status: "present" | "absent" | "late" | "remote";
  hoursWorked?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity/Paternity';
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
  requestedAt: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  userName: string;
  month: string; // e.g., "June 2026"
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "Draft" | "Approved" | "Paid";
  paymentDate?: string;
}

// PROJECT MANAGEMENT TYPES
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "Backlog" | "In Progress" | "In Review" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  assignedTo: string; // UserProfile ID or Name
  subtasks: Subtask[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "Planning" | "In Progress" | "On Hold" | "Completed";
  progress: number; // 0-100
  milestones: string[];
}

// FINANCE TYPES
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: {
    itemName?: string;
    description: string;
    hsnCode?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    amount: number;
  }[];
  taxRate: number; // percentage
  discount: number; // total amount
  total: number;
  status: "Draft" | "Sent" | "Overdue" | "Paid" | "Partially Paid" | "Cancelled";
  companyName?: string;
  customerName?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstNumber?: string;
  panNumber?: string;
  placeOfSupply?: string;
  sellerGst?: string;
  sellerPan?: string;
  sellerAddress?: string;
  sellerState?: string;
  sellerCompany?: string;
  invoiceDate?: string;
  subtotal?: number;
  totalDiscount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  amountPaid?: number;
  balanceAmount?: number;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface Expense {
  id: string;
  category: "Software" | "Travel" | "Marketing" | "Office Supplies" | "Salaries" | "Consulting" | "Other";
  amount: number;
  date: string;
  merchant: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  description: string;
}

// INVENTORY TYPES
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number; // Reorder alert
  unitPrice: number;
  costPrice: number;
  supplierId: string;
  supplierName: string;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  productsSupplied: string[];
}

// AUTOMATION TYPES
export interface AutomationRule {
  id: string;
  name: string;
  trigger: "lead_status_changed" | "invoice_created" | "leave_request_submitted" | "inventory_low";
  condition?: string; // e.g., "status === 'Qualified'", "stock < minStock"
  action: "send_email" | "create_task" | "notify_slack" | "update_status";
  actionPayload: Record<string, string>;
  active: boolean;
}

export interface AutomationLog {
  id: string;
  ruleName: string;
  triggerEvent: string;
  actionTaken: string;
  timestamp: string;
  status: "Success" | "Failed";
}
