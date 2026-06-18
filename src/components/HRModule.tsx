import React, { useState } from "react";
import { Attendance, LeaveRequest, PayrollRecord, UserProfile, Role } from "../types";
import { Clock, CalendarDays, Receipt, HeartHandshake, Check, X, ShieldAlert, Sparkles } from "lucide-react";

interface HRModuleProps {
  attendance: Attendance[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
  currentUser: UserProfile;
  users: UserProfile[];
  onClockInOut: () => void;
  onSubmitLeave: (leave: { leaveType: LeaveRequest["leaveType"]; startDate: string; endDate: string; reason: string }) => void;
  onUpdateLeaveStatus: (leaveId: string, status: LeaveRequest["status"]) => void;
  onAddPayroll: (record: Omit<PayrollRecord, "id">) => void;
  onUpdatePayrollStatus: (payrollId: string, status: PayrollRecord["status"]) => void;
}

export default function HRModule({
  attendance,
  leaves,
  payroll,
  currentUser,
  users,
  onClockInOut,
  onSubmitLeave,
  onUpdateLeaveStatus,
  onAddPayroll,
  onUpdatePayrollStatus
}: HRModuleProps) {
  const [activeTab, setActiveTab] = useState<"attendance" | "leaves" | "payroll">("attendance");

  // State handles clock status display
  const todayStr = new Date().toISOString().split("T")[0];
  const userTodayClock = attendance.find((a) => a.userId === currentUser.id && a.date === todayStr);
  const isClockedIn = userTodayClock && !userTodayClock.clockOut;

  // New leave form state
  const [leaveType, setLeaveType] = useState<LeaveRequest["leaveType"]>("Sick");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  // New payroll generation form state
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [payrollUser, setPayrollUser] = useState(users[0]?.id || "");
  const [payrollMonth, setPayrollMonth] = useState("June 2026");
  const [payrollBase, setPayrollBase] = useState(6500);
  const [payrollBonus, setPayrollBonus] = useState(500);
  const [payrollDeduction, setPayrollDeduction] = useState(200);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) return;
    onSubmitLeave({
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason
    });
    setLeaveReason("");
    setLeaveStart("");
    setLeaveEnd("");
  };

  const handlePayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find(u => u.id === payrollUser);
    onAddPayroll({
      userId: payrollUser,
      userName: matched ? matched.name : "Unknown Employee",
      month: payrollMonth,
      baseSalary: Number(payrollBase),
      bonus: Number(payrollBonus),
      deductions: Number(payrollDeduction),
      netPay: Number(payrollBase) + Number(payrollBonus) - Number(payrollDeduction),
      status: "Draft"
    });
    setIsGeneratingPayroll(false);
  };

  // Check RBAC permissions for approvals
  const canApprove = [Role.SUPER_ADMIN, Role.ADMIN, Role.HR, Role.MANAGER].includes(currentUser.role);
  const canManagePayroll = [Role.SUPER_ADMIN, Role.ADMIN, Role.HR, Role.FINANCE].includes(currentUser.role);

  return (
    <div className="space-y-6" id="hr-module">
      
      {/* Tab Navigation header */}
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "attendance" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Attendance logger
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("leaves")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "leaves" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Leave Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payroll")}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "payroll" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Payroll & Salaries
        </button>
      </div>

      {/* 1. ATTENDANCE MODULE */}
      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Clock In-Out Card Widget */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono">UTC TIME SERVER</span>
              <h4 className="text-sm font-semibold text-slate-100">Live Workspace Clock</h4>
              <p className="text-[11px] text-slate-400">Log clock-in cycles daily. Overtime calculations apply automatically.</p>
            </div>

            <div className="bg-slate-950/80 p-4 border border-slate-850/80 rounded-xl text-center space-y-4">
              <div className="font-mono text-3xl font-bold tracking-widest text-indigo-400">
                {new Date().toTimeString().split(" ")[0].substring(0, 5)} PM
              </div>
              
              <div className="text-[11px] text-slate-500 font-mono">
                {userTodayClock ? (
                  userTodayClock.clockOut ? (
                     <span className="text-slate-400">Session Complete. Hours Worked: {userTodayClock.hoursWorked} hrs</span>
                  ) : (
                     <span className="text-emerald-400 animate-pulse">⏰ Clocked in since {userTodayClock.clockIn}</span>
                  )
                ) : (
                  <span className="text-slate-400">No shift cycles logged for today yet.</span>
                )}
              </div>

              <button
                type="button"
                onClick={onClockInOut}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-lg uppercase tracking-wider ${
                  isClockedIn
                    ? "bg-rose-600 hover:bg-rose-550 text-white"
                    : "bg-indigo-600 hover:bg-indigo-550 text-white"
                }`}
              >
                {isClockedIn ? "Clock Out of Shift" : "Clock In for Duty"}
              </button>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed font-mono">
              Note: Attendance thresholds are tracked in real-time under automation conditions to alert payroll if deficit accumulates.
            </div>
          </div>

          {/* Historical Logs List */}
          <div className="md:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Company Shift Logs</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Shift Date</th>
                    <th className="pb-2">Clock-In</th>
                    <th className="pb-2">Clock-Out</th>
                    <th className="pb-2">Total Hours</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {attendance.map((a) => (
                    <tr key={a.id} className="text-slate-300">
                      <td className="py-2.5 font-sans font-bold text-slate-100">{a.userName}</td>
                      <td className="py-2.5">{a.date}</td>
                      <td className="py-2.5">{a.clockIn}</td>
                      <td className="py-2.5">{a.clockOut || "--:--"}</td>
                      <td className="py-2.5">{a.hoursWorked ? `${a.hoursWorked} hrs` : "Active"}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                          a.status === "present" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 2. LEAVE MANAGEMENT */}
      {activeTab === "leaves" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Apply Leave Request Form */}
          <div className="md:col-span-5 bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-100 tracking-wide border-b border-slate-800 pb-2">Apply for Leave Absence</h4>
              
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Absence Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveRequest["leaveType"])}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-400 focus:outline-none p-2 rounded"
                >
                  <option>Annual</option>
                  <option>Sick</option>
                  <option>Personal</option>
                  <option>Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none p-1.5 rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none p-1.5 rounded font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Reason</label>
                <textarea
                  required
                  placeholder="State reason (e.g. medical consultation)..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-250 focus:outline-none p-2 rounded h-20 resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 rounded-lg transition-all cursor-pointer"
              >
                Submit Absence Claim
              </button>
            </form>
          </div>

          {/* Pending Reviews list */}
          <div className="md:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Leave Applications Review</h4>
              <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono">Authority Mode</span>
            </div>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {leaves.map((l) => (
                <div key={l.id} className="p-3 bg-slate-950/60 border border-slate-850/80 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-200">{l.userName}</span>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded ml-2 font-mono">{l.leaveType}</span>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      l.status === "Approved" ? "bg-emerald-500/15 text-emerald-400" :
                      l.status === "Rejected" ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                    }`}>
                      {l.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">{l.reason}</p>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-950">
                    <span>Duration: {l.startDate} to {l.endDate}</span>
                    
                    {/* Approve / Deny switches based on role approvals permissions */}
                    {l.status === "Pending" && (
                      <div className="flex gap-1.5">
                        {canApprove ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateLeaveStatus(l.id, "Approved")}
                              className="p-1 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 rounded flex items-center justify-center cursor-pointer font-bold"
                              title="Approve Request"
                            >
                              <Check className="w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateLeaveStatus(l.id, "Rejected")}
                              className="p-1 bg-rose-900/40 hover:bg-rose-800 text-rose-300 rounded flex items-center justify-center cursor-pointer font-bold"
                              title="Reject Request"
                            >
                              <X className="w-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[9px] text-amber-650 flex items-center gap-0.5"><ShieldAlert className="w-2.5" /> Requires HR role auth</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. PAYROLL & SALARIES */}
      {activeTab === "payroll" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Salaries & Net Compensations Spreadsheet</h4>
              <p className="text-[11px] text-slate-500">Formulate and authorize employee base salaries, deductions, taxes, and monthly payment statuses.</p>
            </div>

            {canManagePayroll && (
              <button
                type="button"
                onClick={() => setIsGeneratingPayroll(!isGeneratingPayroll)}
                className="bg-indigo-600 hover:bg-indigo-550 px-3 py-1.5 text-xs text-white rounded font-bold transition-all cursor-pointer"
              >
                + Formulate Employee Slip
              </button>
            )}
          </div>

          {/* Formulate Payroll inline dialog simulation */}
          {isGeneratingPayroll && (
            <form onSubmit={handlePayrollSubmit} className="bg-slate-950 p-4 border border-indigo-950 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Employee</span>
                <select
                  value={payrollUser}
                  onChange={(e) => setPayrollUser(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs p-1.5 focus:outline-none rounded text-slate-300"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold">Month</span>
                <input
                  type="text"
                  required
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs focus:outline-none rounded text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Base Salary ($)</span>
                <input
                  type="number"
                  required
                  value={payrollBase}
                  onChange={(e) => setPayrollBase(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs focus:outline-none rounded text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Bonus ($)</span>
                <input
                  type="number"
                  required
                  value={payrollBonus}
                  onChange={(e) => setPayrollBonus(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs focus:outline-none rounded text-slate-205 font-mono"
                />
              </div>

              <div className="flex flex-col space-y-1 pt-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold text-xs p-2.5 rounded transition-all cursor-pointer"
                >
                  Generate Record
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto text-[11px] font-mono whitespace-nowrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-sans">Employee Name</th>
                  <th className="pb-2">Period Month</th>
                  <th className="pb-2 text-right">Base Salary</th>
                  <th className="pb-2 text-right">Project bonus</th>
                  <th className="pb-2 text-right">Tax Deductions</th>
                  <th className="pb-2 text-right">Net Compensation</th>
                  <th className="pb-2 text-right font-sans">Slip Status</th>
                  <th className="pb-2 text-right">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payroll.map((pay) => (
                  <tr key={pay.id} className="text-slate-200 hover:bg-slate-900/20">
                    <td className="py-3 font-sans font-bold text-slate-100">{pay.userName}</td>
                    <td className="py-3">{pay.month}</td>
                    <td className="py-3 text-right text-slate-400">${pay.baseSalary.toLocaleString()}</td>
                    <td className="py-3 text-right text-emerald-400">+${pay.bonus.toLocaleString()}</td>
                    <td className="py-3 text-right text-rose-500">-${pay.deductions.toLocaleString()}</td>
                    <td className="py-3 text-right text-indigo-400 font-bold">${pay.netPay.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-sans ${
                        pay.status === "Paid" ? "bg-emerald-500/15 text-emerald-400" :
                        pay.status === "Approved" ? "bg-indigo-500/15 text-indigo-400" : "bg-slate-600/15 text-slate-400"
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-sans">
                      <div className="flex justify-end gap-1.5">
                        {canManagePayroll ? (
                          <>
                            {pay.status === "Draft" && (
                              <button
                                type="button"
                                onClick={() => onUpdatePayrollStatus(pay.id, "Approved")}
                                className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-900 text-indigo-305 text-[10px] px-2 py-0.5 rounded cursor-pointer"
                              >
                                Approve Slip
                              </button>
                            )}
                            {pay.status === "Approved" && (
                              <button
                                type="button"
                                onClick={() => onUpdatePayrollStatus(pay.id, "Paid")}
                                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 text-[10px] px-2 py-0.5 rounded cursor-pointer"
                              >
                                Disburse Pay
                              </button>
                            )}
                            {pay.status === "Paid" && (
                              <span className="text-[10px] text-slate-500 font-mono">Paid {pay.paymentDate}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-[9px] text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
