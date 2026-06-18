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
      
      {/* Top filter tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "catalog" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Product Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "suppliers" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
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
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-slate-200"
          />
        </div>
      </div>

      {/* 1. PRODUCT CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          
          <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Corporate Stock Holdings</h4>
              <p className="text-[11px] text-slate-500">Inventory thresholds, storage depots positions, and supplier mappings.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Product</span>
            </button>
          </div>

          {/* New Product form drawer simulator */}
          {isAddingProduct && (
            <form onSubmit={handleProductSubmit} className="bg-slate-950 p-5 border border-indigo-950 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Product / License Name</span>
                <input
                  type="text"
                  required
                  placeholder="Aisle gateway node bridge G2"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded p-1.5 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Part Category</span>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-400 outline-none"
                >
                  <option>Core Software</option>
                  <option>Hardware Transceiver</option>
                  <option>Networking Accessories</option>
                  <option>Licenses Pack</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Supplier Node</span>
                <select
                  value={pSupplier}
                  onChange={(e) => setPSupplier(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-400 outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Initial Quantity</span>
                <input
                  type="number"
                  value={pStock}
                  onChange={(e) => setPStock(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Min Threshold</span>
                <input
                  type="number"
                  value={pMin}
                  onChange={(e) => setPMin(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Cost Price ($)</span>
                <input
                  type="number"
                  value={pCost}
                  onChange={(e) => setPCost(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Selling Price ($)</span>
                <input
                  type="number"
                  value={pUnit}
                  onChange={(e) => setPUnit(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="md:col-span-4 pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-slate-700 text-white font-bold text-xs p-2 rounded transition-all cursor-pointer w-full"
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
                  className={`p-5 bg-slate-900/60 border rounded-xl space-y-4 relative overflow-hidden transition-all hover:border-slate-700 ${
                    isLowStock ? "border-rose-900 shadow-md shadow-rose-950/20" : "border-slate-800"
                  }`}
                >
                  {/* Warning indicator badge */}
                  {isLowStock && (
                    <div className="absolute top-0 right-0 bg-rose-950 border-l border-b border-rose-900 text-rose-450 text-[9px] font-bold py-1 px-2 rounded-bl-lg font-mono flex items-center gap-1">
                      <ShieldAlert className="w-3" /> LOW STOCK REORDER
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase">{p.sku}</span>
                    <h5 className="text-xs font-bold text-slate-100">{p.name}</h5>
                    <span className="text-[10px] text-indigo-400 block">{p.category}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/40 p-2.5 rounded border border-slate-900">
                    <div>
                      <span className="text-slate-500 block">Unit Cost</span>
                      <strong className="text-slate-300">${p.costPrice.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sale Price</span>
                      <strong className="text-indigo-400">${p.unitPrice.toLocaleString()}</strong>
                    </div>
                    <div className="col-span-2 border-t border-slate-900 pt-1.5 mt-1">
                      <span className="text-slate-500 block">Supplier Contact</span>
                      <strong className="text-slate-350 font-sans">{p.supplierName}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px] font-mono border-t border-slate-950">
                    <div>
                      <span className="text-slate-500 block text-[9px]">Quantity On Hold</span>
                      <strong className={`text-sm ${isLowStock ? "text-rose-400" : "text-emerald-400"}`}>
                        {p.stock} units
                      </strong>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p.id, p.stock, "down")}
                        className="p-1 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 font-bold px-2 rounded cursor-pointer"
                        title="Reduce holding stock by 10"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p.id, p.stock, "up")}
                        className="p-1 border border-indigo-900 bg-slate-955 hover:bg-indigo-950 text-indigo-450 font-bold px-2 rounded cursor-pointer"
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
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-semibold text-white">Permanent Supplier Ledger</h4>
            <p className="text-[11px] text-slate-500">Contact information mapping global parts hardware vendors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3.5 relative">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                    {s.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">{s.name}</h5>
                    <span className="text-[10px] text-slate-505 font-mono">Contact: {s.contactName}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-350">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="select-all hover:text-indigo-405">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Provides Parts</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.productsSupplied.map((productStr, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">
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
