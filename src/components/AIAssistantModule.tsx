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
        return <h4 key={idx} className="text-xs font-bold text-slate-800 uppercase tracking-wide pt-3 pb-1 border-b border-slate-200 font-sans">{cleaned.substring(4)}</h4>;
      }
      if (cleaned.startsWith("##")) {
        return <h3 key={idx} className="text-sm font-extrabold text-blue-600 font-sans pt-4 pb-2">{cleaned.substring(3)}</h3>;
      }
      if (cleaned.startsWith("#")) {
        return <h2 key={idx} className="text-sm font-black text-slate-900 font-sans pt-4 pb-2">{cleaned.substring(2)}</h2>;
      }

      // Checklists/Bullet lists
      const isBullet = cleaned.startsWith("-") || cleaned.startsWith("*");
      if (isBullet) {
        cleaned = cleaned.substring(1).trim();
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 pl-4 py-1">
            <span className="text-blue-600 mt-1 select-none font-sans">•</span>
            <span>{cleaned.replace(/\*\*(.*?)\*\*/g, "$1")}</span>
          </div>
        );
      }

      // Default paragraph, check bold elements
      const parts = cleaned.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed py-1">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-blue-600 font-bold">{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="ai-assistant-module">
      
      {/* Left Column: AI Feature triggers */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Banner introduction */}
        <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 p-5 rounded-xl border border-blue-100 space-y-2 relative overflow-hidden">
          <BrainCircuit className="w-8 h-8 text-blue-600" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">LLM Business Diagnostics Node</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Interface directly with corporate server-side Gemini intelligence models. Automate spreadsheet decomposition and accelerate sales predictions.
            </p>
          </div>
        </div>

        {/* Buttons List for Preset Actions */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
          <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Operational Command Controls</h5>

          <div className="space-y-3">
            {/* Generate Report trigger button */}
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-left text-xs text-slate-800 transition-all flex items-center justify-between hover:border-blue-500 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Compile Operational Review</div>
                  <div className="text-[9px] text-slate-500">Reads active Leads, Invoices and Product deficits</div>
                </div>
              </div>
              <ArrowRightCircle className="w-4 h-4 text-blue-650" />
            </button>

            {/* Sales pipeline predict triggers */}
            <button
              type="button"
              onClick={handlePredictSales}
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-left text-xs text-slate-800 transition-all flex items-center justify-between hover:border-blue-500 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Generate Statistical Sales Forecast</div>
                  <div className="text-[9px] text-slate-505">Evaluates probabilities in active pipeline conversion</div>
                </div>
              </div>
              <ArrowRightCircle className="w-4 h-4 text-emerald-650" />
            </button>
          </div>
        </div>

        {/* Notes secretarial Summarizer text area form */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
          <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Decompile Meeting Transcripts</h5>
          
          <form onSubmit={handleMeetingSummarize} className="space-y-3">
            <textarea
              required
              placeholder="Paste unstructured notes or chat transcript e.g.: Sarah Jenkins spoke to Wayne rep today about standard licenses. Alex needs to submit specs by Friday morning. Jared completed index partitions checks."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg p-2.5 text-xs text-slate-800 font-mono h-24 resize-none"
            />
            <button
              type="submit"
              disabled={loading || !notesText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow"
            >
              {loading && activePreset === "meeting" ? "Decompiling Notes..." : "Generate SECRETARIAL Action Plan"}
            </button>
          </form>
        </div>

        {/* Natural Language Task Creator form */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
          <div className="space-y-1">
            <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <PlusCircle className="w-4 h-4 text-blue-600" /> Synthesize Task Tickets
            </h5>
            <p className="text-[10px] text-slate-505 leading-normal">Type natural sentences like "Create High priority task for Alex to finalize proposal and Medium priority for Jared to fix database partitioning".</p>
          </div>

          <form onSubmit={handleCreateTasks} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Draft proposal specs by Friday Alex, check slow indexing queries Jared..."
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg p-2 text-xs text-slate-805 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !naturalText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow"
            >
              {loading && activePreset === "tasks" ? "Synthesizing Interactive Tickets..." : "Parse & Automatically Create Tasks"}
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: AI Analytical Outputs */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between min-h-[500px] shadow-sm">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Executive Diagnostics Ledger</span>
            </div>

            {loading ? (
              <span className="text-xs text-blue-600 font-mono animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Querying Gemini. Wait...
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">Output Stream Ready</span>
            )}
          </div>

          {/* Warning Message regarding Simulated Fallback mode */}
          {warningMessage && (
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-805 flex items-center gap-1.5 leading-normal font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Core output renderer */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {outputHtml ? (
              renderMarkdownText(outputHtml)
            ) : (
              <div className="text-center py-24 text-slate-400 text-xs font-mono leading-relaxed">
                Trigger diagnostic commands or paste unstructured conversation transcript files. Output logs will render here in real-time.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 font-mono text-[9px] text-slate-400 leading-relaxed text-center">
          Powered securely by Gemini LLM. All predictions and diagnostics conform to standard statistical thresholds.
        </div>

      </div>

    </div>
  );
}
