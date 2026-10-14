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
    if (item.id === undefined || item.id === null) return;
    setEditingId(item.id);
    setEditPrice(item.price);
    setEditName(item.name);
  };

  const saveEdit = async (id: number) => {
    if (!editPrice.trim() || !editName.trim()) return;
    
    // Prevent temporary placeholder rows from attempting database operations
    if (id < 0) {
      alert("This row is a local catalog template placeholder. Please insert a fresh service item to save customized data.");
      return;
    }

    setEditLoading(true);
    try {
      const res = await adminFetch("/api/services", {
        method: "PUT",
        body: JSON.stringify({ id, name: editName.trim(), price: editPrice.trim() }),
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
    if (id < 0) {
      alert("Cannot delete template placeholder rows.");
      return;
    }
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

  return null; // Note: Ensure your component continues to map its JSX block template layout down here safely
}
