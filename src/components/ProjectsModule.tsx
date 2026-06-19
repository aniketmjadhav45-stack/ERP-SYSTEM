import React, { useState } from "react";
import { Project, Task, Subtask, UserProfile } from "../types";
import { Plus, CheckSquare, ListTodo, Users, Calendar, BarChart3, AlertCircle, PlusCircle } from "lucide-react";

interface ProjectsModuleProps {
  projects: Project[];
  tasks: Task[];
  users: UserProfile[];
  onAddTask: (task: { projectId: string; title: string; description: string; priority: Task["priority"]; dueDate: string; assignedTo: string }) => void;
  onUpdateTask: (taskId: string, updatedFields: Partial<Task>) => void;
}

export default function ProjectsModule({
  projects,
  tasks,
  users,
  onAddTask,
  onUpdateTask
}: ProjectsModuleProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // New task form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("Medium");
  const [taskDue, setTaskDue] = useState("");
  const [taskAssignee, setTaskAssignee] = useState(users[0]?.name || "");

  // Selected project details
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !selectedProjectId) return;

    onAddTask({
      projectId: selectedProjectId,
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      dueDate: taskDue || new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
      assignedTo: taskAssignee
    });

    setTaskTitle("");
    setTaskDesc("");
    setTaskPriority("Medium");
    setTaskDue("");
    setIsAddingTask(false);
  };

  const toggleSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  const selectedTaskObj = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6" id="projects-module">
      
      {/* Target Project Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => { setSelectedProjectId(p.id); setSelectedTaskId(null); }}
            className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3.5 shadow-sm ${
              selectedProjectId === p.id
                ? "bg-gradient-to-br from-indigo-50/80 to-slate-50 border-indigo-500 border-2 scale-[1.01]"
                : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-indigo-700 font-mono font-bold tracking-wider">PROJECT TRACK</span>
              <span className="text-xs font-mono font-black text-indigo-600">{p.progress}% Completed</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 font-sans">{p.name}</h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 h-8 font-medium leading-relaxed">{p.description}</p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full" style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      {currentProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Milestones and Tasks list */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Project Deliverable milestones check-list */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Key Milestones Logged
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentProject.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold">
                    <div className="w-4 h-4 bg-indigo-50 border border-indigo-200 rounded-full flex items-center justify-center text-indigo-700 text-[10px] font-black">
                      ✓
                    </div>
                    <span className="truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* List of Tasks */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-amber-600" /> Active Project Action Checklist
                </h4>

                <button
                  type="button"
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Manual Task</span>
                </button>
              </div>

              {/* Add Task Inline Form */}
              {isAddingTask && (
                <form onSubmit={handleTaskSubmit} className="bg-slate-50 p-4 border border-indigo-150 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-3 shadow-inner">
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-600 font-bold">Task Title</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Test low stock warning webhook"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-600 font-bold">Priority</span>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as Task["priority"])}
                      className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 font-semibold focus:outline-none shadow-sm"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-600 font-bold">Assigned To</span>
                    <select
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="bg-white border border-slate-250 rounded p-1 text-xs text-slate-800 focus:outline-none shadow-sm"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1 pt-4">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              )}

              {/* Task Items Grid/List */}
              <div className="space-y-3">
                {projectTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-3 bg-slate-50 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all cursor-pointer ${
                      selectedTaskId === task.id ? "border-indigo-500 bg-indigo-50/40 border-2" : "border-slate-200 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="space-y-0.5 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{task.title}</span>
                        <span className={`text-[9px] font-mono px-1.5 rounded uppercase font-bold border ${
                          task.priority === "High" ? "bg-rose-50 border-rose-150 text-rose-700" :
                          task.priority === "Medium" ? "bg-amber-50 border-amber-150 text-amber-700" : "bg-slate-100 border-slate-200 text-slate-600"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">{task.description || "No extra check-lists detail descriptions logged."}</p>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 font-bold">
                      <span>Owner: {task.assignedTo.split(" ")[0]}</span>
                      <span>Due: {task.dueDate}</span>
                      
                      <select
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task["status"])}
                        className="bg-white text-[10px] text-indigo-700 font-black border border-slate-250 outline-none rounded p-1 shadow-sm"
                      >
                        <option>Backlog</option>
                        <option>In Progress</option>
                        <option>In Review</option>
                        <option>Completed</option>
                      </select>
                    </div>
                  </div>
                ))}

                {projectTasks.length === 0 && (
                  <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    No deliverables logged for this target track. Add a task to initiate progress!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Active Task Subtasks Checking Panel */}
          <div className="lg:col-span-4">
            {selectedTaskObj ? (
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-5 sticky top-4 shadow-sm">
                
                <div className="space-y-1 border-b border-slate-150 pb-3">
                  <span className="text-[10px] text-indigo-650 font-mono tracking-widest font-black uppercase">Subtask workflow controls</span>
                  <h4 className="text-sm font-black text-slate-900">{selectedTaskObj.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-2">{selectedTaskObj.description || "No description provided."}</p>
                </div>

                {/* Subtask Checkbox items */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-700">Decompiled Operations Checklist</h5>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedTaskObj.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => toggleSubtask(selectedTaskObj, st.id)}
                        className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-all shadow-sm"
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                          st.completed 
                            ? "bg-indigo-600 border-indigo-500 text-white font-bold" 
                            : "border-slate-350 bg-white"
                        }`}>
                          {st.completed && "✔"}
                        </div>
                        <span className={`text-[11px] font-mono leading-none font-bold ${st.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {st.title}
                        </span>
                      </div>
                    ))}

                    {/* Quick subtask adder simulation */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const titleInput = prompt("Enter new checklist criteria item:");
                          if (titleInput) {
                            const newSub: Subtask = {
                              id: "st_" + Date.now(),
                              title: titleInput,
                              completed: false
                            };
                            onUpdateTask(selectedTaskObj.id, {
                              subtasks: [...selectedTaskObj.subtasks, newSub]
                            });
                          }
                        }}
                        className="text-[10px] text-indigo-700 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer font-bold"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Checklist Criteria</span>
                      </button>
                    </div>

                    {selectedTaskObj.subtasks.length === 0 && (
                      <div className="text-[10px] text-slate-500 italic p-1">No checklist subtask criteria has been added yet. Use the prompt link above to synthesize milestones!</div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 leading-relaxed font-mono space-y-1 shadow-inner">
                  <div>Assigned Owner: <strong className="text-slate-900 font-sans font-bold">{selectedTaskObj.assignedTo}</strong></div>
                  <div>Target Due Date: <strong className="text-slate-900 font-bold">{selectedTaskObj.dueDate}</strong></div>
                  <div className="pt-1.5 border-t border-slate-200 mt-1.5 font-medium">
                    Click any subtask item to check its status. Task progress updates automatically in operational gantt stacks.
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-250 rounded-xl p-8 text-center text-xs text-slate-500 shadow-inner font-medium">
                Click any operational task item to view detailed checklists, complete subtasks, or create criteria.
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">No projects listed. Register an upgrade path!</div>
      )}

    </div>
  );
}
