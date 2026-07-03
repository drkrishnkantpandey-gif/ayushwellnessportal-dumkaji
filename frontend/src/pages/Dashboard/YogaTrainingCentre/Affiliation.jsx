import React, { useState, useRef } from "react";
import {
  FileCheck,
  FileWarning,
  FileUp,
  RefreshCcw,
  Trash2,
  ShieldCheck,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Affiliation() {
  const [documents, setDocuments] = useState([]);
  const fileRef = useRef(null);
  const [activeDocIndex, setActiveDocIndex] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    expiryDate: "",
    fileUrl: "",
    status: "Pending",
    adminStatus: "Pending", // new: admin verification status
  });

  const triggerUpload = (index = null) => {
    setActiveDocIndex(index);
    fileRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (activeDocIndex !== null) {
      const updated = [...documents];
      updated[activeDocIndex].fileUrl = url;
      updated[activeDocIndex].status = "Pending";
      updated[activeDocIndex].adminStatus = "Pending";
      setDocuments(updated);
    } else {
      setDocuments([
        ...documents,
        {
          ...formData,
          fileUrl: url,
          status: "Pending",
          adminStatus: "Pending",
        },
      ]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      expiryDate: "",
      fileUrl: "",
      status: "Pending",
      adminStatus: "Pending",
    });
    setActiveDocIndex(null);
  };

  const deleteDoc = (index) => {
    if (window.confirm("Delete this certificate?")) {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  const daysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const setAdminStatus = (index, status) => {
    const updated = [...documents];
    updated[index].adminStatus = status;
    setDocuments(updated);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
        <ShieldCheck size={28} className="text-emerald-700" />
        Affiliation & Accreditation
      </h2>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border mb-6">
        <h3 className="text-xl font-semibold text-emerald-700 mb-4">
          📄 Upload New Certificate
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Certificate Name *</label>
            <input
              type="text"
              placeholder="e.g., AYUSH Accreditation"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Expiry / Valid Until *</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg mt-1"
            />
          </div>
        </div>

        <button
          onClick={() => triggerUpload(null)}
          className="mt-4 flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
        >
          <FileUp size={20} /> Upload Certificate
        </button>
      </div>

      {/* Certificates List */}
      <h3 className="text-xl font-semibold text-emerald-700 mb-3">
        📑 Uploaded Certificates
      </h3>

      {documents.length === 0 ? (
        <p className="text-gray-500 italic">No certificates uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documents.map((doc, index) => {
            const remaining = daysLeft(doc.expiryDate);

            return (
              <div
                key={index}
                className="bg-white border rounded-xl p-5 shadow hover:shadow-lg transition"
              >
                <h4 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                  <FileCheck className="text-emerald-600" />
                  {doc.title}
                </h4>

                <p className="text-gray-700 flex items-center gap-2 mt-1">
                  <CalendarDays size={16} className="text-teal-600" />
                  Valid Until: <strong>{doc.expiryDate}</strong>
                </p>

                {remaining <= 0 ? (
                  <p className="text-red-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle size={18} /> Expired
                  </p>
                ) : remaining < 30 ? (
                  <p className="text-orange-500 font-semibold mt-1">
                    ⚠ Expiring Soon ({remaining} days left)
                  </p>
                ) : (
                  <p className="text-emerald-600 font-semibold mt-1">
                    {remaining} days remaining
                  </p>
                )}

                {/* Admin Verification Status */}
                <p className="mt-2">
                  Admin Status:{" "}
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      doc.adminStatus === "Verified"
                        ? "text-emerald-600"
                        : doc.adminStatus === "Rejected"
                        ? "text-red-600"
                        : "text-orange-500"
                    }`}
                  >
                    {doc.adminStatus === "Verified" && <CheckCircle size={16} />}
                    {doc.adminStatus === "Rejected" && <XCircle size={16} />}
                    {doc.adminStatus === "Pending" && <FileWarning size={16} />}
                    {doc.adminStatus}
                  </span>
                </p>

                {doc.fileUrl && (
                  <iframe
                    src={doc.fileUrl}
                    className="w-full h-40 border rounded-lg mt-3"
                    title="certificate"
                  />
                )}

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => triggerUpload(index)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <RefreshCcw size={18} /> Replace
                  </button>

                  <button
                    onClick={() => deleteDoc(index)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>

                {/* Admin Panel Controls */}
                <div className="flex justify-between mt-3 text-sm">
                  <button
                    onClick={() => setAdminStatus(index, "Verified")}
                    className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => setAdminStatus(index, "Rejected")}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setAdminStatus(index, "Pending")}
                    className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                  >
                    Pending
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input
        type="file"
        ref={fileRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
