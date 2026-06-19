import React, { useState, useEffect } from "react";
import { Invoice, Expense, UserProfile, Role } from "../types";
import { 
  Plus, Receipt, Calculator, AlertCircle, Sparkles, Building, Trash, Coins, 
  Search, Eye, Edit2, Copy, Download, Printer, Send, Share2, Filter, 
  FileSpreadsheet, ArrowUpRight, CheckCircle2, Clock, Ban, Calendar, ShieldCheck, Mail,
  Activity, ArrowDownLeft, CreditCard, ChevronRight, Check, X, Building2, HelpCircle
} from "lucide-react";
import { getHeaders } from "../utils/apiHelpers";

interface FinanceModuleProps {
  invoices: Invoice[];
  expenses: Expense[];
  onAddInvoice: (invoice: any) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: Invoice["status"], extraFields?: any) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onAddExpense: (expense: Omit<Expense, "id" | "status">) => void;
  onUpdateExpenseStatus: (expenseId: string, status: Expense["status"]) => void;
  currentUser: UserProfile;
  initialTab?: "invoices" | "expenses" | "pl";
}

// Activity Log item type
interface ActivityLog {
  id: string;
  timestamp: string;
  invoiceId: string;
  invoiceNum: string;
  type: "system" | "email" | "status" | "payment" | "reminder";
  text: string;
  user: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Puducherry"
];

const UNITS = ["Nos", "Pcs", "Kgs", "Mtr", "Bags", "Ltr", "Hrs", "Days", "Box"];

export default function FinanceModule({
  invoices,
  expenses,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  onAddExpense,
  onUpdateExpenseStatus,
  currentUser,
  initialTab = "invoices"
}: FinanceModuleProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "expenses" | "pl">(initialTab);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [simplePreset, setSimplePreset] = useState<string>("All");

  // Selection states for Modals
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);

  // Sharing & Mailing Simulation States
  const [sharingInvoice, setSharingInvoice] = useState<any | null>(null);
  const [emailingInvoice, setEmailingInvoice] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPortalPreview, setShowPortalPreview] = useState(false);

  // Email payload fields
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailHistory, setEmailHistory] = useState<string[]>([]);

  // Simulation log list
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: "log-1", timestamp: "2026-06-19 09:30 AM", invoiceId: "all", invoiceNum: "SYSTEM", type: "system", text: "Invoice register multi-company secure database synced.", user: "System Scheduler" },
    { id: "log-2", timestamp: "2026-06-19 10:15 AM", invoiceId: "INV-2026-00001", invoiceNum: "INV-2026-00001", type: "reminder", text: "Auto scheduler generated upcoming due warnings for client Wayne Corp.", user: "RemindBot" }
  ]);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Check and dispatch automatic reminder rules
  useEffect(() => {
    // Run automated check upon viewing: check for overdue and auto-update status to "Overdue" if not paid & past due date
    const todayStr = new Date().toISOString().split("T")[0];
    let triggeredLog = false;
    invoices.forEach((inv) => {
      if (inv.dueDate && inv.dueDate < todayStr && inv.status !== "Paid" && inv.status !== "Overdue" && inv.status !== "Cancelled") {
        // Automatically check if status is eligible for "Overdue" update
        // We simulate updating to overdue
        if (!triggeredLog) {
          logActivity(inv.id, inv.invoiceNumber || "INV-XXXX", "system", `System validated due date (${inv.dueDate}) passed. Auto-flagged invoice status as OVERDUE.`, "Cron Manager");
          triggeredLog = true;
        }
      }
    });
  }, [invoices]);

  const logActivity = (invoiceId: string, invoiceNum: string, type: ActivityLog["type"], text: string, user: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split("T")[0];
    const newLog: ActivityLog = {
      id: "log-" + Date.now() + Math.random().toString(36).substr(2, 5),
      timestamp: `${dateStr} ${timestamp}`,
      invoiceId,
      invoiceNum,
      type,
      text,
      user
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // AUTOMATED REMINDERS SIMULATOR
  const triggerAutoReminders = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    let count = 0;
    
    invoices.forEach((inv) => {
      if (inv.status !== "Paid" && inv.status !== "Cancelled") {
        const isOverdue = inv.dueDate && inv.dueDate < todayStr;
        const msg = isOverdue 
          ? `OVERDUE ALERT: Invoice ${inv.invoiceNumber} is overdue since ${inv.dueDate}. Please arrange immediate settlement of GST dues Rs ${inv.total?.toLocaleString() || "0"}.`
          : `GENTLE REMINDER: Invoice ${inv.invoiceNumber} is due on ${inv.dueDate}. Balance Outstanding Rs ${inv.total?.toLocaleString() || "0"}.`;
        
        logActivity(inv.id, inv.invoiceNumber || "INV-XXXX", "reminder", `Simulated reminder email successfully triggered: "${msg}"`, "SMTP Auto Bot");
        count++;
      }
    });

    triggerToast(`Sent ${count} automated due date reminders successfully! Check logs.`);
  };

  // --- NEW INVOICE FORM STATE ---
  const [sellerCompany, setSellerCompany] = useState(currentUser?.tenantId === "tenant_nebula" ? "Reliance Infra Ltd" : currentUser?.tenantId === "tenant_birla" ? "Adani Power Ltd" : "Tata Agro Pvt Ltd");
  const [sellerGst, setSellerGst] = useState(currentUser?.tenantId === "tenant_nebula" ? "29AAACR9876F1Z5" : currentUser?.tenantId === "tenant_birla" ? "19AAAAC1122D1Z2" : "27AAAAC1234A1Z1");
  const [sellerPan, setSellerPan] = useState("AAACT1234F");
  const [sellerAddress, setSellerAddress] = useState("Corporate HQ Office, Nariman Point, Mumbai, Maharashtra 400021");
  const [sellerState, setSellerState] = useState("Maharashtra");

  const [buyerName, setBuyerName] = useState("");
  const [buyerGst, setBuyerGst] = useState("");
  const [buyerPan, setBuyerPan] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("Karnataka");

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0]); // 14 days later

  const [invoiceItems, setInvoiceItems] = useState<any[]>([
    { itemName: "Milled Raw Basmati Rice", description: "Standard export quality AAA grade", hsnCode: "10063010", quantity: 180, unit: "Bags", unitPrice: 3200, discount: 5, taxRate: 18, amount: 547200 }
  ]);

  // Payment inputs
  const [invoiceStatus, setInvoiceStatus] = useState<Invoice["status"]>("Draft");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [transactionId, setTransactionId] = useState<string>("");

  // Update seller details automatically based on changes in currentUser / preset company
  useEffect(() => {
    const parentCompany = currentUser?.tenantId === "tenant_nebula" ? "Reliance Infra Ltd" : currentUser?.tenantId === "tenant_birla" ? "Adani Power Ltd" : "Tata Agro Pvt Ltd";
    const parentGst = currentUser?.tenantId === "tenant_nebula" ? "29AAACR9876F1Z5" : currentUser?.tenantId === "tenant_birla" ? "19AAAAC1122D1Z2" : "27AAAAC1234A1Z1";
    const parentState = currentUser?.tenantId === "tenant_nebula" ? "Karnataka" : currentUser?.tenantId === "tenant_birla" ? "West Bengal" : "Maharashtra";
    const parentAddr = currentUser?.tenantId === "tenant_nebula" ? "Reliance Tech Office, Whitefield, Bengaluru, Karnataka" : currentUser?.tenantId === "tenant_birla" ? "Adani Power Station, Salt Lake, Kolkata, West Bengal" : "Corporate HQ Office, Nariman Point, Mumbai, Maharashtra 400018";
    
    setSellerCompany(parentCompany);
    setSellerGst(parentGst);
    setSellerState(parentState);
    setSellerAddress(parentAddr);
  }, [currentUser]);

  // Compute live taxes & discounts
  const calculateTotals = (itemsList: any[]) => {
    let subtotal = 0;
    let totalDiscount = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const isIntraState = sellerState.toLowerCase().trim() === placeOfSupply.toLowerCase().trim();

    itemsList.forEach((item) => {
      const lineRaw = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      const discountVal = lineRaw * (Number(item.discount || 0) / 100);
      const lineFinalWithDiscount = lineRaw - discountVal;

      subtotal += lineFinalWithDiscount;
      totalDiscount += discountVal;

      const taxRateVal = Number(item.taxRate || 0);
      const itemTaxAmount = lineFinalWithDiscount * (taxRateVal / 100);

      if (isIntraState) {
        cgst += itemTaxAmount / 2;
        sgst += itemTaxAmount / 2;
      } else {
        igst += itemTaxAmount;
      }
    });

    const grandTotal = subtotal + cgst + sgst + igst;
    const balanceAmount = Math.max(0, grandTotal - amountPaid);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      balanceAmount: Math.round(balanceAmount * 100) / 100
    };
  };

  const calculated = calculateTotals(invoiceItems);

  // AUTO GENERATE UNIQUE INVOICE NUMBER
  const computeNextInvoiceNumber = (): string => {
    const currentYear = new Date().getFullYear();
    const companyInvoices = invoices.filter(i => i.invoiceNumber?.startsWith(`INV-${currentYear}-`));
    
    let maxNum = 0;
    companyInvoices.forEach(i => {
      const match = i.invoiceNumber?.match(/(\d+)$/);
      if (match) {
        const val = parseInt(match[1]);
        if (val > maxNum) maxNum = val;
      }
    });
    
    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(5, "0");
    return `INV-${currentYear}-${padded}`;
  };

  const openCreateForm = () => {
    setEditingInvoice(null);
    setBuyerName("");
    setBuyerGst("");
    setBuyerPan("");
    setBuyerAddress("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setDueDate(new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0]);
    setInvoiceItems([
      { itemName: "Raw Steel Shingle Tubes", description: "B2B infrastructure grading 120mm", hsnCode: "73063090", quantity: 200, unit: "Nos", unitPrice: 2200, discount: 5, taxRate: 18, amount: 418000 }
    ]);
    setInvoiceStatus("Draft");
    setAmountPaid(0);
    setPaymentDate("");
    setPaymentMethod("Bank Transfer");
    setTransactionId("");
    setIsFormOpen(true);
  };

  const openEditForm = (inv: any) => {
    setEditingInvoice(inv);
    setSellerCompany(inv.companyName || sellerCompany);
    setSellerGst(inv.sellerGst || sellerGst);
    setSellerPan(inv.sellerPan || sellerPan);
    setSellerAddress(inv.sellerAddress || sellerAddress);
    setSellerState(inv.sellerState || sellerState);

    setBuyerName(inv.customerName || inv.clientName || "");
    setBuyerGst(inv.gstNumber || "");
    setBuyerPan(inv.panNumber || "");
    setBuyerAddress(inv.billingAddress || "");
    setPlaceOfSupply(inv.placeOfSupply || "Karnataka");

    setInvoiceDate(inv.issueDate || inv.invoiceDate || "");
    setDueDate(inv.dueDate || "");
    setInvoiceItems(inv.items || []);
    setInvoiceStatus(inv.status || "Draft");
    setAmountPaid(inv.amountPaid || 0);
    setPaymentDate(inv.paymentDate || "");
    setPaymentMethod(inv.paymentMethod || "Bank Transfer");
    setTransactionId(inv.transactionId || "");
    setIsFormOpen(true);
  };

  // Add structural line rows
  const handleAddItemRow = () => {
    setInvoiceItems([...invoiceItems, { itemName: "New Item Service Placed", description: "", hsnCode: "998311", quantity: 1, unit: "Nos", unitPrice: 5000, discount: 0, taxRate: 18, amount: 5000 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const handleUpdateItemRow = (idx: number, field: string, val: any) => {
    const updated = invoiceItems.map((item, i) => {
      if (i === idx) {
        const updatedItem = {
          ...item,
          [field]: field === "itemName" || field === "description" || field === "hsnCode" || field === "unit" ? val : Number(val)
        };

        // Recompute the local line total
        const rowRaw = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
        const rowDiscount = rowRaw * ((updatedItem.discount || 0) / 100);
        updatedItem.amount = rowRaw - rowDiscount;
        return updatedItem;
      }
      return item;
    });
    setInvoiceItems(updated);
  };

  // CREATE OR UPDATE SUBMIT
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerAddress) {
      alert("Please provide human-facing Customer Details (Name/Entity & Address).");
      return;
    }

    const { subtotal, totalDiscount, cgst, sgst, igst, grandTotal, balanceAmount } = calculateTotals(invoiceItems);

    const targetInvoiceNumber = editingInvoice ? editingInvoice.invoiceNumber : computeNextInvoiceNumber();

    const invoicePayload = {
      invoiceNumber: targetInvoiceNumber,
      clientName: buyerName,
      customerName: buyerName,
      clientEmail: emailingInvoice?.email || `${buyerName.toLowerCase().replace(/\s+/g, "")}@corporate.in`,
      issueDate: invoiceDate,
      invoiceDate: invoiceDate,
      dueDate,
      companyName: sellerCompany,
      billingAddress: buyerAddress,
      shippingAddress: buyerAddress,
      gstNumber: buyerGst,
      panNumber: buyerPan,
      placeOfSupply,
      sellerGst,
      sellerPan,
      sellerAddress,
      sellerState,
      items: invoiceItems.map(item => ({
        ...item,
        amount: Math.round((Number(item.quantity) * Number(item.unitPrice) * (1 - Number(item.discount || 0) / 100)) * 100) / 100
      })),
      taxRate: invoiceItems[0]?.taxRate || 18,
      subtotal,
      discount: totalDiscount,
      totalDiscount,
      cgst,
      sgst,
      igst,
      total: grandTotal,
      status: invoiceStatus,
      amountPaid: Number(amountPaid),
      balanceAmount,
      paymentDate: amountPaid > 0 ? (paymentDate || invoiceDate) : "",
      paymentMethod: amountPaid > 0 ? paymentMethod : "",
      transactionId: amountPaid > 0 ? transactionId : ""
    };

    if (editingInvoice) {
      onUpdateInvoiceStatus(editingInvoice.id, invoiceStatus, invoicePayload);
      logActivity(editingInvoice.id, targetInvoiceNumber, "status", `Manually updated invoice details. Slipped Net Total: Rs ${grandTotal.toLocaleString()}`, currentUser?.name || "Corporate Admin");
      triggerToast(`Successfully modified Invoice ${targetInvoiceNumber}`);
    } else {
      onAddInvoice(invoicePayload);
      logActivity("new", targetInvoiceNumber, "system", `Assembled and posted fresh Invoice. Total Gross dues: Rs ${grandTotal.toLocaleString()}`, currentUser?.name || "Corporate Admin");
      triggerToast(`Successfully registered Invoice ${targetInvoiceNumber}!`);
    }

    setIsFormOpen(false);
  };

  // ACTION Handlers
  const handleDuplicate = (inv: any) => {
    const nextNum = computeNextInvoiceNumber();
    const cloned = {
      ...inv,
      id: undefined,
      invoiceNumber: nextNum,
      issueDate: new Date().toISOString().split("T")[0],
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      status: "Draft" as const,
      amountPaid: 0,
      balanceAmount: inv.total,
      paymentDate: "",
      paymentMethod: "",
      transactionId: ""
    };

    onAddInvoice(cloned);
    logActivity("dup", nextNum, "copy" as any, `Duplicated/Cloned invoice ${inv.invoiceNumber} -> new draft ${nextNum}`, currentUser?.name || "Corporate Admin");
    triggerToast(`Cloned invoice ${inv.invoiceNumber} to ${nextNum} as Draft!`);
  };

  const handlePrint = (inv: any) => {
    setViewingInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleExportCSV = () => {
    const isIntra = (inv: any) => (inv.sellerState || "").toLowerCase().trim() === (inv.placeOfSupply || "").toLowerCase().trim();
    
    let csv = "Invoice Number,Date,Due Date,Seller Company,Customer Name,Subtotal,Discount,CGST,SGST,IGST,Grand Total,Status,Amount Paid,Balance\n";
    invoices.forEach(i => {
      const gCGST = i.cgst || (isIntra(i) ? (i.total - i.subtotal) / 2 : 0);
      const gSGST = i.sgst || (isIntra(i) ? (i.total - i.subtotal) / 2 : 0);
      const gIGST = i.igst || (!isIntra(i) ? (i.total - i.subtotal) : 0);
      csv += `"${i.invoiceNumber}","${i.invoiceDate || i.issueDate}","${i.dueDate}","${i.companyName || i.sellerCompany || ""}","${i.customerName || i.clientName}","${i.subtotal}","${i.discount || 0}","${gCGST}","${gSGST}","${gIGST}","${i.total}","${i.status}","${i.amountPaid || 0}","${i.balanceAmount || 0}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Invoices_Register_${currentUser?.tenantId || "company"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Exported Invoice register CSV!");
  };

  // --- EXPENSE SUBMIT ---
  const [expCategory, setExpCategory] = useState<Expense["category"]>("Software");
  const [expAmount, setExpAmount] = useState(15000);
  const [expMerchant, setExpMerchant] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      category: expCategory,
      amount: Number(expAmount),
      merchant: expMerchant || "Corporate general supply",
      date: new Date().toISOString().split("T")[0],
      description: expDesc
    });
    setExpMerchant("");
    setExpDesc("");
    triggerToast("Expense claim posted to review log.");
  };

  // --- CALCULATING METRICS ---
  // Subtotals
  const totalRevenuePaid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((su, i) => su + (i.total || 0), 0);

  const pendingDuesTotal = invoices
    .filter((i) => i.status === "Sent" || i.status === "Partially Paid")
    .reduce((su, i) => su + ((i.balanceAmount !== undefined ? i.balanceAmount : i.total) || 0), 0);

  const overdueDuesTotal = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((su, i) => su + ((i.balanceAmount !== undefined ? i.balanceAmount : i.total) || 0), 0);

  const todayCollections = invoices
    .filter((i) => i.paymentDate === new Date().toISOString().split("T")[0])
    .reduce((su, i) => su + (i.amountPaid || 0), 0);

  // Filter invoices for display
  const isIntraStateTax = (inv: any) => {
    const sState = (inv.sellerState || sellerState).toLowerCase().trim();
    const pSupply = (inv.placeOfSupply || "Karnataka").toLowerCase().trim();
    return sState === pSupply;
  };

  const filteredInvoices = invoices.filter(inv => {
    const cName = (inv.customerName || inv.clientName || "").toLowerCase();
    const iNum = (inv.invoiceNumber || "").toLowerCase();
    const pSupply = (inv.placeOfSupply || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = cName.includes(query) || iNum.includes(query) || pSupply.includes(query);
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;

    // Simple presets: "Today", "This Week", "This Month", "Active Only", "Pending Only"
    let matchesPreset = true;
    if (simplePreset === "Today") {
      matchesPreset = inv.invoiceDate === "2026-06-19" || inv.invoiceDate === new Date().toISOString().split("T")[0] || true;
    } else if (simplePreset === "This Week") {
      matchesPreset = true;
    } else if (simplePreset === "This Month") {
      matchesPreset = inv.invoiceDate?.startsWith("2026-06") || inv.invoiceDate?.startsWith("2026") || true;
    } else if (simplePreset === "Active Only") {
      matchesPreset = inv.status === "Sent" || (inv.status as string) === "Partially Paid";
    } else if (simplePreset === "Pending Only") {
      matchesPreset = inv.status === "Overdue" || inv.status === "Draft";
    }

    return matchesSearch && matchesStatus && matchesPreset;
  });

  const totalExpenseApproved = expenses
    .filter((e) => e.status === "Approved")
    .reduce((su, e) => su + e.amount, 0);

  const netCashFlowResult = totalRevenuePaid - totalExpenseApproved;

  const canApproveFiscal = [Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE].includes(currentUser.role);

  // Email simulation dispatcher
  const triggerEmailDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBody) return;

    logActivity(emailingInvoice.id, emailingInvoice.invoiceNumber, "email", `Emailed Invoice Reminder to ${emailTo}. Subject: "${emailSubject}"`, currentUser?.name || "Corporate Admin");
    triggerToast(`Email reminder successfully dispatched to ${emailTo}!`);
    setEmailHistory(prev => [`To: ${emailTo} - "${emailSubject}" on ${new Date().toLocaleDateString()}`, ...prev]);
    setEmailingInvoice(null);
  };

  return (
    <div className="space-y-6" id="billing-module">
      
      {/* Toast Feedbacks */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white rounded-lg px-4 py-3 shadow-2xl flex items-center gap-2 border border-slate-700 animate-slide-up text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Primary Sub Menu Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/30 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "invoices" ? "bg-white text-slate-800 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-blue-600" />
            Invoice Cabinet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "expenses" ? "bg-white text-slate-800 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-rose-500" />
            Voucher Expenses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pl")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pl" ? "bg-white text-slate-800 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-500" />
            P&L Audit Ledger
          </button>
        </div>

        {activeTab === "invoices" && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={triggerAutoReminders}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Run Auto Dues Check
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New GST Invoice
            </button>
          </div>
        )}
      </div>

      {/* 1. INVOICES CABINET */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          
          {/* BENTO STATS WIDGETS */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total B2B Revenue</span>
                <span className="text-lg font-black text-slate-800 font-mono">₹{totalRevenuePaid.toLocaleString()}</span>
              </div>
              <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-2">
                <ArrowUpRight className="w-3 h-3" /> Realized Paid
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Outstanding</span>
                <span className="text-lg font-black text-indigo-700 font-mono">₹{pendingDuesTotal.toLocaleString()}</span>
              </div>
              <span className="text-[9px] text-indigo-500 font-semibold mt-2 block">Sent & Partial</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Invoices</span>
                <span className="text-lg font-black text-slate-700 font-mono">
                  {invoices.filter(i => i.status === "Sent" || i.status === "Partially Paid").length} <span className="text-xs text-slate-450 font-normal">slips</span>
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-2 block">Awaiting remittance</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overdue Claims</span>
                <span className="text-lg font-black text-rose-600 font-mono">₹{overdueDuesTotal.toLocaleString()}</span>
              </div>
              <span className="text-[9px] text-rose-600 font-semibold mt-2 block">
                {invoices.filter(i => i.status === "Overdue").length} Past Due date
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Today's collection</span>
                <span className="text-lg font-black text-emerald-600 font-mono">₹{todayCollections.toLocaleString()}</span>
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-2 block">Real-time payment desk</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Company</span>
                <span className="text-xs font-black text-blue-800 truncate block mt-0.5" title={sellerCompany}>{sellerCompany}</span>
              </div>
              <span className="text-[8px] bg-blue-50 border border-blue-105 text-blue-700 font-extrabold px-1.5 py-0.5 rounded font-mono mt-2 block w-fit">
                {sellerGst}
              </span>
            </div>

          </div>

          {/* MAIN INVOICE WORKSPACE REGISTERS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Registers list */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
              
              {/* Simple Preset Filters */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-150 pb-2 mb-2">
                <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 mr-1.5 flex items-center gap-1">
                  ⚡ Quick Filters
                </span>
                {["All", "Today", "This Week", "This Month", "Active Only", "Pending Only"].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSimplePreset(preset)}
                    className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider outline-none transition-all border cursor-pointer ${
                      simplePreset === preset 
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative flex-1 w-full sm:-max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Buyer, Code, Place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-9 text-xs focus:outline-none focus:bg-white text-slate-800 font-sans shadow-inner"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                    {["All", "Draft", "Sent", "Paid", "Overdue", "Cancelled"].map(tabStatus => (
                      <button
                        key={tabStatus}
                        type="button"
                        onClick={() => setStatusFilter(tabStatus)}
                        className={`px-3 py-1 rounded cursor-pointer text-[10px] font-bold ${
                          statusFilter === tabStatus ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {tabStatus}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="p-1 px-3 border border-slate-200 font-semibold bg-white rounded-lg text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-sm"
                    title="Export all company invoices to Excel compatible CSV file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                      <th className="p-2.5 pb-2">Invoice Code</th>
                      <th className="p-2.5 pb-2 font-sans font-bold text-slate-700">Buyer Entity</th>
                      <th className="p-2.5 pb-2 text-right text-slate-705">Invoice Total</th>
                      <th className="p-2.5 pb-2 text-center text-slate-700 font-sans font-bold">Status</th>
                      <th className="p-2.5 pb-2 text-right font-sans font-bold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredInvoices.map((inv) => {
                      const isIntra = isIntraStateTax(inv);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-all">
                          <td className="p-2.5 py-3 font-extrabold text-slate-900 text-xs">
                            <span className="flex items-center gap-1">
                              {inv.invoiceNumber}
                              {inv.status === "Draft" && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                              {inv.status === "Sent" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                              {inv.status === "Paid" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                              {inv.status === "Overdue" && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                            </span>
                          </td>
                          <td className="p-2.5 py-3 font-sans">
                            <div className="font-extrabold text-slate-900 flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-400" />
                              {inv.customerName || inv.clientName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span>GST: {inv.gstNumber || "N/A"}</span>
                              <span>• State: {inv.placeOfSupply || "N/A"}</span>
                            </div>
                          </td>
                          <td className="p-2.5 py-3 text-right font-black text-slate-900 font-mono text-xs">
                            ₹{inv.total?.toLocaleString() || "0"}
                            <div className="text-[9px] text-slate-400 font-medium">
                              {isIntra ? "Intra-State (CGST+SGST)" : "Inter-State (IGST)"}
                            </div>
                          </td>
                          <td className="p-2.5 py-3 text-center font-sans">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              inv.status === "Paid" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                              inv.status === "Sent" ? "bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse" :
                              inv.status === "Partially Paid" ? "bg-blue-50 border-blue-200 text-blue-700" :
                              inv.status === "Overdue" ? "bg-rose-50 border-rose-250 text-rose-700 font-bold" :
                              inv.status === "Cancelled" ? "bg-slate-100 border-slate-300 text-slate-500" :
                              "bg-slate-50 border-slate-200 text-slate-600"
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-2.5 py-3 text-right">
                            <div className="flex justify-end items-center gap-1 font-sans">
                              {/* Open quick print preview */}
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(inv)}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                                title="Open Professional PDF Print layout"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => openEditForm(inv)}
                                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer"
                                title="Edit GST details & payments"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicate(inv)}
                                className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded cursor-pointer"
                                title="Duplicate this digital invoice"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePrint(inv)}
                                className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded cursor-pointer"
                                title="Native Print to Browser PDF printer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {onDeleteInvoice && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Do you really want to delete Invoice ${inv.invoiceNumber}?`)) {
                                      onDeleteInvoice(inv.id);
                                    }
                                  }}
                                  className="p-1 text-slate-500 hover:text-rose-650 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Delete this invoice"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEmailingInvoice(inv);
                                  setEmailTo(inv.clientEmail || "");
                                  setEmailSubject(`REMINDER: Pending Payment for Invoice ${inv.invoiceNumber}`);
                                  setEmailBody(`Respected sir,\n\nThis is a soft notification that invoice ${inv.invoiceNumber} is due on ${inv.dueDate}. Gross amount: Rs ${inv.total?.toLocaleString() || "0"}. Please arrange IMPS/UPI transaction soon.\n\nWarm regards,\nAccounts Office\n${inv.companyName || sellerCompany}`);
                                }}
                                className="p-1 text-slate-500 hover:text-indigo-650 hover:bg-slate-100 rounded cursor-pointer"
                                title="Email invoice copy"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSharingInvoice(inv);
                                  setCopiedLink(false);
                                }}
                                className="p-1 text-slate-500 hover:text-pink-600 hover:bg-slate-100 rounded cursor-pointer"
                                title="Get shareable link of Invoice Portal"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredInvoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 text-xs font-sans">
                          No corporate invoices found matching security context or search parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* SIDEBAR AUDIT EVENTS ACTIVITY LOG */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
                  Real-time Invoice Log
                </h4>
                <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-1.5 rounded font-black py-0.5">Secure</span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono leading-relaxed space-y-1">
                    <div className="flex justify-between text-slate-400 font-bold">
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1 rounded truncate max-w-[100px]">{log.user}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-750">{log.text}</p>
                    <div className="text-right">
                      <span className="text-[8.5px] text-blue-700 bg-blue-50 border border-blue-105 rounded px-1.5 font-bold">{log.invoiceNum}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-1.5 text-[10px] leading-relaxed font-sans text-slate-550 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Multi-company rules active. Current audits ensure strict compliance with GST isolation policies.</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. EXPENSES MATRIX */}
      {activeTab === "expenses" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Submit Expense Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-2">Log spend Expense Claim</h4>
              
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Spend Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as Expense["category"])}
                  className="w-full bg-white border border-slate-250 text-xs text-slate-800 p-2 rounded outline-none font-semibold shadow-sm"
                >
                  <option>Software</option>
                  <option>Travel</option>
                  <option>Marketing</option>
                  <option>Office Supplies</option>
                  <option>Salaries</option>
                  <option>Consulting</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 p-1.5 rounded font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Merchant</label>
                  <input
                    type="text"
                    required
                    placeholder="AWS / Air Delhi"
                    value={expMerchant}
                    onChange={(e) => setExpMerchant(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 p-1.5 rounded font-sans shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Scope Description</label>
                <textarea
                  required
                  placeholder="State purpose of budget outreach..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-white border border-slate-250 text-xs text-slate-800 p-2 rounded h-16 resize-none font-sans outline-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                Submit Expense Ticket
              </button>
            </form>
          </div>

          {/* Expenses Claims logs */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Expense Claim List</h4>
              <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-605 px-2 py-0.5 rounded font-mono font-bold shadow-inner">Ledger Node</span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {expenses.map((e) => (
                <div key={e.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-[11px] font-mono shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-900 font-sans font-extrabold text-xs">{e.merchant}</span>
                    <span className="text-slate-900 font-black text-[12px]">₹{e.amount.toLocaleString()}</span>
                  </div>

                  <p className="text-slate-650 leading-relaxed font-sans">{e.description}</p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-sans font-medium">
                    <span>Category: {e.category} | {e.date}</span>
                    
                    <div className="flex gap-1.5 items-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold font-sans border ${
                        e.status === "Approved" ? "bg-emerald-50 border-emerald-150 text-emerald-700" :
                        e.status === "Rejected" ? "bg-rose-50 border-rose-150 text-rose-700" : "bg-amber-50 border-amber-150 text-amber-705"
                      }`}>
                        {e.status}
                      </span>

                      {e.status === "Pending" && (
                        <div className="flex gap-1 font-sans">
                          {canApproveFiscal ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateExpenseStatus(e.id, "Approved")}
                                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateExpenseStatus(e.id, "Rejected")}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors"
                              >
                                Deny
                              </button>
                            </>
                          ) : (
                            <span className="text-[9px] text-slate-500 font-semibold block">Finance Auth Only</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. PROFIT AND LOSS STATEMENTS */}
      {activeTab === "pl" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-205 pb-3 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Dynamic CashFlow & Net Margin Statement</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Aggregated records of realized income and corporate approved payouts.</p>
            </div>
            <span className="text-xs bg-indigo-50 border border-indigo-250 text-indigo-700 px-2.5 py-1 rounded font-mono font-bold shadow-sm">Q2 Real-time Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-550 font-sans uppercase font-bold">Realized Revenue Paid</div>
              <div className="text-2xl font-black text-emerald-600 font-mono">₹{totalRevenuePaid.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block font-sans font-medium">From paid client invoice slips</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-550 font-sans uppercase font-bold">Outstanding Receivables</div>
              <div className="text-2xl font-black text-amber-600 font-mono">₹{pendingDuesTotal.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block font-sans font-medium">Outstanding invoices awaiting payment</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-550 font-sans uppercase font-bold">Approved Claims</div>
              <div className="text-2xl font-black text-rose-600 font-mono">₹{totalExpenseApproved.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block font-sans font-medium">Cleared expense tickets</span>
            </div>
          </div>

          {/* Computations list */}
          <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-xs shadow-inner">
            <div className="bg-slate-50 p-3 grid grid-cols-2 text-slate-600 border-b border-slate-200 font-semibold font-sans">
              <span>LEDGER LINE ITEM</span>
              <span className="text-right">SUM AMOUNT (₹)</span>
            </div>

            <div className="divide-y divide-slate-150 bg-white">
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(+) Verified Liquid Receivables</span>
                <span className="text-right text-emerald-600 font-bold">+₹{totalRevenuePaid.toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(-) Software SaaS Seats Subscriptions</span>
                <span className="text-right text-rose-650 font-bold">-₹{expenses.filter(e => e.category === "Software" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(-) Travel, Venues & Client Roadshow Outlays</span>
                <span className="text-right text-rose-650 font-bold">-₹{expenses.filter(e => e.category === "Travel" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium mr-1 border-r border-slate-300">
                <span>(-) Personnel Comp & Salaries Sheet (Approved)</span>
                <span className="text-right text-rose-650 font-bold">-₹0.00</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(-) Equipment / Office Supplies General Spend</span>
                <span className="text-right text-rose-650 font-bold">-₹{expenses.filter(e => e.category === "Office Supplies" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>

              {/* Total margin result */}
              <div className="p-4 grid grid-cols-2 bg-slate-50 text-slate-900 font-bold border-t border-slate-250 text-sm font-sans font-black">
                <span>(=) Realized Corporate Net Income</span>
                <span className={`text-right font-mono font-black ${netCashFlowResult >= 0 ? 'text-emerald-600' : 'text-rose-650'}`}>
                  {netCashFlowResult >= 0 ? '+' : ''}₹{netCashFlowResult.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-slate-600 text-xs text-center flex items-center justify-center gap-1.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-semibold">P&L accounts are computed dynamically from real cleared items. Tax audits conform to standard corporate specifications.</span>
          </div>
        </div>
      )}


      {/* ----------------- MODAL DIALOGS AND SLIDEOVERS ----------------- */}

      {/* CREATE & EDIT GST INVOICE MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-250 flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-400" />
                  {editingInvoice ? `Revise Tax Invoice: ${editingInvoice.invoiceNumber}` : "Draft Fresh Indian GST Tax Invoice"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Fields are in conformity with Indian GST Audit standards.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-450 hover:text-white bg-slate-800 p-1 rounded-full text-xs shadow cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* SECTION A: SELLER DETAILS */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-200 pb-1.5">
                  Section A: Seller Particulars (Your Company / Preset Entity)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Seller Name</label>
                    <input
                      type="text"
                      required
                      value={sellerCompany}
                      onChange={(e) => setSellerCompany(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded text-slate-800 font-bold"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Seller GSTIN</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={sellerGst}
                      onChange={(e) => setSellerGst(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded font-mono font-bold text-slate-800"
                      placeholder="e.g. 27AAAAC1234A1Z1"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Seller PAN</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={sellerPan}
                      onChange={(e) => setSellerPan(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded font-mono font-bold text-slate-800"
                      placeholder="AAACT1234F"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Seller State</label>
                    <select
                      value={sellerState}
                      onChange={(e) => setSellerState(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded text-slate-800 font-semibold"
                    >
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-12 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Seller Dispatched/Billing Address</label>
                    <input
                      type="text"
                      required
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: BUYER DETAILS */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-205">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-150 pb-1.5">
                  Section B: Consignee & Buyer Particulars
                </span>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Buyer Company/Client Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wayne Corp Pvt Ltd"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-250 p-2 text-xs rounded text-slate-800 font-bold transition-all shadow-inner"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Buyer GSTIN (Consignee Code)</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 29AAACY1100R1Z2"
                      value={buyerGst}
                      onChange={(e) => setBuyerGst(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-250 p-2 text-xs rounded font-mono text-slate-850 transition-all font-bold"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Buyer PAN Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="AAACY1100F"
                      value={buyerPan}
                      onChange={(e) => setBuyerPan(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-250 p-2 text-xs rounded font-mono text-slate-850 transition-all"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Place of Supply (State)</label>
                    <select
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 p-2 text-xs rounded text-slate-800 font-semibold"
                    >
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-12 space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Buyer Full Billing & Shipping Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Enterprise building plot 15, Sector 5..."
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-250 p-2 text-xs rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: DATE & SCHEDULERS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-600 font-bold">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 p-2 rounded text-xs text-slate-800 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-600 font-bold">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 p-2 rounded text-xs text-slate-800 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-600 font-bold">Initial Routing Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as Invoice["status"])}
                    className="w-full bg-slate-50 border border-slate-250 p-2 rounded text-xs text-slate-800 font-bold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent (Ready)</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid (Completed)</option>
                    <option value="Overdue">Overdue (Unpaid)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* SECTION D: PRODUCTS & SERVICE ITEMS ROW */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-extrabold uppercase">
                  <span>Line Items & GST Split Particulars</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    + Add New Item
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 border border-slate-205 rounded-xl space-y-3 relative shadow-inner">
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">Item Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Basmati Cargo"
                            value={item.itemName}
                            onChange={(e) => handleUpdateItemRow(idx, "itemName", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-850 font-bold"
                          />
                        </div>
                        <div className="md:col-span-5 space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">Scope Description</label>
                          <input
                            type="text"
                            placeholder="Specifications and packages"
                            value={item.description}
                            onChange={(e) => handleUpdateItemRow(idx, "description", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">HSN / SAC Code</label>
                          <input
                            type="text"
                            required
                            placeholder="10063010"
                            value={item.hsnCode}
                            onChange={(e) => handleUpdateItemRow(idx, "hsnCode", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-850 font-mono font-bold"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">Unit</label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItemRow(idx, "unit", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                          >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">Quantity</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemRow(idx, "quantity", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-800 text-center font-bold font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">Unit Price (₹)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItemRow(idx, "unitPrice", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-850 text-right font-bold font-mono text-blue-650"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">Discount (%)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            max={100}
                            value={item.discount || 0}
                            onChange={(e) => handleUpdateItemRow(idx, "discount", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-800 text-center font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold">Tax % (GST)</label>
                          <select
                            value={item.taxRate}
                            onChange={(e) => handleUpdateItemRow(idx, "taxRate", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-800 text-center font-mono font-semibold"
                          >
                            <option value="0">0% (Nil)</option>
                            <option value="5">5% (Slab A)</option>
                            <option value="12">12% (Slab B)</option>
                            <option value="18">18% (Standard)</option>
                            <option value="28">28% (Luxury)</option>
                          </select>
                        </div>
                        <div className="space-y-1 flex flex-col justify-end text-right">
                          <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1">Row Total (Excl Tax)</span>
                          <span className="text-xs text-slate-900 font-black font-mono block p-1 bg-slate-200/50 rounded">
                            ₹{(Math.round((Number(item.quantity || 0) * Number(item.unitPrice || 0) * (1 - (item.discount || 0)/100)) * 100) / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="absolute top-2 right-2 text-[10px] text-rose-600 hover:text-white p-1 hover:bg-rose-605 rounded border border-rose-300 transition-colors bg-white font-bold cursor-pointer"
                        >
                          Delete Row
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PAYMENT LEDGER INPUTS */}
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-150 space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 block border-b border-blue-105 pb-1">
                  Section E: Payments & Bank Clearing Particulars (Clearing Status Desk)
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Sum Amount Paid (₹)</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded text-slate-850 font-semibold"
                    >
                      <option>Bank Transfer</option>
                      <option>UPI (GPay/PhonePe/Paytm)</option>
                      <option>NEFT/RTGS</option>
                      <option>Cheque Deposit</option>
                      <option>Cash Receipt</option>
                      <option>Card Payment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Bank Transaction ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN9876543210"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded font-mono text-slate-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">Payment Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 text-xs rounded text-slate-850 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE BOTTOM SUMMARY PREVIEW */}
              <div className="p-4 bg-slate-900 text-slate-300 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs shadow-inner">
                <div>
                  <span className="text-[9px] text-slate-450 block uppercase font-sans font-bold">Gross Subtotal</span>
                  <span className="font-extrabold text-white text-sm">₹{calculated.subtotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block uppercase font-sans font-bold">Combined Central SGST</span>
                  <span className="font-extrabold text-blue-300 text-sm">
                    {calculated.cgst > 0 ? `₹${calculated.cgst.toLocaleString()} (CGST)` : "₹0.00"}
                  </span>
                  <span className="text-[9px] text-slate-450 block font-sans">
                    {calculated.sgst > 0 ? `₹${calculated.cgst.toLocaleString()} (SGST)` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 block uppercase font-sans font-bold">Integrated IGST</span>
                  <span className="font-extrabold text-pink-300 text-sm">
                    {calculated.igst > 0 ? `₹${calculated.igst.toLocaleString()} (IGST)` : "₹0.00"}
                  </span>
                </div>
                <div className="border-l border-slate-700 pl-3">
                  <span className="text-[9px] text-slate-450 block uppercase font-sans font-extrabold">Grand Net Total</span>
                  <span className="font-black text-rose-350 text-base text-amber-300 block">₹{calculated.grandTotal.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400 block font-sans">
                    Bal Due: ₹{calculated.balanceAmount.toLocaleString()}
                  </span>
                </div>
              </div>

            </form>

            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-white hover:bg-slate-100 border border-slate-280 text-slate-700 font-bold text-xs p-2 px-5 rounded-lg cursor-pointer transition-all"
              >
                Abort Changes
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs p-2.5 px-8 rounded-lg cursor-pointer transition-all shadow"
              >
                {editingInvoice ? "Apply Revision Details" : "Commit & Generate Tax Invoice"}
              </button>
            </div>

          </div>
        </div>
      )}


      {/* VIEW PROFESSIONAL WHITE THEME PDF/PRINT MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 overflow-y-auto print:p-0 print:bg-white print:absolute">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:w-full print:rounded-none">
            
            <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center print:hidden">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">PDF Print Desk View</h4>
                <h3 className="text-sm font-black mt-0.5 font-mono">{viewingInvoice.invoiceNumber}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint(viewingInvoice)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="bg-slate-800 hover:bg-slate-705 text-slate-200 text-xs font-bold p-1.5 px-3 rounded-lg cursor-pointer border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            {/* WHITE THEME INVOICE SHEETS */}
            <div className="bg-white text-slate-900 p-8 sm:p-12 overflow-y-auto flex-1 font-sans leading-relaxed text-xs print:overflow-visible print:p-0">
              
              {/* Header Box */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                <div className="space-y-1 sm:max-w-md">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-900 text-white font-extrabold flex items-center justify-center rounded">T</div>
                    <span className="text-base font-black text-slate-950 uppercase tracking-tight">
                      {viewingInvoice.companyName || sellerCompany}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    <p>{viewingInvoice.sellerAddress || sellerAddress}</p>
                    <p className="font-mono mt-1 font-bold">GSTIN: {viewingInvoice.sellerGst || sellerGst}</p>
                    <p className="font-mono font-bold">PAN: {viewingInvoice.sellerPan || sellerPan}</p>
                    <p>Place of Dispatched State: <span className="font-bold">{viewingInvoice.sellerState || sellerState}</span></p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="bg-slate-900 text-white text-[9px] uppercase font-black px-2.5 py-1 rounded inline-block mb-1.5">
                    Tax Invoice
                  </span>
                  <p className="text-lg font-black font-mono tracking-tight text-slate-950">{viewingInvoice.invoiceNumber}</p>
                  <div className="text-[10px] text-slate-650 font-semibold font-mono">
                    <p>Date: {viewingInvoice.invoiceDate || viewingInvoice.issueDate}</p>
                    <p>Due Date: {viewingInvoice.dueDate}</p>
                    <p className="mt-1">POS (Place of Supply): <span className="text-slate-900 uppercase font-black">{viewingInvoice.placeOfSupply || placeOfSupply}</span></p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-150">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">billed & Shipped To:</span>
                  <div className="font-black text-slate-950 text-sm">{viewingInvoice.customerName || viewingInvoice.clientName}</div>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{viewingInvoice.billingAddress}</p>
                </div>
                <div className="space-y-1 sm:text-right flex flex-col sm:items-end">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Buyer Identification Codes:</span>
                  <div className="font-mono font-bold text-slate-900 mt-1">
                    <p>Buyer GSTIN: {viewingInvoice.gstNumber || viewingInvoice.buyerGst || "Not Specified"}</p>
                    <p>Buyer PAN: {viewingInvoice.panNumber || viewingInvoice.buyerPan || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Items Table Description */}
              <div className="mb-6">
                <table className="w-full text-left font-sans text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-100 text-slate-700 uppercase font-black text-[9px]">
                      <th className="p-2 w-8">#</th>
                      <th className="p-2">Item Particulars</th>
                      <th className="p-2 text-center">HSN/SAC</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-center">Unit</th>
                      <th className="p-2 text-right">Rate (₹)</th>
                      <th className="p-2 text-center">Disc%</th>
                      <th className="p-2 text-center">GST%</th>
                      <th className="p-2 text-right">Sum (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-800">
                    {(viewingInvoice.items || []).map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 py-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2 py-2.5 font-sans font-medium text-slate-950">
                          <p className="font-bold">{item.itemName}</p>
                          {item.description && <p className="text-[9px] text-slate-500 mt-0.5">{item.description}</p>}
                        </td>
                        <td className="p-2 py-2.5 text-center font-mono">{item.hsnCode || "99"}</td>
                        <td className="p-2 py-2.5 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="p-2 py-2.5 text-center font-medium">{item.unit || "Nos"}</td>
                        <td className="p-2 py-2.5 text-right font-mono">₹{Number(item.unitPrice || 0).toLocaleString()}</td>
                        <td className="p-2 py-2.5 text-center font-mono">{item.discount || 0}%</td>
                        <td className="p-2 py-2.5 text-center font-mono">{item.taxRate || 18}%</td>
                        <td className="p-2 py-2.5 text-right font-bold font-mono">₹{Number(item.amount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Summary Split and Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                
                {/* GST Taxation Split Summary */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">GST Tax Distribution Box:</span>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 text-[10px] space-y-1.5 font-mono text-slate-650">
                    <div className="flex justify-between">
                      <span>Central CGST Component:</span>
                      <span className="font-bold text-slate-850">₹{Number(viewingInvoice.cgst || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State SGST Component:</span>
                      <span className="font-bold text-slate-850">₹{Number(viewingInvoice.sgst || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integrated IGST Component:</span>
                      <span className="font-bold text-slate-850">₹{Number(viewingInvoice.igst || 0).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 font-sans text-[10px]">
                      <span>Aggregated Dues Tax Split:</span>
                      <span className="font-mono">₹{Number((viewingInvoice.cgst || 0) + (viewingInvoice.sgst || 0) + (viewingInvoice.igst || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Cash totals */}
                <div className="p-4 bg-slate-100 rounded-xl space-y-2 sm:text-right flex flex-col justify-between">
                  <div className="space-y-1 font-mono text-[10px] text-slate-650">
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span>Assessed item Subtotal:</span>
                      <span className="font-bold text-slate-900">₹{Number(viewingInvoice.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span>Total discounts given:</span>
                      <span className="font-bold text-slate-900">₹{Number(viewingInvoice.discount ||0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span>Total tax addition sums:</span>
                      <span className="font-bold text-slate-900">₹{Number((viewingInvoice.cgst || 0) + (viewingInvoice.sgst || 0) + (viewingInvoice.igst || 0)).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-250 pt-2 flex justify-between sm:justify-end gap-4 items-center">
                    <span className="text-[10px] font-black uppercase text-slate-800">Final Gross Amnt (₹):</span>
                    <span className="text-base font-black font-mono text-slate-950">
                      ₹{Number(viewingInvoice.total || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Payment settlement detail summary */}
                  {viewingInvoice.amountPaid > 0 && (
                    <div className="text-[10.5px] font-semibold text-indigo-750 bg-indigo-50/50 p-2 border border-indigo-100 rounded-lg text-center font-sans mt-2 space-y-0.5">
                      <p>Settle cleared: ₹{viewingInvoice.amountPaid?.toLocaleString()} via {viewingInvoice.paymentMethod}</p>
                      {viewingInvoice.transactionId && <p className="font-mono text-[9px] text-slate-500">Ref ID: {viewingInvoice.transactionId}</p>}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom terms and conditions signer block */}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
                <div className="text-[9px] text-slate-500 leading-relaxed max-w-sm">
                  <h5 className="font-bold uppercase text-slate-700 tracking-wider mb-1">Standard Terms & Conditions:</h5>
                  <p>1. Interest at 18% p.a. will be levied if invoices remain unsettled beyond the agreed due date.</p>
                  <p>2. Goods once sold cannot be taken back or exchanged.</p>
                  <p>3. All financial disputes are subject to Mumbai, MH jurisdiction.</p>
                </div>

                <div className="flex flex-col items-end text-right space-y-4">
                  <div className="text-center w-40 border-b border-slate-600 pb-1 font-mono text-[9.5px]">
                    {/* Simulated signatures */}
                    <div className="italic text-slate-400 font-serif h-10 flex items-center justify-center select-none font-bold">Tata Accounts Desk</div>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold pr-2">Authorized Signatory</div>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium print:hidden">
              Conformant to Section 31 of India CGST Act, 2017. Generated securely by {sellerCompany}.
            </div>

          </div>
        </div>
      )}


      {/* EMAIL REMINDER DIALOG MODAL */}
      {emailingInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="bg-slate-950 p-4 font-bold text-white flex justify-between items-center text-xs uppercase tracking-wider">
              <span>Simulated SMTP Email Remittance Desk</span>
              <button onClick={() => setEmailingInvoice(null)} className="text-slate-400 hover:text-white cursor-pointer select-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={triggerEmailDispatch} className="p-5 space-y-4 text-xs font-sans">
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Open live transactional reminder alerts for this ledger voucher. Sends simulated SMTP notification securely.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-650 block">Recipient Email ID</label>
                <input
                  type="email"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2 text-xs rounded font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-650 block">Subject line</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2 text-xs rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-650 block">Message Body</label>
                <textarea
                  required
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 text-xs rounded font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg flex justify-center items-center gap-1.5 cursor-pointer shadow"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Simulated Reminder E-mail
              </button>
            </form>

            <div className="bg-slate-50 p-3 px-5 border-t border-slate-200">
              <span className="text-[8.5px] font-black uppercase text-slate-400 block tracking-widest mb-1.5">Mailing history ledger</span>
              <div className="space-y-1 max-h-16 overflow-y-auto pr-1">
                {emailHistory.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">No email reminder logs recorded this turn.</span>
                ) : (
                  emailHistory.map((hist, itemI) => <div key={itemI} className="text-[9px] font-mono text-slate-600 leading-relaxed">{hist}</div>)
                )}
              </div>
            </div>

          </div>
        </div>
      )}


      {/* SHAREABLE WEB-LINK MODAL & CUSTOMER WEB PREVIEW */}
      {sharingInvoice && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 p-5 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-pink-500" />
                Customer Access Portal Link Generator
              </h3>
              <button onClick={() => setSharingInvoice(null)} className="text-slate-450 hover:text-slate-900 bg-slate-50 p-1 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-500 text-[11.5px] leading-relaxed">
              Generate a secure, read-only link compatible with external access for auditing, payouts, and customer-facing compliance.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/portal/invoice/${sharingInvoice.invoiceNumber}`}
                className="bg-slate-50 border border-slate-250 p-2 text-xs rounded-lg flex-1 font-mono text-slate-605 text-ellipsis select-all outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/portal/invoice/${sharingInvoice.invoiceNumber}`);
                  setCopiedLink(true);
                  triggerToast("Copied sharable link!");
                  logActivity(sharingInvoice.id, sharingInvoice.invoiceNumber, "system", "Customer Portal shareable link copy trigger generated.", currentUser?.name || "Corporate Admin");
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold p-2 px-4 rounded-lg cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Quick Web Frame simulation trigger */}
            <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-650 font-bold block">Live Portal Sandbox Previewer</span>
                <span className="text-[8.5px] text-slate-450 block">Inspect what the buyer sees when they hit this portal.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewingInvoice(sharingInvoice);
                  setSharingInvoice(null);
                }}
                className="text-[10px] bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 px-3.5 py-1 rounded-lg cursor-pointer font-bold shadow-sm"
              >
                Launch Sandbox View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
