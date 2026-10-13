"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminModal, { CategoryGroup } from "@/components/AdminModal";
import { defaultPriceCategories } from "@/lib/defaultServices";
import { adminFetch } from "@/lib/adminClient";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryGroup[]>(
    defaultPriceCategories.map((c, i) => ({
      title: c.title,
      categoryOrder: i,
      items: c.items.map((it, idx) => ({
        id: idx + 1,
        name: it.name,
        price: it.price,
        isAvailable: true,
      })),
    }))
  );

  const fetchSession = async () => {
    try {
      const res = await adminFetch("/api/admin/me");
      const data = await res.json();
      if (data.authenticated) {
        setIsLoggedIn(true);
        setUsername(data.user?.username || "Storm");
      } else {
        setIsLoggedIn(false);
        setUsername(null);
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-sand/30 flex flex-col justify-center items-center p-4">
      <div className="fixed top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ivory text-ink hover:text-rose-deep shadow-sm text-xs uppercase tracking-wider font-medium ring-1 ring-petal/60 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Divine Empress Website
        </Link>
      </div>

      <AdminModal
        isOpen={true}
        onClose={() => {
          window.location.href = "/";
        }}
        isLoggedIn={isLoggedIn}
        username={username}
        onLoginSuccess={(u) => {
          setIsLoggedIn(true);
          setUsername(u);
        }}
        onLogout={() => {
          setIsLoggedIn(false);
          setUsername(null);
        }}
        categories={categories}
        onRefreshServices={fetchServices}
      />
    </div>
  );
}
