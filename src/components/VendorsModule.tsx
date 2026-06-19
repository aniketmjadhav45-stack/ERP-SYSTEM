import React, { useState } from "react";
import { Supplier, Product } from "../types";
import { 
  Building2, Plus, Mail, Phone, ShoppingCart, UserPlus, 
  MapPin, CheckCircle, Clock, Trash, Tag, ShieldAlert,
  Percent, ChevronRight, FileCode
} from "lucide-react";

interface VendorsModuleProps {
  suppliers: Supplier[];
  products: Product[];
  onAddSupplier: (supplier: Omit<Supplier, "id">) => void;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  productName: string;
  quantity: number;
  totalCost: number;
  status: "Draft" | "Pending Approval" | "Shipped" | "Completed" | "Paid";
  deliveryDate: string;
}

export default function VendorsModule({ suppliers, products, onAddSupplier }: VendorsModuleProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "po">("directory");

  // New Vendor form
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorProducts, setVendorProducts] = useState<string[]>([]);

  // Purchase orders memory state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    { id: "po_1", poNumber: "PO-2026-0031", vendorName: "Swaraj Castings India", productName: "Heavy Alloy Steel Sheets", quantity: 50, totalCost: 450000, status: "Shipped", deliveryDate: "2026-06-25" },
    { id: "po_2", poNumber: "PO-2026-0034", vendorName: "Vandex Supplies", productName: "Integrated Chip Microcontrollers", quantity: 120, totalCost: 240000, status: "Completed", deliveryDate: "2026-06-12" },
    { id: "po_3", poNumber: "PO-2026-0036", vendorName: "Bengal Precision Tooling", productName: "Optical Calibration Lenses", quantity: 15, totalCost: 185000, status: "Pending Approval", deliveryDate: "2026-07-02" }
  ]);

  // New PO states
  const [isAddingPo, setIsAddingPo] = useState(false);
  const [poVendor, setPoVendor] = useState("");
  const [poProductName, setPoProductName] = useState("");
  const [poQty, setPoQty] = useState(1);
  const [poRate, setPoRate] = useState(100);

  // INR convertor helper
  const INR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val * 83.5);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !vendorEmail) return;

    onAddSupplier({
      name: vendorName,
      contactName: vendorContact || "Corporate Logistics Exec",
      email: vendorEmail,
      phone: vendorPhone || "+91 22 5550 9922",
      productsSupplied: vendorProducts
    });

    setVendorName("");
    setVendorContact("");
    setVendorEmail("");
    setVendorPhone("");
    setVendorProducts([]);
    setIsAddingVendor(false);
  };

  const handlePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poVendor || !poProductName || poQty <= 0) return;

    const code = "PO-2026-00" + (purchaseOrders.length + 31);
    const newPo: PurchaseOrder = {
      id: "po_" + Date.now(),
      poNumber: code,
      vendorName: poVendor,
      productName: poProductName,
      quantity: poQty,
      totalCost: (poQty * poRate) / 83.5, // Convert inputted INR to internal USD scale
      status: "Pending Approval",
      deliveryDate: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0]
    };

    setPurchaseOrders([newPo, ...purchaseOrders]);
    setIsAddingPo(false);
    setPoVendor("");
    setPoProductName("");
    setPoQty(1);
    setPoRate(100);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" id="vendors-module-view">
      
      {/* Title bar / Tab toggle */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Vendors & Procurement Portal</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage bulk supplier agreements, catalog procurement line items, and audit purchase orders outstandings.
          </p>
        </div>

        <div className="flex border border-slate-200 rounded-lg p-1 bg-white shrink-0 self-start">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "directory" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Vendor Directory
          </button>
          <button
            onClick={() => setActiveTab("po")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "po" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Procurement POs
          </button>
        </div>
      </div>

      <div className="p-6">
        
        {activeTab === "directory" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Options bar */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold">{suppliers.length} Registered Trade Suppliers</span>
              <button
                type="button"
                onClick={() => setIsAddingVendor(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors shadow"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard New Vendor</span>
              </button>
            </div>

            {/* Quick adding form popup modal */}
            {isAddingVendor && (
              <form onSubmit={handleVendorSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 font-medium text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">Onboard Indian Corporate Supplier</span>
                  <button onClick={() => setIsAddingVendor(false)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold">Vendor Legal Name</label>
                    <input
                      type="text"
                      required
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="E.g., Swaraj Castings India Pvt Ltd"
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold">Primary Liaison Officer</label>
                    <input
                      type="text"
                      value={vendorContact}
                      onChange={(e) => setVendorContact(e.target.value)}
                      placeholder="E.g., Sanjay Deshmukh"
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold font-mono">Workspace Email Address</label>
                    <input
                      type="email"
                      required
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder="E.g., purchase@swarajcastings.in"
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold font-mono">Mobile / Hotline Tariff (+91)</label>
                    <input
                      type="text"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder="E.g., +91 98220 11993"
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-650 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer shadow transition-colors"
                >
                  Confirm Supplier Register
                </button>
              </form>
            )}

            {/* Suppers card layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suppliers.map((v) => (
                <div key={v.id} className="border border-slate-200 p-5 rounded-xl bg-white space-y-4 hover:border-slate-300 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600 font-sans">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{v.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono tracking-wider">Supplies: {v.productsSupplied?.join(", ") || "General Castings"}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">{v.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">{v.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>Contact: <strong>{v.contactName}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PO tab content */}
        {activeTab === "po" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Options bar */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold">{purchaseOrders.length} Authorized procurement agreements</span>
              <button
                type="button"
                onClick={() => setIsAddingPo(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors shadow"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Raise Purchase Order</span>
              </button>
            </div>

            {/* Quick raising form popup */}
            {isAddingPo && (
              <form onSubmit={handlePOSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 font-medium text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">Draft New Purchase Agreement (PO)</span>
                  <button onClick={() => setIsAddingPo(false)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold">Select Vendor</label>
                    <select
                      required
                      value={poVendor}
                      onChange={(e) => setPoVendor(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-805"
                    >
                      <option value="">-- Choose Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold font-mono">Commodity Raw Material Name</label>
                    <input
                      type="text"
                      required
                      value={poProductName}
                      onChange={(e) => setPoProductName(e.target.value)}
                      placeholder="E.g., Hot Rolled Mild Steel Blocks"
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-805"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold">Quantity Required</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={poQty}
                      onChange={(e) => setPoQty(Number(e.target.value))}
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-805"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold font-mono">Estimated Unit Base Cost (INR)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={poRate}
                      onChange={(e) => setPoRate(Number(e.target.value))}
                      className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-805"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-650 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer shadow transition-colors"
                >
                  Approve and Queue PO
                </button>
              </form>
            )}

            {/* PO List */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                    <th className="p-4">PO Document ID</th>
                    <th className="p-4">Supplier Partner</th>
                    <th className="p-4 font-mono">Materials Allocated</th>
                    <th className="p-4 font-mono text-center">Quantity</th>
                    <th className="p-4 font-mono">Calculated Cost (INR)</th>
                    <th className="p-4 text-center">Agreement Status</th>
                    <th className="p-4">Dispatch ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id}>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5 pt-4">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span>{po.poNumber}</span>
                      </td>
                      <td className="p-4 text-slate-900">{po.vendorName}</td>
                      <td className="p-4 text-slate-650">{po.productName}</td>
                      <td className="p-4 font-mono text-center text-slate-900">{po.quantity}</td>
                      <td className="p-4 font-mono text-slate-900">{INR(po.totalCost)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 font-bold text-[9px] uppercase border rounded-full ${
                          po.status === "Paid" || po.status === "Completed"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : po.status === "Shipped"
                            ? "bg-blue-50 border-blue-200 text-blue-750"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{po.deliveryDate}</td>
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
