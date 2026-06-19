import React, { useState } from "react";
import { Product } from "../types";
import { 
  FileText, Plus, Trash, AlertTriangle, Printer, Sparkles,
  Percent, FileBarChart, CheckSquare, Pencil, Download, Calendar,
  TrendingUp, FileIcon, Mail, Building
} from "lucide-react";

interface QuotationsModuleProps {
  products: Product[];
}

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quotation {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  items: QuotationItem[];
  taxRate: number; // e.g. 18%
  notes: string;
  date: string;
  total: number;
  status: "Draft" | "Sent to Client" | "Accepted" | "Rejected";
}

export default function QuotationsModule({ products }: QuotationsModuleProps) {
  const [activeTab, setActiveTab] = useState<"builder" | "history">("builder");

  // Quotation History Memory state
  const [quotes, setQuotes] = useState<Quotation[]>([
    {
      id: "q_1",
      quoteNumber: "QT-2026-921A",
      clientName: "Mahindra Infra Developers Ltd",
      clientEmail: "procure@mahindra.co.in",
      items: [
        { id: "qi_1", description: "Industrial Grade Carbon Steel Beams", quantity: 15, unitPrice: 32000 },
        { id: "qi_2", description: "Structural Anchor Clamps", quantity: 80, unitPrice: 450 }
      ],
      taxRate: 18,
      notes: "Quotation is subject to Bangalore physical shipping codes. Credit terms strictly: 40% clearance within invoice date.",
      date: "2026-06-15",
      total: 608880, // programmatically calculated total in INR equivalent
      status: "Sent to Client"
    }
  ]);

  // Active custom quote builder state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([
    { id: "qi_" + Date.now(), description: "Consulting Support Package", quantity: 1, unitPrice: 25000 }
  ]);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [quoteNotes, setQuoteNotes] = useState("Validity: 30 days from date of issue. GST @ 18% applied under statutory schedule.");

  // Helpers
  const INR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddItemRow = () => {
    setQuoteItems([...quoteItems, { id: "qi_" + Date.now(), description: "Standard Steel Castings Pack", quantity: 10, unitPrice: 1500 }]);
  };

  const handleUpdateItem = (id: string, field: "description" | "quantity" | "unitPrice", val: any) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === "description" ? val : Number(val)
        };
      }
      return item;
    }));
  };

  const handleRemoveItemRow = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const handleCalculateSubtotal = () => {
    return quoteItems.reduce((su, item) => su + (item.quantity * item.unitPrice), 0);
  };

  const handleCalculateGST = (subtotal: number) => {
    return subtotal * (taxRate / 100);
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || quoteItems.length === 0) return;

    const sub = handleCalculateSubtotal();
    const gst = handleCalculateGST(sub);
    const totalVal = sub + gst;

    const num = "QT-2026-9" + (quotes.length + 21) + "A";
    const newQuote: Quotation = {
      id: "q_" + Date.now(),
      quoteNumber: num,
      clientName,
      clientEmail,
      items: quoteItems,
      taxRate,
      notes: quoteNotes,
      date: new Date().toISOString().split("T")[0],
      total: totalVal,
      status: "Draft"
    };

    setQuotes([newQuote, ...quotes]);
    setClientName("");
    setClientEmail("");
    setQuoteItems([{ id: "qi_" + Date.now(), description: "Consulting Support Package", quantity: 1, unitPrice: 25000 }]);
    setActiveTab("history");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn" id="quotations-module-root">
      
      {/* Title bar */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Quotations & Statutory Estimates</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build and dispatch official pre-sales corporate estimates containing customizable Indian GST slabs and legal disclaimers.
          </p>
        </div>

        <div className="flex border border-slate-200 rounded-lg p-1 bg-white shrink-0 self-start">
          <button
            onClick={() => setActiveTab("builder")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "builder" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Quotation Builder
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "history" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manage Estimates ({quotes.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        
        {activeTab === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Builder form */}
            <form onSubmit={handleSubmitQuote} className="lg:col-span-7 space-y-5">
              
              <div className="border border-slate-200 p-5 rounded-xl space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
                  1. Corporate Client Addressable
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Client Company / Name</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="E.g., Godrej Industries Pvt Ltd"
                      className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Client Billing Email</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="E.g., accounts@godrej.co.in"
                      className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items Table builder */}
              <div className="border border-slate-200 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    2. Proposal Materials & Tariffs
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-0.5 text-blue-600 text-xs font-bold hover:text-blue-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {quoteItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-2.5 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase leading-none">Line Description</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                          placeholder="Steel casting / Consultation hours..."
                          className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-full sm:w-20 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase leading-none">Qty</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, "quantity", e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                      <div className="w-full sm:w-32 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase leading-none">Rate (₹)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, "unitPrice", e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                      {quoteItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(item.id)}
                          className="p-2 border border-slate-200 hover:bg-slate-50 duration-150 text-rose-500 rounded-lg cursor-pointer h-[33px]"
                        >
                          <Trash className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GST & T&C Configuration */}
              <div className="border border-slate-200 p-5 rounded-xl space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
                  3. Indian GST Slab & Disclaimers
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Estimated Tax Tariffs</label>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 text-slate-800 cursor-pointer"
                    >
                      <option value="5">GST 5% (Basics)</option>
                      <option value="12">GST 12% (Industrial)</option>
                      <option value="18">GST 18% (Services/IT)</option>
                      <option value="28">GST 28% (Luxury)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Terms and Conditions note</label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 h-[67px] resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs tracking-wide transition-all shadow cursor-pointer"
                >
                  Confirm Estimate Ledger & Generate Letterhead
                </button>
              </div>

            </form>

            {/* Letterhead Previewer */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
                  SaaS Letterhead Live Preview
                </span>

                {/* Simulated Tally invoice layout */}
                <div className="bg-white border border-slate-200 p-5 mt-4 rounded-lg shadow-sm space-y-4 text-[10.5px] leading-relaxed text-slate-700">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-none">APEX INDUSTRIES LTD</h4>
                      <span className="text-[9px] text-slate-500 font-mono">GSTIN: 27AAPCS1234H1Z5</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-extrabold uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded leading-none">QUOTATION ESTIMATE</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>Prepared For: <strong>{clientName || "Corporate Client Ltd"}</strong></div>
                    <div>Email: <span className="font-mono">{clientEmail || "accounts@client.co.in"}</span></div>
                    <div>Estimate Date: <span className="font-mono">{new Date().toISOString().split("T")[0]}</span></div>
                  </div>

                  {/* Lines list */}
                  <div className="border-t border-b border-slate-100 py-2 space-y-2">
                    <div className="font-bold flex justify-between text-slate-900">
                      <span>Line Description</span>
                      <span className="font-mono">Total (INR)</span>
                    </div>
                    {quoteItems.map((qi, idx) => (
                      <div key={qi.id} className="flex justify-between">
                        <span>{idx + 1}. {qi.description} ({qi.quantity}x)</span>
                        <span className="font-mono">{INR(qi.quantity * qi.unitPrice)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculated summary */}
                  <div className="space-y-1.5 font-medium text-right text-xs">
                    <div>Subtotal: <strong className="font-mono text-slate-800">{INR(handleCalculateSubtotal())}</strong></div>
                    <div>GST ({taxRate}% Slab): <strong className="font-mono text-slate-800">{INR(handleCalculateGST(handleCalculateSubtotal()))}</strong></div>
                    <div className="border-t border-slate-100 pt-1.5 font-extrabold text-blue-600">Grand Total: <span className="font-mono text-sm">{INR(handleCalculateSubtotal() + handleCalculateGST(handleCalculateSubtotal()))}</span></div>
                  </div>

                  <div className="text-[9px] text-slate-400 italic pt-1.5 border-t border-slate-100 leading-normal">
                    {quoteNotes}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 bg-white border border-slate-200 rounded-lg p-2.5">
                Estimates automatically convert to official invoices under the <strong>Finance module</strong> once accepted by customer portal liaison!
              </div>
            </div>

          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="p-4">Quotation ID</th>
                    <th className="p-4">Client Partner</th>
                    <th className="p-4 font-mono">Date Raised</th>
                    <th className="p-4 font-mono">Inclusive Tax slab</th>
                    <th className="p-4 font-mono text-right">Aggregate Estimate value</th>
                    <th className="p-4 text-center">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                  {quotes.map((q) => (
                    <tr key={q.id}>
                      <td className="p-4 font-bold text-slate-900">{q.quoteNumber}</td>
                      <td className="p-4 text-slate-900 font-semibold">{q.clientName}</td>
                      <td className="p-4 font-mono text-slate-650">{q.date}</td>
                      <td className="p-4 font-mono text-slate-500">{q.taxRate}% GST Enabled</td>
                      <td className="p-4 font-mono text-right text-slate-900 font-bold">{INR(q.total)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 font-bold text-[9px] uppercase border rounded-full ${
                          q.status === "Accepted"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : q.status === "Sent to Client"
                            ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}>
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
