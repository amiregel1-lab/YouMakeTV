import { useEffect, useMemo, useRef, useState } from 'react';
import { CreatorFilm, CreatorProfile } from '../types';
import PricingSlider from './PricingSlider';

interface CreatorOnboardingProps {
  onComplete: (profile: CreatorProfile) => void;
}

const steps = ['Agreement', 'Account', 'KYC', 'Creator rights', 'Optional upload'];

const AGREEMENT_TEXT = `CREATOR AGREEMENT — YouMakeTV.ai

Effective date: January 1, 2026

By completing creator onboarding, you ("Creator") agree to this Creator Agreement with YouMakeTV.ai ("YouMakeTV"). Read this Agreement carefully before continuing.

1. CONTENT OWNERSHIP
You retain full intellectual property ownership of all content you upload. This Agreement does not transfer ownership of your content to YouMakeTV.

2. LICENSE GRANTED TO YOUMAKETV
By uploading content, you grant YouMakeTV a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to: host, store, stream, display, promote, market, and distribute your content on and in connection with the platform; reproduce clips or excerpts for promotional purposes; adapt or reformat your content for technical compatibility.

3. CREATOR WARRANTIES AND REPRESENTATIONS
You represent and warrant that: (a) you own the content or hold all necessary rights to upload and monetize it; (b) the content does not infringe any third-party copyright, trademark, right of publicity, privacy right, or other legal right; (c) the content complies with all applicable laws; (d) any AI-generated elements were produced using tools that permit commercial use; (e) you are at least 18 years of age and legally capable of entering into binding contracts.

4. AI-GENERATED CONTENT
You accept sole responsibility for ensuring all AI tools used permit commercial distribution. You may not use AI tools to create content depicting real, identifiable individuals in a harmful or unauthorized manner. You acknowledge that the legal status of AI-generated content varies by jurisdiction.

5. CONTENT MODERATION
YouMakeTV reserves the right, in its sole and absolute discretion, to remove, disable, suspend, or restrict access to any content at any time, for any reason, with or without notice. Content removal does not entitle you to compensation for lost earnings.

6. PROHIBITED CONTENT
You may not upload content that: depicts child sexual abuse material; promotes violence, terrorism, or illegal activity; infringes third-party intellectual property; constitutes targeted harassment; depicts real individuals without their consent in a harmful manner; or violates any applicable law.

7. REVENUE SHARE AND PAYMENTS
Subject to your compliance with platform policies, YouMakeTV will pay you: 70% of Net Revenue for the first 500 paid watches per film; 80% of Net Revenue thereafter. Payouts are processed monthly with a $25 minimum threshold. Revenue share rates are subject to change on 30 days' notice. Chargebacks will be deducted from your earnings. Payouts may be delayed for fraud review.

8. TAXES AND COMPLIANCE
You are solely responsible for all taxes arising from your earnings. You may be required to provide tax documentation before payouts are processed. YouMakeTV may report earnings to tax authorities as required by law.

9. TERMINATION
YouMakeTV may terminate your creator account at any time for policy violations. Pending earnings at termination may be forfeited in YouMakeTV's sole discretion.

10. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOUMAKETV SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR YOUR CONTENT. YOUMAKETV'S TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF (A) REVENUE SHARE PAID TO YOU IN THE PRIOR THREE MONTHS OR (B) $100 USD.

11. INDEMNIFICATION
You agree to defend, indemnify, and hold harmless YouMakeTV and its officers, directors, employees, agents, and affiliates from any claims, damages, and costs arising from: your content; your violations of this Agreement; infringement of third-party rights by your content; and any tax liability arising from your earnings.

12. DISPUTE RESOLUTION
Any dispute arising under this Agreement shall be resolved by binding arbitration under AAA Commercial Arbitration Rules in Delaware. You waive any right to participate in class action proceedings against YouMakeTV.

13. GOVERNING LAW
This Agreement is governed by the laws of the State of Delaware, United States.

14. MODIFICATION
YouMakeTV may modify this Agreement on 30 days' notice. Continued use after modification constitutes acceptance.

By continuing onboarding, you confirm you have read and agree to this Creator Agreement in its entirety.

Full agreement available at: youmaketv.ai/creator-agreement`;

export default function CreatorOnboarding({ onComplete }: CreatorOnboardingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreement, setAgreement] = useState({ agreeTerms: false, agreeRights: false, agreePolicy: false });
  const [account, setAccount] = useState({ fullName: '', studioName: '', email: '', password: '' });
  const [kyc, setKyc] = useState({ legalName: '', dob: '', residence: '', agreeAccuracy: false });
  const [rights, setRights] = useState({ confirmAi: false, confirmRights: false, confirmMonetize: false, confirmDisplay: false, understandPrototype: false });
  const [film, setFilm] = useState({ title: '', description: '', category: 'Sci-Fi', duration: '10m', language: 'English', tools: '', rating: 'PG-13', price: 3.99 });
  const [showComplete, setShowComplete] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);

  // Check if agreement box fits without scrolling (e.g. very large display)
  useEffect(() => {
    if (activeStep === 0 && agreementRef.current) {
      const el = agreementRef.current;
      if (el.scrollHeight <= el.clientHeight + 4) {
        setHasScrolledToBottom(true);
      }
    }
  }, [activeStep]);

  const handleAgreementScroll = () => {
    const el = agreementRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setHasScrolledToBottom(true);
    }
  };

  const canContinue = useMemo(() => {
    if (activeStep === 0) {
      return hasScrolledToBottom && agreement.agreeTerms && agreement.agreeRights && agreement.agreePolicy;
    }
    if (activeStep === 1) {
      return account.fullName.trim() !== '' && account.studioName.trim() !== '' && account.email.trim() !== '' && account.password.trim() !== '';
    }
    if (activeStep === 2) {
      return kyc.legalName.trim() !== '' && kyc.dob !== '' && kyc.residence.trim() !== '' && kyc.agreeAccuracy;
    }
    if (activeStep === 3) {
      return Object.values(rights).every(Boolean);
    }
    return true;
  }, [activeStep, hasScrolledToBottom, agreement, account, kyc, rights]);

  const createProfile = (includeFilm: boolean) => {
    const dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const profile: CreatorProfile = {
      fullName: account.fullName.trim(),
      studioName: account.studioName.trim(),
      email: account.email.trim(),
      verified: true,
      kycCompleted: true,
      createdAt: dateLabel,
      films: includeFilm && film.title.trim().length > 0
        ? [
            {
              id: `film-${Date.now()}`,
              title: film.title.trim(),
              subtitle: film.description.trim().slice(0, 70),
              description: film.description.trim(),
              genre: film.category,
              duration: film.duration,
              creator: account.studioName.trim(),
              category: film.category,
              price: film.price,
              thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
              status: 'Pending Review',
              views: 0,
              trailerViews: 0,
              paidWatches: 0,
              freeWatches: 0,
              rating: film.rating,
              language: film.language,
              tools: film.tools.split(',').map((tool) => tool.trim()).filter(Boolean),
              uploadDate: dateLabel,
              updatedDate: dateLabel,
            },
          ]
        : [],
    };

    onComplete(profile);
    setShowComplete(true);
  };

  if (showComplete) {
    return (
      <section className="rounded-[2rem] border border-slate-200/80 bg-white shadow-soft p-10">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-700">Onboarding complete</p>
          <h1 className="text-4xl font-semibold text-slate-950">Your creator account is verified.</h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600">
            You can now access your creator dashboard. Upload can be completed later if you skipped it now.
          </p>
          <button onClick={() => createProfile(false)} className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Go to creator dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white shadow-soft p-10">
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-700">Creator onboarding</p>
            <h1 className="text-4xl font-semibold text-slate-950">Complete your creator onboarding in {steps.length} steps</h1>
          </div>
          <div className="text-sm text-slate-600">Step {activeStep + 1} of {steps.length}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {steps.map((label, index) => (
            <div key={label} className={`rounded-3xl border px-4 py-3 text-center text-xs uppercase tracking-[0.25em] ${index <= activeStep ? 'border-cyan-500 bg-cyan-50 text-slate-900' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
              {label}
            </div>
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-8">

          {/* ── Step 0: Agreement ─────────────────────────────────────────── */}
          {activeStep === 0 && (
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-slate-900">Creator Agreement</p>
                <p className="mt-1 text-sm text-slate-500">
                  Read the full agreement below and scroll to the bottom to enable the required checkboxes.
                  You can also{' '}
                  <a href="/creator-agreement" target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
                    view the full agreement in a new tab
                  </a>.
                </p>
              </div>

              {/* Scrollable agreement box */}
              <div className="relative">
                <div
                  ref={agreementRef}
                  onScroll={handleAgreementScroll}
                  className="h-72 overflow-y-auto rounded-2xl border border-slate-300 bg-white p-5 text-xs leading-6 text-slate-600 font-mono whitespace-pre-wrap"
                >
                  {AGREEMENT_TEXT}
                </div>
                {!hasScrolledToBottom && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-2xl bg-gradient-to-t from-white/90 to-transparent flex items-end justify-center pb-2">
                    <span className="text-xs text-slate-400">↓ Scroll to read the full agreement</span>
                  </div>
                )}
              </div>

              {/* Checkboxes — disabled until scrolled to bottom */}
              <div className={`space-y-3 transition-opacity ${hasScrolledToBottom ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                {[
                  { key: 'agreeTerms' as const, label: 'I have read and agree to the Creator Agreement.' },
                  { key: 'agreeRights' as const, label: 'I confirm that I own or control all rights necessary for the content I upload.' },
                  { key: 'agreePolicy' as const, label: 'I understand that YouMakeTV may remove content or suspend accounts for policy violations.' },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreement[item.key]}
                      onChange={(e) => setAgreement((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-cyan-600 flex-none"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              {!hasScrolledToBottom && (
                <p className="text-xs text-slate-400">
                  Scroll to the bottom of the agreement above to enable the required checkboxes.
                </p>
              )}
            </div>
          )}

          {/* ── Step 1: Account ───────────────────────────────────────────── */}
          {activeStep === 1 && (
            <div className="space-y-5">
              <p className="text-slate-600">Create your creator account and studio profile. Real authentication will be added later.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Full name', value: account.fullName, key: 'fullName' },
                  { label: 'Studio name', value: account.studioName, key: 'studioName' },
                  { label: 'Email', value: account.email, key: 'email', type: 'email' },
                  { label: 'Password', value: account.password, key: 'password', type: 'password' },
                ].map((field) => (
                  <label key={field.label} className="space-y-2 text-sm text-slate-700">
                    {field.label}
                    <input
                      type={field.type ?? 'text'}
                      value={field.value}
                      onChange={(event) => setAccount((current) => ({ ...current, [field.key]: event.target.value }))}
                      className="input-field"
                      placeholder={field.label}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: KYC ──────────────────────────────────────────────── */}
          {activeStep === 2 && (
            <div className="space-y-5">
              <p className="text-slate-600">Mock verification gives your creator account a verified status in the prototype.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Legal full name', value: kyc.legalName, key: 'legalName' },
                  { label: 'Date of birth', value: kyc.dob, key: 'dob', type: 'date' },
                  { label: 'Country of residence', value: kyc.residence, key: 'residence' },
                ].map((field) => (
                  <label key={field.label} className="space-y-2 text-sm text-slate-700">
                    {field.label}
                    <input
                      type={(field.type as 'date') ?? 'text'}
                      value={field.value}
                      onChange={(event) => setKyc((current) => ({ ...current, [field.key]: event.target.value }))}
                      className="input-field"
                    />
                  </label>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Government ID placeholder</p>
                  <p className="mt-2">Real document upload will be connected to a KYC provider later.</p>
                </div>
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Selfie placeholder</p>
                  <p className="mt-2">This step is mocked to demonstrate identity verification flow.</p>
                </div>
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={kyc.agreeAccuracy} onChange={(event) => setKyc((current) => ({ ...current, agreeAccuracy: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600" />
                I confirm the information above is accurate.
              </label>
            </div>
          )}

          {/* ── Step 3: Creator rights ────────────────────────────────────── */}
          {activeStep === 3 && (
            <div className="space-y-5">
              <p className="text-slate-600">Confirm the rights and permissions for your content before publishing.</p>
              {[
                { key: 'confirmAi', label: 'I confirm this film/content is AI-generated or AI-assisted.' },
                { key: 'confirmRights', label: 'I confirm I own or have rights to all visuals, audio, music, voices, likenesses, prompts, and assets used.' },
                { key: 'confirmMonetize', label: 'I confirm I am allowed to monetize this content.' },
                { key: 'confirmDisplay', label: 'I agree that YouMakeTV.ai may display, promote, and monetize uploaded content.' },
                { key: 'understandPrototype', label: 'I understand real legal and payment systems will be added later.' },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 text-sm text-slate-700">
                  <input type="checkbox" checked={rights[item.key as keyof typeof rights]} onChange={(event) => setRights((current) => ({ ...current, [item.key]: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600" />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* ── Step 4: Optional upload ───────────────────────────────────── */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <p className="text-slate-600">Upload your first film details now, or finish onboarding and upload later from the dashboard.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Film title
                  <input value={film.title} onChange={(event) => setFilm((current) => ({ ...current, title: event.target.value }))} className="input-field" placeholder="Eternal Credits" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Runtime
                  <input value={film.duration} onChange={(event) => setFilm((current) => ({ ...current, duration: event.target.value }))} className="input-field" placeholder="10m" />
                </label>
              </div>
              <label className="space-y-2 text-sm text-slate-700">
                Short description
                <textarea value={film.description} onChange={(event) => setFilm((current) => ({ ...current, description: event.target.value }))} className="input-field min-h-[120px]" placeholder="A cinematic AI journey through a neon skyline." />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-700">
                  Genre
                  <select value={film.category} onChange={(event) => setFilm((current) => ({ ...current, category: event.target.value }))} className="input-field">
                    <option>Sci-Fi</option>
                    <option>Action</option>
                    <option>Drama</option>
                    <option>Short</option>
                    <option>Experimental</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Language
                  <select value={film.language} onChange={(event) => setFilm((current) => ({ ...current, language: event.target.value }))} className="input-field">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Rating
                  <select value={film.rating} onChange={(event) => setFilm((current) => ({ ...current, rating: event.target.value }))} className="input-field">
                    <option>G</option>
                    <option>PG</option>
                    <option>PG-13</option>
                    <option>R</option>
                  </select>
                </label>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Price</p>
                <div className="mt-4">
                  <PricingSlider value={film.price} onChange={(next) => setFilm((current) => ({ ...current, price: next }))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">Full film upload placeholder</div>
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">Thumbnail upload placeholder</div>
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">Trailer upload placeholder</div>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-100 p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Tip</p>
                <p className="mt-2">You can skip upload now and finish your creator setup in the dashboard later.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button onClick={() => setActiveStep((current) => Math.max(0, current - 1))} disabled={activeStep === 0} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
            Back
          </button>
          <div className="flex flex-wrap gap-3">
            {activeStep === steps.length - 1 ? (
              <>
                <button onClick={() => createProfile(false)} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Skip upload and finish
                </button>
                <button onClick={() => createProfile(true)} className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Submit creator profile
                </button>
              </>
            ) : (
              <button onClick={() => canContinue && setActiveStep((current) => current + 1)} disabled={!canContinue} className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
