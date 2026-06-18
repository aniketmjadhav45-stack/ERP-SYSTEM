import React, { useState } from "react";
import { Sparkles, BrainCircuit, FileSearch, LineChart, HelpCircle, Loader2, ArrowRightCircle, PlusCircle, AlertCircle } from "lucide-react";

interface AIAssistantModuleProps {
  onRefreshTasks: () => void;
}

export default function AIAssistantModule({ onRefreshTasks }: AIAssistantModuleProps) {
  const [outputHtml, setOutputHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [naturalText, setNaturalText] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activePreset, setActivePreset] = useState<"report" | "meeting" | "predict" | "tasks" | "custom">("report");
  const [warningMessage, setWarningMessage] = useState("");

  const callAiEndpoint = async (mode: string, payload: any) => {
    setLoading(true);
    setWarningMessage("");
    setOutputHtml("");
    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, payload })
      });
      const data = await response.json();

      if (data.success) {
        setOutputHtml(data.output);
        // If simulated task creator succeeded, notify parent board to reload tasks database
        if (mode === "create_tasks") {
          onRefreshTasks();
        }
      } else {
        // Handle server fallback mock parameters if API key isn't provided
        setOutputHtml(data.backupOutput || "### AI Response\n\nFailed to contact AI engine.");
        setWarningMessage("AI is operating in simulated mode. Expose GEMINI_API_KEY in Secrets for live intelligence.");
      }
    } catch (err: any) {
      console.error(err);
      setOutputHtml("### System Simulation\n\nCould not connect to full live server-side AI. Providing fallback forecasting data:\n\n- **Projected Q3 Growth:** +14.5%\n- **Friction Points Found:** Compound query indices under high latency load.\n- **Action advice:** Upgrade Acme Enterprise subscription plan.");
      setWarningMessage("Live server connection timed out. Showing simulated prediction data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setActivePreset("report");
    callAiEndpoint("generate_report", {});
  };

  const handleMeetingSummarize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesText.trim()) return;
    setActivePreset("meeting");
    callAiEndpoint("meeting_summaries", { notesText });
  };

  const handlePredictSales = () => {
    setActivePreset("predict");
    callAiEndpoint("predict_sales", {});
  };

  const handleCreateTasks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalText.trim()) return;
    setActivePreset("tasks");
    callAiEndpoint("create_tasks", { naturalText });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setActivePreset("custom");
    callAiEndpoint("custom", { customPrompt });
  };

  // Simple custom markdown line parser to render lists, headers, and bold highlights beautifully in client
  const renderMarkdownText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let cleaned = line.trim();
      if (!cleaned) return <div key={idx} className="h-2" />;

      // Headers ###
      if (cleaned.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-100 uppercase tracking-wide pt-3 pb-1 border-b border-slate-900 font-sans">{cleaned.substring(4)}</h4>;
      }
      if (cleaned.startsWith("##")) {
        return <h3 key={idx} className="text-base font-extrabold text-indigo-400 font-sans pt-4 pb-2">{cleaned.substring(3)}</h3>;
      }
      if (cleaned.startsWith("#")) {
        return <h2 key={idx} className="text-lg font-black text-indigo-305 font-sans pt-4 pb-2">{cleaned.substring(2)}</h2>;
      }

      // Checklists/Bullet lists
      const isBullet = cleaned.startsWith("-") || cleaned.startsWith("*");
      if (isBullet) {
        cleaned = cleaned.substring(1).trim();
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 pl-4 py-1">
            <span className="text-indigo-400 mt-1 select-none font-sans">•</span>
            <span>{cleaned.replace(/\*\*(.*?)\*\*/g, "$1")}</span>
          </div>
        );
      }

      // Default paragraph, check bold elements
      const parts = cleaned.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed py-1 font-mono">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-indigo-300 font-bold font-sans">{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-assistant-module">
      
      {/* Left Column: AI Feature triggers */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Banner introduction */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-indigo-900/10 to-slate-950 p-5 rounded-2xl border border-indigo-900/30 space-y-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
          <BrainCircuit className="w-8 h-8 text-indigo-400" />
          <div>
            <h4 className="text-sm font-extrabold text-slate-100">LLM Business Diagnostics Node</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Interface directly with corporate server-side Gemini intelligence models. Automate spreadsheet decomposition and accelerate sales predictions.
            </p>
          </div>
        </div>

        {/* Buttons List for Preset Actions */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
          <h5 className="text-xs font-bold uppercase text-slate-405 tracking-wider">Operational Command Controls</h5>

          <div className="space-y-3">
            {/* Generate Report trigger button */}
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 p-2.5 rounded-lg text-left text-xs text-slate-200 transition-all flex items-center justify-between hover:border-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-indigo-405 flex-shrink-0" />
                <div>
                  <div className="font-bold">Compile Operational Review</div>
                  <div className="text-[9px] text-slate-500">Reads active Leads, Invoices and Product deficits</div>
                </div>
              </div>
              <ArrowRightCircle className="w-4 h-4 text-indigo-450" />
            </button>

            {/* Sales pipeline predict triggers */}
            <button
              type="button"
              onClick={handlePredictSales}
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 p-2.5 rounded-lg text-left text-xs text-slate-200 transition-all flex items-center justify-between hover:border-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold">Generate Statistical Sales Forecast</div>
                  <div className="text-[9px] text-slate-505">Evaluates probabilities in active pipeline conversion</div>
                </div>
              </div>
              <ArrowRightCircle className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        </div>

        {/* Notes secretarial Summarizer text area form */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3">
          <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Decompile Meeting Transcripts</h5>
          
          <form onSubmit={handleMeetingSummarize} className="space-y-3">
            <textarea
              required
              placeholder="Paste unstructured notes or chat transcript e.g.: Sarah Jenkins spoke to Wayne rep today about standard licenses. Alex needs to submit specs by Friday morning. Jared completed index partitions checks."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-200 font-mono h-24 resize-none"
            />
            <button
              type="submit"
              disabled={loading || !notesText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 rounded transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading && activePreset === "meeting" ? "Decompiling Notes..." : "Generate SECRETARIAL Action Plan"}
            </button>
          </form>
        </div>

        {/* Natural Language Task Creator form */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="space-y-1">
            <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <PlusCircle className="w-4 h-4 text-indigo-400" /> Synthesize Task Tickets
            </h5>
            <p className="text-[10px] text-slate-500 leading-normal">Type natural sentences like "Create High priority task for Alex to finalize proposal and Medium priority for Jared to fix database partitioning".</p>
          </div>

          <form onSubmit={handleCreateTasks} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Draft proposal specs by Friday Alex, check slow indexing queries Jared..."
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded p-2 text-xs text-slate-200 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !naturalText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 rounded transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading && activePreset === "tasks" ? "Synthesizing Interactive Tickets..." : "Parse & Automatically Create Tasks"}
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: AI Analytical Outputs */}
      <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[500px]">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Executive Diagnostics Ledger</span>
            </div>

            {loading ? (
              <span className="text-xs text-indigo-400 font-mono animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Querying Gemini. Wait...
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Output Stream Ready</span>
            )}
          </div>

          {/* Warning Message regarding Simulated Fallback mode */}
          {warningMessage && (
            <div className="bg-amber-955/20 border border-amber-900 p-2.5 rounded text-[11px] text-amber-400 font-mono flex items-center gap-1.5 leading-normal">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Core output renderer */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {outputHtml ? (
              renderMarkdownText(outputHtml)
            ) : (
              <div className="text-center py-24 text-slate-600 text-xs font-mono">
                Trigger diagnostic commands or paste unstructured conversation transcript files. Output logs will render here in real-time.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-900 font-mono text-[9px] text-slate-650 leading-relaxed text-center">
          Powered securely by Gemini LLM. All predictions and diagnostics conform to standard statistical thresholds.
        </div>

      </div>

    </div>
  );
}
