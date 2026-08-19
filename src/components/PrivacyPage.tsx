import SEOHead from './SEOHead';
import { PAGE_SEO } from '../lib/seo';

// This policy describes what the platform actually does today.
//
// The previous version described a product that does not exist: banking and
// payout data, tax identification numbers, KYC documents retained for five
// years, a payment processor storing card last-4, seven-year transaction
// records. None of that is collected, because none of it exists yet. At the
// same time the real recipients of real data — Supabase, Vercel, Resend and the
// CRM that every contact lead is forwarded to — were named nowhere.
//
// Anything added here later must describe something the code actually does.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="text-sm text-slate-600 leading-7 space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <SEOHead {...PAGE_SEO['/privacy']} />

      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
          Legal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Effective date: January 1, 2026 · Last updated: August 19, 2026</p>
        <p className="mt-4 text-slate-600 leading-7">
          YouMakeTV.ai ("YouMakeTV," "we," "us," or "our") operates a streaming platform for
          AI-generated films. This Privacy Policy describes what information we collect, how we use
          it, who else sees it, and what you can ask us to do about it.
        </p>
        <p className="mt-3 text-slate-600 leading-7">
          It describes the platform as it works today. YouMakeTV is in beta: there is no payment
          processing, no creator payout system and no identity verification, so we do not collect
          payment details, banking information, tax identification or identity documents. If that
          changes, this policy will change with it before the feature launches — not after.
        </p>
      </div>

      {/* Sections */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-10 divide-y divide-slate-100">

        <Section title="1. Information We Collect">
          <p><strong>Viewer accounts (stored in your browser, not on our servers)</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              A username and whether you have activated a YouMake+ membership in this prototype.
              This is saved in your browser's local storage on the device you used. It is not sent
              to us, and there is no account record on our servers to look up, export or breach.
            </li>
            <li>Passwords typed into the sign-in form are not transmitted or stored anywhere.</li>
          </ul>

          <p><strong>Creator profiles (also stored in your browser)</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Your name, studio name and email address, plus any film details you enter, saved in
              your browser's local storage. Creator onboarding does not ask for a date of birth, a
              government ID or a photograph, and does not upload anything to us.
            </li>
          </ul>

          <p><strong>Messages you send us</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              What you type into the contact form: name, email address, optional phone number,
              subject and message.
            </li>
            <li>
              Attribution attached to that submission: the page you sent it from, the referring URL,
              and any campaign parameters present in the address bar (<code>utm_source</code>,{' '}
              <code>utm_medium</code>, <code>utm_campaign</code>, <code>utm_term</code>,{' '}
              <code>utm_content</code>, <code>gclid</code>, <code>fbclid</code>). This tells us which
              campaign or link brought you here.
            </li>
          </ul>

          <p><strong>Anonymous product events</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              One record per meaningful action — a trailer played, a purchase button clicked, a
              sign-in, a membership activation, a film page opened — containing the event type, the
              film's catalog id and title, and a timestamp.
            </li>
            <li>
              These records carry no IP address, no account identifier and no cookie. They cannot be
              traced back to you, which also means we cannot delete "your" events on request: there
              is no "your" in them.
            </li>
          </ul>

          <p><strong>Content creators publish</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Films, trailers, cover images, titles, descriptions and other metadata submitted for publication.</li>
          </ul>

          <p><strong>Standard server logs</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Our hosting provider records ordinary request logs (IP address, user agent, URL,
              timestamp) for delivery, security and abuse prevention. We do not build profiles from
              them.
            </li>
          </ul>
        </Section>

        <div className="pt-10">
          <Section title="2. What We Do Not Collect">
            <p>
              To be explicit, because prior versions of this policy said otherwise: we do not
              collect or store payment card details, bank account or payout information, tax
              identification numbers, government-issued identity documents, photographs taken for
              identity verification, or dates of birth. No payment processor is connected to the
              platform, and creator earnings figures shown in the creator workspace are simulated
              until billing launches.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. How We Use Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>To operate the platform and serve the film catalog;</li>
              <li>To answer the messages you send us, and to follow up about a request you made;</li>
              <li>To understand, in aggregate, which films and pages people engage with, so we can improve the catalog and the site;</li>
              <li>To detect and prevent abuse, fraud and automated traffic;</li>
              <li>To comply with legal obligations that apply to us.</li>
            </ul>
            <p>
              We do not sell personal information, and we do not share it with third parties for
              their own marketing purposes.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Cookies, Local Storage and Analytics">
            <p>
              <strong>Local storage.</strong> We use your browser's local storage to remember your
              viewer or creator profile and your analytics choice. This is functional storage on
              your device — clearing your browser data removes it, and nothing is copied to us.
            </p>
            <p>
              <strong>Analytics.</strong> If analytics are enabled on this deployment, we ask before
              anything loads: a banner offers "Allow analytics" or "Decline". If you decline, or if
              you never answer, no analytics or advertising script is loaded, and no analytics cookie
              is set. If you accept, Google Analytics / Google Tag Manager and the Meta Pixel may be
              loaded to measure page views and engagement. You can change your mind by clearing this
              site's data in your browser, which restores the choice prompt.
            </p>
            <p>
              We do not run advertising on the platform and do not allow ad retargeting based on
              your activity here.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Service Providers We Share Data With">
            <p>
              These are the companies and systems that process data on our behalf. This list is
              exhaustive as of the date at the top of this page:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Vercel Inc.</strong> (United States) — hosting, content delivery and the
                serverless functions behind the site. Processes request logs and anything you submit
                in transit.
              </li>
              <li>
                <strong>Supabase Inc.</strong> (United States) — the database and file storage
                holding the film catalog, cover images, trailers and the anonymous product events
                described in Section 1.
              </li>
              <li>
                <strong>Resend</strong> (United States) — delivers contact-form submissions to our
                support inbox by email.
              </li>
              <li>
                <strong>Growth OS</strong> — our own internal business system. Every contact-form
                submission is forwarded to it, including the attribution parameters listed in
                Section 1, so we can track and answer enquiries. It is operated by us, not sold to
                or shared with anyone else.
              </li>
              <li>
                <strong>Google (Analytics / Tag Manager) and Meta (Pixel)</strong> — loaded{' '}
                <em>only</em> if analytics are enabled on this deployment <em>and</em> you have
                accepted the analytics banner. Declining means these are never contacted.
              </li>
            </ul>
            <p>
              We may also disclose information where required by law, court order or valid legal
              process, or to protect the rights, safety or property of YouMakeTV or others; and, in
              the event of a merger, acquisition or sale of assets, to the acquiring party, subject
              to this policy or a materially equivalent one.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. International Data Transfers">
            <p>
              YouMakeTV is operated from the United States and the providers listed in Section 5
              store data in the United States. If you use the Platform from elsewhere, the limited
              information described above is processed in the United States, where data protection
              law may differ from that of your home country.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. How Long We Keep Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Profiles in your browser:</strong> until you clear your browser data or sign
                out. We hold no copy.
              </li>
              <li>
                <strong>Contact-form submissions:</strong> kept in our support inbox and internal
                business system for as long as needed to handle the enquiry and to keep a record of
                our correspondence; deleted on request.
              </li>
              <li>
                <strong>Anonymous product events:</strong> retained to measure trends over time.
                Because they contain no identifier, they are not linked to any person.
              </li>
              <li>
                <strong>Published film content:</strong> retained while it remains on the platform
                and for a short period afterwards, as set out in the Creator Agreement.
              </li>
              <li>
                <strong>Server logs:</strong> retained by our hosting provider under its standard
                retention period.
              </li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Security">
            <p>
              All traffic is served over TLS. Database credentials with write access exist only on
              the server side and are never sent to the browser; the public key shipped with the site
              can read the film catalog and nothing else, enforced by row-level security. The
              analytics event table is closed to that key entirely. Administrative access requires a
              signed, expiring session issued server-side.
            </p>
            <p>
              No system is perfectly secure and we cannot guarantee absolute security. If we become
              aware of a breach materially affecting personal data, we will notify affected people as
              required by applicable law.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Your Rights and Choices">
            <p>Depending on where you live, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ask what personal information we hold about you, and receive a copy;</li>
              <li>Ask us to correct information that is wrong or incomplete;</li>
              <li>Ask us to delete information we hold about you;</li>
              <li>Object to or ask us to restrict certain processing;</li>
              <li>Withdraw consent you previously gave (for example, for analytics).</li>
            </ul>
            <p>
              In practice, most of what the platform stores about you is on your own device: clearing
              this site's data in your browser deletes your viewer or creator profile immediately,
              without asking us. For anything else — chiefly a message you sent us — email{' '}
              <span className="text-brand-purple">privacy@youmaketv.ai</span> and we will respond
              within thirty (30) days.
            </p>
            <p>
              <strong>California residents:</strong> we do not sell or share personal information as
              those terms are defined by the CCPA/CPRA.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="10. Children and Content Ratings">
            <p>
              The Platform is not directed at children under 13, and we do not knowingly collect
              personal information from them. The catalog carries content ratings from G to R; each
              film page displays its rating, and signing in requires confirming that you are 18 or
              older.
            </p>
            <p>
              If you believe a child under 13 has provided us with personal information, contact us
              at <span className="text-brand-purple">privacy@youmaketv.ai</span> and we will delete
              it.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="11. Third-Party Links">
            <p>
              The Platform links to third-party websites and AI tool providers. We are not
              responsible for their privacy practices; review their policies before using them.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="12. Changes to This Policy">
            <p>
              We will update this Policy when our practices change. Material changes will be
              announced by email or a prominent notice on the Platform at least fifteen (15) days
              before they take effect, and the "Last updated" date above will change.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="13. Contact">
            <p>For privacy questions, requests or complaints:</p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-1">
              <p className="font-semibold text-slate-950">Privacy — YouMakeTV.ai</p>
              <p>Email: <span className="text-brand-purple">privacy@youmaketv.ai</span></p>
            </div>
            <p>
              EEA/UK residents who are not satisfied with our response may lodge a complaint with
              their local data protection authority.
            </p>
          </Section>
        </div>

      </div>

      <p className="text-xs text-center text-slate-400 pb-4">
        YouMakeTV.ai · privacy@youmaketv.ai
      </p>
    </div>
  );
}
