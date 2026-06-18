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
}

export default function FinanceModule({
  invoices,
  expenses,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onAddExpense,
  onUpdateExpenseStatus,
  currentUser
}: FinanceModuleProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "expenses" | "pl">("invoices");

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
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "invoices" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Invoice Generator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "expenses" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Expense Claims
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pl")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "pl" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Profit & Loss Balance
        </button>
      </div>

      {/* 1. INVOICES SCREEN */}
      {activeTab === "invoices" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Create Invoice Dynamic Form */}
          <div className="xl:col-span-5 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-100 tracking-wide border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-400" /> Synthesize Client Invoice
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">Client Entity</label>
                  <input
                    type="text"
                    required
                    placeholder="Wayne Enterprises"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none p-2 rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">Billing Email</label>
                  <input
                    type="email"
                    required
                    placeholder="billing@waynecorp.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none p-2 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none p-1.5 rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">Discount ($)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none p-1.5 rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none p-1 rounded font-mono"
                  />
                </div>
              </div>

              {/* Dynamic item rows */}
              <div className="space-y-2 pt-2 border-t border-slate-850/60">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                  >
                    + Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-950/40 p-2 border border-slate-850/60 rounded">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleUpdateItemRow(idx, "description", e.target.value)}
                        className="md:col-span-6 bg-slate-950 border border-slate-900 border-none rounded p-1 text-[11px] text-slate-200 font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemRow(idx, "quantity", e.target.value)}
                        className="md:col-span-2 bg-slate-950 border border-slate-900 border-none rounded p-1 text-[11px] text-slate-200 font-mono text-center font-bold"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItemRow(idx, "unitPrice", e.target.value)}
                        className="md:col-span-3 bg-slate-950 border border-slate-900 border-none rounded p-1 text-[11px] text-slate-200 font-mono text-right text-indigo-400"
                      />
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="md:col-span-1 text-[10px] text-rose-500 hover:text-rose-450 font-sans font-bold cursor-pointer text-center"
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
                className="w-full bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-lg uppercase tracking-wider"
              >
                Assemble & Publish Invoice
              </button>
            </form>
          </div>

          {/* Published Invoices Table */}
          <div className="xl:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ledger Accounts Invoices</h4>
            
            <div className="overflow-x-auto whitespace-nowrap">
              <table className="w-full text-left text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-801 text-slate-500">
                    <th className="pb-2">Invoice Code</th>
                    <th className="pb-2 font-sans">Client Entity</th>
                    <th className="pb-2 text-right">Sum Total</th>
                    <th className="pb-2 text-center font-sans">Slip Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="text-slate-300">
                      <td className="py-2.5 font-bold text-slate-100">{inv.invoiceNumber}</td>
                      <td className="py-2.5 font-sans font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="flex items-center gap-1"><Building className="w-3 text-slate-500" /> {inv.clientName}</span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-100">${inv.total.toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold font-sans ${
                          inv.status === "Paid" ? "bg-emerald-500/15 text-emerald-400" :
                          inv.status === "Sent" ? "bg-indigo-500/15 text-indigo-400" :
                          inv.status === "Overdue" ? "bg-rose-500/15 text-rose-450" : "bg-slate-500/15 text-slate-400"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-1 font-sans">
                          {inv.status === "Draft" && (
                            <button
                              type="button"
                              onClick={() => onUpdateInvoiceStatus(inv.id, "Sent")}
                              className="text-[10px] bg-indigo-950 border border-indigo-900 text-indigo-400 px-2 py-0.5 rounded cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {inv.status === "Sent" && (
                            <button
                              type="button"
                              onClick={() => onUpdateInvoiceStatus(inv.id, "Paid")}
                              className="text-[10px] bg-emerald-950 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded cursor-pointer"
                            >
                              Paid Verified
                            </button>
                          )}
                          {inv.status === "Overdue" && (
                            <button
                              type="button"
                              onClick={() => onUpdateInvoiceStatus(inv.id, "Paid")}
                              className="text-[10px] bg-emerald-950 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded cursor-pointer animate-pulse"
                            >
                              Settle Claim
                            </button>
                          )}
                          {inv.status === "Paid" && (
                            <span className="text-[10px] text-slate-500 font-mono">✔ Completed</span>
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
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-100 border-b border-slate-800 pb-2">Log Spend Expense Claim</h4>
              
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Spend Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as Expense["category"])}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-400 p-2 rounded outline-none"
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
                  <label className="text-[11px] text-slate-305">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-1 rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-305">Merchant</label>
                  <input
                    type="text"
                    required
                    placeholder="AWS / Delta Airlines"
                    value={expMerchant}
                    onChange={(e) => setExpMerchant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-205 p-1 rounded font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Scope Description</label>
                <textarea
                  required
                  placeholder="State purpose of budget outreach..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 p-2 rounded h-16 resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 rounded transition-all cursor-pointer"
              >
                Submit Expense Ticket
              </button>
            </form>
          </div>

          {/* Expenses Claims logs */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Expense Claim List</h4>
              <span className="text-[10px] text-indigo-400 font-mono">Ledger Node</span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {expenses.map((e) => (
                <div key={e.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-105 font-sans font-bold">{e.merchant}</span>
                    <span className="text-slate-200 font-bold text-[12px]">${e.amount.toLocaleString()}</span>
                  </div>

                  <p className="text-slate-400 leading-relaxed font-sans">{e.description}</p>

                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-950 text-[10px] text-slate-500">
                    <span>Category: {e.category} | {e.date}</span>
                    
                    <div className="flex gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold font-sans ${
                        e.status === "Approved" ? "bg-emerald-500/15 text-emerald-400" :
                        e.status === "Rejected" ? "bg-rose-500/15 text-rose-450" : "bg-amber-500/15 text-amber-400"
                      }`}>
                        {e.status}
                      </span>

                      {e.status === "Pending" && (
                        <div className="flex gap-1 ml-1 font-sans">
                          {canApproveFiscal ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateExpenseStatus(e.id, "Approved")}
                                className="bg-emerald-950 border border-emerald-900 text-emerald-400 px-1.5 py-0.5 rounded text-[9px]"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateExpenseStatus(e.id, "Rejected")}
                                className="bg-rose-950 border border-rose-900 text-rose-400 px-1.5 py-0.5 rounded text-[9px]"
                              >
                                Deny
                              </button>
                            </>
                          ) : (
                            <span className="text-[9px] text-slate-600 block">Requires Finance Auth</span>
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
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-white">Dynamic CashFlow & Net Margin Statement</h4>
              <p className="text-[11px] text-slate-500">Aggrated records of realized income and corporate approved payouts.</p>
            </div>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">Q2 Real-time Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Realized Revenue Paid</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">${totalRevenuePaid.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block">From paid client invoice slips</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Outstanding Accounts Receivables</div>
              <div className="text-2xl font-bold text-amber-400 font-mono">${totalRevenuePending.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block">Outstanding invoices awaiting payment</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-lg space-y-1">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Accumulated Approved Claims</div>
              <div className="text-2xl font-bold text-rose-500 font-mono">${totalExpenseApproved.toLocaleString()}</div>
              <span className="text-[9px] text-slate-500 block">Cleared expense tickets</span>
            </div>
          </div>

          {/* Computations list */}
          <div className="border border-slate-855 rounded-xl overflow-hidden font-mono text-xs">
            <div className="bg-slate-950 p-3 grid grid-cols-2 text-slate-400 border-b border-slate-900">
              <span>LEDGER LINE ITEM</span>
              <span className="text-right">SUM AMOUNT ($)</span>
            </div>

            <div className="divide-y divide-slate-850/60 bg-slate-950/20">
              <div className="p-3 grid grid-cols-2 text-slate-205">
                <span>(+) Verified Liquid Receivables</span>
                <span className="text-right text-emerald-400 font-bold">+${totalRevenuePaid.toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-205">
                <span>(-) Software SaaS Seats Subscriptions</span>
                <span className="text-right text-rose-400">-${expenses.filter(e => e.category === "Software" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-205">
                <span>(-) Travel, Venues & Client Roadshow Outlays</span>
                <span className="text-right text-rose-400">-${expenses.filter(e => e.category === "Travel" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-205 mr-1">
                <span>(-) Personnel Comp & Salaries Sheet (Approved)</span>
                <span className="text-right text-rose-405">-$0.00</span>
              </div>
              <div className="p-3 grid grid-cols-2 text-slate-205">
                <span>(-) Equipment / Office Supplies General Spend</span>
                <span className="text-right text-rose-400">-${expenses.filter(e => e.category === "Office Supplies" && e.status === "Approved").reduce((su, e) => su + e.amount, 0).toLocaleString()}</span>
              </div>

              {/* Total margin result */}
              <div className="p-4 grid grid-cols-2 bg-indigo-950/30 text-white font-bold border-t border-slate-800 text-sm">
                <span>(=) Realized Corporate Net Income</span>
                <span className={`text-right font-mono ${netCashFlowResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netCashFlowResult >= 0 ? '+' : ''}${netCashFlowResult.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-lg text-slate-400 text-xs text-center flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>P&L accounts are computed dynamically from real cleared items. Tax audits conform to standard multi-tenant corporate specifications.</span>
          </div>
        </div>
      )}

    </div>
  );
}
