import SEOHead from './SEOHead';

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
      <SEOHead
        title="Privacy Policy | YouMakeTV.ai"
        description="Learn how YouMakeTV.ai collects, uses, and protects your personal data."
        canonical="/privacy"
      />

      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
          Legal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Effective date: January 1, 2026 · Last updated: June 1, 2026</p>
        <p className="mt-4 text-slate-600 leading-7">
          YouMakeTV.ai is committed to protecting your privacy. This policy describes what information we
          collect, how we use it, and your rights regarding your data.
        </p>
      </div>

      {/* Sections */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-10 divide-y divide-slate-100">

        <Section title="1. Information We Collect">
          <p>We may collect the following categories of information:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account information:</strong> Username, email address, and password when you create an account.</li>
            <li><strong>Creator information:</strong> Full legal name, studio name, bank account details, and identity documents collected during KYC verification.</li>
            <li><strong>Usage data:</strong> Pages visited, films watched, search queries, and interactions with the platform.</li>
            <li><strong>Payment data:</strong> Purchase history and transaction identifiers. Full payment card details are processed by our payment provider and are not stored on our servers.</li>
            <li><strong>Device data:</strong> IP address, browser type, operating system, and device identifiers.</li>
          </ul>
        </Section>

        <div className="pt-10">
          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, operate, and improve the YouMakeTV.ai platform.</li>
              <li>Process payments and distribute creator earnings.</li>
              <li>Personalize your content discovery experience.</li>
              <li>Send transactional communications such as purchase confirmations and payout notifications.</li>
              <li>Prevent fraud, abuse, and unauthorized access.</li>
              <li>Comply with applicable legal obligations.</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. Cookies and Tracking">
            <p>
              We use cookies and similar tracking technologies to maintain your session, remember your
              preferences, and analyze platform usage. You may disable cookies through your browser settings,
              but some features of the platform may not function correctly without them.
            </p>
            <p>
              We use anonymized analytics to understand aggregate usage patterns. We do not use third-party
              advertising networks or sell behavioral data to advertisers.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Data Sharing">
            <p>We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Payment processors:</strong> To facilitate purchases and creator payouts.</li>
              <li><strong>Identity verification providers:</strong> To complete creator KYC requirements.</li>
              <li><strong>Infrastructure providers:</strong> Cloud hosting and content delivery services.</li>
              <li><strong>Legal authorities:</strong> When required by law, court order, or to protect platform integrity.</li>
            </ul>
            <p>All third-party providers are contractually bound to protect your data and may not use it for their own purposes.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you delete your account,
              we will delete or anonymize your personal data within 90 days, except where retention is required
              by law (e.g., financial records for tax purposes, which may be retained for up to 7 years).
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. Your Rights">
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <span className="text-brand-purple">privacy@youmaketv.ai</span>.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. Security">
            <p>
              We implement industry-standard security measures including encryption in transit (TLS),
              encryption at rest for sensitive data, and access controls limiting who can view personal
              information. No system is completely secure, and we cannot guarantee absolute security.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Children's Privacy">
            <p>
              YouMakeTV.ai is not directed at children under 13. We do not knowingly collect personal
              information from children under 13. If you believe a child has provided us with personal
              information, please contact us immediately at <span className="text-brand-purple">privacy@youmaketv.ai</span>.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes
              via email or prominent notice on the platform. Your continued use after changes are
              posted constitutes acceptance of the updated policy.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="10. Contact">
            <p>
              For privacy-related questions or requests, contact our Data Protection team at{' '}
              <span className="text-brand-purple">privacy@youmaketv.ai</span>.
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
