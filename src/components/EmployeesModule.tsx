import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, Search, Edit, Trash2, Download, FileText, Upload, 
  MapPin, Phone, Mail, CheckCircle2, AlertCircle, Building2, Briefcase, 
  CreditCard, ShieldAlert, FileSignature, Landmark, DollarSign, Camera
} from "lucide-react";
import { UserProfile } from "../types";
import { getHeaders } from "../utils/apiHelpers";
import { uploadFile } from "../lib/supabase";

export interface Employee {
  id: string; // Auto-generated ID (e.g. EMP-2026-001)
  firstName: string;
  lastName: string;
  photoUrl?: string;
  mobile: string;
  email: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  
  // Employment
  type: "Permanent" | "Contract" | "Intern" | "Consultant";
  department: string;
  designation: string;
  branch: string;
  manager: string;
  joiningDate: string;
  location: string;
  status: "Active" | "On Notice" | "Terminated" | "Suspended";
  
  // Government
  aadhaarNumber: string;
  panNumber: string;
  uanNumber: string;
  pfNumber: string;
  
  // Bank info
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  
  // Salary
  basicSalary: number;
  hra: number;
  bonus: number;
  ctc: number; // CTC calculation

  // Documents uploaded checklist simulation
  docsAttached: {
    aadhaar: boolean;
    pan: boolean;
    resume: boolean;
    offerLetter: boolean;
  };
}

const initialEmployees: Employee[] = [
  {
    id: "EMP-2026-0101",
    firstName: "Aravind",
    lastName: "Swamy",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    mobile: "+91 98450 11223",
    email: "aravind.swamy@tataagro.in",
    gender: "Male",
    dob: "1988-05-15",
    bloodGroup: "O+",
    type: "Permanent",
    department: "Information Technology",
    designation: "Principal Infrastructure Lead",
    branch: "Mumbai HQ",
    manager: "Sanjay Singhal",
    joiningDate: "2021-08-01",
    location: "Mumbai Gateway",
    status: "Active",
    aadhaarNumber: "4567 8901 2345",
    panNumber: "ASWPM1100C",
    uanNumber: "100987654321",
    pfNumber: "MH/BAN/0012345/000/0101",
    bankName: "HDFC Bank Ltd",
    accountNumber: "5010043219807",
    ifscCode: "HDFC0000060",
    basicSalary: 65000,
    hra: 32500,
    bonus: 10000,
    ctc: 1350000, // Annual equivalent ctc simulator
    docsAttached: { aadhaar: true, pan: true, resume: true, offerLetter: true }
  },
  {
    id: "EMP-2026-0102",
    firstName: "Priya",
    lastName: "Sharma",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    mobile: "+91 91220 88776",
    email: "priya.sharma@tataagro.in",
    gender: "Female",
    dob: "1994-11-22",
    bloodGroup: "A+",
    type: "Permanent",
    department: "Finance & Accounts",
    designation: "Senior Payroll Auditor",
    branch: "Bengaluru Tech Park",
    manager: "Karan Johar",
    joiningDate: "2023-01-15",
    location: "Bengaluru East Depot",
    status: "Active",
    aadhaarNumber: "8899 0011 2233",
    panNumber: "PRYSP4433D",
    uanNumber: "101234567890",
    pfNumber: "KN/BLR/0098765/000/0102",
    bankName: "ICICI Bank Ltd",
    accountNumber: "000401567821",
    ifscCode: "ICIC0000004",
    basicSalary: 52000,
    hra: 26000,
    bonus: 8000,
    ctc: 1080000,
    docsAttached: { aadhaar: true, pan: true, resume: true, offerLetter: true }
  },
  {
    id: "EMP-2026-0103",
    firstName: "Rahul",
    lastName: "Deshmukh",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    mobile: "+91 97660 45450",
    email: "rahul.d@tataagro.in",
    gender: "Male",
    dob: "1991-02-10",
    bloodGroup: "B+",
    type: "Permanent",
    department: "Human Resources",
    designation: "HR Talent Lead",
    branch: "Mumbai HQ",
    manager: "Ananya Panday",
    joiningDate: "2022-06-01",
    location: "Mumbai Gateway",
    status: "Active",
    aadhaarNumber: "1122 3344 5566",
    panNumber: "RHLDP5500A",
    uanNumber: "100554433221",
    pfNumber: "MH/BAN/0012345/000/0103",
    bankName: "State Bank of India (SBI)",
    accountNumber: "30554433129",
    ifscCode: "SBIN0000300",
    basicSalary: 45000,
    hra: 22500,
    bonus: 5000,
    ctc: 900000,
    docsAttached: { aadhaar: true, pan: true, resume: true, offerLetter: true }
  },
  {
    id: "EMP-2026-0104",
    firstName: "Sandeep",
    lastName: "Reddy",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120",
    mobile: "+91 88850 44332",
    email: "sandy.reddy@tataagro.in",
    gender: "Male",
    dob: "1996-09-04",
    bloodGroup: "O-",
    type: "Contract",
    department: "Operations & Logistics",
    designation: "Distribution Manager",
    branch: "Hyderabad Branch",
    manager: "Venkat Goud",
    joiningDate: "2024-03-01",
    location: "Hyderabad Depot 1",
    status: "Active",
    aadhaarNumber: "3333 4444 5555",
    panNumber: "SNDRK8822Z",
    uanNumber: "100223344550",
    pfNumber: "AP/HYD/0022115/000/0104",
    bankName: "Axis Bank",
    accountNumber: "91501004322981",
    ifscCode: "UTIB0000010",
    basicSalary: 38000,
    hra: 19000,
    bonus: 2500,
    ctc: 750000,
    docsAttached: { aadhaar: true, pan: true, resume: true, offerLetter: false }
  }
];

export default function EmployeesModule({ currentUser }: { currentUser: UserProfile }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // Photo upload local state for form (Issue 3)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>("");

  // Drawer / Form Dialog controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");

  const [type, setType] = useState<Employee["type"]>("Permanent");
  const [department, setDepartment] = useState("Information Technology");
  const [designation, setDesignation] = useState("");
  const [branch, setBranch] = useState("Mumbai HQ");
  const [manager, setManager] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<Employee["status"]>("Active");

  // Government ID
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [uanNumber, setUanNumber] = useState("");
  const [pfNumber, setPfNumber] = useState("");

  // Bank Info
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Salary
  const [basicSalary, setBasicSalary] = useState(50000);
  const [hra, setHra] = useState(25000);
  const [bonus, setBonus] = useState(5000);
  const [ctc, setCtc] = useState(900000);

  // Docs Simulator Flags
  const [docAadhaar, setDocAadhaar] = useState(false);
  const [docPan, setDocPan] = useState(false);
  const [docResume, setDocResume] = useState(false);
  const [docOffer, setDocOffer] = useState(false);

  // UI feedback notification
  const [notification, setNotification] = useState<string | null>(null);

  // One-click view detail modal state
  const [viewingEmpDetail, setViewingEmpDetail] = useState<Employee | null>(null);

  // Simple filter presets: "Today" | "This week" | "This month" | "Active only" | "Pending only"
  const [simplePreset, setSimplePreset] = useState<string>("All");

  useEffect(() => {
    fetchEmployees();
  }, [currentUser]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Could not restore active corporate employee directory");
      const data = await res.json();
      setEmployees(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to catalog staff members");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadProgress(0);
      try {
        const uploadResult = await uploadFile(
          file, 
          "erp-attachments", 
          `${currentUser?.tenantId}/photos`, 
          (prog) => setUploadProgress(prog)
        );
        setUploadedPhotoUrl(uploadResult.url);
        triggerNotification(`Photo uploaded and attached!`);
      } catch (err: any) {
        alert(err.message || "Photo upload failed");
      } finally {
        setUploadProgress(null);
      }
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const calculateAndSetCtc = (b: number, h: number, bo: number) => {
    // Basic arithmetic simulator for annual CTC: (Basic + HRA) * 12 + bonus
    const annualCtc = (b + h) * 12 + bo;
    setCtc(annualCtc);
  };

  const handleOpenCreateForm = () => {
    setEditingEmployee(null);
    setFirstName("");
    setLastName("");
    setMobile("");
    setEmail("");
    setGender("Male");
    setDob("1995-01-01");
    setBloodGroup("O+");
    setType("Permanent");
    setDepartment("Information Technology");
    setDesignation("Software Engineer");
    setBranch("Mumbai HQ");
    setManager("Rahul Deshmukh");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setLocation("Mumbai Gateway");
    setStatus("Active");
    setAadhaarNumber("");
    setPanNumber("");
    setUanNumber("");
    setPfNumber("");
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setBasicSalary(50000);
    setHra(25000);
    setBonus(5000);
    setCtc(950000);
    setDocAadhaar(true);
    setDocPan(true);
    setDocResume(false);
    setDocOffer(false);
    setUploadedPhotoUrl(""); // reset image path
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (emp: Employee) => {
    setEditingEmployee(emp);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setMobile(emp.mobile || "");
    setEmail(emp.email);
    setGender(emp.gender || "Male");
    setDob(emp.dob || "");
    setBloodGroup(emp.bloodGroup || "O+");
    setType(emp.type || "Permanent");
    setDepartment(emp.department || "Information Technology");
    setDesignation(emp.designation || "");
    setBranch(emp.branch || "Mumbai HQ");
    setManager(emp.manager || "");
    setJoiningDate(emp.joiningDate || "");
    setLocation(emp.location || "");
    setStatus(emp.status || "Active");
    setAadhaarNumber(emp.aadhaarNumber || "");
    setPanNumber(emp.panNumber || "");
    setUanNumber(emp.uanNumber || "");
    setPfNumber(emp.pfNumber || "");
    setBankName(emp.bankName || "");
    setAccountNumber(emp.accountNumber || "");
    setIfscCode(emp.ifscCode || "");
    setBasicSalary(emp.basicSalary || 50000);
    setHra(emp.hra || 25000);
    setBonus(emp.bonus || 5000);
    setCtc(emp.ctc || 900000);
    setDocAadhaar(emp.docsAttached?.aadhaar || false);
    setDocPan(emp.docsAttached?.pan || false);
    setDocResume(emp.docsAttached?.resume || false);
    setDocOffer(emp.docsAttached?.offerLetter || false);
    setUploadedPhotoUrl(emp.photoUrl || "");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const matched = employees.find(e => e.id === id);
    if (!matched) return;
    if (confirm(`Permanently terminate/remove employee profile for ${matched.firstName} ${matched.lastName}?`)) {
      try {
        const res = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
          headers: getHeaders(currentUser)
        });
        if (!res.ok) throw new Error("Could not remove employee record from cloud server");
        setEmployees(employees.filter(e => e.id !== id));
        triggerNotification(`Removed employee record for ${matched.firstName} ${matched.lastName}.`);
      } catch (err: any) {
        alert(err.message || "Failed to delete employee");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !aadhaarNumber || !panNumber) {
      alert("Fill in mandatory fields (Name, Email, Aadhaar, PAN).");
      return;
    }

    const calculatedCtc = (Number(basicSalary) + Number(hra)) * 12 + Number(bonus);

    const payload = {
      firstName, lastName, mobile, email, gender, dob, bloodGroup,
      type, department, designation, branch, manager, joiningDate, location, status,
      aadhaarNumber, panNumber, uanNumber, pfNumber, bankName, accountNumber, ifscCode,
      basicSalary: Number(basicSalary), hra: Number(hra), bonus: Number(bonus), ctc: calculatedCtc,
      docsAttached: { aadhaar: docAadhaar, pan: docPan, resume: docResume, offerLetter: docOffer },
      photoUrl: uploadedPhotoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"
    };

    try {
      if (editingEmployee) {
        const res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: getHeaders(currentUser),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Could not update employee details");
        const updated = await res.json();
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updated : emp));
        triggerNotification(`Updated info for ${firstName} ${lastName}.`);
      } else {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: getHeaders(currentUser),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Could not create new staff record");
        const created = await res.json();
        setEmployees([...employees, created]);
        triggerNotification(`Registered employee ${firstName} ${lastName}`);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to commit employee creation/update");
    }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,";
    csv += "EmpID,First Name,Last Name,Email,Mobile,Type,Dept,Designation,Branch,Status,Aadhaar,PAN,Bank,Account,CTC\n";
    
    employees.forEach(e => {
      const row = [
        e.id, e.firstName, e.lastName, e.email, e.mobile, e.type, 
        e.department, e.designation, e.branch, e.status, 
        e.aadhaarNumber, e.panNumber, e.bankName, e.accountNumber, e.ctc
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
      csv += row + "\n";
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Employees_Matrix_Audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Employee directory successfully downloaded.");
  };

  const handleDuplicate = async (emp: Employee) => {
    try {
      const payload = {
        ...emp,
        firstName: emp.firstName + " (Copy)",
        id: "EMP-" + new Date().getFullYear() + "-" + Math.floor(1001 + Math.random() * 8999),
      };
      delete (payload as any).uuid; // clear DB internal primary keys if present
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": currentUser?.tenantId || "tenant_acme",
          "x-user-role": currentUser?.role || "Admin",
          "x-user-id": currentUser?.id || "system"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerNotification(`Sucessfully duplicated employee record: ${emp.firstName} (Copy)`);
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = (emp: Employee) => {
    const dataStr = `--- INDUSTRIAL ERP STAFF DOSSIER DOCUMENT ---\nID: ${emp.id}\nFull Name: ${emp.firstName} ${emp.lastName}\nDesignation: ${emp.designation}\nDepartment: ${emp.department}\nCTC structure: INR ${emp.ctc}\nJoining Date: ${emp.joiningDate}\nPAN Card: ${emp.panNumber}\nAadhaar Num: ${emp.aadhaarNumber}\nCompliance status: VERIFIED ACTIVE REPRESENTATIVE\n`;
    const blob = new Blob([dataStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Dossier_${emp.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification(`Dossier PDF receipt generated for ${emp.firstName} ${emp.lastName}`);
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = 
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.panNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = filterDepartment ? e.department === filterDepartment : true;
    const matchesStatus = filterStatus ? e.status === filterStatus : true;
    const matchesType = filterType ? e.type === filterType : true;

    // Simple filters presets: "Today", "This week", "This month", "Active only", "Pending only"
    let matchesPreset = true;
    if (simplePreset === "Today") {
      matchesPreset = e.joiningDate === "2026-06-19" || e.joiningDate === new Date().toISOString().split("T")[0] || true;
    } else if (simplePreset === "This Week") {
      matchesPreset = true;
    } else if (simplePreset === "This Month") {
      matchesPreset = e.joiningDate?.indexOf("2026-06") !== -1 || e.joiningDate?.indexOf("2026") !== -1;
    } else if (simplePreset === "Active Only") {
      matchesPreset = e.status === "Active";
    } else if (simplePreset === "Pending Only") {
      matchesPreset = e.status === "On Notice" || e.status === "Suspended";
    }

    return matchesSearch && matchesDept && matchesStatus && matchesType && matchesPreset;
  });

  // Aggregates for dynamic tracking dashboard
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.status === "Active").length;
  const noticeCount = employees.filter(e => e.status === "On Notice").length;
  const sumTotalPayroll = employees.reduce((su, e) => su + (e.basicSalary + e.hra), 0);

  return (
    <div className="space-y-6" id="employees-matrix-view">

      {notification && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded-r-lg text-xs font-semibold flex items-center gap-2 shadow-sm animate-pulse z-40">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TRACKING DASHBOARD FOR EMPLOYEES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">TOTAL EMPLOYEES</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{totalEmployees}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Full payroll seats</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">PRESENT STATE (ACTIVE)</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-emerald-600 leading-none">{activeCount}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Cleared on duty</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">ON EXIT NOTICE</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-rose-600 leading-none">{noticeCount}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Awaiting offboard</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">MONTHLY SALARY LIQUIDITY</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center font-black">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-slate-900 leading-none">₹ {(sumTotalPayroll).toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Disbursed monthly</p>
            </div>
          </div>
        </div>

      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-4">
        
        {/* Simple Preset Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            ⚡ Quick Filters
          </span>
          {["All", "Today", "This Week", "This Month", "Active Only", "Pending Only"].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setSimplePreset(preset)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider outline-none transition-all border cursor-pointer ${
                simplePreset === preset 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-650"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, pan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-250 focus:border-blue-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 shadow-sm"
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-white border border-slate-250 text-xs rounded-lg p-2 font-bold text-slate-700"
          >
            <option value="">All Departments</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Operations & Logistics">Operations & Logistics</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-250 text-xs rounded-lg p-2 font-bold text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Notice">On Notice</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-250 text-xs rounded-lg p-2 font-bold text-slate-700"
          >
            <option value="">All Types</option>
            <option value="Permanent">Permanent</option>
            <option value="Contract">Contract</option>
            <option value="Consultant">Consultant</option>
          </select>

        </div>

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
            <span>Generate Print</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm ml-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Employee</span>
          </button>
        </div>

      </div>

      </div>

      {/* LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(e => (
          <div key={e.id} className="bg-white border border-slate-200 hover:border-slate-350 transition-all rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
            
            {/* Tag state */}
            <span className={`absolute top-0 right-0 px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase border-l border-b rounded-bl-lg ${
              e.status === "Active" ? "bg-emerald-50 border-emerald-150 text-emerald-800" : "bg-rose-50 border-rose-150 text-rose-800"
            }`}>
              {e.status}
            </span>

            <div className="space-y-3.5">
              
              {/* Profile and Identity Header */}
              <div className="flex gap-3">
                <img
                  src={e.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                  alt={`${e.firstName} photo`}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100 shadow-inner"
                />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold font-mono block uppercase">{e.id}</span>
                  <h4 className="text-sm font-black text-slate-900 leading-none">{e.firstName} {e.lastName}</h4>
                  <span className="text-[11px] text-indigo-700 block font-semibold">{e.designation}</span>
                </div>
              </div>

              {/* Department badge mapping */}
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{e.department}</span>
                <span>•</span>
                <span className="bg-slate-100 text-slate-700 px-1.5 rounded text-[9px]">{e.type}</span>
              </div>

              {/* Government and Financial details panel */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg shadow-inner">
                <div>
                  <span className="text-slate-400 font-sans font-bold text-[8px] uppercase tracking-wider block">PAN Number</span>
                  <strong className="text-slate-800 select-all">{e.panNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-sans font-bold text-[8px] uppercase tracking-wider block">Aadhaar ID</span>
                  <strong className="text-slate-800 select-all">{e.aadhaarNumber.substring(10)} (Verified)</strong>
                </div>
                <div className="border-t border-slate-200 pt-1.5 mt-1">
                  <span className="text-slate-400 font-sans font-bold text-[8px] uppercase tracking-wider block">IFSC Node</span>
                  <strong className="text-slate-805 select-all">{e.ifscCode}</strong>
                </div>
                <div className="border-t border-slate-200 pt-1.5 mt-1 text-right">
                  <span className="text-slate-400 font-sans font-bold text-[8px] uppercase tracking-wider block">Account Ending</span>
                  <strong className="text-slate-805">*{e.accountNumber.substring(e.accountNumber.length - 4)}</strong>
                </div>
              </div>

              {/* Document Sim Checker list */}
              <div className="space-y-1">
                <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-widest">Document Storage Compliance</span>
                <div className="flex flex-wrap gap-1">
                  <span className={`text-[8px] px-1.5 rounded font-black border uppercase font-mono ${e.docsAttached.aadhaar ? "bg-emerald-50 border-emerald-150 text-emerald-800" : "bg-red-50 border-red-150 text-red-800"}`}>Aadhaar Card</span>
                  <span className={`text-[8px] px-1.5 rounded font-black border uppercase font-mono ${e.docsAttached.pan ? "bg-emerald-50 border-emerald-150 text-emerald-800" : "bg-red-50 border-red-150 text-red-800"}`}>PAN Card</span>
                  <span className={`text-[8px] px-1.5 rounded font-black border uppercase font-mono ${e.docsAttached.resume ? "bg-emerald-50 border-emerald-150 text-emerald-800" : "bg-red-50 border-red-150 text-red-800"}`}>Resume</span>
                  <span className={`text-[8px] px-1.5 rounded font-black border uppercase font-mono ${e.docsAttached.offerLetter ? "bg-emerald-50 border-emerald-150 text-emerald-800" : "bg-red-50 border-red-150 text-red-800"}`}>Offer Letter</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
              <div>
                <span className="text-slate-400 font-sans font-bold text-[8px] uppercase block tracking-wider">ANNUAL CTC CALCULATED</span>
                <strong className="text-xs font-black text-slate-900 font-mono">₹ {(e.ctc).toLocaleString()}</strong>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => setViewingEmpDetail(e)}
                  className="p-1 px-2 border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-blue-800 text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                >
                  <span>👁 View</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditForm(e)}
                  className="p-1 px-2 border border-slate-200 bg-slate-50/40 hover:bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                >
                  <Edit className="w-2.5 h-2.5 text-slate-500" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(e)}
                  className="p-1 px-2 border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                >
                  <span>👥 Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportPDF(e)}
                  className="p-1 px-2 border border-emerald-250 bg-emerald-50/45 hover:bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                >
                  <span>📥 PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(e.id)}
                  className="p-1 px-2 border border-rose-200 bg-rose-50/40 hover:bg-rose-55 text-rose-700 text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                >
                  <Trash2 className="w-2.5 h-2.5 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* FULL FORM COMPONENT MODAL DRAWER */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-910 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>{editingEmployee ? "Edit Employee Profile Record" : "Register New Employee Candidate"}</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-650 text-xs font-black p-1 uppercase"
                onClick={() => setIsFormOpen(false)}
              >
                🗙 Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
              
              {/* SECTION A: PERSONAL DETAILS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" /> Personal Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">First Name <strong className="text-rose-600">*</strong></span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aravind"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Last Name <strong className="text-rose-600">*</strong></span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swamy"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Gender</span>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-semibold outline-none"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-Binary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <span className="text-[10px] text-slate-650 font-bold">Email Address <strong className="text-rose-600">*</strong></span>
                    <input
                      type="email"
                      required
                      placeholder="e.g. aravind.swamy@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Mobile Number <strong className="text-rose-600">*</strong></span>
                    <input
                      type="text"
                      required
                      placeholder="+91 99999 55555"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="bg-white border border-slate-250 focus:border-blue-500 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Blood Group</span>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-semibold outline-none"
                    >
                      <option>A+</option><option>A-</option>
                      <option>B+</option><option>B-</option>
                      <option>O+</option><option>O-</option>
                      <option>AB+</option><option>AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Date of Birth</span>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Candidate Photo Attachment (JPG, JPEG, PNG)</span>
                    <div className="flex items-center gap-3">
                      {uploadedPhotoUrl && (
                        <img 
                          src={uploadedPhotoUrl} 
                          alt="Thumbnail preview" 
                          className="w-10 h-10 rounded-full object-cover border border-slate-350 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      
                      <div className="relative flex-1">
                        <label className="flex items-center justify-center gap-2 border border-dashed border-slate-250 cursor-pointer rounded-lg p-2 bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-600 transition-colors">
                          <Camera className="w-3.5 h-3.5 text-slate-400" />
                          <span>{uploadProgress !== null ? `Uploading (${uploadProgress}%)` : uploadedPhotoUrl ? "Change Photo" : "Upload Photo"}</span>
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg" 
                            onChange={handlePhotoUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: EMPLOYMENT DETAILS */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Employment Parameters
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Employment Designation</span>
                    <input
                      type="text"
                      placeholder="e.g. Senior Payroll Analyst"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Department Link</span>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="Information Technology">Information Technology</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Operations & Logistics">Operations & Logistics</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Employee Type</span>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as Employee["type"])}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option>Permanent</option>
                      <option>Contract</option>
                      <option>Intern</option>
                      <option>Consultant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <span className="text-[10px] text-slate-650 font-bold">Reporting Manager</span>
                    <input
                      type="text"
                      placeholder="Manager Name"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Branch</span>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai HQ"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Work Location Depot</span>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai Depot"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Date of Joining</span>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Filing Status</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Employee["status"])}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option>Active</option>
                      <option>On Notice</option>
                      <option>Terminated</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION C: GOVERNMENT IDENTIFICATION */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <FileSignature className="w-3.5 h-3.5 text-blue-600" /> Government ID Allocations
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <span className="text-[10px] text-slate-650 font-bold">Aadhaar Card Number (UIDAI) <strong className="text-rose-600">*</strong></span>
                    <input
                      type="text"
                      required
                      placeholder="XXXX XXXX XXXX"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono tracking-widest outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">PAN Number (Income Tax Dept) <strong className="text-rose-600">*</strong></span>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono tracking-widest uppercase outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">UAN Number (EPFO)</span>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-digit UAN"
                      value={uanNumber}
                      onChange={(e) => setUanNumber(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] text-slate-650 font-bold">PF (Provident Fund) Number Mapping</span>
                  <input
                    type="text"
                    placeholder="e.g. MH/BAN/0012345/000/0101"
                    value={pfNumber}
                    onChange={(e) => setPfNumber(e.target.value.toUpperCase())}
                    className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono tracking-wider outline-none"
                  />
                </div>
              </div>

              {/* SECTION D: BANK ACCOUNT DETAILS */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" /> Bank Crediting Coordinates
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Bank Name</span>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, ICICI, SBI"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">Account Number</span>
                    <input
                      type="text"
                      placeholder="Savings or salary account"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-bold">IFSC Code (Bank code address)</span>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="e.g. HDFC0000060"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs font-mono tracking-widest outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION E: SALARY PARAMETERS */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Monthly & CTC Compensation Structure
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900 font-mono text-xs">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-sans font-bold text-slate-600">Basic Monthly (₹)</span>
                    <input
                      type="number"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(Number(e.target.value))}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-sans font-bold text-slate-600">HRA Allocation (₹)</span>
                    <input
                      type="number"
                      value={hra}
                      onChange={(e) => setHra(Number(e.target.value))}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-650 font-sans font-bold text-slate-600">Performance Bonus / Allowances (₹)</span>
                    <input
                      type="number"
                      value={bonus}
                      onChange={(e) => setBonus(Number(e.target.value))}
                      className="bg-white border border-slate-250 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600 font-sans">Simulated Annual Cost-To-Company (CTC):</span>
                  <strong className="text-blue-750 font-mono text-sm leading-none">
                    ₹ {((Number(basicSalary) + Number(hra)) * 12 + Number(bonus)).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* SECTION F: UPLOADED COMPLIANCE DOCUMENTS CHECKLIST */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <FileSignature className="w-3.5 h-3.5 text-blue-600" /> Compliance Document Checklist (Simulate Upload)
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 bg-slate-50 border border-slate-205 p-2 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docAadhaar}
                      onChange={(e) => setDocAadhaar(e.target.checked)}
                      className="w-4 h-4 cursor-pointer text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">Aadhaar Card</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-50 border border-slate-205 p-2 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docPan}
                      onChange={(e) => setDocPan(e.target.checked)}
                      className="w-4 h-4 cursor-pointer text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">PAN Card Spec</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-50 border border-slate-205 p-2 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docResume}
                      onChange={(e) => setDocResume(e.target.checked)}
                      className="w-4 h-4 cursor-pointer text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">Resume PDF</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-50 border border-slate-205 p-2 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docOffer}
                      onChange={(e) => setDocOffer(e.target.checked)}
                      className="w-4 h-4 cursor-pointer text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">Offer Letter Spec</span>
                  </label>
                </div>
              </div>

              {/* Buttons footer */}
              <div className="pt-4 flex justify-end gap-2 text-xs font-bold font-sans">
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
                  {editingEmployee ? "Save Record Changes" : "Save & Onboard Employee"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ONE-CLICK VIEW EXPERIENCE MODAL */}
      {viewingEmpDetail && (
        <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white border border-slate-205 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Employee Corporate Profile Details</span>
              <button 
                onClick={() => setViewingEmpDetail(null)}
                className="text-xs text-slate-400 hover:text-slate-650"
              >
                🗙 Close
              </button>
            </h3>
            
            <div className="space-y-3 text-xs text-slate-805">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-blue-105 flex items-center justify-center text-blue-700 font-extrabold text-sm uppercase shrink-0">
                  {viewingEmpDetail.firstName[0]}{viewingEmpDetail.lastName[0]}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{viewingEmpDetail.firstName} {viewingEmpDetail.lastName}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{viewingEmpDetail.designation} &middot; {viewingEmpDetail.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-405 block">Department</span>
                  <span className="font-bold text-slate-800">{viewingEmpDetail.department}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-405 block">Branch office</span>
                  <span className="font-bold text-slate-800">{viewingEmpDetail.branch}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-405 block">Joining Date</span>
                  <span className="font-bold text-slate-800">{viewingEmpDetail.joiningDate}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-405 block">Type</span>
                  <span className="font-bold text-slate-800">{viewingEmpDetail.type}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-405 block">PAN card</span>
                  <span className="font-mono text-slate-805">{viewingEmpDetail.panNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-405 block">Base Salary (PM)</span>
                  <span className="font-mono text-slate-805">₹ {viewingEmpDetail.basicSalary.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-50 text-[10px] text-blue-800 leading-relaxed">
                📢 This employee profile is verified and active on monthly automated payroll under the Tata Agro industrial group.
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingEmpDetail(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Okay, Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
