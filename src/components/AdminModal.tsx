"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Lock, LogIn, LogOut, Plus, Trash2, Edit3, Check, RefreshCw,
  Sparkles, Calendar, Phone, Mail, AlertCircle, CheckCircle, ChevronDown
} from "lucide-react";
import { adminFetch, setAdminToken, clearAdminToken } from "@/lib/adminClient";

export interface CategoryItem {
  id?: number;
  name: string;
  price: string;
  isAvailable?: boolean;
}

export interface CategoryGroup {
  title: string;
  categoryOrder: number;
  items: CategoryItem[];
}

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  username: string | null;
  onLoginSuccess: (user: string) => void;
  onLogout: () => void;
  categories: CategoryGroup[];
  onRefreshServices: () => Promise<void>;
}

export default function AdminModal({
  isOpen,
  onClose,
  isLoggedIn,
  username,
  onLoginSuccess,
  onLogout,
  categories,
  onRefreshServices,
}: AdminModalProps) {
  // Login form state
  const [loginUser, setLoginUser] = useState("Storm");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Admin tab
  const [activeTab, setActiveTab] = useState<"services" | "bookings" | "add">("services");

  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Add Service Form
  const [newCatName, setNewCatName] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [isNewCategoryCustom, setIsNewCategoryCustom] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Editing service state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Bookings list state
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Fetch bookings when user switches to bookings tab
  useEffect(() => {
    if (isLoggedIn && activeTab === "bookings") {
      fetchBookings();
    }
  }, [isLoggedIn, activeTab]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await adminFetch("/api/bookings");
      const data = await res.json();
      if (res.ok && data.bookings) {
        setBookingsList(data.bookings);
      } else if (res.status === 401) {
        // Session expired — force re-login
        clearAdminToken();
        onLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check credentials.");
      }

      // Store token for iframe/embed-proof auth (cookies are blocked in some previews)
      if (data.token) {
        setAdminToken(data.token);
      }

      onLoginSuccess(data.user?.username || "Storm");
      setLoginPass("");
      setActiveTab("services");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    clearAdminToken();
    onLogout();
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(null);

    const category = newCatName.trim();
    const name = newServiceName.trim();
    const price = newServicePrice.trim();

    if (!category || !name || !price) {
      setAddMsg({ text: "Please fill in category, service name, and price.", error: true });
      return;
    }

    setAddLoading(true);
    try {
      const res = await adminFetch("/api/services", {
        method: "POST",
        body: JSON.stringify({ category, name, price }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add service");
      }

      setAddMsg({ text: `Successfully added "${name}" for ${price}!`, error: false });
      setNewServiceName("");
      setNewServicePrice("");
      await onRefreshServices();
    } catch (err: unknown) {
      setAddMsg({ text: err instanceof Error ? err.message : "Failed to add service", error: true });
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (item: CategoryItem) => {
    if (!item.id) return;
    setEditingId(item.id);
    setEditPrice(item.price);
    setEditName(item.name);
  };

  const saveEdit = async (id: number) => {
    if (!editPrice.trim() || !editName.trim()) return;
    setEditLoading(true);

    try {
      const res = await adminFetch(`/api/services/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName.trim(), price: editPrice.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          clearAdminToken();
          onLogout();
          throw new Error("Session expired. Please log in again as Storm.");
        }
        throw new Error(data.error || "Failed to update service");
      }

      setEditingId(null);
      await onRefreshServices();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update service");
    } finally {
      setEditLoading(false);
    }
  };

  const deleteService = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await adminFetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          clearAdminToken();
          onLogout();
          throw new Error("Session expired. Please log in again as Storm.");
        }
        throw new Error(data.error || "Failed to delete");
      }
      await onRefreshServices();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete service");
    }
  };

  const handleResetCatalog = async () => {
    setResetLoading(true);
    try {
      const res = await adminFetch("/api/services/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          clearAdminToken();
          onLogout();
          throw new Error("Session expired. Please log in again as Storm.");
        }
        throw new Error(data.error || "Reset failed");
      }
      setShowResetConfirm(false);
      await onRefreshServices();
      alert("Services restored to default catalog!");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reset");
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    try {
      await adminFetch(`/api/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const existingCategoryTitles = Array.from(new Set(categories.map((c) => c.title)));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-4xl bg-ivory rounded-3xl shadow-2xl ring-1 ring-petal/80 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 bg-sand/80 border-b border-petal/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-petal flex items-center justify-center text-rose-deep">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="font-display text-xl text-ink font-semibold flex items-center gap-2">
                  Divine Empress Admin Portal
                  {isLoggedIn && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans uppercase font-medium">
                      Logged in as {username || "Storm"}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone">
                  {isLoggedIn
                    ? "Manage services, adjust prices, and review client bookings in real-time."
                    : "Enter your Storm Martinus credentials to update services & prices."}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-petal/80 text-stone hover:text-ink transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {!isLoggedIn ? (
              /* Login Form */
              <div className="max-w-md mx-auto py-8">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-full bg-petal/70 text-rose-deep mx-auto flex items-center justify-center mb-3">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="font-display text-2xl text-ink">Admin Authentication</h4>
                  <p className="text-stone text-xs mt-1">
                    Please log in with the Storm administrator credentials.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] font-medium text-stone mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      placeholder="Username (e.g. Storm)"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-ink/15 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-sm text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] font-medium text-stone mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-ink/15 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-sm text-ink"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3.5 bg-ink text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-medium hover:bg-rose-deep transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {loginLoading ? (
                        "Verifying..."
                      ) : (
                        <>
                          <LogIn size={15} />
                          <span>Sign In to Admin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-4 text-center">
                    <p className="text-[11px] text-stone/80">
                      Credentials hint: username <span className="font-semibold text-ink">Storm</span>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              /* Logged In Dashboard */
              <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-petal/60 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("services")}
                      className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium transition-all ${
                        activeTab === "services"
                          ? "bg-rose-deep text-white shadow-sm"
                          : "bg-sand/60 text-stone hover:text-ink hover:bg-sand"
                      }`}
                    >
                      Manage Services ({categories.reduce((acc, c) => acc + c.items.length, 0)})
                    </button>
                    <button
                      onClick={() => setActiveTab("add")}
                      className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-1.5 ${
                        activeTab === "add"
                          ? "bg-rose-deep text-white shadow-sm"
                          : "bg-sand/60 text-stone hover:text-ink hover:bg-sand"
                      }`}
                    >
                      <Plus size={14} /> Add New Service
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-1.5 ${
                        activeTab === "bookings"
                          ? "bg-rose-deep text-white shadow-sm"
                          : "bg-sand/60 text-stone hover:text-ink hover:bg-sand"
                      }`}
                    >
                      <Calendar size={14} /> Bookings
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRefreshServices()}
                      title="Sync Services"
                      className="p-2 rounded-xl bg-sand/60 hover:bg-sand text-stone hover:text-ink transition-colors"
                    >
                      <RefreshCw size={15} />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut size={13} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: MANAGE SERVICES & PRICES */}
                {activeTab === "services" && (
                  <div className="space-y-5">
                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 p-3.5 rounded-2xl border border-petal/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone">Category:</span>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-xs bg-sand/40 border border-ink/10 rounded-lg px-3 py-1.5 text-ink font-medium focus:outline-none"
                        >
                          <option value="All">All Categories ({existingCategoryTitles.length})</option>
                          {existingCategoryTitles.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="text-xs text-stone flex items-center gap-3">
                        <span className="text-rose-deep font-semibold">Tip:</span> Click any price or title to edit directly.
                      </div>
                    </div>

                    {/* Services by Category List */}
                    <div className="space-y-6">
                      {categories
                        .filter((c) => selectedCategory === "All" || c.title === selectedCategory)
                        .map((cat) => (
                          <div
                            key={cat.title}
                            className="bg-white/80 rounded-2xl p-5 border border-petal/60 shadow-sm"
                          >
                            <div className="flex items-center justify-between border-b border-petal/40 pb-3 mb-4">
                              <h4 className="font-display text-lg text-ink font-medium uppercase tracking-wider flex items-center gap-2">
                                <span className="text-rose-deep">✦</span> {cat.title}
                              </h4>
                              <span className="text-xs text-stone bg-sand/60 px-2.5 py-1 rounded-full">
                                {cat.items.length} {cat.items.length === 1 ? "item" : "items"}
                              </span>
                            </div>

                            <div className="divide-y divide-petal/30">
                              {cat.items.map((item) => {
                                const isEditing = editingId === item.id;
                                return (
                                  <div
                                    key={item.id ?? item.name}
                                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sand/20 px-2 rounded-lg transition-colors"
                                  >
                                    {isEditing ? (
                                      <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                                        <input
                                          type="text"
                                          value={editName}
                                          onChange={(e) => setEditName(e.target.value)}
                                          className="flex-1 px-3 py-1.5 text-sm bg-white border border-rose-deep rounded-lg text-ink focus:outline-none"
                                          placeholder="Service name"
                                        />
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            className="w-28 px-3 py-1.5 text-sm font-semibold bg-white border border-rose-deep rounded-lg text-rose-deep focus:outline-none"
                                            placeholder="e.g. R450"
                                          />
                                          <button
                                            onClick={() => item.id && saveEdit(item.id)}
                                            disabled={editLoading}
                                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                            title="Save"
                                          >
                                            <Check size={16} />
                                          </button>
                                          <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1.5 bg-stone/20 hover:bg-stone/30 text-ink rounded-lg transition-colors"
                                            title="Cancel"
                                          >
                                            <X size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex-1 flex items-baseline gap-2">
                                          <span className="font-normal text-sm text-ink">{item.name}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                          <span className="font-display text-lg text-rose-deep font-semibold tracking-wide">
                                            {item.price}
                                          </span>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => startEdit(item)}
                                              className="p-1.5 rounded-lg text-stone hover:text-ink hover:bg-sand/60 transition-colors"
                                              title="Edit Price & Name"
                                            >
                                              <Edit3 size={15} />
                                            </button>
                                            {item.id && (
                                              <button
                                                onClick={() => deleteService(item.id!, item.name)}
                                                className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                title="Delete Service"
                                              >
                                                <Trash2 size={15} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Reset Catalog Warning Bar */}
                    <div className="pt-6 border-t border-petal/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone">
                      <span>All updates reflect immediately on the live website.</span>
                      {showResetConfirm ? (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-medium">Reset all to default catalog?</span>
                          <button
                            onClick={handleResetCatalog}
                            disabled={resetLoading}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                          >
                            {resetLoading ? "Resetting..." : "Yes, Reset"}
                          </button>
                          <button
                            onClick={() => setShowResetConfirm(false)}
                            className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="text-stone hover:text-red-600 underline transition-colors"
                        >
                          Restore initial Divine Empress default price catalog
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: ADD NEW SERVICE */}
                {activeTab === "add" && (
                  <div className="bg-white/80 rounded-2xl p-6 border border-petal/60 max-w-2xl mx-auto">
                    <div className="mb-6">
                      <h4 className="font-display text-2xl text-ink">Add New Service</h4>
                      <p className="text-xs text-stone mt-1">
                        Add a service to an existing category or create a new category.
                      </p>
                    </div>

                    {addMsg && (
                      <div
                        className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                          addMsg.error
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {addMsg.error ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        <span>{addMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleAddService} className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs uppercase tracking-wider font-medium text-stone">
                            Category *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewCategoryCustom(!isNewCategoryCustom);
                              setNewCatName("");
                            }}
                            className="text-xs text-rose-deep hover:underline font-medium"
                          >
                            {isNewCategoryCustom ? "Choose existing category" : "+ Create custom category"}
                          </button>
                        </div>

                        {isNewCategoryCustom ? (
                          <input
                            type="text"
                            required
                            placeholder="Enter new category name (e.g. Wig Installations)"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-sand/30 border border-ink/15 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-sm text-ink"
                          />
                        ) : (
                          <select
                            required
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-sand/30 border border-ink/15 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-sm text-ink"
                          >
                            <option value="">-- Select a Category --</option>
                            {existingCategoryTitles.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-medium text-stone mb-1.5">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. French Curl Braids (Medium)"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-sand/30 border border-ink/15 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-sm text-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-medium text-stone mb-1.5">
                          Price *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. R650 or 650"
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-sand/30 border border-ink/15 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-sm text-ink"
                        />
                        <p className="text-[11px] text-stone mt-1">
                          You can type &quot;R650&quot; or just &quot;650&quot; — South African Rand prefix (R) is automatically formatted.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={addLoading}
                          className="w-full py-3.5 bg-ink text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-medium hover:bg-rose-deep transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                        >
                          {addLoading ? (
                            "Saving Service..."
                          ) : (
                            <>
                              <Plus size={16} />
                              <span>Publish Service to Website</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 3: CLIENT BOOKINGS */}
                {activeTab === "bookings" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-display text-xl text-ink">Client Bookings</h4>
                        <p className="text-xs text-stone">
                          Recent appointments submitted by clients on Divine Empress.
                        </p>
                      </div>
                      <button
                        onClick={fetchBookings}
                        className="px-3 py-1.5 rounded-xl bg-sand/60 hover:bg-sand text-xs font-medium text-stone flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} className={bookingsLoading ? "animate-spin" : ""} /> Refresh
                      </button>
                    </div>

                    {bookingsLoading ? (
                      <div className="text-center py-12 text-stone text-sm">Loading bookings...</div>
                    ) : bookingsList.length === 0 ? (
                      <div className="text-center py-12 bg-white/60 rounded-2xl border border-petal/50">
                        <Calendar size={32} className="mx-auto text-rose-muted/60 mb-2" />
                        <p className="text-ink font-medium text-sm">No appointment requests yet</p>
                        <p className="text-xs text-stone mt-1">
                          New bookings from the website form will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookingsList.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white/90 rounded-2xl p-5 border border-petal/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-display text-lg text-ink font-medium">{b.clientName}</span>
                                <span
                                  className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full ${
                                    b.status === "confirmed"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : b.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>

                              <p className="text-sm font-medium text-rose-deep">{b.serviceName}</p>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-stone">
                                <span className="flex items-center gap-1.5">
                                  <Calendar size={13} /> {b.bookingDate} at {b.bookingTime}
                                </span>
                                <a
                                  href={`tel:${b.phone}`}
                                  className="flex items-center gap-1.5 hover:text-rose-deep text-ink"
                                >
                                  <Phone size={13} /> {b.phone}
                                </a>
                                {b.email && (
                                  <a
                                    href={`mailto:${b.email}`}
                                    className="flex items-center gap-1.5 hover:text-rose-deep"
                                  >
                                    <Mail size={13} /> {b.email}
                                  </a>
                                )}
                              </div>

                              {b.notes && (
                                <p className="text-xs bg-sand/50 p-2 rounded-lg text-ink/80 mt-2 italic">
                                  &quot;{b.notes}&quot;
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-center">
                              {b.status === "pending" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                                >
                                  Confirm
                                </button>
                              )}
                              {b.status === "confirmed" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, "completed")}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                                >
                                  Complete
                                </button>
                              )}
                              <a
                                href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(
                                  b.clientName
                                )},%20this%20is%20Storm%20from%20Divine%20Empress%20confirming%20your%20appointment`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-medium"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
