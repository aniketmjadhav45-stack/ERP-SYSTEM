import React, { useState } from "react";
import { Product, Supplier } from "../types";
import { Plus, Search, Layers, ShieldAlert, CheckCircle2, User, Mail, Phone, MapPin, Sparkles } from "lucide-react";

interface InventoryModuleProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (product: Omit<Product, "id" | "sku">) => void;
  onUpdateProduct: (productId: string, updatedFields: Partial<Product>) => void;
}

export default function InventoryModule({
  products,
  suppliers,
  onAddProduct,
  onUpdateProduct
}: InventoryModuleProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "suppliers">("catalog");
  const [searchQuery, setSearchQuery] = useState("");

  // New Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState("Core Software");
  const [pStock, setPStock] = useState(150);
  const [pMin, setPMin] = useState(30);
  const [pUnit, setPUnit] = useState(120);
  const [pCost, setPCost] = useState(45);
  const [pSupplier, setPSupplier] = useState("");
  const [pLocation, setPLocation] = useState("Cloud Gateway US-East");

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName) return;

    // Resolve supplier name match
    const supObj = suppliers.find((s) => s.id === pSupplier) || suppliers[0];

    onAddProduct({
      name: pName,
      category: pCategory,
      stock: Number(pStock),
      minStock: Number(pMin),
      unitPrice: Number(pUnit),
      costPrice: Number(pCost),
      supplierId: supObj ? supObj.id : "sup_1",
      supplierName: supObj ? supObj.name : "Vandex Technical",
      location: pLocation
    });

    setPName("");
    setIsAddingProduct(false);
  };

  const handleAdjustStock = (pId: string, currentStock: number, direction: "up" | "down") => {
    const delta = direction === "up" ? 10 : -10;
    const newStock = Math.max(0, currentStock + delta);
    onUpdateProduct(pId, { stock: newStock });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="inventory-module">
      
      {/* Top filter tabs & search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "catalog" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Product Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "suppliers" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
            }`}
          >
            Supplier Directory
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search SKUs, parts catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-250 focus:border-indigo-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-slate-800 shadow-sm"
          />
        </div>
      </div>

      {/* 1. PRODUCT CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          
          <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Corporate Stock Holdings</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Inventory thresholds, storage depots positions, and supplier mappings.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="bg-indigo-600 hover:bg-indigo-555 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Product</span>
            </button>
          </div>

          {/* New Product form drawer simulator */}
          {isAddingProduct && (
            <form onSubmit={handleProductSubmit} className="bg-slate-50 p-5 border border-indigo-100 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 shadow-inner">
              <div className="md:col-span-2 flex flex-col space-y-1">
                <span className="text-[10px] text-slate-600 font-bold">Product / License Name</span>
                <input
                  type="text"
                  required
                  placeholder="Aisle gateway node bridge G2"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="bg-white border border-slate-250 focus:border-indigo-550 rounded p-1.5 text-xs text-slate-800 font-sans outline-none shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-600 font-bold">Part Category</span>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                  className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 font-semibold outline-none shadow-sm"
                >
                  <option>Core Software</option>
                  <option>Hardware Transceiver</option>
                  <option>Networking Accessories</option>
                  <option>Licenses Pack</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-600 font-bold">Supplier Node</span>
                <select
                  value={pSupplier}
                  onChange={(e) => setPSupplier(e.target.value)}
                  className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 font-semibold outline-none shadow-sm"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-600 font-bold">Initial Quantity</span>
                <input
                  type="number"
                  value={pStock}
                  onChange={(e) => setPStock(Number(e.target.value))}
                  className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-600 font-bold">Min Threshold</span>
                <input
                  type="number"
                  value={pMin}
                  onChange={(e) => setPMin(Number(e.target.value))}
                  className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-600 font-bold">Cost Price ($)</span>
                <input
                  type="number"
                  value={pCost}
                  onChange={(e) => setPCost(Number(e.target.value))}
                  className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-600 font-bold">Selling Price ($)</span>
                <input
                  type="number"
                  value={pUnit}
                  onChange={(e) => setPUnit(Number(e.target.value))}
                  className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 font-mono shadow-sm"
                />
              </div>

              <div className="md:col-span-4 pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-slate-700 text-white font-bold text-xs p-2 rounded-lg transition-all cursor-pointer w-full shadow"
                >
                  Register Inventory Asset Node
                </button>
              </div>
            </form>
          )}

          {/* Grid list of holds */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock < p.minStock;
              return (
                <div
                  key={p.id}
                  className={`p-5 bg-white border rounded-xl space-y-4 relative overflow-hidden transition-all hover:shadow-md hover:border-slate-350 shadow-sm ${
                    isLowStock 
                      ? "border-rose-350 border-2 shadow-rose-50 shadow" 
                      : "border-slate-200"
                  }`}
                >
                  {/* Warning indicator badge */}
                  {isLowStock ? (
                    <div className="absolute top-0 right-0 bg-rose-50 border-l border-b border-rose-150 text-rose-700 font-serif font-black text-[9px] py-1 px-2.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
                      <ShieldAlert className="w-3" /> LOW STOCK REORDER
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0 bg-emerald-50 border-l border-b border-emerald-150 text-emerald-700 font-sans font-bold text-[9px] py-1 px-2.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
                      ✓ ADEQUATE
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest block font-bold uppercase">{p.sku}</span>
                    <h5 className="text-sm font-black text-slate-900 font-sans">{p.name}</h5>
                    <span className="text-[10px] text-indigo-700 block font-bold font-mono">{p.category}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-inner">
                    <div>
                      <span className="text-slate-500 block font-sans font-bold text-[9px]">Unit Cost</span>
                      <strong className="text-slate-805">${p.costPrice.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans font-bold text-[9px]">Sale Price</span>
                      <strong className="text-indigo-600">${p.unitPrice.toLocaleString()}</strong>
                    </div>
                    <div className="col-span-2 border-t border-slate-200 pt-1.5 mt-1 font-sans">
                      <span className="text-slate-500 block font-sans font-bold text-[9px]">Supplier Contact</span>
                      <strong className="text-slate-805 font-bold font-sans">{p.supplierName}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 text-[11px] font-mono border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[9px] font-sans font-bold">Quantity On Hand</span>
                      <strong className={`text-sm ${isLowStock ? "text-rose-600 font-black" : "text-emerald-705 font-black"}`}>
                        {p.stock} units
                      </strong>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p.id, p.stock, "down")}
                        className="p-1 border border-slate-250 bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold px-2 rounded-md cursor-pointer shadow-sm transition-colors text-[10px]"
                        title="Reduce holding stock by 10"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p.id, p.stock, "up")}
                        className="p-1 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-2 rounded-md cursor-pointer shadow-sm transition-colors text-[10px]"
                        title="Increase holding stock by 10"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 2. SUPPLIERS REGISTER LIST */}
      {activeTab === "suppliers" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Permanent Supplier Ledger</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Contact information mapping global parts hardware vendors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 relative shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 border border-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-black">
                    {s.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">{s.name}</h5>
                    <span className="text-[10px] text-slate-550 font-mono">Contact: {s.contactName}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-650">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="select-all hover:text-indigo-600">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Provides Parts</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.productsSupplied.map((productStr, idx) => (
                      <span key={idx} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono font-bold shadow-sm">
                        {productStr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
