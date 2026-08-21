import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatorProfile } from '../types';
import BetaNotice from './BetaNotice';

interface CreatorOnboardingProps {
  onComplete: (profile: CreatorProfile) => void;
}

const STEPS = ['Create Account', 'Creator Agreement'];

const BENEFITS = [
  '30% revenue share on paid views from your first film',
  'Grows to 35% at 1,000 views, 40% at 5,000 views',
  'A dashboard for your films, views and revenue share',
  'Upload, edit, and manage your films',
  'Set your own price — free or paid — and change it anytime',
  'Full IP ownership retained',
];

const CREATOR_STATS = [
  { label: 'Starting revenue share', value: '30%' },
  { label: 'Pro tier revenue share', value: '40%' },
  { label: 'Ownership of your work', value: 'Yours' },
  { label: 'To join and publish', value: 'Free' },
];

const AGREEMENT_TEXT = `CREATOR AGREEMENT — YouMakeTV.ai
Effective date: January 1, 2026

PREAMBLE

This Creator Agreement ("Agreement") governs your use of the YouMakeTV.ai creator tools, dashboard, and content distribution platform. By completing creator onboarding, uploading any content, or accessing creator-specific features, you agree to be legally bound by this Agreement. Read it carefully before continuing.

1. CONTENT OWNERSHIP

You retain full intellectual property ownership of all content you upload to the platform. This Agreement does not transfer ownership of your content to YouMakeTV. YouMakeTV acquires only the license rights expressly granted below.

You are solely responsible for ensuring that you hold all necessary rights, licenses, and permissions required to upload, distribute, and monetize your content, including rights to any AI tools, generative models, voice performances, musical compositions, sound recordings, visual assets, scripts, and other elements incorporated into your content.

2. LICENSE GRANTED TO YOUMAKETV

By uploading content to the platform, you grant YouMakeTV a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to: host, store, and transmit your content; stream and deliver your content to viewers; display your content including title, description, and thumbnail; reproduce clips or excerpts for promotional purposes; promote and market your content through platform interfaces, emails, and advertising channels; distribute your content to viewers who have purchased access or hold an active subscription; adapt or reformat your content for technical compatibility with platform infrastructure; and use your content, title, studio name, and likeness in promotional materials.

This license continues for as long as your content remains on the platform and for a reasonable period thereafter to allow YouMakeTV to fulfill existing viewer access obligations.

3. CREATOR WARRANTIES AND REPRESENTATIONS

By uploading content, you represent and warrant that: (a) you own the content or hold all necessary rights to upload and monetize it; (b) the content does not infringe any third-party copyright, trademark, trade secret, patent, right of publicity, privacy right, or any other proprietary right; (c) the content complies with all applicable laws, including laws regarding obscenity, defamation, and content ratings; (d) any AI-generated elements were produced using tools and services that permit commercial use and monetization; (e) you have not depicted real, identifiable individuals without their consent in a manner that is false, defamatory, or violates their rights; (f) all content metadata including title, description, and rating is accurate and not misleading; (g) you are at least 18 years of age and legally capable of entering into binding contracts. These warranties are continuous. If you become aware that any warranty is no longer accurate, you must notify YouMakeTV immediately and remove or correct the affected content.

4. AI-GENERATED CONTENT

YouMakeTV is a platform designed for AI-generated and AI-assisted films. You acknowledge that the legal status of copyright in AI-generated content varies by jurisdiction and is subject to change. You accept sole responsibility for monitoring and complying with applicable legal developments. You must ensure that all AI tools and generative models you use permit commercial use and distribution of outputs. You may not use AI tools to generate content depicting real, identifiable individuals in a false, harmful, or unauthorized manner, including deepfake content created without the subject's explicit consent.

5. CONTENT MODERATION

YouMakeTV reserves the right, in its sole and absolute discretion, to review, reject, remove, disable, suspend, or restrict access to any content at any time, for any reason or no reason, with or without prior notice. Reasons for content action include but are not limited to: violation of this Agreement or platform policies; receipt of a valid DMCA notice; complaints from viewers or third parties; platform quality standards; legal requirements or court orders; risk of reputational harm. Content removal does not entitle you to compensation for lost earnings. YouMakeTV shall not be liable for any loss of revenue arising from content removal, suspension, or restriction.

6. PROHIBITED CONTENT

You may not upload content that: depicts child sexual abuse material or sexual content involving minors; promotes, glorifies, or facilitates violence, terrorism, or illegal activity; constitutes targeted harassment, hate speech, or incitement to discrimination; is defamatory, fraudulent, or intentionally deceptive; infringes any third-party intellectual property rights; depicts real individuals without their consent in a sexual, humiliating, or defamatory manner; violates any applicable export control laws; or violates any applicable local, national, or international law or regulation. Uploading prohibited content may result in immediate account termination and reporting to law enforcement authorities.

7. REVENUE SHARE AND PAYMENTS

Subject to this Agreement and your compliance with all platform policies, YouMakeTV will pay you based on your Creator tier: 30% of Net Revenue as a Starter Creator (0–999 total paid views); 35% of Net Revenue as a Growth Creator (1,000–4,999 total paid views); 40% of Net Revenue as a Pro Creator (5,000+ total paid views). Payouts are processed monthly on or around the 1st of each month for earnings accumulated in the prior calendar month. Payouts are subject to a minimum threshold of $25.00 USD. Earnings below the threshold will be carried forward.

You acknowledge that: revenue share rates are subject to change upon 30 days' written notice; platform fees, transaction fees, and processing costs may be deducted before revenue share is calculated; payouts may be delayed by up to 60 days for fraud review, dispute resolution, or regulatory compliance; YouMakeTV may withhold payment if it reasonably suspects fraudulent activity, including artificially inflated view counts; chargebacks initiated by viewers will be deducted from your earnings regardless of reason; YouMakeTV reserves the right to offset future earnings against any amounts you owe.

8. TAXES AND COMPLIANCE

You are solely responsible for all taxes, levies, and duties arising from your earnings, including income taxes, self-employment taxes, and VAT. You may be required to provide tax identification documentation before payouts are processed. Failure to provide required tax documentation may delay or suspend payouts. YouMakeTV may report your earnings to tax authorities as required by law.

9. CREATOR ACCOUNT

You are responsible for maintaining the confidentiality of your account credentials. You may not share, sell, or transfer your creator account. YouMakeTV reserves the right to require re-verification of your identity at any time.

10. TERMINATION

YouMakeTV may terminate your creator account at any time, with or without notice, if you: violate any provision of this Agreement; upload content that violates applicable law or platform policies; are found to be a repeat copyright infringer; engage in fraudulent activity; or engage in conduct harmful to the platform, other creators, or viewers. Upon termination for cause, pending earnings may be forfeited in YouMakeTV's sole discretion.

11. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOUMAKETV AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUES, DATA, EARNINGS, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT OR YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOUMAKETV'S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE GREATER OF (A) REVENUE SHARE PAID TO YOU IN THE THREE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00 USD).

12. INDEMNIFICATION

You agree to defend, indemnify, and hold harmless YouMakeTV and its officers, directors, employees, contractors, agents, licensors, affiliates, successors, and assigns from and against any claims, damages, liabilities, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: your content; your use of the platform in violation of this Agreement; any claim that your content infringes any third-party intellectual property right; any tax liability arising from your earnings; and any claim related to AI-generated elements of your content.

13. DISPUTE RESOLUTION

Any dispute arising out of or relating to this Agreement shall be resolved by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The arbitration shall be conducted in the State of Delaware. You waive any right to participate in a class action lawsuit or class-wide arbitration against YouMakeTV.

14. GOVERNING LAW

This Agreement is governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.

15. MODIFICATION

YouMakeTV reserves the right to modify this Agreement at any time. Material changes will be notified via email or platform notice at least 30 days before taking effect. Continued use of the platform after modification constitutes acceptance.

CONTACT
Creator Support: info@youmaketv.ai
Legal: info@youmaketv.ai
Full agreement: youmaketv.ai/creator-agreement

By clicking "Create Creator Account," you confirm that you have read, understood, and agree to this Creator Agreement in its entirety.`;

// ── Right panel content per step ──────────────────────────────────────────────

function RightPanel({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 px-10 py-12 text-white">
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">Why creators choose us</p>
            <h2 className="text-xl font-bold text-white leading-snug">Your films. Your revenue.<br />Your dashboard.</h2>
          </div>
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-slate-300">
                <svg className="h-5 w-5 text-brand-cyan flex-none mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
          <div className="h-px bg-white/10" />
          <div className="grid grid-cols-2 gap-3">
            {CREATOR_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 space-y-1">
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-px bg-white/10" />
          <p className="text-xs text-slate-500 leading-relaxed">Creators retain full IP ownership. Revenue share is based on your original film price.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col justify-between bg-slate-950 px-10 py-12 text-white">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">Almost there</p>
          <h2 className="text-xl font-bold text-white leading-snug">What happens after<br />you sign up.</h2>
        </div>
        <ul className="space-y-4">
          {[
            { num: '1', title: 'Dashboard access', desc: 'Instant access to your creator workspace.' },
            { num: '2', title: 'Upload your first film', desc: 'Use the dashboard upload tool to publish your first AI film.' },
            { num: '3', title: 'Set your price', desc: 'Free or paid, your call. Revenue share is 30%, growing as paid views accumulate.' },
            { num: '4', title: 'Payouts, once billing is live', desc: 'Billing is not connected yet. We will email every creator before real payments begin.' },
          ].map((item) => (
            <li key={item.num} className="flex items-start gap-4">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white">
                {item.num}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-px bg-white/10" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Creators retain full IP ownership. Revenue share is based on your original film price. Billing is not connected yet, so no payouts have been made.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CreatorOnboarding({ onComplete }: CreatorOnboardingProps) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Step 0 — Account
  const [account, setAccount] = useState({
    fullName: '',
    studioName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Step 1 — Agreement
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreement, setAgreement] = useState({
    agreeTerms: false,
    agreeRights: false,
    agreePolicy: false,
    agreePayments: false,
    agreeAccuracy: false,
  });
  const agreementRef = useRef<HTMLDivElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const pendingProfileRef = useRef<CreatorProfile | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      if (pendingProfileRef.current) onComplete(pendingProfileRef.current);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showSuccess, onComplete]);

  // Check if agreement box needs scrolling
  useEffect(() => {
    if (activeStep === 1 && agreementRef.current) {
      const el = agreementRef.current;
      if (el.scrollHeight <= el.clientHeight + 4) setHasScrolledToBottom(true);
    }
  }, [activeStep]);

  const passwordChecks = useMemo(() => ({
    length: account.password.length >= 6,
    match: account.password.length > 0 && account.password === account.confirmPassword,
  }), [account.password, account.confirmPassword]);

  const canContinue = useMemo(() => {
    if (activeStep === 0) {
      return (
        account.fullName.trim().length > 0 &&
        account.studioName.trim().length > 0 &&
        account.email.trim().includes('@') &&
        passwordChecks.length &&
        passwordChecks.match
      );
    }
    return hasScrolledToBottom && Object.values(agreement).every(Boolean);
  }, [activeStep, account, passwordChecks, hasScrolledToBottom, agreement]);

  const handleGoogleSignUp = () => {
    setShowGoogleModal(true);
  };

  const handleAgreementScroll = () => {
    const el = agreementRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setHasScrolledToBottom(true);
  };

  const createProfile = () => {
    const dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    // Nothing here is verified, so nothing here claims to be. Identity
    // verification arrives with billing; until then the profile says so rather
    // than stamping itself `verified: true` on the strength of a form.
    const profile: CreatorProfile = {
      fullName: account.fullName.trim() || account.studioName.trim(),
      studioName: account.studioName.trim() || 'My Studio',
      email: account.email.trim(),
      verified: false,
      kycCompleted: false,
      createdAt: dateLabel,
      films: [],
    };
    pendingProfileRef.current = profile;
    setShowSuccess(true);
  };

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20';
  const labelClass = 'block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2';

  if (showSuccess) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-10">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand-purple/30 bg-brand-purple/10">
              <svg className="h-12 w-12 text-brand-purple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-purple">
              ✓ Creator Account Created
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Welcome to YouMakeTV.</h1>
            <p className="text-sm text-slate-500">Redirecting to your dashboard…</p>
          </div>
          <div className="flex justify-center gap-1.5 pt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-brand-purple animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-10">

      {/* Google sign-up coming-soon modal */}
      {showGoogleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-950">Google Sign-Up Coming Soon</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Google sign-up will be connected before launch. Please use the manual sign-up form below to create your creator account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="w-full rounded-full bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              OK, use manual sign-up
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">

        {/* Progress indicator */}
        <div className="mb-5 flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">Step {activeStep + 1} of {STEPS.length}</p>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-12 rounded-full transition-colors duration-300 ${i <= activeStep ? 'bg-brand-purple' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Honest state of the platform, stated before anyone signs up. */}
        <BetaNotice className="mb-5" />

        {/* Card */}
        <div className="rounded-[2rem] overflow-hidden border border-slate-200/70 shadow-2xl lg:grid lg:grid-cols-2">

          {/* Left — Form */}
          <div className="bg-white px-8 py-12 sm:px-12 space-y-7">

            {/* ── STEP 0: Create Account ──────────────────────────────────── */}
            {activeStep === 0 && (
              <>
                <div>
                  <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-purple mb-4">
                    Creator Portal
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950">Create Your Creator Account</h1>
                  <p className="mt-2 text-sm text-slate-500">Start publishing AI-generated films to viewers who came looking for exactly that.</p>
                </div>

                {/* Google — primary CTA */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">or sign up manually</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Manual form */}
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Your Name</label>
                    <input
                      type="text"
                      placeholder="Alex Rivera"
                      value={account.fullName}
                      onChange={(e) => setAccount((p) => ({ ...p, fullName: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Studio Name</label>
                    <input
                      type="text"
                      placeholder="Neon Horizon Films"
                      value={account.studioName}
                      onChange={(e) => setAccount((p) => ({ ...p, studioName: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      placeholder="creator@example.com"
                      value={account.email}
                      onChange={(e) => setAccount((p) => ({ ...p, email: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={account.password}
                      onChange={(e) => setAccount((p) => ({ ...p, password: e.target.value }))}
                      className={inputClass}
                    />
                    {account.password.length > 0 && (
                      <p className={`mt-1.5 text-xs font-medium ${passwordChecks.length ? 'text-emerald-600' : 'text-red-500'}`}>
                        {passwordChecks.length ? '✓ Minimum 6 characters' : '✗ Password must be at least 6 characters'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={account.confirmPassword}
                      onChange={(e) => setAccount((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className={inputClass}
                    />
                    {account.confirmPassword.length > 0 && (
                      <p className={`mt-1.5 text-xs font-medium ${passwordChecks.match ? 'text-emerald-600' : 'text-red-500'}`}>
                        {passwordChecks.match ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setActiveStep(1)}
                  className="w-full rounded-full bg-brand-purple py-3.5 text-sm font-semibold text-white transition hover:bg-brand-indigo disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>

                <p className="text-center text-xs text-slate-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => navigate('/creatorsLogin')} className="text-brand-purple hover:underline font-semibold">Sign in</button>
                </p>
              </>
            )}

            {/* ── STEP 1: Creator Agreement ───────────────────────────────── */}
            {activeStep === 1 && (
              <>
                <div>
                  <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-purple mb-4">
                    Final Step
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950">Creator Agreement</h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Read the agreement below and scroll to the bottom to enable sign-up.{' '}
                    <a href="/creator-agreement" target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">
                      Open full agreement ↗
                    </a>
                  </p>
                </div>

                {/* Scrollable agreement */}
                <div className="relative">
                  <div
                    ref={agreementRef}
                    onScroll={handleAgreementScroll}
                    className="h-[500px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs leading-6 text-slate-600 whitespace-pre-wrap"
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  >
                    {AGREEMENT_TEXT}
                  </div>
                  {!hasScrolledToBottom && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 rounded-b-2xl bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-2">
                      <span className="text-xs text-slate-400">↓ Scroll to read full agreement</span>
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div className={`space-y-3 transition-opacity duration-300 ${hasScrolledToBottom ? 'opacity-100' : 'opacity-30 pointer-events-none select-none'}`}>
                  {[
                    { key: 'agreeTerms' as const,    label: 'I have read and agree to the Creator Agreement.' },
                    { key: 'agreeRights' as const,   label: 'I confirm that I own or control all rights necessary for the content I upload.' },
                    { key: 'agreePolicy' as const,   label: 'I understand that YouMakeTV may remove content or suspend accounts for policy violations.' },
                    { key: 'agreePayments' as const, label: 'I understand that creator payouts, fees, and platform terms may change over time.' },
                    { key: 'agreeAccuracy' as const, label: 'I confirm that all information provided during onboarding is accurate.' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreement[item.key]}
                        onChange={(e) => setAgreement((p) => ({ ...p, [item.key]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-purple flex-none"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                {!hasScrolledToBottom && (
                  <p className="text-xs text-slate-400">Scroll to the bottom of the agreement to enable the required checkboxes.</p>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setActiveStep(0)} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={createProfile}
                    className="flex-1 rounded-full bg-brand-purple py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Create Creator Account →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right — Dynamic panel */}
          <RightPanel step={activeStep} />
        </div>
      </div>
    </div>
  );
}
