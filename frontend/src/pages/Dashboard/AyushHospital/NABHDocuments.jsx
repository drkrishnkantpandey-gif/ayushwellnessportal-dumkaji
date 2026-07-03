import API from '../../../config/api';
import React, { useState, useRef, useEffect } from "react";
import { FileText, Upload, CheckCircle, Clock, XCircle, Eye, Download, Search, AlertCircle, Loader2, Plus, File } from "lucide-react";
import axios from "axios";

const NABHDocuments = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: null, message: "" });
    const [files, setFiles] = useState({
        nabhCertificate: null,
        supportingDocument: null
    });
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const nabhInputRef = useRef(null);
    const supportInputRef = useRef(null);

    const fetchDocuments = async () => {
        try {
            const response = await axiosInstance.get(`${API}/api/ayush-hospital/documents`, {
                headers: {
                }
            });
            if (response.data.success) {
                setDocuments(response.data.documents);
            }
        } catch (err) {
            console.error("Fetch documents error:", err);
            setError("Failed to load document history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];

            if (file.size > 2 * 1024 * 1024) {
                setUploadStatus({ type: "error", message: `File ${file.name} is too large. Max size is 2MB.` });
                return;
            }

            setFiles(prev => ({ ...prev, [name]: file }));
            setUploadStatus({ type: null, message: "" });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!files.nabhCertificate && !files.supportingDocument) {
            setUploadStatus({ type: "error", message: "Please select at least one document to upload." });
            return;
        }

        setIsUploading(true);
        setUploadStatus({ type: null, message: "" });

        const formData = new FormData();
        if (files.nabhCertificate) formData.append("nabhCertificate", files.nabhCertificate);
        if (files.supportingDocument) formData.append("supportingDocument", files.supportingDocument);

        try {
            const response = await axiosInstance.post(`${API}/api/ayush-hospital/upload-documents`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            if (response.data.success) {
                setUploadStatus({ type: "success", message: "Documents uploaded successfully!" });
                setFiles({ nabhCertificate: null, supportingDocument: null });
                fetchDocuments(); // Refresh list
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus({
                type: "error",
                message: error.response?.data?.message || "Failed to upload documents. Please try again."
            });
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "VERIFIED": return "bg-green-50 text-green-700 border-green-200";
            case "UPLOADED": return "bg-blue-50 text-blue-700 border-blue-200";
            case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
            case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "VERIFIED": return <CheckCircle size={14} />;
            case "UPLOADED": return <File size={14} />;
            case "PENDING": return <Clock size={14} />;
            case "REJECTED": return <XCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Regulatory Compliance Document Repository</h1>
                    <p className="text-gray-500 font-normal">Secure management and monitoring of institutional certifications and compliance records.</p>
                </div>
            </div>

            {/* Premium Upload Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Upload size={20} className="text-blue-600" />
                    Document Submission Segment
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NABH Certificate Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">NABH Certificate</label>
                        <input
                            type="file"
                            ref={nabhInputRef}
                            name="nabhCertificate"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg"
                            className="hidden"
                        />
                        <div
                            onClick={() => nabhInputRef.current.click()}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-400 group ${files.nabhCertificate ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                            {files.nabhCertificate ? (
                                <>
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                        <File size={24} />
                                    </div>
                                    <p className="text-sm font-semibold text-blue-700 truncate max-w-full px-4">{files.nabhCertificate.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Click to change file</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <Plus size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Drop NABH Certificate here or <span className="text-blue-600 font-semibold">Browse</span></p>
                                    <p className="text-[10px] text-gray-400">PDF, JPG up to 2MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Supporting Document Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">Supporting Document</label>
                        <input
                            type="file"
                            ref={supportInputRef}
                            name="supportingDocument"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg"
                            className="hidden"
                        />
                        <div
                            onClick={() => supportInputRef.current.click()}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-400 group ${files.supportingDocument ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                            {files.supportingDocument ? (
                                <>
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                        <File size={24} />
                                    </div>
                                    <p className="text-sm font-semibold text-blue-700 truncate max-w-full px-4">{files.supportingDocument.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Click to change file</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <Plus size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Drop Supporting Doc here or <span className="text-blue-600 font-semibold">Browse</span></p>
                                    <p className="text-[10px] text-gray-400">PDF, JPG up to 2MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {uploadStatus.type && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2 duration-300 font-medium ${uploadStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                            {uploadStatus.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {uploadStatus.message}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || (!files.nabhCertificate && !files.supportingDocument)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-blue-200 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Synchronizing Submission...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Validate and Submit Records
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">Institutional Submission Log</h2>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="pl-9 pr-4 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition w-64"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
                        <p className="text-gray-500 font-medium">Fetching document records...</p>
                    </div>
                ) : documents.length > 0 ? (
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Remarks</th>
                                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {documents.map((doc, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors truncate max-w-[200px]">{doc.fileName}</p>
                                                <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">ID: DOC-{idx + 1001}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded truncate uppercase tracking-widest">{doc.type.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-gray-600 font-medium">{doc.uploadedAt}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border w-fit ${getStatusStyle(doc.status)}`}>
                                                {getStatusIcon(doc.status)}
                                                {doc.status}
                                            </span>
                                            {doc.remarks && <p className="text-[10px] text-gray-500 px-1 font-normal">{doc.remarks}</p>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button title="View Document" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <Eye size={18} />
                                            </button>
                                            <button title="Download" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-500 font-medium font-sans">No documents uploaded yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Uploaded files will appear here for tracking and verification.</p>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                <h3 className="font-semibold text-blue-900 mb-1 font-sans">Need assistance?</h3>
                <p className="text-sm text-blue-800 opacity-80 mb-4 font-normal">Our verification team reviews documents within 3-5 working days.</p>
                <button className="text-blue-600 font-semibold text-sm hover:underline">Download Document Upload Guidelines</button>
            </div>
        </div>
    );
};

export default NABHDocuments;
