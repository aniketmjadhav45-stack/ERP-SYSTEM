import React, { useState } from "react";
import { 
  HeartHandshake, Plus, Search, Edit, Trash2, Download, FileText, 
  MapPin, Phone, Mail, FileCheck, CheckCircle2, UserCheck, BarChart3, TrendingUp
} from "lucide-react";

export interface Customer {
  id: string; // Customer ID (e.g., CUST-2026-001)
  companyName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  gstNumber: string;
  address: string;
  notes: string;
  status: "Active" | "Inactive" | "Key Account";
  acquisitionValue: number; // For tracking dashboard metrics
}

const initialCustomers: Customer[] = [
  {
    id: "CUST-2026-0101",
    companyName: "Hindalco Industries Ltd",
    contactPerson: "Rajesh Gokhale",
    email: "procurement@hindalco.adityabirla.com",
    mobile: "+91 22 4900 8822",
    gstNumber: "27AAACH8844D1Z9",
    address: "Century Bhavan, Worli, Mumbai, Maharashtra",
    notes: "Key raw metals account. Annual delivery contract auto-renewals in December.",
    status: "Key Account",
    acquisitionValue: 850000
  },
  {
    id: "CUST-2026-0102",
    companyName: "Infosys Mysore Campus",
    contactPerson: "Sudha Murthy",
    email: "facilities.mysore@infosys.com",
    mobile: "+91 821 2400 901",
    gstNumber: "29AAACI9911C1ZA",
    address: "Hebbal Industrial Area, Hootagalli, Mysuru, Karnataka",
    notes: "Agro landscape planning supplies client. Regular monthly orders.",
    status: "Active",
    acquisitionValue: 450000
  },
  {
    id: "CUST-2026-0103",
    companyName: "Godrej Properties",
    contactPerson: "Milind Kirtane",
    email: "milind.k@godrejproperties.com",
    mobile: "+91 98200 44331",
    gstNumber: "27AAACG1111X1Z2",
    address: "Godrej One, Vikhroli East, Mumbai, Maharashtra",
    notes: "Bulk construction landscape partner. Low margins but heavy consistency.",
    status: "Active",
    acquisitionValue: 320000
  }
];

export default function CustomersModule() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Drawer / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form inputs
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Customer["status"]>("Active");
  const [acquisitionValue, setAcquisitionValue] = useState(100000);

  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateForm = () => {
    setEditingCustomer(null);
    setCompanyName("");
    setContactPerson("");
    setEmail("");
    setMobile("");
    setGstNumber("");
    setAddress("");
    setNotes("");
    setStatus("Active");
    setAcquisitionValue(150000);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (cust: Customer) => {
    setEditingCustomer(cust);
    setCompanyName(cust.companyName);
    setContactPerson(cust.contactPerson);
    setEmail(cust.email);
    setMobile(cust.mobile);
    setGstNumber(cust.gstNumber);
    setAddress(cust.address);
    setNotes(cust.notes);
    setStatus(cust.status);
    setAcquisitionValue(cust.acquisitionValue);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const matched = customers.find(c => c.id === id);
    if (confirm(`Are you sure you want to delete Customer Account for "${matched?.companyName}"?`)) {
      setCustomers(customers.filter(c => c.id !== id));
      triggerNotification(`Permanently removed customer registry for "${matched?.companyName}".`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !email) {
      alert("Please fill in corporate requirements.");
      return;
    }

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? {
        ...c,
        companyName, contactPerson, email, mobile, gstNumber, address, notes, status,
        acquisitionValue: Number(acquisitionValue)
      } : c));
      triggerNotification(`Successfully revised records for "${companyName}".`);
    } else {
      const generatedId = `CUST2026-0${101 + customers.length}`;
      const newCust: Customer = {
        id: generatedId,
        companyName, contactPerson, email, mobile, gstNumber, address, notes, status,
        acquisitionValue: Number(acquisitionValue)
      };
      setCustomers([...customers, newCust]);
      triggerNotification(`Successfully registered "${companyName}" with account ${generatedId}.`);
    }
    setIsFormOpen(false);
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "CustomerID,Company Name,Contact Person,Email,Mobile,GSTIN,Address,Status,AcquisitionValue\n";
    
    customers.forEach(c => {
      const row = [
        c.id, c.companyName, c.contactPerson, c.email, c.mobile, 
        c.gstNumber, c.address, c.status, c.acquisitionValue
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
      csv += row + "\n";
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Corporate_Customers_FY26.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Exporter downloaded Customers database list.");
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus ? c.status === filterStatus : true;

    return matchesSearch && matchesStatus;
  });

  const totalAcquisitionLtv = customers.reduce((su, c) => su + c.acquisitionValue, 0);

  return (
    <div className="space-y-6" id="customers-module-screen">

      {notification && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded-r-lg text-xs font-semibold flex items-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* CUSTOMER INTELLIGENCE TRACKING DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">REGISTERED CLIENTS</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">
              <UserCheck className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{customers.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Industrial consumers</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">KEY ACCOUNTS (ENTERPRISE)</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-indigo-700 leading-none">
                {customers.filter(c => c.status === "Key Account").length}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">High-LTV accounts</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">SAVED ACQUISITION VALUE (LTV)</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-none">₹ {totalAcquisitionLtv.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Aggregated book value</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-1 bg-blue-50/10">
          <span className="text-[9px] uppercase tracking-wider text-blue-600 font-black block">SALES OPPORTUNITY INDEX</span>
          <p className="text-[11px] text-slate-600 font-semibold leading-tight mt-1">
            Accounts mapped to GSTIN verification nodes. Automatic dispatch cycle applied.
          </p>
        </div>

      </div>

      {/* FILTER SEARCH BAR */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers, ID, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-250 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-slate-805 shadow-sm"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-250 text-xs rounded-lg p-2 font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active Partners</option>
            <option value="Key Account">Key Enterprises</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

        {/* WORK ACTIONS */}
        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-center justify-end shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-755 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-755 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate PDF</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm ml-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>

      </div>

      {/* COMPACT CUSTOMERS LISTING TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Customer ID</th>
                <th className="p-4">Company Name</th>
                <th className="p-4">Primary Contact</th>
                <th className="p-4">Corporate Info</th>
                <th className="p-4">GST Number</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">LTV Estimate</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-650">{c.id}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 leading-tight">{c.companyName}</div>
                    <div className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">{c.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 leading-none">{c.contactPerson}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{c.mobile}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 hover:text-blue-600 duration-150">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="select-all">{c.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono bg-slate-100 p-1 px-1.5 rounded font-bold text-slate-700 text-[10px] select-all">
                      {c.gstNumber || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold border ${
                      c.status === "Key Account" 
                        ? "bg-indigo-50 border-indigo-150 text-indigo-805" 
                        : "bg-emerald-50 border-emerald-150 text-emerald-805"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900">
                    ₹ {c.acquisitionValue.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(c)}
                        className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 cursor-pointer"
                        title="Edit registry information"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 hover:bg-rose-50 border border-rose-150 rounded text-rose-600 cursor-pointer"
                        title="Delete registry node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RICH POPUP FORM MODAL DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-915 flex items-center gap-1.5">
                <HeartHandshake className="w-5 h-5 text-blue-600" />
                <span>{editingCustomer ? "Edit Customer Record" : "Register New Business Consumer"}</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-650 text-xs font-black p-1 uppercase"
                onClick={() => setIsFormOpen(false)}
              >
                🗙 Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-650 font-bold">Company / Entity Name <strong className="text-rose-600">*</strong></span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hindalco Industries Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-800 outline-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Primary Contact Person <strong className="text-rose-600">*</strong></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Gokhale"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-800 outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">State GST Number</span>
                  <input
                    type="text"
                    placeholder="e.g. 27AAACH8844D1Z9"
                    maxLength={15}
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.toUpperCase())}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs font-mono uppercase outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Contact Email Address <strong className="text-rose-600">*</strong></span>
                  <input
                    type="email"
                    required
                    placeholder="procurement@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-655 font-bold">Mobile Phone Support</span>
                  <input
                    type="text"
                    placeholder="+91 99999 44444"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Customer Tier</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Customer["status"])}
                    className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-bold outline-none cursor-pointer shadow-sm"
                  >
                    <option>Active</option>
                    <option>Key Account</option>
                    <option>Inactive</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Book Acquisition Value (₹)</span>
                  <input
                    type="number"
                    value={acquisitionValue}
                    onChange={(e) => setAcquisitionValue(Number(e.target.value))}
                    className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-650 font-bold">Corporate Billing Address</span>
                <input
                  type="text"
                  placeholder="Billing block, street, GIDC..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs outline-none shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-650 font-bold">Internal Accounts & Sourcing Notes</span>
                <textarea
                  placeholder="Specific requirements, pricing agreements, terms..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white border border-slate-250 rounded-lg p-2 text-xs h-20 outline-none resize-none shadow-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex justify-end gap-2 text-xs font-bold font-sans animate-fadeIn">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-650 border border-slate-250 px-4 py-2 rounded-lg cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all shadow-sm font-bold"
                >
                  {editingCustomer ? "Update Profile" : "Register Consumer"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
