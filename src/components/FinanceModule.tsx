import React, { useState } from "react";
import { Invoice, Expense, UserProfile, Role } from "../types";
import { Plus, Receipt, Calculator, AlertCircle, Sparkles, Building, Trash, Coins } from "lucide-react";

interface FinanceModuleProps {
  invoices: Invoice[];
  expenses: Expense[];
  onAddInvoice: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "total"> & { total: number }) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: Invoice["status"]) => void;
  onAddExpense: (expense: Omit<Expense, "id" | "status">) => void;
  onUpdateExpenseStatus: (expenseId: string, status: Expense["status"]) => void;
  currentUser: UserProfile;
  initialTab?: "invoices" | "expenses" | "pl";
}

export default function FinanceModule({
  invoices,
  expenses,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onAddExpense,
  onUpdateExpenseStatus,
  currentUser,
  initialTab = "invoices"
}: FinanceModuleProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "expenses" | "pl">(initialTab);

  // New Invoice State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
    { description: "System Orchestration Pack", quantity: 1, unitPrice: 2000 }
  ]);

  // New Expense State
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expCategory, setExpCategory] = useState<Expense["category"]>("Software");
  const [expAmount, setExpAmount] = useState(150);
  const [expMerchant, setExpMerchant] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const handleAddItemRow = () => {
    setInvoiceItems([...invoiceItems, { description: "Extra Consulting Hours", quantity: 10, unitPrice: 150 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const handleUpdateItemRow = (idx: number, field: "description" | "quantity" | "unitPrice", val: any) => {
    const updated = invoiceItems.map((item, i) => {
      if (i === idx) {
        return {
          ...item,
          [field]: field === "description" ? val : Number(val)
        };
      }
      return item;
    });
    setInvoiceItems(updated);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !dueDate) return;

    // Compute totals
    const subtotal = invoiceItems.reduce((su, item) => su + (item.quantity * item.unitPrice), 0);
    const taxVal = subtotal * (taxRate / 100);
    const total = subtotal + taxVal - discount;

    onAddInvoice({
      clientName,
      clientEmail,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate,
      items: invoiceItems.map((item) => ({ ...item, amount: item.quantity * item.unitPrice })),
      taxRate,
      discount,
      total,
      status: "Draft"
    });

    setClientName("");
    setClientEmail("");
    setDueDate("");
    setInvoiceItems([{ description: "System Orchestration Pack", quantity: 1, unitPrice: 2000 }]);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      category: expCategory,
      amount: Number(expAmount),
      merchant: expMerchant || "Corporate general spend",
      date: new Date().toISOString().split("T")[0],
      description: expDesc
    });
    setExpMerchant("");
    setExpDesc("");
    setIsAddingExpense(false);
  };

  // Profit and Loss calculations
  const totalRevenuePaid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((su, i) => su + i.total, 0);
  const totalRevenuePending = invoices
    .filter((i) => i.status === "Sent" || i.status === "Partially Paid")
    .reduce((su, i) => su + i.total, 0);
  const totalRevenueOverdue = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((su, i) => su + i.total, 0);

  const totalExpenseApproved = expenses
    .filter((e) => e.status === "Approved")
    .reduce((su, e) => su + e.amount, 0);

  const netCashFlowResult = totalRevenuePaid - totalExpenseApproved;

  const canApproveFiscal = [Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE].includes(currentUser.role);

  return (
    <div className="space-y-6" id="finance-module">
      
      {/* Sub menu selector */}
      <div className="flex bg-white p-1 rounded-lg border border-slate-200 w-fit shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "invoices" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Invoice Generator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "expenses" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
          }`}
        >
          Expense Claims
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pl")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pl" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
          }`}
        >
          Profit & Loss Balance
        </button>
      </div>

      {/* 1. INVOICES SCREEN */}
      {activeTab === "invoices" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Create Invoice Dynamic Form */}
          <div className="xl:col-span-5 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" /> Synthesize Client Invoice
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Client Entity</label>
                  <input
                    type="text"
                    required
                    placeholder="Wayne Enterprises"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 focus:outline-none p-2 rounded shadow-sm font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Billing Email</label>
                  <input
                    type="email"
                    required
                    placeholder="billing@waynecorp.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 focus:outline-none p-2 rounded shadow-sm font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 focus:outline-none p-1.5 rounded font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Discount ($)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 focus:outline-none p-1.5 rounded font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-[11px] text-slate-800 focus:outline-none p-1 rounded font-mono shadow-sm"
                  />
                </div>
              </div>

              {/* Dynamic item rows */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-indigo-650 hover:text-indigo-700 cursor-pointer flex items-center gap-0.5 font-bold font-sans"
                  >
                    + Add Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-2 border border-slate-200 rounded shadow-inner">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleUpdateItemRow(idx, "description", e.target.value)}
                        className="md:col-span-6 bg-white border border-slate-200 rounded p-1 text-[11px] text-slate-800 font-sans outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemRow(idx, "quantity", e.target.value)}
                        className="md:col-span-2 bg-white border border-slate-200 rounded p-1 text-[11px] text-slate-800 font-mono text-center font-bold outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItemRow(idx, "unitPrice", e.target.value)}
                        className="md:col-span-3 bg-white border border-slate-200 rounded p-1 text-[11px] text-slate-805 font-mono text-right text-indigo-700 font-bold outline-none"
                      />
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="md:col-span-1 text-[10px] text-rose-600 hover:text-rose-700 font-sans font-black cursor-pointer text-center"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-550 text-white font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow"
              >
                Assemble & Publish Invoice
              </button>
            </form>
          </div>

          {/* Published Invoices Table */}
          <div className="xl:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ledger Accounts Invoices</h4>
            
            <div className="overflow-x-auto whitespace-nowrap">
              <table className="w-full text-left text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                    <th className="p-2 pb-2">Invoice Code</th>
                    <th className="p-2 pb-2 font-sans font-bold">Client Entity</th>
                    <th className="p-2 pb-2 text-right">Sum Total</th>
                    <th className="p-2 pb-2 text-center font-sans font-bold">Slip Status</th>
                    <th className="p-2 pb-2 text-right font-sans font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-all">
                      <td className="p-2 py-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-2 py-3 font-sans font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> {inv.clientName}</span>
                      </td>
                      <td className="p-2 py-3 text-right font-black text-slate-900 font-mono">${inv.total.toLocaleString()}</td>
                      <td className="p-2 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-sans border ${
                          inv.status === "Paid" ? "bg-emerald-50 border-emerald-150 text-emerald-700" :
                          inv.status === "Sent" ? "bg-indigo-50 border-indigo-150 text-indigo-700" :
                          inv.status === "Overdue" ? "bg-rose-50 border-rose-150 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-550"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-2 py-3 text-right">
                        <div className="flex justify-end gap-1 font-sans">
                          {inv.status === "Draft" && (
                            <button
                              type="button"
                              onClick={() => onUpdateInvoiceStatus(inv.id, "Sent")}
                              className="text-[10px] bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-md cursor-pointer shadow-sm transition-colors"
                            >
                              Dispatch
                            </button>
                          )}
                          {inv.status === "Sent" && (
                            <button
                              type="button"
                              onClick={() => onUpdateInvoiceStatus(inv.id, "Paid")}
                              className="text-[10px] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-md cursor-pointer shadow-sm transition-colors"
                            >
                              Paid Verified
                            </button>
                          )}
                          {inv.status === "Overdue" && (
                            <button
                              type="button"
                              onClick={() => onUpdateInvoiceStatus(inv.id, "Paid")}
                              className="text-[10px] bg-emerald-50 border border-emerald-205 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-md cursor-pointer shadow-sm transition-colors"
                            >
                              Settle Claim
                            </button>
                          )}
                          {inv.status === "Paid" && (
                            <span className="text-[10px] text-slate-500 font-mono font-medium">✔ Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider border-b border-slate-200 pb-2">Log Spend Expense Claim</h4>
              
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
                  <label className="text-[11px] text-slate-600 font-bold">Amount ($)</label>
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
                    placeholder="AWS / Delta Airlines"
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
                    <span className="text-slate-900 font-black text-[12px]">${e.amount.toLocaleString()}</span>
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
              <div className="text-2xl font-black text-emerald-600 font-mono">${totalRevenuePaid.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block font-sans font-medium">From paid client invoice slips</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-550 font-sans uppercase font-bold">Outstanding Receivables</div>
              <div className="text-2xl font-black text-amber-600 font-mono">${totalRevenuePending.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block font-sans font-medium">Outstanding invoices awaiting payment</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-1 shadow-sm">
              <div className="text-[10px] text-slate-550 font-sans uppercase font-bold">Approved Claims</div>
              <div className="text-2xl font-black text-rose-600 font-mono">${totalExpenseApproved.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block font-sans font-medium font-medium">Cleared expense tickets</span>
            </div>
          </div>

          {/* Computations list */}
          <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-xs shadow-inner">
            <div className="bg-slate-50 p-3 grid grid-cols-2 text-slate-600 border-b border-slate-200 font-semibold font-sans">
              <span>LEDGER LINE ITEM</span>
              <span className="text-right">SUM AMOUNT ($)</span>
            </div>

            <div className="divide-y divide-slate-150 bg-white">
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(+) Verified Liquid Receivables</span>
                <span className="text-right text-emerald-600 font-bold">+${totalRevenuePaid.toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(-) Software SaaS Seats Subscriptions</span>
                <span className="text-right text-rose-650 font-bold">-${expenses.filter(e => e.category === "Software" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(-) Travel, Venues & Client Roadshow Outlays</span>
                <span className="text-right text-rose-650 font-bold">-${expenses.filter(e => e.category === "Travel" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium mr-1">
                <span>(-) Personnel Comp & Salaries Sheet (Approved)</span>
                <span className="text-right text-rose-650 font-bold">-$0.00</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-800 font-medium">
                <span>(-) Equipment / Office Supplies General Spend</span>
                <span className="text-right text-rose-650 font-bold">-${expenses.filter(e => e.category === "Office Supplies" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>

              {/* Total margin result */}
              <div className="p-4 grid grid-cols-2 bg-slate-50 text-slate-900 font-bold border-t border-slate-250 text-sm font-sans font-black">
                <span>(=) Realized Corporate Net Income</span>
                <span className={`text-right font-mono font-black ${netCashFlowResult >= 0 ? 'text-emerald-600' : 'text-rose-650'}`}>
                  {netCashFlowResult >= 0 ? '+' : ''}${netCashFlowResult.toLocaleString()}
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

    </div>
  );
}
