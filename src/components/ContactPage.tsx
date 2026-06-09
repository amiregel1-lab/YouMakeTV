import { useState } from 'react';
import SEOHead from './SEOHead';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });

  const subjects = ['General', 'Creator Support', 'Viewer Support', 'Copyright / DMCA', 'Press & Media', 'Partnerships'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[YouMakeTV] ${form.subject} — from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`);
    window.location.href = `mailto:info@youmaketv.ai?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SEOHead
        title="Contact | YouMakeTV.ai"
        description="Get in touch with the YouMakeTV team for creator support, viewer questions, press inquiries, or partnerships."
        canonical="/contact"
      />

      <div>
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
          Contact Us
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Get in touch</h1>
        <p className="mt-2 text-slate-500">
          We'd love to hear from you. Fill out the form and our team will respond within one business day.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-10 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl mx-auto">✓</div>
          <h2 className="text-lg font-semibold text-slate-950">Message received</h2>
          <p className="text-sm text-slate-600">
            Thank you, <strong>{form.name}</strong>. We'll get back to you at <strong>{form.email}</strong> within one business day.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Full name</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Email address</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Subject</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
            >
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="How can we help?"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Send Message →
          </button>
        </form>
      )}

      {/* Contact info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Creator Support', detail: 'info@youmaketv.ai', note: 'For onboarding, payouts, and film questions' },
          { label: 'Press & Media', detail: 'info@youmaketv.ai', note: 'Interview requests and media inquiries' },
        ].map((c) => (
          <div key={c.label} className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{c.label}</p>
            <p className="text-sm font-semibold text-brand-purple">{c.detail}</p>
            <p className="text-xs text-slate-500">{c.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
