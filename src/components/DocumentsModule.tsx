import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Upload, Trash2, Download, Eye, AlertCircle, 
  CheckCircle2, Folder, ShieldCheck, RefreshCw, X
} from "lucide-react";
import { UserProfile } from "../types";
import { getHeaders } from "../utils/apiHelpers";
import { uploadFile, deleteFileFromStorage } from "../lib/supabase";

interface DocumentRecord {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number; // KB
  fileFormat: string;
  category: "Compliance Document" | "Contract" | "Agreement" | "Profile Photo" | "Company Logo";
  company_id: string;
  created_at: string;
  created_by: string;
}

interface DocumentsModuleProps {
  currentUser: UserProfile;
}

export default function DocumentsModule({ currentUser }: DocumentsModuleProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentRecord["category"]>("Compliance Document");

  // Filter category
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        headers: getHeaders(currentUser)
      });
      if (!res.ok) throw new Error("Could not access corporate file cabinet");
      const data = await res.json();
      setDocuments(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sync file repository");
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    setUploadProgress(0);
    setUploadSuccess(null);
    setError(null);

    try {
      // Direct call to our Supabase / Local storage upload utility (includes size & extension validation!)
      const uploadResult = await uploadFile(
        file, 
        "erp-attachments", // Standard bucket name
        currentUser.tenantId, // Isolated folder path per company ID (Issue 1)
        (prog) => setUploadProgress(prog)
      );

      // Create record document in corporate database
      const saveRes = await fetch("/api/documents", {
        method: "POST",
        headers: getHeaders(currentUser),
        body: JSON.stringify({
          name: uploadResult.name,
          fileUrl: uploadResult.url,
          fileSize: uploadResult.size,
          fileFormat: uploadResult.format,
          category: selectedCategory
        })
      });

      if (!saveRes.ok) {
        throw new Error("File uploaded to storage but database logging failed.");
      }

      const newDocRecord = await saveRes.json();
      setDocuments((prev) => [newDocRecord, ...prev]);
      setUploadSuccess(`Success! Filename "${file.name}" uploaded and archived.`);
      
      setTimeout(() => {
        setUploadSuccess(null);
        setUploadProgress(null);
      }, 4000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "File upload failed.");
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this file record?")) return;
    try {
      // 1. Delete from storage
      await deleteFileFromStorage(fileUrl, "erp-attachments");

      // 2. Delete from database
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: getHeaders(currentUser)
      });

      if (!res.ok) {
        throw new Error("Could not drop record from corporate directory.");
      }

      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setUploadSuccess("File record dropped successfully.");
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Delete operations aborted");
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="documents-module-view">
      {/* MODULE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" /> Secure Corporate Document Center
          </h2>
          <p className="text-xs text-slate-500">
            Isolated cloud multi-tenant storage for compliance credentials, legal contracts, and media assets.
          </p>
        </div>
        <button 
          onClick={fetchDocuments}
          className="flex items-center gap-1.5 bg-slate-50 border border-slate-205 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer self-start transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload Catalog
        </button>
      </div>

      {/* ALERTS DECK */}
      {error && (
        <div className="bg-rose-50 border border-rose-150 p-3.5 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>Error processing file operations: {error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-slideDown">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* CORE CONTROL DIVISIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DRAG AND DROP UPLODER DIVISION - Issue 3 Upload Progress & Size checking */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Configure Asset Meta</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1">Asset Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="Compliance Document">Compliance Document (e.g. GST Reg)</option>
                <option value="Contract">Contract Agreement</option>
                <option value="Agreement">Standard Form Non-Disclosure (NDA)</option>
                <option value="Profile Photo">Employee Profile Picture</option>
                <option value="Company Logo">SaaS Brand Corporate Logo</option>
              </select>
            </div>

            {/* Drag & Drop Canvas */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] transition-all ${
                dragActive ? "border-blue-500 bg-blue-50/40" : "border-slate-250 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-350"
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mb-2.5 animate-bounce" />
              <p className="text-xs font-extrabold text-slate-800">Drag &amp; Drop corporate files here</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[170px]">Allowed formats: JPG, PNG, PDF (Max 5MB)</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={onFileInputChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden" 
              />
            </div>

            {/* Upload progress indicator */}
            {uploadProgress !== null && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-500 block">Uploading progress...</span>
                  <span className="font-mono font-bold text-blue-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-150" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="text-[10px] text-slate-400 leading-relaxed font-semibold bg-blue-50/20 p-3 rounded-lg border border-blue-50">
              ✔️ This system strictly isolates your file assets under active company namespace folder {currentUser.tenantId}. Other tenants hold zero visibility.
            </div>
          </div>
        </div>

        {/* FILES DIRECTORY PANEL */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            
            {/* Filter Toolbars */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="relative w-full sm:max-w-xs">
                <input 
                  type="text" 
                  placeholder="Quick search file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-3 pr-4 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Compliance Document">Compliance Documents</option>
                  <option value="Contract">Contracts</option>
                  <option value="Agreement">Agreements</option>
                  <option value="Profile Photo">Profile Photos</option>
                  <option value="Company Logo">Company Logos</option>
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-2">
                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="text-xs text-slate-400 font-bold">Decoding company cabinet key...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-semibold space-y-1">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p>No document files found matching filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => {
                  const isPdf = doc.fileFormat?.toLowerCase() === "pdf";
                  const isImage = ["jpg", "jpeg", "png"].includes(doc.fileFormat?.toLowerCase() || "");
                  
                  return (
                    <div 
                      key={doc.id} 
                      className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all relative group"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`p-2.5 rounded-xl shrink-0 ${
                          isPdf ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          <FileText className="w-5 h-5" />
                        </span>
                        
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h4 className="text-xs font-extrabold text-slate-800 truncate" title={doc.name}>
                            {doc.name}
                          </h4>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg inline-block text-[8px] uppercase tracking-wider">{doc.category}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold pt-1.5">
                            <span>{doc.fileSize} KB</span>
                            <span>•</span>
                            <span className="font-mono text-[8px] uppercase bg-slate-200/60 px-1 py-0.2 rounded font-black text-slate-600">{doc.fileFormat}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls bar */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-center gap-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-100 p-1 px-2.5 rounded-lg text-[10px] font-black text-slate-600 transition-all cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Preview
                        </button>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-250 p-1 px-2.5 rounded-lg text-[10px] font-black text-slate-600 transition-all cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                        <button 
                          onClick={() => handleDelete(doc.id, doc.fileUrl)}
                          className="ml-auto p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-lg cursor-pointer transition-all"
                          title="Drop file permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* PICTURE/PDF PREVIEW LIGHTBOX DIALOG */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-250 max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h4 className="text-xs font-black text-slate-900 truncate max-w-md">{previewDoc.name}</h4>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{previewDoc.category} | isolated safe mode</p>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)} 
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-100 p-6 flex items-center justify-center overflow-auto">
              {previewDoc.fileFormat?.toLowerCase() === "pdf" ? (
                <iframe 
                  src={`${previewDoc.fileUrl}#view=FitH`} 
                  className="w-full h-full border-none rounded-xl bg-white shadow-md"
                  title="PDF Render Screen"
                />
              ) : ["jpg", "jpeg", "png"].includes(previewDoc.fileFormat?.toLowerCase() || "") ? (
                <img 
                  src={previewDoc.fileUrl} 
                  referrerPolicy="no-referrer"
                  alt={previewDoc.name} 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-slate-200"
                />
              ) : (
                <div className="text-center p-12 space-y-2">
                  <FileText className="w-16 h-16 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Preview not natively supported for .{previewDoc.fileFormat} format.</p>
                  <a 
                    href={previewDoc.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow"
                  >
                    Download and View File Locally
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
