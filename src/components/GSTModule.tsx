import React, { useState } from "react";
import { 
  Percent, FileSpreadsheet, CheckCircle2, ShieldCheck, 
  MapPin, Hash, Calculator, ClipboardList, Trash, ArrowRight,
  Sparkles, FileText, Download, UserCheck
} from "lucide-react";
import { Invoice } from "../types";

interface GSTModuleProps {
  invoices: Invoice[];
  selectedIndustry: string;
}

export default function GSTModule({ invoices, selectedIndustry }: GSTModuleProps) {
  const [activeTab, setActiveTab] = useState<"calculator" | "validation" | "eway" | "gstr">("calculator");

  // GSTIN state
  const [gstinInput, setGstinInput] = useState("27AAPCS1234H1Z5");
  const [validationResult, setValidationResult] = useState<any | null>(null);

  // Calculator states
  const [baseInputAmount, setBaseInputAmount] = useState(10000);
  const [selectedSlab, setSelectedSlab] = useState<5 | 12 | 18 | 28>(18);
  const [isInterState, setIsInterState] = useState(false);

  // eWay bill state
  const [ewayVehicle, setEwayVehicle] = useState("MH-12-PQ-9876");
  const [ewayFrom, setEwayFrom] = useState("Mumbai, MH");
  const [ewayTo, setEwayTo] = useState("Pune, MH");
  const [ewayHsn, setEwayHsn] = useState("84713010");
  const [ewayVal, setEwayVal] = useState(125000);
  const [ewayResults, setEwayResults] = useState<any[]>([]);

  // Format Helper
  const INR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val * 83.5); // Unified approximate conversion scale to INR
  };

  // Indian State Codes dictionary
  const STATE_CODES: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
    "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
    "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
    "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka", "30": "Goa", "32": "Kerala",
    "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman & Nicobar Islands", "36": "Telangana",
    "37": "Andhra Pradesh", "38": "Ladakh"
  };

  const handleValidateGSTIN = (e: React.FormEvent) => {
    e.preventDefault();
    const g = gstinInput.trim().toUpperCase();
    
    // Regular Expression for standard Indian 15-character GSTIN
    const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (g.length !== 15) {
      setValidationResult({
        valid: false,
        error: "Incorrect length. GSTIN must be exactly 15 characters."
      });
      return;
    }

    if (!pattern.test(g)) {
      setValidationResult({
        valid: false,
        error: "Invalid format. Standard is: [StateCode][PAN][EntityNum][Alpha][CheckDigit]"
      });
      return;
    }

    // Capture valid elements
    const stateCode = g.substring(0, 2);
    const pan = g.substring(2, 12);
    const stateName = STATE_CODES[stateCode] || "Unknown Jurisdiction";

    setValidationResult({
      valid: true,
      gstin: g,
      stateCode,
      stateName,
      pan,
      tradeName: gstinInput.toLowerCase().includes("tata") ? "Tata Industries Ltd" : "Reliance Corporate Trade Pvt Ltd",
      taxpayerType: "Regular (Composition Exempt)",
      registrationDate: "2018-07-01",
      status: "Active"
    });
  };

  const handleGenerateEWayBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ewayVehicle || !ewayFrom || !ewayTo) return;

    const code = "EWB" + Math.floor(Math.random() * 1000000000000);
    const newBill = {
      id: "ewb_" + Date.now(),
      billNumber: code,
      vehicleNumber: ewayVehicle.toUpperCase(),
      fromLocation: ewayFrom,
      toLocation: ewayTo,
      hsnCode: ewayHsn,
      consignmentValue: ewayVal,
      generatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    setEwayResults([newBill, ...ewayResults]);
    setEwayVehicle("");
  };

  const calculatedTaxVal = baseInputAmount * (selectedSlab / 100);
  const totalAmount = baseInputAmount + calculatedTaxVal;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" id="gst-module-root">
      
      {/* Module Title Banner & Switch tabs */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 rounded-t-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            <span>Statutory Goods & Services Tax (GST) Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile domestic tax liability, simulate GSTIN registration authenticity, and print authorized e-Way consignment passes.
          </p>
        </div>

        {/* Tab List */}
        <div className="flex border border-slate-200 rounded-lg p-1 bg-white">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "calculator" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            GST Quick Calc
          </button>
          <button
            onClick={() => setActiveTab("validation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "validation" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            GSTIN Validator
          </button>
          <button
            onClick={() => setActiveTab("eway")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "eway" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            e-Way Bill Generator
          </button>
          <button
            onClick={() => setActiveTab("gstr")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "gstr" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            GSTR Filing Dashboard
          </button>
        </div>
      </div>

      {/* Main interactive cards frame */}
      <div className="p-6">
        
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Calculator Controls */}
            <div className="lg:col-span-5 border border-slate-200 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Simulate Indian Tax Slab</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Base Taxable Amount (INR Scale)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={baseInputAmount}
                      onChange={(e) => setBaseInputAmount(Number(e.target.value))}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Applicable GST Tariff Slab</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 12, 18, 28].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSlab(s as any)}
                        className={`text-xs font-bold p-2.5 rounded-lg border transition-all ${
                          selectedSlab === s 
                            ? "bg-blue-50 border-blue-600 text-blue-600" 
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Interstate Supply (IGST)?</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Toggles CGST+SGST vs unique IGST</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isInterState}
                    onChange={(e) => setIsInterState(e.target.checked)}
                    className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="lg:col-span-7 bg-blue-50/40 border border-blue-100 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-3 border-b border-blue-100">
                  PROGRAMMATIC TAX APPORTIONMENT
                </h4>

                <div className="mt-5 space-y-3.5 text-xs font-medium text-slate-705">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Goods Service Value:</span>
                    <strong className="font-mono text-slate-900">{INR(baseInputAmount / 83.5)}</strong>
                  </div>

                  {!isInterState ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1">Central Tax (CGST - {selectedSlab/2}%):</span>
                        <strong className="font-mono text-slate-800">{INR((calculatedTaxVal / 2) / 83.5)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1">State Tax (SGST - {selectedSlab/2}%):</span>
                        <strong className="font-mono text-slate-800">{INR((calculatedTaxVal / 2) / 83.5)}</strong>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Integrated Interstate (IGST - {selectedSlab}%):</span>
                      <strong className="font-mono text-slate-880 text-blue-600">{INR(calculatedTaxVal / 83.5)}</strong>
                    </div>
                  )}

                  <div className="border-t border-blue-100 pt-3 flex justify-between font-bold text-slate-950 text-sm">
                    <span>Tax Inclusive Grand Total:</span>
                    <span className="font-mono text-blue-700">{INR(totalAmount / 83.5)}</span>
                  </div>
                </div>
              </div>

              {/* Zoho style tip */}
              <div className="p-3 bg-white border border-blue-100 rounded-lg text-[10px] text-slate-500 leading-relaxed mt-6">
                <strong>Standard Tariff Guide:</strong> 5% is suited for basic bulk commodities; 12% is for general industrial machinery; 18% is standard IT support & CA audits; 28% covers high luxury logistics.
              </div>
            </div>
          </div>
        )}

        {activeTab === "validation" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Input card */}
            <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-4">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                <span>Simulate GSTIN Authenticity Engine</span>
              </h3>

              <form onSubmit={handleValidateGSTIN} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={gstinInput}
                    onChange={(e) => setGstinInput(e.target.value)}
                    placeholder="Enter 15 character GSTIN..."
                    className="w-full text-xs font-semibold border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 uppercase tracking-wider text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">E.g., 27AAPCS1234H1Z5 (Maharashtra trade profile)</span>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer self-start h-[41px]"
                >
                  Verify Portal Cache
                </button>
              </form>
            </div>

            {/* Validation Outputs */}
            {validationResult && (
              <div className={`p-6 rounded-xl border ${
                validationResult.valid ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/40 border-rose-105"
              }`}>
                {validationResult.valid ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">GSTIN IS REGISTERED & LIVE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Corporate Trade Name:</span>
                          <strong className="text-slate-800">{validationResult.tradeName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tax Jurisdiction State:</span>
                          <strong className="text-slate-800">{validationResult.stateName} (Code {validationResult.stateCode})</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">PAN Mapping:</span>
                          <strong className="font-mono text-slate-800">{validationResult.pan}</strong>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Taxpayer Type:</span>
                          <strong className="text-slate-700">{validationResult.taxpayerType}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Authorized Date:</span>
                          <strong className="text-slate-700">{validationResult.registrationDate}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Status:</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-250 text-emerald-800 font-bold text-[10px] rounded">
                            {validationResult.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="p-1 px-2.5 bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-black">X</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-widest">VERIFICATION FAILING</h4>
                      <p className="text-xs mt-1 text-slate-600 font-medium">{validationResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "eway" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Form */}
            <form onSubmit={handleGenerateEWayBill} className="lg:col-span-5 border border-slate-200 p-5 rounded-xl bg-white space-y-4">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <ClipboardList className="w-4.5 h-4.5 text-blue-600" />
                <span>Consignment Details</span>
              </h3>

              <div className="space-y-4 text-xs font-medium">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Vehicle Transport Number</label>
                  <input
                    type="text"
                    required
                    value={ewayVehicle}
                    onChange={(e) => setEwayVehicle(e.target.value)}
                    placeholder="E.g., MH-12-PQ-9876"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-850 font-bold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Supply From</label>
                    <input
                      type="text"
                      required
                      value={ewayFrom}
                      onChange={(e) => setEwayFrom(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Supply To</label>
                    <input
                      type="text"
                      required
                      value={ewayTo}
                      onChange={(e) => setEwayTo(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">HSN Tariff Item</label>
                    <input
                      type="text"
                      required
                      value={ewayHsn}
                      onChange={(e) => setEwayHsn(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-850 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Freight Value (₹)</label>
                    <input
                      type="number"
                      required
                      value={ewayVal}
                      onChange={(e) => setEwayVal(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Authorize e-Way Pass
                </button>
              </div>
            </form>

            {/* List */}
            <div className="lg:col-span-7 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-2">
                ACTIVE E-WAY CLEARANCE BILLS ({ewayResults.length})
              </h4>

              {ewayResults.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <FileSpreadsheet className="w-8 h-8 opacity-40" />
                  <span className="text-xs">No active transit e-way bills generated.</span>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {ewayResults.map((ew) => (
                    <div key={ew.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm relative overflow-hidden">
                      {/* Barcode effect */}
                      <div className="absolute right-3 top-3 opacity-20 flex flex-col items-center">
                        <div className="w-[80px] h-[30px] border-l border-r border-black flex justify-between">
                          <div className="w-1 bg-black h-full" />
                          <div className="w-0.5 bg-black h-full" />
                          <div className="w-2 bg-black h-full" />
                          <div className="w-1 bg-black h-full" />
                        </div>
                        <span className="text-[6px] font-mono tracking-widest mt-1">EWA-4392</span>
                      </div>

                      <div className="text-xs font-bold text-blue-600">Bill #: {ew.billNumber}</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700 pt-1">
                        <div>Vehicle: <strong className="font-mono text-slate-900">{ew.vehicleNumber}</strong></div>
                        <div>HSN Code: <strong className="font-mono text-slate-900">{ew.hsnCode}</strong></div>
                        <div>Consignment: <strong className="text-emerald-700">{INR(ew.consignmentValue / 83.5)}</strong></div>
                        <div>Timestamp: <span>{ew.generatedAt}</span></div>
                      </div>
                      <div className="text-[10.5px] font-semibold text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-1">
                        <span>Route:</span>
                        <span>{ew.fromLocation}</span>
                        <ArrowRight className="w-3" />
                        <span>{ew.toLocation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "gstr" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cards row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">GSTR-1 Outward Returns</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">DRAFT REPORT</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-slate-950 font-mono">₹ 14,82,900</div>
                  <p className="text-[11px] font-medium text-slate-500">Collected liabilities mapped across {invoices.length} domestic sales files.</p>
                </div>
                <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md transition-all cursor-pointer shadow-sm">
                  Export GSTR-1 Offline XLS
                </button>
              </div>

              <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">GSTR-2A Auto-Fills</span>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">ITC SYNCED</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-slate-950 font-mono">₹ 3,45,210</div>
                  <p className="text-[11px] font-medium text-slate-500">Input Tax credits preloaded from verified supplier GSTR-1 filings.</p>
                </div>
                <button className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded transition-colors cursor-pointer">
                  Sync ITC from GSTN Cache
                </button>
              </div>

              <div className="border border-slate-200 p-5 rounded-xl bg-white space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">GSTR-3B Summary Offset</span>
                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-bold">READY TO SUBMIT</span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-slate-950 font-mono">₹ 11,37,690</div>
                  <p className="text-[11px] font-medium text-slate-500">Net electronic liability left following comprehensive ITC deductibles subtraction.</p>
                </div>
                <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs rounded transition-colors cursor-pointer">
                  File and Pay with CSC Digital
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
