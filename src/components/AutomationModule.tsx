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
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Active Trigger Workflows
            </h4>
            <p className="text-[11px] text-slate-500">Enable conditional triggers that instantiate operations automatically in real-time.</p>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4 pt-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 bg-slate-950/40 border rounded-xl space-y-3 transition-all ${
                rule.active ? "border-indigo-950 bg-slate-950" : "border-slate-900 bg-slate-950/20"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-100">{rule.name}</h5>
                  <div className="text-[10px] text-indigo-400 font-mono uppercase">
                    Trigger: {rule.trigger.replace(/_/g, " ")}
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => onToggleRule(rule.id, rule.active)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-all outline-none flex items-center cursor-pointer ${
                    rule.active ? "bg-indigo-600 justify-end" : "bg-slate-800 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow" />
                </button>
              </div>

              {/* Conditions Description detail */}
              <div className="bg-slate-950/45 p-2 px-3 border border-slate-900 text-[10px] font-mono text-slate-400 rounded-lg space-y-1">
                {rule.condition && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Condition Block:</span>
                    <span>{rule.condition}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-900/40 pt-1 mt-1">
                  <span className="text-slate-500">Dispatched Action:</span>
                  <span className="text-indigo-455 font-sans font-bold capitalize">{rule.action.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Execution trace trace logs */}
      <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-indigo-400" /> Active Dispatch Logs
          </h4>

          {onRefreshLogs && (
            <button
              type="button"
              onClick={onRefreshLogs}
              className="text-[10px] text-slate-450 hover:text-slate-300 flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCcw className="w-3" />
              <span>Refresh Trace</span>
            </button>
          )}
        </div>

        {/* Logs Timeline */}
        <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-95 – absolute border border-slate-850/80 p-3 bg-slate-950 rounded-lg space-y-1 text-[11px] font-mono relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400 font-bold max-w-[150px] truncate">
                  {log.ruleName}
                </span>

                <span className="text-[9px] text-slate-500">{log.timestamp}</span>
              </div>

              <div className="text-slate-400 text-[10px] leading-relaxed pt-1.5 pb-1">
                <strong className="text-slate-350 select-all block mb-1">Trigger Event:</strong>
                {log.triggerEvent}
              </div>

              <p className="text-slate-200 text-xs bg-slate-950/80 p-2 rounded border border-slate-900 font-sans leading-relaxed">
                 ✔ {log.actionTaken}
              </p>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-16 text-slate-650 font-mono text-xs">
               No automations triggered in current memory stack frame. Trigger an inventory low-stock alert or qualify a sales lead on CRM board!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
