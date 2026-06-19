import React, { useState } from "react";
import { 
  Building2, Plus, Edit, Trash2, Search, ArrowUpDown, FileText, Download, 
  MapPin, Phone, Mail, Globe, CheckCircle2, AlertCircle, Sparkles, Building
} from "lucide-react";

export interface Company {
  id: string;
  name: string;
  gstNumber: string;
  panNumber: string;
  cinNumber?: string;
  businessType: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  financialYear: string;
  status: "Active" | "Inactive";
}

const indianStates = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Telangana", 
  "West Bengal", "Uttar Pradesh", "Haryana", "Rajasthan", "Madhya Pradesh", 
  "Bihar", "Punjab", "Andhra Pradesh", "Kerala", "Assam"
];

const businessTypes = [
  "Private Limited (Pvt Ltd)", "Public Limited (Ltd)", "Partnership Firm", 
  "Sole Proprietorship", "One Person Company (OPC)", "LLP (Limited Liability Partnership)"
];

const industries = [
  "Manufacturing", "Construction", "Information Technology", "Agriculture & Agro", 
  "Healthcare & Hospitals", "Education & Schools", "Finance & CA Firm", 
  "Retail & Distribution", "Service & Consultation"
];

export default function CompanySetupModule() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "comp_1",
      name: "Tata Agro Pvt Ltd",
      gstNumber: "27AAAAC1234A1Z1",
      panNumber: "AAAAA1234A",
      cinNumber: "U01100MH2024PTC123456",
      businessType: "Private Limited (Pvt Ltd)",
      industry: "Agriculture & Agro",
      email: "finance@tataagro.co.in",
      phone: "+91 22 2200 1122",
      website: "https://tataagro.co.in",
      address: "Bombay House, Homi Mody Street, Fort",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "400001",
      financialYear: "2026-27 (FY26)",
      status: "Active"
    },
    {
      id: "comp_2",
      name: "Reliance Infra Ltd",
      gstNumber: "24AAACR4321B2Z2",
      panNumber: "BBBBB5678B",
      cinNumber: "L45200GJ1995PLC028734",
      businessType: "Public Limited (Ltd)",
      industry: "Construction",
      email: "contact@relinfra.com",
      phone: "+91 79 3500 4400",
      website: "https://relinfra.com",
      address: "Reliance House, Ghansoli",
      state: "Gujarat",
      city: "Ahmedabad",
      pincode: "380009",
      financialYear: "2026-27 (FY26)",
      status: "Active"
    },
    {
      id: "comp_3",
      name: "Adani Power Ltd",
      gstNumber: "24AAAAP9999C3Z3",
      panNumber: "CCCCC9999C",
      cinNumber: "L40100GJ1996PLC030533",
      businessType: "Public Limited (Ltd)",
      industry: "Manufacturing",
      email: "admin@adanipower.com",
      phone: "+91 79 2656 5555",
      website: "https://adanipower.com",
      address: "Adani Corporate House, S.G. Highway",
      state: "Gujarat",
      city: "Ahmedabad",
      pincode: "382421",
      financialYear: "2026-27 (FY26)",
      status: "Active"
    },
    {
      id: "comp_4",
      name: "Acme Consulting Services",
      gstNumber: "29AAAAC9876F1Z5",
      panNumber: "DDDDD7777D",
      cinNumber: "",
      businessType: "Sole Proprietorship",
      industry: "Service & Consultation",
      email: "compliance@acmeconsulting.in",
      phone: "+91 80 4455 6677",
      website: "https://acmeconsulting.in",
      address: "Prestige Tech Park, Outer Ring Road",
      state: "Karnataka",
      city: "Bengaluru",
      pincode: "560103",
      financialYear: "2026-27 (FY26)",
      status: "Active"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");

  // Controls form modal/drawer
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [businessType, setBusinessType] = useState(businessTypes[0]);
  const [industry, setIndustry] = useState(industries[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState(indianStates[0]);
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [financialYear, setFinancialYear] = useState("2026-27 (FY26)");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Notifications feedback banner
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateForm = () => {
    setEditingCompany(null);
    setName("");
    setGstNumber("");
    setPanNumber("");
    setCinNumber("");
    setBusinessType(businessTypes[0]);
    setIndustry(industries[0]);
    setEmail("");
    setPhone("");
    setWebsite("");
    setAddress("");
    setState(indianStates[0]);
    setCity("");
    setPincode("");
    setFinancialYear("2026-27 (FY26)");
    setStatus("Active");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (comp: Company) => {
    setEditingCompany(comp);
    setName(comp.name);
    setGstNumber(comp.gstNumber);
    setPanNumber(comp.panNumber);
    setCinNumber(comp.cinNumber || "");
    setBusinessType(comp.businessType);
    setIndustry(comp.industry);
    setEmail(comp.email);
    setPhone(comp.phone);
    setWebsite(comp.website);
    setAddress(comp.address);
    setState(comp.state);
    setCity(comp.city);
    setPincode(comp.pincode);
    setFinancialYear(comp.financialYear);
    setStatus(comp.status);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const matched = companies.find(c => c.id === id);
    if (confirm(`Are you sure you want to delete Company Profile for "${matched?.name}"?`)) {
      setCompanies(companies.filter(c => c.id !== id));
      triggerNotification(`Permanently deleted "${matched?.name}" profile.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gstNumber || !panNumber || !email) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    if (editingCompany) {
      // Edit mode
      setCompanies(companies.map(c => c.id === editingCompany.id ? {
        ...c,
        name, gstNumber, panNumber, cinNumber, businessType, industry,
        email, phone, website, address, state, city, pincode, financialYear, status
      } : c));
      triggerNotification(`Successfully updated "${name}" company logistics.`);
    } else {
      // Add mode
      const newComp: Company = {
        id: "comp_" + Date.now(),
        name, gstNumber, panNumber, cinNumber, businessType, industry,
        email, phone, website, address, state, city, pincode, financialYear, status
      };
      setCompanies([...companies, newComp]);
      triggerNotification(`Successfully registered "${name}" corporate setup.`);
    }
    setIsFormOpen(false);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Company Name,GSTIN,PAN,CIN,Type,Industry,Email,Phone,State,City,FY\n";
    
    companies.forEach(c => {
      const row = [
        c.id, c.name, c.gstNumber, c.panNumber, c.cinNumber || "N/A", 
        c.businessType, c.industry, c.email, c.phone, c.state, c.city, c.financialYear
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Company_Registrations_FY26.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Company ledger exported successfully to CSV format.");
  };

  // PDF Print Simulator
  const handleExportPDF = () => {
    window.print();
    triggerNotification("Print setup initiated for corporate registration cards.");
  };

  // Search & Filter Filtered result set
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = filterState ? c.state === filterState : true;
    const matchesIndustry = filterIndustry ? c.industry === filterIndustry : true;

    return matchesSearch && matchesState && matchesIndustry;
  });

  // KPI aggregates
  const totalCompaniesCount = companies.length;
  const activeCompaniesCount = companies.filter(c => c.status === "Active").length;
  const distinctStatesCount = new Set(companies.map(c => c.state)).size;

  return (
    <div className="space-y-6" id="company-setup-screen">
      
      {/* Dynamic Activity Tracker Notification Banner */}
      {notification && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded-r-lg text-xs font-semibold flex items-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TRACKING DASHBOARD CARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">TOTAL ENTITIES</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{totalCompaniesCount}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Incorporated profiles</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">OPERATIONAL ACTIVE</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-emerald-600 leading-none">{activeCompaniesCount}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Filing status healthy</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">REGIONAL GEOS</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center font-black">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{distinctStatesCount} States</h3>
              <p className="text-[10px] text-slate-400 mt-1">Multi-state operations</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-rose-100 p-5 rounded-xl shadow-sm space-y-1.5 flex flex-col justify-end bg-rose-50/10">
          <span className="text-[9px] uppercase tracking-wider text-rose-500 font-extrabold block">COMPLIANCE COMPANION</span>
          <div className="text-[11px] text-slate-600 font-semibold leading-tight">
            GST & MCA e-filings must follow PAN allocation maps. Ensure active FY aligned.
          </div>
        </div>

      </div>

      {/* FILTER CONTROLS & UTILITIES BAR */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, GSTIN, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-250 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 shadow-sm"
            />
          </div>

          {/* STATE FILTER */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-white border border-slate-250 text-xs rounded-lg p-2 font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All States</option>
            {indianStates.map(st => <option key={st} value={st}>{st}</option>)}
          </select>

          {/* INDUSTRY FILTER */}
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="bg-white border border-slate-250 text-xs rounded-lg p-2 font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Industries</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>

        {/* WORK ACTION UTILITIES */}
        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-center justify-end shrink-0">
          
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-750 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
            title="Download CSV database ledger"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-750 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
            title="Print list or save to PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm ml-1"
          >
            <Plus className="w-4 h-4" />
            <span>New Company Setup</span>
          </button>

        </div>

      </div>

      {/* COMPACT ENTRY LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompanies.map(c => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
            
            {/* Status indicator */}
            <span className={`absolute top-0 right-0 px-2.5 py-1 text-[8px] font-bold rounded-bl-lg border-l border-b uppercase ${
              c.status === "Active" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-150" 
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              {c.status}
            </span>

            {/* Header Identity */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-[10px] text-blue-650 font-bold font-mono tracking-wide uppercase">{c.businessType}</span>
              </div>
              <h4 className="text-base font-black text-slate-900 tracking-tight">{c.name}</h4>
              <p className="text-[11px] text-indigo-700 font-semibold font-mono">{c.industry}</p>
            </div>

            {/* Indian tax registration grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-[11px] font-mono shadow-inner">
              <div>
                <span className="text-slate-400 block font-sans font-bold text-[9px] uppercase tracking-wider">GST Number</span>
                <strong className="text-slate-800 select-all">{c.gstNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-sans font-bold text-[9px] uppercase tracking-wider">PAN Number</span>
                <strong className="text-slate-800 select-all">{c.panNumber}</strong>
              </div>
              {c.cinNumber && (
                <div className="col-span-2 border-t border-slate-200 pt-2 mt-1">
                  <span className="text-slate-400 block font-sans font-bold text-[9px] uppercase tracking-wider">CIN (MCA Registered Number)</span>
                  <strong className="text-slate-850 select-all text-[10px]">{c.cinNumber}</strong>
                </div>
              )}
            </div>

            {/* Contact mapping */}
            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-2 hover:text-blue-600 duration-150">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="select-all">{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{c.phone}</span>
              </div>
              {c.website && (
                <div className="flex items-center gap-2 hover:text-blue-600 font-mono text-[10px]">
                  <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href={c.website} target="_blank" rel="noreferrer" className="underline">{c.website}</a>
                </div>
              )}
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] leading-tight">
                  {c.address}, {c.city}, {c.state} - {c.pincode}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3.5 mt-2">
              <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">FY Aligned: {c.financialYear}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditForm(c)}
                  className="p-1 px-2.5 border border-slate-250 hover:bg-slate-50 rounded-md text-[10px] font-bold text-slate-700 cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                >
                  <Edit className="w-3 h-3 text-slate-500" />
                  <span>Edit Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="p-1 px-2.5 border border-rose-150 hover:bg-rose-50 rounded-md text-[10px] font-bold text-rose-700 cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                >
                  <Trash2 className="w-3 h-3 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CREATION AND EDITING DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-905 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>{editingCompany ? "Modify Company Setup Node" : "Register New Company Profile"}</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 text-xs font-black p-1 uppercase"
                onClick={() => setIsFormOpen(false)}
              >
                🗙 Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Identity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Company Name <strong className="text-rose-600">*</strong></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Agro Pvt Ltd"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-800 outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">GSTIN Registration <strong className="text-rose-600">*</strong></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 27AAAAC1234A1Z1"
                    maxLength={15}
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs font-mono tracking-widest text-slate-850 uppercase outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Tax allocations row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">PAN Number <strong className="text-rose-600">*</strong></span>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. AAAAA1234A"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs font-mono tracking-widest text-slate-850 uppercase outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">CIN Number (Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. U01100MH2024PTC123456"
                    maxLength={21}
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs font-mono text-slate-850 uppercase outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Active Financial Year</span>
                  <select
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="bg-white border border-slate-250 rounded-lg p-2 text-xs text-slate-800 outline-none font-semibold cursor-pointer shadow-sm"
                  >
                    <option value="2026-27 (FY26)">2026-27 (FY26)</option>
                    <option value="2027-28 (FY27)">2027-28 (FY27)</option>
                    <option value="2025-26 (FY25)">2025-26 (FY25)</option>
                  </select>
                </div>
              </div>

              {/* Business profile type & industry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Constitution of Business</span>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="bg-white border border-slate-250 rounded-lg p-2 text-xs text-slate-850 outline-none font-semibold cursor-pointer shadow-sm"
                  >
                    {businessTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Sector / Industry Vertical</span>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-white border border-slate-250 rounded-lg p-2 text-xs text-slate-850 outline-none font-semibold cursor-pointer shadow-sm"
                  >
                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
              </div>

              {/* Contact communications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Corporate Contact Email <strong className="text-rose-600">*</strong></span>
                  <input
                    type="email"
                    required
                    placeholder="info@company.co.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-800 outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Company Phone Support</span>
                  <input
                    type="text"
                    placeholder="e.g. +91 22 2200 4433"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-800 outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Corporate Website URI</span>
                  <input
                    type="url"
                    placeholder="https://mycorp.co.in"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-800 outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* Regional localization mapping */}
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-650 font-bold">Principal Place of Business (Address)</span>
                <input
                  type="text"
                  placeholder="Premises name, street, locality..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-850 outline-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1 md:col-span-2">
                  <span className="text-[10px] text-slate-650 font-bold">State (State jurisdictional zone)</span>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-white border border-slate-250 rounded-lg p-2 text-xs text-slate-850 outline-none font-semibold cursor-pointer shadow-sm"
                  >
                    {indianStates.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">City Zone</span>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs text-slate-800 outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">Indian Pincode</span>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 400001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-1.5 text-xs text-slate-800 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="status-checkbox"
                  checked={status === "Active"}
                  onChange={(e) => setStatus(e.target.checked ? "Active" : "Inactive")}
                  className="w-4 h-4 text-blue-650 cursor-pointer"
                />
                <label htmlFor="status-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Filing Status is Dynamic Active (Regulatory Compliant)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 text-xs font-bold font-sans">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-650 border border-slate-250 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  {editingCompany ? "Save Changes" : "Create Profile"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
