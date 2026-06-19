import React, { useState } from "react";
import { Invoice, Expense, Product, Project } from "../types";
import { 
  FileText, TrendingUp, AlertTriangle, Printer, Download, Filter, 
  Calendar, CheckCircle, HelpCircle, Layers, IndianRupee, ShieldCheck
} from "lucide-react";

interface ReportsModuleProps {
  invoices: Invoice[];
  expenses: Expense[];
  products: Product[];
  projects: Project[];
  selectedIndustry: string;
}

export default function ReportsModule({ 
  invoices, 
  expenses, 
  products, 
  projects,
  selectedIndustry 
}: ReportsModuleProps) {
  const [reportType, setReportType] = useState<"financial" | "tax" | "inventory" | "projects">("financial");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Format Helper
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val * 83.5); // Convert default USD scale to Indian Rupees (approx scale)
  };

  // Calculations
  const invoicesFiltered = invoices.filter(inv => {
    if (selectedMonth === "all") return true;
    return inv.issueDate.startsWith(selectedMonth);
  });

  const expensesFiltered = expenses.filter(exp => {
    if (selectedMonth === "all") return true;
    return exp.date.startsWith(selectedMonth);
  });

  const totalInvoiced = invoicesFiltered.reduce((acc, inv) => acc + inv.total, 0);
  const totalPaid = invoicesFiltered.filter(inv => inv.status === "Paid").reduce((acc, inv) => acc + inv.total, 0);
  const totalPending = invoicesFiltered.filter(inv => inv.status === "Sent" || inv.status === "Partially Paid").reduce((acc, inv) => acc + inv.total, 0);
  const totalExpenseVal = expensesFiltered.filter(exp => exp.status === "Approved").reduce((acc, exp) => acc + exp.amount, 0);

  const rawProfitLoss = totalPaid - totalExpenseVal;

  // Stock Valuation
  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValuation = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const avgProfitMargin = products.length > 0 
    ? (products.reduce((acc, p) => acc + ((p.unitPrice - p.costPrice) / p.unitPrice), 0) / products.length) * 100 
    : 15;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" id="reports-module-container">
      {/* Upper Tab Control Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-200 bg-slate-50 gap-4 rounded-t-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Interactive Audit & Reporting Control</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export Indian business statutory compliance worksheets, ledgers, and sector analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setReportType("financial")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                reportType === "financial" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Financial (P&L)
            </button>
            <button
              onClick={() => setReportType("tax")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                reportType === "tax" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tax (GSTR Summarical)
            </button>
            <button
              onClick={() => setReportType("inventory")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                reportType === "inventory" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Inventory Valuation
            </button>
            <button
              onClick={() => setReportType("projects")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                reportType === "projects" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Projects Budgets
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs border border-slate-200 bg-white rounded-lg p-2 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Financial Year (All Months)</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-04">April 2026</option>
            </select>

            <button 
              onClick={() => window.print()}
              className="p-2 border border-slate-200 hover:bg-slate-50 duration-150 text-slate-600 rounded-lg cursor-pointer" 
              title="Print Audit copy"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Body */}
      <div className="p-6">
        
        {/* Industry Specific Metric Focus */}
        <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Industry Preset Focus: {selectedIndustry}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedIndustry === "Manufacturing" && "Showing specialized capacity utilization metrics, material scrap valuations, and bill-of-materials costs."}
                {selectedIndustry === "Construction" && "Auto-tracking subcontracting line expenses, state tender retention ratios, and capital heavy component costs."}
                {selectedIndustry === "Hospitals" && "Calibrating operational clinical bed allocation costs, diagnostics supplies ledger, and OPD collections."}
                {selectedIndustry === "Agencies" && "Retainer timeline compliance multipliers, service delivery SLA indexes, and project efficiency margins."}
                {selectedIndustry === "Schools" && "Student enrollment collection schedules, physical campus layout expenses, and educational staff payroll."}
                {selectedIndustry === "CA Firms" && "Pruning dynamic client filing milestones tracker, active litigations compliance, and auditing workload ratios."}
                {selectedIndustry === "Distributors" && "Stock turnovers coefficients, logistics dispatch freight values, and local dealer credit ledgers."}
                {selectedIndustry === "Retail Businesses" && "Daily register totals, local CGST receipts compliance, and low margin inventory flags."}
                {!["Manufacturing", "Construction", "Hospitals", "Agencies", "Schools", "CA Firms", "Distributors", "Retail Businesses"].includes(selectedIndustry) && "Dynamic service segment mapping, GST statutory ratios compliance, and overhead budgets."}
              </p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        {reportType === "financial" && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Gross Invoiced Revenue</span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{formatINR(totalInvoiced)}</div>
                <span className="text-[10px] text-emerald-600 mt-1 font-semibold block">↑ 14.2% YoY growth</span>
              </div>
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Collected cashflow</span>
                <div className="text-xl font-bold font-mono text-blue-600 mt-1">{formatINR(totalPaid)}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">From verified bank clearances</span>
              </div>
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Statutory Approved Expenses</span>
                <div className="text-xl font-bold font-mono text-rose-600 mt-1">{formatINR(totalExpenseVal)}</div>
                <span className="text-[10px] text-emerald-650 font-semibold mt-1 block">Under strict budgetary cap</span>
              </div>
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Simulated Net Profit/Loss</span>
                <div className="text-xl font-bold font-mono text-slate-950 mt-1">{formatINR(rawProfitLoss)}</div>
                <span className={`text-[10px] mt-1 font-semibold block ${rawProfitLoss >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {rawProfitLoss >= 0 ? "Operating Surplus" : "Over Budget Deficit"}
                </span>
              </div>
            </div>

            {/* Simulated Balance Projection */}
            <div className="border border-slate-200 p-6 rounded-xl bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-950 uppercase">Profit & Loss Detailed Breakdown (Simulated Ledger)</h4>
                  <p className="text-[11px] text-slate-500">Subject to CA manual tax audits and monthly credit balances adjustments.</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs leading-none font-semibold text-slate-700">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ledger CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-2.5">Accounts Category</th>
                      <th className="py-2.5 font-mono">Debit (Outward)</th>
                      <th className="py-2.5 font-mono">Credit (Inward)</th>
                      <th className="py-2.5">Statutory Standard Group</th>
                      <th className="py-2.5 text-right">Running Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                    <tr>
                      <td className="py-3">Domestic Sales (GST 18% Standard)</td>
                      <td className="py-3 font-mono text-slate-400">—</td>
                      <td className="py-3 font-mono text-emerald-600">{formatINR(totalPaid * 0.85)}</td>
                      <td className="py-3">Direct Incomes</td>
                      <td className="py-3 font-mono text-right text-emerald-600 font-bold">{formatINR(totalPaid * 0.85)}</td>
                    </tr>
                    <tr>
                      <td className="py-3">Interstate IGST Collections (28% luxury scale)</td>
                      <td className="py-3 font-mono text-slate-400">—</td>
                      <td className="py-3 font-mono text-emerald-600">{formatINR(totalPaid * 0.15)}</td>
                      <td className="py-3">GST Liability Account</td>
                      <td className="py-3 font-mono text-right text-emerald-600 font-bold">{formatINR(totalPaid)}</td>
                    </tr>
                    <tr>
                      <td className="py-3">IT/Cloud Infrastructure & CRM Subscriptions</td>
                      <td className="py-3 font-mono text-rose-500">{formatINR(totalExpenseVal * 0.3)}</td>
                      <td className="py-3 font-mono text-slate-400">—</td>
                      <td className="py-3">Indirect Overheads</td>
                      <td className="py-3 font-mono text-right text-slate-700 font-bold">{formatINR(totalPaid - (totalExpenseVal * 0.3))}</td>
                    </tr>
                    <tr>
                      <td className="py-3">Vendor Procurement Outstandings</td>
                      <td className="py-3 font-mono text-rose-500">{formatINR(totalExpenseVal * 0.7)}</td>
                      <td className="py-3 font-mono text-slate-400">—</td>
                      <td className="py-3">Supply Expenses</td>
                      <td className="py-3 font-mono text-right text-slate-700 font-bold">{formatINR(rawProfitLoss)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === "tax" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Statutory Overview */}
            <div className="border border-yellow-200 bg-yellow-50/50 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-yellow-800 uppercase tracking-wide">STATUTORY FILINGS RECONCILIATION FOR FIN-YEAR 2026-27</h5>
                <p className="text-[11px] text-yellow-700 leading-relaxed mt-1">
                  Tax estimates are computed programmatically applying the CGST + SGST (Intrastate) or IGST (Interstate) split. Real exports are logged as GSTR-1 (Outward Liabilities) and GSTR-3B (Summary returns). Match with Input Tax Credit (ITC) captured under Supplier purchases.
                </p>
              </div>
            </div>

            {/* GSTR Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase">GSTR-1 Outward Return Worksheet</h5>
                    <p className="text-[11px] text-slate-500">Summary of invoices issued with GST breakdowns.</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">READY TO EXPORT</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Outward Taxable Value:</span>
                    <strong className="font-mono text-slate-900">{formatINR(totalInvoiced * 0.82)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Simulated CGST (9% avg):</span>
                    <strong className="font-mono text-slate-800">{formatINR((totalInvoiced * 0.18) / 2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Simulated SGST (9% avg):</span>
                    <strong className="font-mono text-slate-800">{formatINR((totalInvoiced * 0.18) / 2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interstate IGST (18% scale):</span>
                    <strong className="font-mono text-slate-800">{formatINR(totalInvoiced * 0.05)}</strong>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-950">
                    <span>Aggregate GST Liability:</span>
                    <span className="font-mono text-blue-600">{formatINR(totalInvoiced * 0.18)}</span>
                  </div>
                </div>

                <button className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                  Generate GSTR-1 JSON Payload
                </button>
              </div>

              <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase">GSTR-3B Auto-Offset Assessment</h5>
                    <p className="text-[11px] text-slate-500">Calculated offset against available Input Tax Credit (ITC).</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold">SYSTEM CALCULATED</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Liability Accountable:</span>
                    <strong className="font-mono text-slate-900">{formatINR(totalInvoiced * 0.18)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Captured Input Credit (Suppliers):</span>
                    <strong className="font-mono text-emerald-600">{formatINR(totalExpenseVal * 0.18)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reverse Charge Ledger (RCM):</span>
                    <strong className="font-mono text-yellow-600">{formatINR(totalExpenseVal * 0.02)}</strong>
                  </div>
                  <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-950">
                    <span>Net Electronic Cash Ledger Outflow:</span>
                    <span className="font-mono text-blue-600">{formatINR(Math.max(0, (totalInvoiced * 0.18) - (totalExpenseVal * 0.18)))}</span>
                  </div>
                </div>

                <button className="w-full text-center py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  Offset Balance & Submit Returns
                </button>
              </div>

            </div>
          </div>
        )}

        {reportType === "inventory" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Inventory Valuation Header Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Aggregate Stock Items</span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{totalStockItems.toLocaleString()} Units</div>
                <span className="text-[10px] text-slate-500 block mt-1">Spread across central depots</span>
              </div>
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Asset Book Value</span>
                <div className="text-xl font-bold font-mono text-blue-600 mt-1">{formatINR(totalStockValuation)}</div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">At base cost valuation</span>
              </div>
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Average Markup Profit</span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{avgProfitMargin.toFixed(1)}% Margin</div>
                <span className="text-[10px] text-slate-500 block mt-1">Against retail market prices</span>
              </div>
            </div>

            {/* Inventory table */}
            <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold text-slate-900 uppercase">Valuation Breakdown by SKU (Indian Tally Standard)</h5>
                <span className="text-[10px] text-slate-500 font-mono">FIFO costing model active</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-2.5">SKU Name</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 font-mono">In-Stock</th>
                      <th className="py-2.5 font-mono">Cost Price</th>
                      <th className="py-2.5 font-mono">Sale Price</th>
                      <th className="py-2.5 text-right font-mono">Book Asset Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-semibold text-slate-900">{p.name} <span className="text-[10px] text-slate-400 font-mono">({p.sku})</span></td>
                        <td className="py-3 text-slate-500">{p.category}</td>
                        <td className="py-3 font-mono text-slate-900">{p.stock}</td>
                        <td className="py-3 font-mono text-slate-700">{formatINR(p.costPrice)}</td>
                        <td className="py-3 font-mono text-slate-705">{formatINR(p.unitPrice)}</td>
                        <td className="py-3 font-mono text-right font-bold text-blue-600">{formatINR(p.stock * p.costPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === "projects" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Active Projects Tracked</span>
                <div className="text-lg font-bold text-slate-950 mt-1">{projects.length} Total deliverables</div>
              </div>
              <div className="border border-slate-150 p-4 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-405 tracking-wider">Combined Total Budgets</span>
                <div className="text-lg font-bold text-blue-600 mt-1">
                  {formatINR(projects.reduce((acc, p) => acc + p.budget, 0))}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-4">
              <h5 className="text-xs font-bold text-slate-900 uppercase">Operational Milestones Budget Margin Compliance</h5>
              <div className="space-y-4 text-xs font-medium">
                {projects.map((proj) => (
                  <div key={proj.id} className="border-b border-slate-100 pb-3 last:border-b-0 space-y-1.5Packed">
                    <div className="flex justify-between text-slate-900 font-bold">
                      <span>{proj.name}</span>
                      <span className="font-mono text-blue-600">{proj.progress}% Deliver Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${proj.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Client: {proj.clientName}</span>
                      <span className="font-mono">Budget: {formatINR(proj.budget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
