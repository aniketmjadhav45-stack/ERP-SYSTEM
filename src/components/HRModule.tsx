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
  initialTab?: "attendance" | "leaves" | "payroll";
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
  onUpdatePayrollStatus,
  initialTab = "attendance"
}: HRModuleProps) {
  const [activeTab, setActiveTab] = useState<"attendance" | "leaves" | "payroll">(initialTab);

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
      <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "attendance" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Attendance Logger
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("leaves")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "leaves" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
          }`}
        >
          Leave Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payroll")}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
            activeTab === "payroll" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-605 hover:text-slate-900"
          }`}
        >
          Payroll & Salaries
        </button>
      </div>

      {/* 1. ATTENDANCE MODULE */}
      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Clock In-Out Card Widget */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono">UTC TIME SERVER</span>
              <h4 className="text-sm font-black text-slate-900">Live Workspace Clock</h4>
              <p className="text-[11px] text-slate-600">Log clock-in cycles daily. Overtime calculations apply automatically.</p>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl text-center space-y-4 shadow-inner">
              <div className="font-mono text-3xl font-black tracking-widest text-indigo-600">
                {new Date().toTimeString().split(" ")[0].substring(0, 5)} PM
              </div>
              
              <div className="text-[11px] text-slate-500 font-mono font-semibold">
                {userTodayClock ? (
                  userTodayClock.clockOut ? (
                     <span className="text-slate-600">Session Complete. Hours Worked: {userTodayClock.hoursWorked} hrs</span>
                  ) : (
                     <span className="text-emerald-600 animate-pulse font-bold">⏰ Clocked in since {userTodayClock.clockIn}</span>
                  )
                ) : (
                  <span className="text-slate-500">No shift cycles logged for today yet.</span>
                )}
              </div>

              <button
                type="button"
                onClick={onClockInOut}
                className={`w-full py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider ${
                  isClockedIn
                    ? "bg-rose-600 hover:bg-rose-550 text-white shadow-rose-200 shadow"
                    : "bg-indigo-600 hover:bg-indigo-550 text-white shadow-indigo-200 shadow"
                }`}
              >
                {isClockedIn ? "Clock Out of Shift" : "Clock In for Duty"}
              </button>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed font-mono font-medium">
              Note: Attendance thresholds are tracked in real-time under automation conditions to alert payroll if deficit accumulates.
            </div>
          </div>

          {/* Historical Logs List */}
          <div className="md:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Company Shift Logs</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                    <th className="p-2 pb-2 font-sans font-bold">Name</th>
                    <th className="p-2 pb-2">Shift Date</th>
                    <th className="p-2 pb-2">Clock-In</th>
                    <th className="p-2 pb-2">Clock-Out</th>
                    <th className="p-2 pb-2">Total Hours</th>
                    <th className="p-2 pb-2 text-right font-sans font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 py-3 font-sans font-bold text-slate-900">{a.userName}</td>
                      <td className="p-2 py-3">{a.date}</td>
                      <td className="p-2 py-3 font-semibold text-slate-900">{a.clockIn}</td>
                      <td className="p-2 py-3">{a.clockOut || "--:--"}</td>
                      <td className="p-2 py-3">{a.hoursWorked ? `${a.hoursWorked} hrs` : "Active"}</td>
                      <td className="p-2 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                          a.status === "present" ? "bg-emerald-50 text-emerald-700 border-emerald-150" : "bg-indigo-50 text-indigo-700 border-indigo-150"
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
          <div className="md:col-span-5 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider border-b border-slate-150 pb-2">Apply for Leave Absence</h4>
              
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Absence Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveRequest["leaveType"])}
                  className="w-full bg-white border border-slate-250 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none p-2 rounded shadow-sm font-semibold"
                >
                  <option>Annual</option>
                  <option>Sick</option>
                  <option>Personal</option>
                  <option>Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 outline-none p-1.5 rounded font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-bold">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full bg-white border border-slate-250 text-xs text-slate-800 outline-none p-1.5 rounded font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-bold">Reason</label>
                <textarea
                  required
                  placeholder="State reason (e.g. medical consultation)..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full bg-white border border-slate-250 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none p-2 rounded h-20 resize-none font-sans shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                Submit Absence Claim
              </button>
            </form>
          </div>

          {/* Pending Reviews list */}
          <div className="md:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Leave Applications Review</h4>
              <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-605 px-2 py-0.5 rounded font-mono font-bold">Authority Mode</span>
            </div>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {leaves.map((l) => (
                <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{l.userName}</span>
                      <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded ml-2 font-mono font-bold">{l.leaveType}</span>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                      l.status === "Approved" ? "bg-emerald-50 border-emerald-150 text-emerald-700" :
                      l.status === "Rejected" ? "bg-rose-50 border-rose-150 text-rose-700" : "bg-amber-50 border-amber-150 text-amber-750"
                    }`}>
                      {l.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-650 font-sans leading-relaxed">{l.reason}</p>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200 font-medium">
                    <span>Duration: {l.startDate} to {l.endDate}</span>
                    
                    {/* Approve / Deny switches based on role approvals permissions */}
                    {l.status === "Pending" && (
                      <div className="flex gap-1.5">
                        {canApprove ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateLeaveStatus(l.id, "Approved")}
                              className="p-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded flex items-center justify-center cursor-pointer font-bold"
                              title="Approve Request"
                            >
                              <Check className="w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateLeaveStatus(l.id, "Rejected")}
                              className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 rounded flex items-center justify-center cursor-pointer font-bold"
                              title="Reject Request"
                            >
                              <X className="w-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[9px] text-amber-700 flex items-center gap-0.5"><ShieldAlert className="w-2.5" /> Requires HR role auth</span>
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-205 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Salaries & Net Compensations Spreadsheet</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Formulate and authorize employee base salaries, deductions, taxes, and monthly payment statuses.</p>
            </div>

            {canManagePayroll && (
              <button
                type="button"
                onClick={() => setIsGeneratingPayroll(!isGeneratingPayroll)}
                className="bg-indigo-600 hover:bg-indigo-550 px-3 py-1.5 text-xs text-white rounded font-bold transition-all cursor-pointer shadow-sm"
              >
                + Formulate Employee Slip
              </button>
            )}
          </div>

          {/* Formulate Payroll inline dialog simulation */}
          {isGeneratingPayroll && (
            <form onSubmit={handlePayrollSubmit} className="bg-slate-50 p-4 border border-indigo-100 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3 shadow-inner">
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-550 font-sans font-bold">Employee</span>
                <select
                  value={payrollUser}
                  onChange={(e) => setPayrollUser(e.target.value)}
                  className="bg-white border border-slate-250 text-xs p-1.5 focus:outline-none rounded text-slate-800 shadow-sm"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-550 font-mono font-bold">Month</span>
                <input
                  type="text"
                  required
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="bg-white border border-slate-250 p-1.5 text-xs focus:outline-none rounded text-slate-800 font-mono shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-550 font-sans font-bold">Base Salary ($)</span>
                <input
                  type="number"
                  required
                  value={payrollBase}
                  onChange={(e) => setPayrollBase(Number(e.target.value))}
                  className="bg-white border border-slate-250 p-1.5 text-xs focus:outline-none rounded text-slate-800 font-mono shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-550 font-sans font-bold">Bonus ($)</span>
                <input
                  type="number"
                  required
                  value={payrollBonus}
                  onChange={(e) => setPayrollBonus(Number(e.target.value))}
                  className="bg-white border border-slate-250 p-1.5 text-xs focus:outline-none rounded text-slate-800 font-mono shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-1 pt-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold text-xs p-2.5 rounded hover:bg-indigo-550 transition-all cursor-pointer shadow-sm"
                >
                  Generate Record
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto text-[11px] font-mono whitespace-nowrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-250 text-slate-500 bg-slate-50/50">
                  <th className="p-2 pb-2 font-sans font-bold">Employee Name</th>
                  <th className="p-2 pb-2">Period Month</th>
                  <th className="p-2 pb-2 text-right">Base Salary</th>
                  <th className="p-2 pb-2 text-right">Project Bonus</th>
                  <th className="p-2 pb-2 text-right">Tax Deductions</th>
                  <th className="p-2 pb-2 text-right">Net Compensation</th>
                  <th className="p-2 pb-2 text-right font-sans font-bold">Slip Status</th>
                  <th className="p-2 pb-2 text-right font-sans font-bold">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-805">
                {payroll.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 py-3.5 font-sans font-bold text-slate-900">{pay.userName}</td>
                    <td className="p-2 py-3.5">{pay.month}</td>
                    <td className="p-2 py-3.5 text-right text-slate-550">${pay.baseSalary.toLocaleString()}</td>
                    <td className="p-2 py-3.5 text-right font-bold text-emerald-600">+${pay.bonus.toLocaleString()}</td>
                    <td className="p-2 py-3.5 text-right text-rose-600">-${pay.deductions.toLocaleString()}</td>
                    <td className="p-2 py-3.5 text-right text-indigo-700 font-black">${pay.netPay.toLocaleString()}</td>
                    <td className="p-2 py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-sans border ${
                        pay.status === "Paid" ? "bg-emerald-50 border-emerald-150 text-emerald-700" :
                        pay.status === "Approved" ? "bg-indigo-50 border-indigo-150 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-550"
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-2 py-3.5 text-right font-sans">
                      <div className="flex justify-end gap-1.5">
                        {canManagePayroll ? (
                          <>
                            {pay.status === "Draft" && (
                              <button
                                type="button"
                                onClick={() => onUpdatePayrollStatus(pay.id, "Approved")}
                                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] px-2.5 py-1 rounded font-bold cursor-pointer shadow-sm"
                              >
                                Approve Slip
                              </button>
                            )}
                            {pay.status === "Approved" && (
                              <button
                                type="button"
                                onClick={() => onUpdatePayrollStatus(pay.id, "Paid")}
                                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 text-[10px] px-2.5 py-1 rounded font-bold cursor-pointer shadow-sm"
                              >
                                Disburse Pay
                              </button>
                            )}
                            {pay.status === "Paid" && (
                              <span className="text-[10px] text-slate-500 font-mono font-medium">Paid {pay.paymentDate}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-[9px] text-slate-400">-</span>
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
