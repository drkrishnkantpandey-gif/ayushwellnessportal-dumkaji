import API from '../../../config/api';
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Building2,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import axiosInstance from '../../../config/axiosInstance';



const categories = [
  { id: "studio", label: "Yoga Studio Photos", icon: Building2 },
  { id: "hall", label: "Yoga Halls", icon: Building2 },
  { id: "classroom", label: "Classrooms", icon: Building2 },
  { id: "equipment", label: "Equipment", icon: FolderOpen },
  { id: "outdoor", label: "Outdoor Areas", icon: ImageIcon },
  { id: "reception", label: "Reception / Office Area", icon: Building2 },
];

export default function Infrastructure() {
  const [gallery, setGallery] = useState({});
  const fileRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("");

  const [previewImg, setPreviewImg] = useState(null);
  const [allPhotosCategory, setAllPhotosCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");

  // Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 1));

  const resetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = (e) => (e.deltaY < 0 ? zoomIn() : zoomOut());

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API}/api/training-centre/infrastructure`, config);
      const grouped = response.data.data.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});
      setGallery(grouped);
      setError("");
    } catch (err) {
      console.error("Failed to fetch infrastructure media", err);
      setError("Failed to load infrastructure media. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files, category) => {
    if (!category || files.length === 0) return;

    const formData = new FormData();
    formData.append("category", category);
    if (description) formData.append("description", description);
    files.forEach((file) => formData.append("media", file));

    try {
      setLoading(true);
      console.log("Token:", token);
      const headers = {
        "Content-Type": "multipart/form-data",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      await axiosInstance.post(`${API}/api/training-centre/infrastructure`, formData, {
        headers,
      });
      setDescription("");
      await fetchGallery();
    } catch (err) {
      console.error("Failed to upload infrastructure media", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openFilePicker = (category) => {
    setActiveCategory(category);
    setTimeout(() => fileRef.current.click(), 20);
  };

  const removeImage = async (mediaId) => {
    if (!window.confirm("Delete this media item?")) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/training-centre/infrastructure/${mediaId}`);
      await fetchGallery();
    } catch (err) {
      console.error("Failed to delete infrastructure media", err);
      setError("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, category) => {
    e.preventDefault();
    handleImageUpload(Array.from(e.dataTransfer.files), category);
  };

  return (
    <div className="p-6">
      {/* PAGE TITLE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-emerald-800">
            <Building2 className="text-emerald-600 w-8 h-8" />
            <span className="bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
              Centre Infrastructure
            </span>
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Manage and showcase your facility spaces to demonstrate readiness for AYUSH certification.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGallery}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium border border-emerald-200"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh Gallery
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const images = gallery[cat.id] || [];

          return (
            <div
              key={cat.id}
              className="bg-white shadow-lg p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, cat.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 tracking-wide">
                    {cat.label}
                  </h3>
                </div>

                <button
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition shadow-sm"
                  onClick={() => openFilePicker(cat.id)}
                >
                  <Plus size={16} /> Add Images
                </button>
              </div>

              {activeCategory === cat.id && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600">
                    Optional Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="Describe this upload batch (e.g., renovated studio with infrared heaters)"
                  />
                </div>
              )}

              {/* Dropzone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 mb-6 group cursor-pointer
                  ${activeCategory === cat.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'}`}
                onClick={() => openFilePicker(cat.id)}
              >
                <div className="bg-white p-3 rounded-full w-12 h-12 mx-auto mb-3 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">
                  Click or drag images here to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, WEBP</p>
              </div>

              {/* Gallery Preview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.length === 0 && (
                  <div className="col-span-3 flex flex-col items-center text-gray-500 py-6 border-2 border-dashed rounded-lg bg-gray-50">
                    <ImageIcon className="w-10 h-10 mb-2 text-teal-500 opacity-70" />
                    <p className="text-sm italic">No images uploaded yet.</p>
                  </div>
                )}

                {images.slice(0, 3).map((img, index) => {
                  const remaining = images.length - 3;

                  return (
                    <div
                      key={img.id}
                      className="relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                      onClick={() => {
                        if (index === 2 && remaining > 0) {
                          setAllPhotosCategory(cat.id);
                        } else {
                          // Fix: Use API for absolute path
                          setPreviewImg(img.media_url ? `${API}${img.media_url}` : null);
                          resetZoom();
                        }
                      }}
                    >
                      <img
                        src={img.media_url ? `${API}${img.media_url}` : ''}
                        className="w-full h-32 object-cover"
                        alt=""
                      />

                      <div className="absolute inset-0 bg-black bg-opacity-40 hidden group-hover:flex items-center justify-center gap-4">
                        <button
                          className="bg-white p-2 rounded-full shadow hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(img.id);
                          }}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>

                      {index === 2 && remaining > 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition">
                          +{remaining} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileRef}
        className="hidden"
        onChange={(e) =>
          handleImageUpload(Array.from(e.target.files), activeCategory)
        }
      />

      {/* FULLSCREEN IMAGE MODAL */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <button
            className="absolute top-5 right-5 bg-white bg-opacity-90 p-3 rounded-full shadow"
            onClick={() => {
              setPreviewImg(null);
              resetZoom();
            }}
          >
            <X className="text-red-600" size={26} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/20">
            <button
              onClick={(e) => { e.stopPropagation(); zoomOut(); }}
              className="text-white hover:text-emerald-400 text-xl font-bold px-2 transition"
              title="Zoom Out"
            >
              −
            </button>
            <div className="h-4 w-px bg-white/30"></div>
            <button
              onClick={(e) => { e.stopPropagation(); resetZoom(); }}
              className="text-white text-sm font-medium hover:text-emerald-400 transition"
            >
              Reset
            </button>
            <div className="h-4 w-px bg-white/30"></div>
            <button
              onClick={(e) => { e.stopPropagation(); zoomIn(); }}
              className="text-white hover:text-emerald-400 text-xl font-bold px-2 transition"
              title="Zoom In"
            >
              +
            </button>
          </div>

          <img
            src={previewImg}
            onMouseDown={handleMouseDown}
            onClick={() => {
              if (zoom === 1) zoomIn();
            }}
            draggable={false}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
              transition: isDragging ? "none" : "transform 0.15s ease",
              cursor: zoom > 1 ? "grab" : "zoom-in",
            }}
          />
        </div>
      )}


      {/* ALL PHOTOS POPUP — Masonry Style */}
      {allPhotosCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-auto p-6 relative">
            <button
              className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
              onClick={() => setAllPhotosCategory(null)}
            >
              <X size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4">All Photos</h3>

            {/* Masonry Grid */}
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {(gallery[allPhotosCategory] || []).map((img) => (
                <div
                  key={img.id}
                  className="break-inside-avoid relative cursor-pointer"
                  onClick={() => {
                    // Fix: Use API for absolute path
                    setPreviewImg(img.media_url ? `${API}${img.media_url}` : null);
                    resetZoom();
                  }}
                >
                  <img
                    src={img.media_url ? `${API}${img.media_url}` : ''}
                    className="w-full rounded-lg mb-3"
                    style={{ objectFit: "cover" }}
                    alt=""
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
