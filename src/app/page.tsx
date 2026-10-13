"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Phone, Mail, MapPin, Clock, Sparkles, Heart,
  ChevronRight, Star, Lock, UserCheck, PlusCircle, Edit3
} from "lucide-react";
import {
  AbstractFlow, AbstractWaves, AbstractSpirals, AbstractBraid, AbstractBloom
} from "@/components/AbstractArt";
import BookingForm from "@/components/BookingForm";
import AdminModal, { CategoryGroup } from "@/components/AdminModal";
import { defaultPriceCategories } from "@/lib/defaultServices";
import { adminFetch } from "@/lib/adminClient";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
  { label: "Book", href: "#book" },
];

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Admin state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);

  // Dynamic services loaded from PostgreSQL database
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

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const checkAdminAuth = async () => {
    try {
      const res = await adminFetch("/api/admin/me");
      const data = await res.json();
      if (data.authenticated) {
        setIsAdminLoggedIn(true);
        setAdminUsername(data.user?.username || "Storm");
      } else {
        setIsAdminLoggedIn(false);
        setAdminUsername(null);
        // Don't clear token here on first load — it may just be an expired session.
        // Token is cleared explicitly on 401 during edits or on logout.
      }
    } catch {
      setIsAdminLoggedIn(false);
      setAdminUsername(null);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetchServices();
    checkAdminAuth();
  }, []);

  // Flatten services list for booking options
  const flattenedServices = categories.flatMap((cat) =>
    cat.items.map((it) => ({
      name: it.name,
      price: it.price,
      category: cat.title,
    }))
  );

  return (
    <div className="min-h-screen bg-ivory text-ink font-body selection:bg-blush selection:text-ink">
      {/* Navigation */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-ivory/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(212,149,160,0.15)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/images/logo.png"
              alt="Divine Empress Hair — Look Good, Feel Good"
              className="h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full object-cover ring-1 ring-rose-deep/30 shadow-[0_4px_20px_rgba(180,96,110,0.25)] group-hover:ring-rose-deep/60 transition-all"
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-lg md:text-xl tracking-wide text-ink">
                Divine <span className="italic font-light text-rose-deep">Empress</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone font-medium mt-1">
                Hair · Durban North
              </span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-[13px] uppercase tracking-[0.15em] font-medium text-stone">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="relative group hover:text-ink transition-colors">
                {l.label}
                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-rose-deep group-hover:w-full transition-all duration-300" />
              </a>
            ))}

            {/* Admin Login / Dashboard Tab on Top */}
            <button
              onClick={() => setAdminModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all ${
                isAdminLoggedIn
                  ? "bg-rose-deep text-white shadow-sm hover:bg-ink"
                  : "bg-sand/80 hover:bg-petal/80 text-ink ring-1 ring-ink/10"
              }`}
            >
              {isAdminLoggedIn ? (
                <>
                  <UserCheck size={14} className="text-white" />
                  <span>Admin ({adminUsername || "Storm"})</span>
                </>
              ) : (
                <>
                  <Lock size={13} className="text-rose-deep" />
                  <span>Admin Login</span>
                </>
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setAdminModalOpen(true)}
              className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5 ${
                isAdminLoggedIn ? "bg-rose-deep text-white" : "bg-sand text-ink ring-1 ring-ink/10"
              }`}
            >
              <Lock size={12} />
              <span>Admin</span>
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full hover:bg-petal/50 transition-colors text-ink"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden bg-ivory/98 backdrop-blur-xl border-t border-petal/60"
            >
              <div className="flex flex-col items-center gap-6 py-8 text-base font-display text-xl tracking-wide">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="hover:text-rose-deep transition-colors"
                  >
                    {l.label}
                  </a>
                ))}

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setAdminModalOpen(true);
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink text-white text-xs uppercase tracking-widest font-sans font-medium"
                >
                  <Lock size={14} />
                  <span>{isAdminLoggedIn ? `Admin Portal (${adminUsername})` : "Admin Login (Storm)"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Admin Floating Banner when logged in */}
      {isAdminLoggedIn && (
        <div className="fixed bottom-6 right-6 z-40">
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setAdminModalOpen(true)}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-ink text-white shadow-2xl hover:bg-rose-deep transition-all duration-300 ring-2 ring-rose-deep/40"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-medium">Admin Active: Storm</span>
            <Edit3 size={15} />
          </motion.button>
        </div>
      )}

      {/* Admin Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isLoggedIn={isAdminLoggedIn}
        username={adminUsername}
        onLoginSuccess={(user) => {
          setIsAdminLoggedIn(true);
          setAdminUsername(user);
        }}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setAdminUsername(null);
        }}
        categories={categories}
        onRefreshServices={fetchServices}
      />

      <main>
        {/* Hero */}
        <section className="relative min-h-[92vh] flex items-center overflow-hidden">
          {/* Soft decorative gradient backgrounds */}
          <div className="absolute top-[-20%] left-[-15%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-petal/60 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-warm/50 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-36 pb-20 w-full grid md:grid-cols-12 gap-12 md:gap-8 items-center">
            <div className="md:col-span-7">
              <motion.p
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-rose-muted text-sm md:text-base uppercase tracking-[0.3em] font-medium mb-6"
              >
                Luxury Hair Salon · Durban North
              </motion.p>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="font-display text-6xl sm:text-7xl md:text-9xl leading-[0.88] tracking-[-0.035em] text-ink mb-8"
              >
                Divine{" "}
                <span className="italic font-light text-rose-deep">Empress</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-lg md:text-xl text-stone leading-relaxed max-w-lg font-light mb-10"
              >
                Transformation begins with intention. At Divine Empress, every strand is treated as an art form — refined, protected, and elevated by hands that understand both beauty and silence.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap items-center gap-4"
              >
                <a
                  href="#book"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-ivory rounded-full text-sm uppercase tracking-[0.15em] font-medium hover:bg-rose-deep transition-all duration-300 shadow-[0_10px_30px_rgba(212,149,160,0.2)]"
                >
                  Book a Session <ChevronRight size={16} />
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-ink/10 text-ink rounded-full text-sm uppercase tracking-[0.15em] font-medium hover:border-rose-deep hover:text-rose-deep transition-all duration-300"
                >
                  View Services
                </a>
              </motion.div>
            </div>

            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="md:col-span-5 relative"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_80px_rgba(58,51,50,0.15)] ring-1 ring-ink/5 aspect-[4/5]">
                <AbstractFlow className="w-full h-full" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-14 h-14 rounded-full bg-ivory/70 backdrop-blur-md flex items-center justify-center mb-5 ring-1 ring-white/60">
                    <Sparkles size={22} className="text-rose-deep" />
                  </div>
                  <p className="font-display italic text-2xl md:text-3xl text-ink/80 leading-snug max-w-[240px]">
                    Where every strand becomes an intention.
                  </p>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 md:-left-12 bg-ivory/95 backdrop-blur-md shadow-2xl rounded-2xl p-5 md:p-7 max-w-[220px] md:max-w-[260px] ring-1 ring-petal/60">
                <div className="flex items-center gap-2 text-rose-deep mb-2">
                  <Star size={16} fill="currentColor" />
                  <span className="text-xs uppercase tracking-[0.2em] font-medium">Experience</span>
                </div>
                <p className="font-display text-4xl md:text-5xl text-ink leading-none mb-1">5</p>
                <p className="text-xs text-stone uppercase tracking-widest">Years of craft</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About / Owner */}
        <section id="about" className="relative py-28 md:py-36 overflow-hidden">
          <div className="absolute top-0 right-0 w-[50vw] h-[60vh] bg-gradient-to-bl from-petal/40 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
              {/* Abstract composition */}
              <div className="relative">
                <div className="rounded-[2.5rem] overflow-hidden shadow-[0_25px_70px_rgba(58,51,50,0.12)] ring-1 ring-ink/5 aspect-[4/5] relative">
                  <AbstractBloom className="w-full h-full" />
                  <div className="absolute inset-0 flex items-end justify-center p-10">
                    <div className="text-center">
                      <p className="font-display italic text-3xl md:text-4xl text-ink/85 leading-tight">
                        Storm <span className="text-rose-deep">·</span> Martinus
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] text-stone mt-3">Founder · Stylist</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -right-4 md:-right-12 bg-ink text-ivory rounded-2xl p-6 md:p-8 shadow-2xl max-w-[240px] md:max-w-[300px]">
                  <div className="font-display text-5xl md:text-6xl italic font-light mb-2">01</div>
                  <p className="text-sm md:text-base text-petal font-light leading-relaxed">
                    Every client walks away feeling like the only one — because they are.
                  </p>
                </div>
              </div>

              <div className="pt-4 md:pt-12">
                <p className="text-rose-muted text-sm uppercase tracking-[0.25em] font-medium mb-4">The Owner</p>
                <h2 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-[-0.03em] text-ink mb-8">
                  Storm{" "}
                  <span className="italic font-light text-rose-deep">Martinus</span>
                </h2>

                <div className="w-16 h-[2px] bg-rose-deep mb-8" />

                <p className="text-stone leading-[1.85] text-base md:text-lg font-light mb-6">
                  With <strong className="font-medium text-ink">five years</strong> of hands-on experience, Storm has refined her craft into something closer to art than service. She is the sole founder, stylist, and heart of <strong className="font-medium text-ink">Divine Empress</strong> — a salon built not on volume, but on stillness and intention.
                </p>

                <p className="text-stone leading-[1.85] text-base md:text-lg font-light mb-8">
                  From intricate protective braids to luminous colour transformations, Storm treats every session as a collaboration. She believes the best results come from listening first — to the hair, to the face, and to the vision quietly held inside.
                </p>

                <div className="flex flex-wrap gap-3">
                  {["Protective Styling", "Precision Colour", "Bridal Design", "Hair Wellness"].map((tag) => (
                    <span key={tag} className="px-4 py-1.5 bg-petal/60 text-ink text-xs uppercase tracking-[0.12em] font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Price List */}
        <section id="services" className="py-28 md:py-36 bg-sand/60 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-petal to-transparent" />

          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
              <div>
                <p className="text-rose-muted text-sm uppercase tracking-[0.25em] font-medium mb-3">A Curated Menu</p>
                <h2 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-[-0.03em] text-ink">
                  Services <span className="italic font-light text-rose-deep">&</span> Prices
                </h2>
              </div>
              <div className="space-y-3 max-w-md">
                <p className="text-stone text-base md:text-lg font-light leading-relaxed">
                  Transparent pricing across colour, treatments and protective braiding. Hair is included in all listed prices — from cornrows to passion twists.
                </p>
                {isAdminLoggedIn && (
                  <button
                    onClick={() => setAdminModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-deep text-white text-xs uppercase tracking-wider font-medium hover:bg-ink transition-colors shadow-sm"
                  >
                    <PlusCircle size={14} />
                    <span>Manage / Add Services as Storm</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-14 gap-y-14 md:gap-y-16">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  custom={i % 2}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="bg-ivory/70 rounded-[2rem] p-7 md:p-9 ring-1 ring-petal/50 shadow-[0_15px_50px_rgba(58,51,50,0.05)] relative group/card"
                >
                  {/* Category header ribbon */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-rose-deep">✦</span>
                    <h3 className="font-display text-2xl md:text-3xl text-ink tracking-wide uppercase">
                      {cat.title}
                    </h3>
                    <span className="flex-1 h-[1px] bg-gradient-to-r from-rose-deep/40 to-transparent" />
                    {isAdminLoggedIn && (
                      <button
                        onClick={() => setAdminModalOpen(true)}
                        className="text-xs text-rose-deep hover:underline flex items-center gap-1 font-sans uppercase font-medium tracking-wider"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {cat.items.map((item) => (
                      <div
                        key={item.id ?? item.name}
                        className="flex items-baseline gap-3 py-2.5 group"
                      >
                        <span className="text-stone font-light text-base md:text-lg group-hover:text-ink transition-colors">
                          {item.name}
                        </span>
                        <span className="flex-1 border-b border-dotted border-ink/20 translate-y-[-3px]" />
                        <span className="font-display text-xl md:text-2xl text-rose-deep shrink-0">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Inclusive note */}
            <div className="mt-14 md:mt-20 flex flex-col items-center gap-4 text-center">
              <div className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full ring-1 ring-rose-deep/40 bg-petal/40">
                <Sparkles size={16} className="text-rose-deep" />
                <span className="text-sm md:text-base uppercase tracking-[0.2em] font-medium text-ink">
                  Hair is inclusive in prices
                </span>
                <Sparkles size={16} className="text-rose-deep" />
              </div>
              <a
                href="#book"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] font-medium text-stone hover:text-rose-deep transition-colors"
              >
                Book your appointment <ChevronRight size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* Signature Services */}
        <section id="gallery" className="py-28 md:py-36 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 md:px-12 mb-16 md:mb-24">
            <div className="max-w-3xl">
              <p className="text-rose-muted text-sm uppercase tracking-[0.25em] font-medium mb-3">Signature Craft</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-[-0.03em] text-ink mb-6">
                What We <span className="italic font-light text-rose-deep">Create</span>
              </h2>
              <p className="text-stone text-base md:text-lg font-light leading-relaxed">
                A curated look at the specialties offered at Divine Empress. To view real client work, follow Storm on Instagram — every result is unique and crafted around you.
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 auto-rows-[320px] md:auto-rows-[420px]">
              {/* Large feature tile */}
              <a href="#services" className="md:col-span-7 md:row-span-2 group relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(58,51,50,0.1)] ring-1 ring-ink/5 block">
                <AbstractWaves className="w-full h-full transition-transform duration-1000 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-ivory max-w-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-petal mb-3">Colour &amp; Highlights</p>
                  <p className="font-display text-3xl md:text-5xl leading-tight mb-2">Sleek &amp; Luminous</p>
                  <p className="text-sm md:text-base font-light opacity-90">Full colour, half &amp; full head highlights.</p>
                </div>
              </a>

              {/* Tall right */}
              <a href="#services" className="md:col-span-5 group relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(58,51,50,0.1)] ring-1 ring-ink/5 block">
                <AbstractFlow className="w-full h-full transition-transform duration-1000 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-ivory">
                  <p className="text-xs uppercase tracking-[0.25em] text-petal mb-2">Wash &amp; Treat</p>
                  <p className="font-display text-2xl md:text-4xl leading-none">Restorative Care</p>
                </div>
              </a>

              {/* Middle wide */}
              <a href="#services" className="md:col-span-5 group relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(58,51,50,0.1)] ring-1 ring-ink/5 block">
                <AbstractSpirals className="w-full h-full transition-transform duration-1000 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-ivory">
                  <p className="text-xs uppercase tracking-[0.25em] text-petal mb-2">Protective Styles</p>
                  <p className="font-display text-2xl md:text-4xl leading-none">Goddess &amp; Knotless</p>
                </div>
              </a>

              {/* Small bottom left */}
              <a href="#services" className="md:col-span-4 group relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(58,51,50,0.1)] ring-1 ring-ink/5 block">
                <AbstractBraid className="w-full h-full transition-transform duration-1000 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-ivory">
                  <p className="text-xs uppercase tracking-[0.25em] text-petal mb-1">Braids</p>
                  <p className="font-display text-xl md:text-2xl leading-none">Cornrows &amp; Box</p>
                </div>
              </a>

              {/* Small bottom middle - quote */}
              <div className="md:col-span-3 rounded-[2rem] overflow-hidden bg-ink text-ivory flex flex-col items-center justify-center text-center p-6 shadow-[0_20px_60px_rgba(58,51,50,0.1)]">
                <Sparkles size={36} className="text-rose-deep mb-4" />
                <p className="font-display italic text-2xl md:text-3xl leading-tight mb-2">Refined.<br/>Personal.</p>
                <p className="text-xs md:text-sm font-light opacity-80 tracking-wide">Every look, made only for you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Booking Form */}
        <BookingForm servicesList={flattenedServices} />

        {/* Contact / Let's Create */}
        <section id="contact" className="py-28 md:py-36 bg-gradient-to-b from-ink via-[#332d2c] to-ink relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-[-30%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-petal/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-deep/20 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
              {/* Left: info */}
              <div>
                <p className="text-rose-deep text-sm uppercase tracking-[0.25em] font-medium mb-4">Booking & Contact</p>
                <h2 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-[-0.03em] text-ivory mb-8">
                  Let&apos;s <span className="italic font-light text-petal">Create</span>
                </h2>

                <p className="text-petal/90 text-lg md:text-xl font-light leading-relaxed mb-12">
                  Whether you are preparing for a special occasion or simply seeking renewal, Storm invites you to experience the quiet luxury of Divine Empress.
                </p>

                <div className="space-y-6">
                  <a href="tel:+27769591199" className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center group-hover:bg-rose-deep/20 group-hover:ring-rose-deep/40 transition-all">
                      <Phone size={20} className="text-petal" />
                    </div>
                    <div>
                      <p className="text-xs text-petal/60 uppercase tracking-[0.2em] font-medium">Call / WhatsApp</p>
                      <p className="text-ivory text-lg md:text-xl font-display">076 959 1199</p>
                    </div>
                  </a>

                  <a href="mailto:stormmartinus85@gmail.com" className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center group-hover:bg-rose-deep/20 group-hover:ring-rose-deep/40 transition-all">
                      <Mail size={20} className="text-petal" />
                    </div>
                    <div>
                      <p className="text-xs text-petal/60 uppercase tracking-[0.2em] font-medium">Email</p>
                      <p className="text-ivory text-lg md:text-xl font-display">stormmartinus85@gmail.com</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                      <MapPin size={20} className="text-petal" />
                    </div>
                    <div>
                      <p className="text-xs text-petal/60 uppercase tracking-[0.2em] font-medium">Location</p>
                      <p className="text-ivory text-lg md:text-xl font-display">70 Adelaid Tambo Drive, Kensington, Durban North</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: hours + owner cards */}
              <div className="lg:pl-8 flex flex-col gap-5">
                <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-7 md:p-8">
                  <div className="flex items-center gap-2 text-petal mb-4">
                    <Clock size={18} />
                    <span className="text-xs uppercase tracking-[0.2em] font-medium">Opening Hours</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-ivory font-display text-2xl leading-snug">Mon — Fri</p>
                      <p className="text-petal/80 text-sm font-light">9:00 — 18:00</p>
                    </div>
                    <div>
                      <p className="text-ivory font-display text-2xl leading-snug">Saturday</p>
                      <p className="text-petal/80 text-sm font-light">9:00 — 15:00</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-7 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-petal mb-4">
                      <Heart size={18} />
                      <span className="text-xs uppercase tracking-[0.2em] font-medium">Sole Owner</span>
                    </div>
                    <p className="text-ivory font-display text-2xl leading-snug">Storm Martinus</p>
                    <p className="text-petal/80 text-sm font-light mt-1">All appointments handled personally.</p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 text-rose-deep">
                    <Sparkles size={16} />
                    <span className="text-xs uppercase tracking-[0.15em] font-medium">5 Years Experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-ivory border-t border-petal/40">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-12">
            <div>
              <a href="#" className="flex items-center gap-4 mb-4">
                <img
                  src="/images/logo.png"
                  alt="Divine Empress Hair Logo"
                  className="h-20 w-20 rounded-full object-cover ring-1 ring-rose-deep/30 shadow-[0_8px_30px_rgba(180,96,110,0.2)]"
                />
                <span className="flex flex-col leading-tight">
                  <span className="font-display text-2xl text-ink">
                    Divine <span className="italic font-light text-rose-deep">Empress</span>
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-stone font-medium mt-1">
                    Hair · Look Good · Feel Good
                  </span>
                </span>
              </a>
              <p className="text-stone text-sm font-light leading-relaxed max-w-xs">
                A luxury hair salon in Durban North. Run by Storm Martinus with 5 years of experience and an unwavering eye for detail.
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.25em] font-medium text-ink mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2.5 text-sm text-stone font-light">
                <a href="#about" className="hover:text-rose-deep transition-colors">About Storm</a>
                <a href="#services" className="hover:text-rose-deep transition-colors">Services & Prices</a>
                <a href="#gallery" className="hover:text-rose-deep transition-colors">Gallery</a>
                <a href="#book" className="hover:text-rose-deep transition-colors">Book a Session</a>
                <button
                  onClick={() => setAdminModalOpen(true)}
                  className="text-left hover:text-rose-deep transition-colors text-xs uppercase tracking-wider font-medium text-rose-deep pt-1"
                >
                  ✦ Admin Login (Storm)
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.25em] font-medium text-ink mb-4">Contact</h4>
              <div className="flex flex-col gap-3 text-sm text-stone font-light">
                <a href="tel:+27769591199" className="hover:text-rose-deep transition-colors">076 959 1199</a>
                <a href="mailto:stormmartinus85@gmail.com" className="hover:text-rose-deep transition-colors">stormmartinus85@gmail.com</a>
                <p>70 Adelaid Tambo Drive, Kensington, Durban North</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-petal/30">
            <p className="text-xs text-stone font-light tracking-wide">© {new Date().getFullYear()} Divine Empress. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-stone font-light tracking-wide">
              <a href="#" className="hover:text-rose-deep transition-colors">Instagram</a>
              <span className="text-petal/60">·</span>
              <a href="https://wa.me/27769591199" target="_blank" rel="noopener noreferrer" className="hover:text-rose-deep transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
