"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, Send } from "lucide-react";

interface BookingFormProps {
  servicesList?: { name: string; price: string; category: string }[];
}

export default function BookingForm({ servicesList = [] }: BookingFormProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    email: "",
    serviceName: "",
    bookingDate: "",
    bookingTime: "10:00",
    notes: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.phone || !formData.serviceName || !formData.bookingDate) {
      setErrorMessage("Please fill in your name, contact phone, service, and preferred date.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit appointment request");
      }

      setStatus("success");
      setSuccessMessage(
        data.message || "Your appointment request has been sent to Storm! She will contact you directly."
      );
      setFormData({
        clientName: "",
        phone: "",
        email: "",
        serviceName: "",
        bookingDate: "",
        bookingTime: "10:00",
        notes: "",
      });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again or call Storm.");
    }
  };

  return (
    <section id="book" className="py-24 md:py-32 bg-sand/30 relative">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-petal/60 text-xs uppercase tracking-[0.2em] font-medium text-rose-deep mb-4">
            <Sparkles size={14} />
            <span>Reserved Appointments</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-ink leading-tight mb-4">
            Book Your <span className="italic font-light text-rose-deep">Session</span>
          </h2>
          <p className="text-stone font-light text-base md:text-lg max-w-xl mx-auto">
            Choose your desired service and preferred timing. Storm will personally confirm your booking.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-ivory rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_rgba(58,51,50,0.08)] ring-1 ring-petal/70"
        >
          {status === "success" ? (
            <div className="text-center py-10 space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-deep/10 text-rose-deep mx-auto flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-display text-3xl text-ink">Thank You!</h3>
              <p className="text-stone max-w-md mx-auto leading-relaxed">{successMessage}</p>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="px-6 py-2.5 border border-ink/20 rounded-full text-xs uppercase tracking-widest font-medium hover:border-rose-deep hover:text-rose-deep transition-colors"
                >
                  Book Another Session
                </button>
                <a
                  href="https://wa.me/27769591199?text=Hi%20Storm,%20I%20just%20submitted%20a%20booking%20request%20on%20Divine%20Empress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-rose-deep text-white rounded-full text-xs uppercase tracking-widest font-medium hover:bg-ink transition-colors"
                >
                  Message Storm on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === "error" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-800 text-sm border border-red-200">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] font-medium text-stone mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Smith"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-sand/40 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-ink placeholder:text-stone/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] font-medium text-stone mb-2">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 076 959 1199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-sand/40 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-ink placeholder:text-stone/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] font-medium text-stone mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-sand/40 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-ink placeholder:text-stone/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] font-medium text-stone mb-2">
                    Select Desired Service *
                  </label>
                  <input
                    list="services-options"
                    required
                    placeholder="Choose or type service (e.g. Knotless Braids)"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-sand/40 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-ink placeholder:text-stone/50 text-sm"
                  />
                  <datalist id="services-options">
                    {servicesList.length > 0 ? (
                      servicesList.map((s, idx) => (
                        <option key={idx} value={`${s.name} (${s.price}) - ${s.category}`}>
                          {s.category}: {s.name} ({s.price})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Knotless Braids (Medium - R600)" />
                        <option value="Fulani Braids (Small - R780)" />
                        <option value="Box Braids (Medium - R550)" />
                        <option value="Full colour (medium - R400)" />
                        <option value="Wash & Treat (Medium - R250)" />
                        <option value="Passion Twists (Medium - R780)" />
                      </>
                    )}
                  </datalist>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] font-medium text-stone mb-2">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.bookingDate}
                      onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-sand/40 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-ink text-sm"
                    />
                    <Calendar size={18} className="absolute right-3.5 top-3.5 text-stone/60 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.18em] font-medium text-stone mb-2">
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.bookingTime}
                      onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-sand/40 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-ink text-sm appearance-none"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:30">02:30 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                    <Clock size={18} className="absolute right-3.5 top-3.5 text-stone/60 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.18em] font-medium text-stone mb-2">
                  Special Notes or Hair Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell Storm about your hair length, current state, or any custom requests..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-sand/40 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-rose-deep/50 text-ink placeholder:text-stone/50 text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-stone/80">
                  ✦ Hair is inclusive in all protective styles prices.
                </p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-ink text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-medium hover:bg-rose-deep transition-all duration-300 shadow-md disabled:opacity-50"
                >
                  {status === "submitting" ? (
                    "Sending Request..."
                  ) : (
                    <>
                      <span>Send Appointment Request</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
