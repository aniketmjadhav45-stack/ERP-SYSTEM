import React, { useState } from "react";
import { Invoice } from "../types";
import { 
  CreditCard, Hash, Coins, Key, Landmark, CheckSquare, Trash, 
  HelpCircle, Sparkles, Printer, RefreshCw, Smartphone, CheckCircle, HelpCircleIcon
} from "lucide-react";

interface PaymentsModuleProps {
  invoices: Invoice[];
  onConfirmInvoicePaid: (invoiceId: string) => void;
}

interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  clientName: string;
  amount: number;
  paymentMode: "UPI" | "NEFT/RTGS" | "Bank Transfer" | "Cash Override";
  clearedAt: string;
  invoiceId?: string;
}

export default function PaymentsModule({ invoices, onConfirmInvoicePaid }: PaymentsModuleProps) {
  const [activeTab, setActiveTab] = useState<"upi" | "neft" | "receipts">("upi");

  // Dynamic UPI generator inputs
  const [upiId, setUpiId] = useState("tata.industries@okaxis");
  const [upiReceiver, setUpiReceiver] = useState("Tata Industries ERP Account");
  const [upiAmount, setUpiAmount] = useState(15000);
  const [simulatedPayConfirm, setSimulatedPayConfirm] = useState(false);

  // NEFT inputs
  const [neftClient, setNeftClient] = useState("");
  const [neftAmount, setNeftAmount] = useState(120000);
  const [neftBank, setNeftBank] = useState("State Bank of India");
  const [neftUtr, setNeftUtr] = useState("");

  // Payment logs memory state
  const [paymentsLog, setPaymentsLog] = useState<PaymentReceipt[]>([
    { id: "pr_1", receiptNumber: "REC-27320", clientName: "Marvelous Tech Corp", amount: 626250, paymentMode: "NEFT/RTGS", clearedAt: "2026-06-12 11:30" },
    { id: "pr_2", receiptNumber: "REC-27324", clientName: "David Miller", amount: 41750, paymentMode: "UPI", clearedAt: "2026-06-15 15:42" }
  ]);

  // Helpers
  const INR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCreateUPILink = () => {
    // Standard National Payments Corporation of India (NPCI) UPI URI Specifications
    // upi://pay?pa=merchant@upi&pn=MerchantName&am=100.00&cu=INR
    const uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiReceiver)}&am=${upiAmount}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(uri)}`;
  };

  const handleSimulatePaymentConfirmation = () => {
    setSimulatedPayConfirm(true);
    setTimeout(() => {
      const code = "REC-" + Math.floor(Math.random() * 90000 + 10000);
      const newRec: PaymentReceipt = {
        id: "pr_" + Date.now(),
        receiptNumber: code,
        clientName: upiReceiver,
        amount: upiAmount,
        paymentMode: "UPI",
        clearedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
      };

      setPaymentsLog([newRec, ...paymentsLog]);
      setSimulatedPayConfirm(false);
      alert(`Payment cleared successfully! Programmatic receipt ${code} issued and entered in banking ledger.`);
    }, 1500);
  };

  const handleNEFTSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neftClient || !neftUtr) return;

    const code = "REC-" + Math.floor(Math.random() * 90000 + 10000);
    const newRec: PaymentReceipt = {
      id: "pr_" + Date.now(),
      receiptNumber: code,
      clientName: neftClient,
      amount: neftAmount,
      paymentMode: "NEFT/RTGS",
      clearedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    setPaymentsLog([newRec, ...paymentsLog]);
    setNeftClient("");
    setNeftUtr("");
    setActiveTab("receipts");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn" id="payments-module-root">
      
      {/* Tab select title */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <span>UPI Merchant & High-Value Banking Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate dynamic merchant NPCI QR codes, clear incoming NEFT/RTGS wire bank drafts, and track stamp-certified payment receipts.
          </p>
        </div>

        <div className="flex border border-slate-200 rounded-lg p-1 bg-white shrink-0 self-start">
          <button
            onClick={() => setActiveTab("upi")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "upi" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Dynamic UPI QR
          </button>
          <button
            onClick={() => setActiveTab("neft")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "neft" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            NEFT / RTGS Clearing
          </button>
          <button
            onClick={() => setActiveTab("receipts")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "receipts" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Stamp Receipts ({paymentsLog.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        
        {activeTab === "upi" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form column */}
            <div className="lg:col-span-6 border border-slate-200 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-black text-slate-905 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <Smartphone className="w-4.5 h-4.5 text-blue-600" />
                <span>NPCI UPI Specifications</span>
              </h3>

              <div className="space-y-4 text-xs font-medium">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold font-mono">Merchant VPA Address / UPI ID</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="E.g., apexcorp@okaxis"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-850 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Merchant / Business Owner Legal Name</label>
                  <input
                    type="text"
                    required
                    value={upiReceiver}
                    onChange={(e) => setUpiReceiver(e.target.value)}
                    placeholder="E.g., Apex Business Systems Pvt Ltd"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-855 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Tariff Payable amount (INR)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-855 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Live QR column */}
            <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-between text-center min-h-[300px]">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase">NPCI Unified Payments QR</h4>
                <p className="text-[10.5px] text-slate-500 max-w-sm">Scannable using any Google Pay, PhonePe, BHIM, Paytm, or generic banking smartphone applications.</p>
              </div>

              {/* QR Image Frame */}
              <div className="bg-white p-4 border border-slate-250 rounded-xl relative shadow-md select-none mt-4">
                <img
                  src={handleCreateUPILink()}
                  alt="NPCI Scannable UPI Payment QR Code"
                  referrerPolicy="no-referrer"
                  className="w-[160px] h-[160px] object-cover"
                />
                
                {/* Visual indicator in middle of QR */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[8px] tracking-tighter border-2 border-white select-none shadow">
                  UPI
                </div>
              </div>

              <div className="w-full max-w-sm pt-4">
                <button
                  type="button"
                  disabled={simulatedPayConfirm}
                  onClick={handleSimulatePaymentConfirmation}
                  className="w-full py-2 bg-blue-605 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow cursor-pointer uppercase tracking-wider"
                >
                  {simulatedPayConfirm ? "Verifying bank clearance..." : "Simulate Customer UPI Scan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "neft" && (
          <form onSubmit={handleNEFTSubmit} className="max-w-2xl border border-slate-200 p-6 bg-white rounded-xl space-y-4 text-xs font-medium">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-150 pb-2 flex items-center gap-1.5">
              <Landmark className="w-4.5 h-4.5 text-blue-600" />
              <span>Log incoming NEFT / RTGS Wire Clearings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500 uppercase font-semibold">Client Company Legal Name</label>
                <input
                  type="text"
                  required
                  value={neftClient}
                  onChange={(e) => setNeftClient(e.target.value)}
                  placeholder="E.g., Swaraj Industries Ltd"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-805"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase font-semibold">UTR Unique Transaction Reference</label>
                <input
                  type="text"
                  required
                  value={neftUtr}
                  onChange={(e) => setNeftUtr(e.target.value)}
                  placeholder="E.g., SBIN00261942001"
                  className="w-full font-mono border border-slate-200 rounded-lg px-3 py-2 text-slate-805"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500 uppercase font-semibold">Transferred Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={neftAmount}
                  onChange={(e) => setNeftAmount(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-805 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase font-semibold">Origin Bank Name</label>
                <input
                  type="text"
                  required
                  value={neftBank}
                  onChange={(e) => setNeftBank(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-805"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Verify Ledger Entry & Reconcile Outstandings
            </button>
          </form>
        )}

        {activeTab === "receipts" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {paymentsLog.map((log) => (
                <div key={log.id} className="border border-slate-200 p-5 rounded-xl bg-white space-y-4 hover:border-slate-300 shadow-sm relative overflow-hidden">
                  
                  {/* Decorative stamp seal typical of Indian corporate paperwork */}
                  <div className="absolute right-4 bottom-5 w-24 h-24 border-4 border-dashed border-emerald-400 rotate-12 rounded-full flex flex-col items-center justify-center pointer-events-none select-none opacity-40">
                    <span className="text-[7.5px] font-black text-emerald-600 tracking-wider">APEX ERPS</span>
                    <span className="text-[11px] font-black text-emerald-800 leading-none">PAID</span>
                    <span className="text-[6.5px] font-mono text-emerald-500 mt-1">2026-06-19</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">RECEIPT NO</span>
                      <h4 className="text-sm font-bold text-slate-900 leading-none">{log.receiptNumber}</h4>
                    </div>
                    <span className="px-2 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-[9px] rounded-lg">
                      STAMP CLEARED
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold text-slate-700 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Client Partner:</span>
                      <strong className="text-slate-900">{log.clientName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction Value:</span>
                      <strong className="font-mono text-blue-600">{INR(log.amount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Settlement Code:</span>
                      <strong className="font-mono text-slate-700">{log.paymentMode}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verification Time:</span>
                      <span className="font-mono text-slate-500">{log.clearedAt}</span>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
