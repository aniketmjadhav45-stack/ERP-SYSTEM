import React from "react";
import { AutomationRule, AutomationLog } from "../types";
import { Cpu, Zap, Radio, RefreshCcw, Bell, HardDrive, CheckCircle } from "lucide-react";

interface AutomationModuleProps {
  rules: AutomationRule[];
  logs: AutomationLog[];
  onToggleRule: (ruleId: string, currentActive: boolean) => void;
  onRefreshLogs?: () => void;
}

export default function AutomationModule({
  rules,
  logs,
  onToggleRule,
  onRefreshLogs
}: AutomationModuleProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="automations-module">
      
      {/* Left Column: Automation Rules */}
      <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-150 pb-2.5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Active Trigger Workflows
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Enable conditional triggers that instantiate operations automatically in real-time.</p>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4 pt-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 border rounded-xl space-y-3 transition-all ${
                rule.active ? "border-blue-200 bg-blue-50/20" : "border-slate-200 bg-slate-50/30"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900">{rule.name}</h5>
                  <div className="text-[10px] text-blue-600 font-mono font-bold tracking-wide uppercase">
                    Trigger: {rule.trigger.replace(/_/g, " ")}
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => onToggleRule(rule.id, rule.active)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-all outline-none flex items-center cursor-pointer ${
                    rule.active ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>

              {/* Conditions Description detail */}
              <div className="bg-white p-2.5 px-3 border border-slate-200 text-[10px] font-mono text-slate-600 rounded-lg space-y-1 shadow-sm">
                {rule.condition && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Condition Block:</span>
                    <span className="text-slate-800 font-bold">{rule.condition}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                  <span className="text-slate-400">Dispatched Action:</span>
                  <span className="text-blue-700 font-sans font-bold capitalize">{rule.action.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Execution trace trace logs */}
      <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-150 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Active Dispatch Logs
          </h4>

          {onRefreshLogs && (
            <button
              type="button"
              onClick={onRefreshLogs}
              className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCcw className="w-3" />
              <span>Refresh Trace</span>
            </button>
          )}
        </div>

        {/* Logs Timeline */}
        <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 border border-slate-205 rounded-lg space-y-1 text-[11px] font-mono relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-bold max-w-[150px] truncate">
                  {log.ruleName}
                </span>

                <span className="text-[9px] text-slate-400 font-sans font-semibold">{log.timestamp}</span>
              </div>

              <div className="text-slate-600 text-[10px] leading-relaxed pt-1.5 pb-1">
                <strong className="text-slate-700 select-all block mb-0.5 font-sans">Trigger Event:</strong>
                {log.triggerEvent}
              </div>

              <p className="text-slate-800 text-xs bg-white p-2 rounded border border-slate-200 font-sans leading-relaxed shadow-sm">
                 ✔ {log.actionTaken}
              </p>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-16 text-slate-400 font-mono text-xs">
               No automations triggered in current memory stack. Trigger a low-stock alert or qualify a lead on the CRM board!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
