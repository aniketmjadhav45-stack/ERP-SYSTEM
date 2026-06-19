import React, { useState } from "react";
import { Lead, Contact, UserProfile } from "../types";
import { Plus, Search, DollarSign, Mail, Phone, Calendar, Send, Sparkles, Building, Trash } from "lucide-react";

interface CRMModuleProps {
  leads: Lead[];
  contacts: Contact[];
  users: UserProfile[];
  onAddLead: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt" | "timeline">) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: Lead["status"]) => void;
  onDeleteLead: (leadId: string) => void;
  onAddContact: (contact: Omit<Contact, "id" | "lastContactDate">) => void;
}

export default function CRMModule({
  leads,
  contacts,
  users,
  onAddLead,
  onUpdateLeadStatus,
  onDeleteLead,
  onAddContact
}: CRMModuleProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "contacts" | "new_lead">("pipeline");
  const [searchQuery, setSearchQuery] = useState("");
  
  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadValue, setNewLeadValue] = useState(25000);
  const [newLeadStatus, setNewLeadStatus] = useState<Lead["status"]>("New");
  const [newLeadAssigned, setNewLeadAssigned] = useState("Alex Mercer");
  const [newLeadNotes, setNewLeadNotes] = useState("");

  // New Contact Form State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRole, setNewContactRole] = useState("");
  const [newContactCompany, setNewContactCompany] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [interactionText, setInteractionText] = useState("");

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;
    
    onAddLead({
      name: newLeadName,
      company: newLeadCompany,
      email: newLeadEmail,
      phone: newLeadPhone,
      value: Number(newLeadValue),
      status: newLeadStatus,
      assignedTo: newLeadAssigned,
      notes: newLeadNotes
    });

    // Reset Form
    setNewLeadName("");
    setNewLeadCompany("");
    setNewLeadEmail("");
    setNewLeadPhone("");
    setNewLeadValue(25000);
    setNewLeadStatus("New");
    setNewLeadNotes("");
    setActiveTab("pipeline");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactCompany) return;

    onAddContact({
      name: newContactName,
      role: newContactRole,
      company: newContactCompany,
      email: newContactEmail,
      phone: newContactPhone
    });

    setNewContactName("");
    setNewContactRole("");
    setNewContactCompany("");
    setNewContactEmail("");
    setNewContactPhone("");
    setIsAddingContact(false);
  };

  const handleLogInteraction = (e: React.FormEvent, lead: Lead) => {
    e.preventDefault();
    if (!interactionText.trim()) return;

    // Simulate appending email/call interaction to timeline
    const updatedLeadTimeline = [
      {
        id: "tl_custom_" + Date.now(),
        type: "email" as const,
        text: `Logged Email update: ${interactionText}`,
        date: new Date().toISOString().split("T")[0]
      },
      ...lead.timeline
    ];

    lead.timeline = updatedLeadTimeline;
    setInteractionText("");
    // Trigger visual re-render of detail view
    setSelectedLead({ ...lead });
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pipelineStages: Lead["status"][] = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won"];

  return (
    <div className="space-y-6" id="crm-module">
      
      {/* Search Input and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => { setActiveTab("pipeline"); setSelectedLead(null); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pipeline" ? "bg-indigo-600 text-white" : "text-slate-550 hover:text-slate-900"
            }`}
          >
            Sales Pipeline
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("contacts"); setSelectedLead(null); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "contacts" ? "bg-indigo-600 text-white" : "text-slate-550 hover:text-slate-900"
            }`}
          >
            Contacts Directory
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("new_lead"); setSelectedLead(null); }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "new_lead" ? "bg-indigo-600 text-white" : "text-slate-550 hover:text-slate-900"
            }`}
          >
            + Register Lead
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-slate-800 shadow-sm"
          />
        </div>
      </div>

      {/* Main Module Content area */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Kanban Columns */}
          <div className="xl:col-span-8 overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1000px] items-stretch">
              {pipelineStages.map((stage) => {
                const stageLeads = filteredLeads.filter((l) => l.status === stage);
                const columnsSum = stageLeads.reduce((su, ld) => su + ld.value, 0);

                return (
                  <div key={stage} className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col min-h-[500px] shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{stage}</span>
                        <div className="text-[10px] text-slate-550 font-mono font-bold">${columnsSum.toLocaleString()}</div>
                      </div>
                      <span className="bg-slate-200 text-slate-705 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-300">{stageLeads.length}</span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`p-3 bg-white hover:bg-slate-50 border rounded-lg cursor-pointer transition-all space-y-2 shadow-sm ${
                            selectedLead?.id === lead.id ? "border-indigo-600 shadow-md ring-2 ring-indigo-500/20" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h5 className="text-xs font-bold text-slate-900">{lead.company}</h5>
                            <span className="text-[10px] text-blue-600 font-mono font-black">${lead.value.toLocaleString()}</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-600 font-sans line-clamp-1">{lead.name}</p>

                          <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400 border-t border-slate-100 font-semibold">
                            <span>Assigned: {lead.assignedTo.split(" ")[0]}</span>
                            <span>{lead.createdAt}</span>
                          </div>
                        </div>
                      ))}

                      {stageLeads.length === 0 && (
                        <div className="text-center py-12 text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white/40">
                          No deals
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Side Details Panel */}
          <div className="xl:col-span-4">
            {selectedLead ? (
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-5 sticky top-4 shadow-sm">
                
                {/* Header detail */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{selectedLead.company}</h4>
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">Contact: {selectedLead.name}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteLead(selectedLead.id)}
                      className="p-1 px-2 text-[10px] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-rose-750 cursor-pointer"
                    >
                      <Trash className="w-3" />
                    </button>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => onUpdateLeadStatus(selectedLead.id, e.target.value as Lead["status"])}
                      className="bg-white text-xs text-indigo-650 border border-slate-200 font-bold outline-none rounded p-1 shadow-sm"
                    >
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Qualified</option>
                      <option>Proposal</option>
                      <option>Negotiation</option>
                      <option>Closed Won</option>
                      <option>Closed Lost</option>
                    </select>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Contract Value</span>
                    <span className="text-emerald-600 font-black">${selectedLead.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Email Address</span>
                    <span className="text-slate-800 select-all hover:text-indigo-600 font-semibold">{selectedLead.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Phone Code</span>
                    <span className="text-slate-800 font-semibold">{selectedLead.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Sales Owner</span>
                    <span className="text-indigo-600 font-sans font-bold">{selectedLead.assignedTo}</span>
                  </div>
                </div>

                {/* Email/Interaction Tracker log */}
                <div className="border border-slate-200 p-3 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
                    <span className="flex items-center gap-1"><Mail className="w-3 text-indigo-600" /> Log Custom Email Dispatch</span>
                  </div>
                  <form onSubmit={(e) => handleLogInteraction(e, selectedLead)} className="space-y-2">
                    <textarea
                      placeholder="Type details of client outreach conversation..."
                      value={interactionText}
                      onChange={(e) => setInteractionText(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono h-16 resize-none shadow-sm"
                    />
                    <button
                      type="submit"
                      className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-550 text-white px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 w-full transition-all cursor-pointer shadow-sm"
                    >
                      <Send className="w-3" />
                      <span>Dispatch Tracker Log</span>
                    </button>
                  </form>
                </div>

                {/* Lead Notes */}
                <div>
                  <h5 className="text-xs font-bold text-slate-700 mb-1">Initial Discovery Notes</h5>
                  <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                    {selectedLead.notes || "No extra discovery files supplied."}
                  </p>
                </div>

                {/* History Timeline Logs */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-700">Outreach Timeline Logs</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedLead.timeline.map((tl) => (
                      <div key={tl.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] space-y-0.5">
                        <div className="flex justify-between font-mono text-slate-400">
                          <span className="capitalize text-[8px] text-indigo-600 font-extrabold">{tl.type}</span>
                          <span>{tl.date}</span>
                        </div>
                        <p className="text-slate-850 font-sans">{tl.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-250 rounded-xl p-8 text-center text-xs text-slate-500 shadow-sm leading-relaxed">
                Click a lead card to inspect interaction logs, log calls and emails, changing deal values, or update deal status tags.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Contacts List tab */}
      {activeTab === "contacts" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Client Contacts Directory</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Permanent record of client organizational contact nodes.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingContact(!isAddingContact)}
              className="bg-indigo-600 hover:bg-indigo-550 px-3 py-1.5 text-xs text-white rounded font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Contact</span>
            </button>
          </div>

          {/* New Contact Form Simulated inline */}
          {isAddingContact && (
            <form onSubmit={handleContactSubmit} className="bg-slate-50 p-4 border border-blue-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3 shadow-inner">
              <input
                type="text"
                placeholder="Name"
                required
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
              />
              <input
                type="text"
                placeholder="Role (e.g. VP Tech)"
                value={newContactRole}
                onChange={(e) => setNewContactRole(e.target.value)}
                className="bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
              />
              <input
                type="text"
                placeholder="Company"
                required
                value={newContactCompany}
                onChange={(e) => setNewContactCompany(e.target.value)}
                className="bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
              />
              <input
                type="email"
                placeholder="Email address"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
              />
              <input
                type="text"
                placeholder="Phone line"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white font-bold text-xs p-2 rounded hover:bg-indigo-550 transition-all cursor-pointer shadow-sm"
              >
                Submit Contact File
              </button>
            </form>
          )}

          <div className="overflow-x-auto text-[11px] font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-250 text-slate-500 bg-slate-50/50">
                  <th className="p-2 pb-2 font-sans font-bold">Contact Name</th>
                  <th className="p-2 pb-2 font-sans font-bold">Company</th>
                  <th className="p-2 pb-2 font-sans font-bold">Title Role</th>
                  <th className="p-2 pb-2 font-sans font-bold">Email</th>
                  <th className="p-2 pb-2 font-sans font-bold">Contact Number</th>
                  <th className="p-2 pb-2 font-sans font-bold">Outreach Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="text-slate-800 hover:bg-slate-50 transition-colors">
                    <td className="p-2 py-3 font-sans font-bold text-slate-900 flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-blue-50 border border-blue-105 rounded-full flex items-center justify-center text-[10px] text-blue-700 uppercase font-sans font-bold">
                        {c.name.substring(0, 1)}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-2 py-3">
                      <span className="flex items-center gap-1 text-slate-605 font-sans font-medium"><Building className="w-3 text-slate-400" /> {c.company}</span>
                    </td>
                    <td className="p-2 py-3 text-slate-705 font-sans font-medium">{c.role}</td>
                    <td className="p-2 py-3 text-blue-600 select-all font-bold">{c.email}</td>
                    <td className="p-2 py-3 text-slate-705">{c.phone}</td>
                    <td className="p-2 py-3 text-slate-500 font-sans">{c.lastContactDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Lead Form tab */}
      {activeTab === "new_lead" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl mx-auto shadow-sm">
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-150 pb-2">Register Lead Account</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Client Rep Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jessica Jones"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Marvel Tech Corp"
                  value={newLeadCompany}
                  onChange={(e) => setNewLeadCompany(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Contract Email</label>
                <input
                  type="email"
                  placeholder="billing@marveltech.com"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 012-4949"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Value Estimate ($)</label>
                <input
                  type="number"
                  value={newLeadValue}
                  onChange={(e) => setNewLeadValue(Number(e.target.value))}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Status Node</label>
                <select
                  value={newLeadStatus}
                  onChange={(e) => setNewLeadStatus(e.target.value as Lead["status"])}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-1.5 text-xs text-slate-700 shadow-sm font-semibold"
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Proposal</option>
                  <option>Negotiation</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Sales Assigned</label>
                <select
                  value={newLeadAssigned}
                  onChange={(e) => setNewLeadAssigned(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-1.5 text-xs text-slate-750 shadow-sm font-semibold"
                >
                  {users.filter(u => u.role === "Sales" || u.role === "Super Admin" || u.role === "Admin").map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 font-bold">Discovery notes</label>
              <textarea
                value={newLeadNotes}
                onChange={(e) => setNewLeadNotes(e.target.value)}
                placeholder="Client requires automated invoice reminders module and custom P&L generation tools..."
                className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-800 font-sans h-20 resize-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-550 py-2.5 rounded text-xs text-white font-bold transition-all cursor-pointer shadow-sm"
            >
              Submit Lead Account Profile
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
