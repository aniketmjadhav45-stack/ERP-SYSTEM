import React, { useState } from "react";
import { Project, Invoice, UserProfile } from "../types";
import { ShieldCheck, Coins, FolderKanban, HelpCircle, Send, MessageSquareText, Sparkles, Receipt } from "lucide-react";

interface CustomerPortalProps {
  currentUser: UserProfile;
  projects: Project[];
  invoices: Invoice[];
  onPayInvoice: (invoiceId: string) => void;
}

export default function CustomerPortal({
  currentUser,
  projects,
  invoices,
  onPayInvoice
}: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "finance" | "support">("projects");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Filter invoices belonging specifically to Customer (or just show all for simplicity under multi-tenant preset simulation)
  const outstandingInvoices = invoices.filter((i) => i.status !== "Paid");
  const completedInvoices = invoices.filter((i) => i.status === "Paid");

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject) return;

    setFeedbackSuccess(true);
    setTicketSubject("");
    setTicketDesc("");
    setTimeout(() => {
      setFeedbackSuccess(false);
    }, 4500);
  };

  return (
    <div className="space-y-6" id="customer-portal">
      
      {/* Visual Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-slate-50 border border-emerald-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-teal-700 text-xs font-bold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Customer Portal Ingress</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Review live deliverables tracks, settle outstanding invoices, or log technical support tickets securely below.
          </p>
        </div>

        <span className="text-xs bg-white text-teal-700 border border-teal-250 px-3 py-1.5 rounded font-mono font-bold shadow-sm">
          Profile: {currentUser.role}
        </span>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "projects" ? "bg-teal-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
          }`}
        >
          Project Deliverables
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("finance")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "finance" ? "bg-teal-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
          }`}
        >
          Outstanding Invoices ({outstandingInvoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "support" ? "bg-teal-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
          }`}
        >
          Support Helpdesk
        </button>
      </div>

      {/* 1. PROJECT HIGHLIGHTS */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Deliverable Tracks</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 font-sans">{p.name}</h5>
                    <span className="text-[10px] text-slate-505 font-mono">Closing end date: {p.endDate}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                    {p.progress}% Completed
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">{p.description}</p>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full" style={{ width: `${p.progress}%` }} />
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Released milestones deliverables</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {p.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded border border-slate-150 text-[10px] font-mono text-slate-705 shadow-sm">
                        <span className="text-emerald-600 text-[10px] font-black">✔</span>
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. OUTSTANDING INVOICES */}
      {activeTab === "finance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Outstanding Bills checklist */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-505 tracking-wider">Awaiting Settlement</h4>

            <div className="space-y-3.5">
              {outstandingInvoices.map((inv) => (
                <div key={inv.id} className="p-4 bg-white border border-slate-200 border-l-[4px] border-l-rose-500 rounded-xl space-y-4 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-mono text-slate-900">{inv.invoiceNumber}</strong>
                      <span className="text-[9px] uppercase font-bold bg-rose-50 text-rose-700 border border-rose-150 px-1.5 py-0.5 rounded font-sans">{inv.status}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">Due details: {inv.dueDate} | Settle for: {inv.clientEmail} </p>
                    
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {inv.items.map((item, id) => (
                        <span key={id} className="text-[9px] bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded text-slate-650 font-mono font-semibold">
                          {item.description} (x{item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between space-y-2">
                    <span className="text-lg font-black font-mono text-emerald-600">${inv.total.toLocaleString()}</span>
                    
                    {/* PAY SIMULATION LINK */}
                    <button
                      type="button"
                      onClick={() => onPayInvoice(inv.id)}
                      className="bg-emerald-600 hover:bg-emerald-550 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1 self-stretch md:self-auto text-center justify-center font-sans tracking-wide"
                    >
                      <Coins className="w-3.5" />
                      <span>Settle Balance Now</span>
                    </button>
                  </div>
                </div>
              ))}

              {outstandingInvoices.length === 0 && (
                <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 bg-slate-50 rounded-xl font-medium shadow-inner">
                  No pending outstanding business liabilities detected. Excellent fiscal position!
                </div>
              )}
            </div>
          </div>

          {/* Settled Slip history list */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1">
              <Receipt className="w-4 h-4 text-emerald-600" /> Settled Slip History
            </h4>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {completedInvoices.map((inv) => (
                <div key={inv.id} className="p-2.5 bg-slate-50 border border-slate-155 rounded font-mono text-[11px] flex justify-between items-center shadow-inner">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{inv.invoiceNumber}</div>
                    <div className="text-[9px] text-emerald-600 font-sans mt-0.5 font-bold">✔ Cleared settlement</div>
                  </div>

                  <strong className="text-slate-900 font-black">${inv.total.toLocaleString()}</strong>
                </div>
              ))}

              {completedInvoices.length === 0 && (
                <div className="text-[10px] text-slate-500 italic font-medium p-2">No cleared slips found in current memory cycle.</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3. HELP TICKET CREATOR */}
      {activeTab === "support" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl mx-auto space-y-4 shadow-sm">
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-teal-600" /> Log Technical Issue Ticket
              </h4>
              <p className="text-[11px] text-slate-505 mt-1 font-medium">Submit requests directly to internal engineers or account manager specialists.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-705 font-bold">Ticket Priority Mode</label>
              <select className="w-full bg-white border border-slate-250 focus:border-indigo-505 focus:outline-none p-1.5 text-xs text-slate-800 rounded outline-none font-mono font-semibold shadow-sm">
                <option>Low - Operational Question</option>
                <option>Medium - Performance Friction</option>
                <option>High - Severe Gateway Impediment</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-705 font-bold">Inquiry Subject</label>
              <input
                type="text"
                required
                placeholder="Low stock product alert callback failed in Berlin Depot"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none p-2 text-xs text-slate-800 rounded font-mono shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-705 font-bold">Detailed Diagnostic logs / painpoints</label>
              <textarea
                required
                placeholder="Provide steps to reproduce checkout threshold triggers or missing compound indices..."
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-indigo-505 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono h-20 resize-none"
              />
            </div>

            {feedbackSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 text-emerald-850 rounded text-[11px] font-sans font-semibold">
                ✔ Ticket logged successfully on Cloud Service Desk! Internal support agent Alex Mercer will notify your billing email.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-550 text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Helpdesk Ticket</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
