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
          YouMakeTV.ai ("YouMakeTV," "we," "us," or "our") is committed to protecting your privacy.
          This Privacy Policy describes how we collect, use, share, and protect personal information
          when you use our website, applications, and services (collectively, the "Platform"). It also
          describes your rights and choices regarding your information.
        </p>
        <p className="mt-3 text-slate-600 leading-7">
          By using the Platform, you agree to the collection and use of information in accordance
          with this Privacy Policy. If you do not agree, please discontinue use of the Platform.
        </p>
      </div>

      {/* Sections */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-10 divide-y divide-slate-100">

        <Section title="1. Information We Collect">
          <p>We collect the following categories of information:</p>

          <p><strong>Account Information</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Username, email address, and password when you create a viewer account;</li>
            <li>Profile preferences and account settings you configure.</li>
          </ul>

          <p><strong>Creator Information</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full legal name, studio name, date of birth, and country of residence collected during creator onboarding;</li>
            <li>Government-issued identity documents and selfie images collected for KYC verification;</li>
            <li>Banking or payment account information for payout processing;</li>
            <li>Tax identification numbers and related tax compliance documentation.</li>
          </ul>

          <p><strong>Transaction and Payment Information</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Purchase history, transaction identifiers, and subscription status;</li>
            <li>Payment method type (e.g., credit card network) and last four digits — full card numbers are processed by our payment provider and not stored on our servers.</li>
          </ul>

          <p><strong>Usage and Technical Data</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pages and films viewed, search queries, and interactions with Platform features;</li>
            <li>IP address, browser type and version, operating system, device identifiers, and referring URLs;</li>
            <li>Session duration, click-through data, and other engagement metrics.</li>
          </ul>

          <p><strong>Content You Upload (Creators)</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Films, thumbnails, trailers, titles, descriptions, and other metadata you submit.</li>
          </ul>

          <p><strong>Communications</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Messages you send to our support team or through contact forms.</li>
          </ul>
        </Section>

        <div className="pt-10">
          <Section title="2. How We Collect Information">
            <p>We collect information in the following ways:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Directly from you:</strong> When you create an account, complete onboarding, make a purchase, or contact support;</li>
              <li><strong>Automatically:</strong> Through cookies, web beacons, log files, and similar tracking technologies as you use the Platform;</li>
              <li><strong>From third parties:</strong> From payment processors, identity verification providers, and analytics providers, subject to their own privacy policies;</li>
              <li><strong>From your device:</strong> Device identifiers, browser settings, and similar technical information collected when you access the Platform.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, operate, maintain, and improve the Platform;</li>
              <li>Process purchases and distribute creator earnings;</li>
              <li>Verify identity and complete KYC requirements for creator accounts;</li>
              <li>Personalize your content discovery and viewing experience;</li>
              <li>Send transactional communications including purchase confirmations, payout notifications, and account security alerts;</li>
              <li>Respond to your support requests and inquiries;</li>
              <li>Detect, investigate, and prevent fraud, abuse, and violations of our Terms;</li>
              <li>Comply with applicable legal obligations, including tax reporting and regulatory compliance;</li>
              <li>Analyze Platform usage trends to improve features and content recommendations;</li>
              <li>Send marketing communications where you have consented (see Section 5).</li>
            </ul>
            <p>We do not sell your personal information to third parties for their own marketing purposes.</p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Cookies and Tracking Technologies">
            <p>
              We use cookies and similar tracking technologies to maintain your session, remember your
              preferences, and analyze Platform usage. Types of cookies we use include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential cookies:</strong> Required for core Platform functions such as authentication and session management. These cannot be disabled without affecting Platform functionality;</li>
              <li><strong>Analytics cookies:</strong> Used to understand how visitors interact with the Platform (e.g., pages visited, time on site). We use anonymized or aggregated analytics data and do not link it to your personally identifiable information;</li>
              <li><strong>Preference cookies:</strong> Store your settings such as language, content preferences, and display options;</li>
              <li><strong>Security cookies:</strong> Help detect fraud and protect account security.</li>
            </ul>
            <p>
              We do not use third-party advertising networks or allow ad retargeting based on your
              Platform activity. You may disable non-essential cookies through your browser settings.
              Note that disabling certain cookies may impair Platform functionality.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Marketing Communications">
            <p>
              With your consent, we may send you marketing communications about new content, creator
              opportunities, platform features, and promotions. You can opt out of marketing
              communications at any time by:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Clicking the "unsubscribe" link in any marketing email;</li>
              <li>Updating your communication preferences in your account settings;</li>
              <li>Contacting us at <span className="text-brand-purple">privacy@youmaketv.ai</span>.</li>
            </ul>
            <p>
              Opting out of marketing emails does not affect transactional or account communications
              (such as purchase receipts or payout notifications), which we send based on our contract
              with you.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. Data Sharing and Disclosure">
            <p>We may share your information with the following categories of recipients:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Payment processors:</strong> To facilitate viewer purchases and creator payouts.
                Payment processors receive only the information necessary to process transactions and
                are not authorized to use it for other purposes.
              </li>
              <li>
                <strong>Identity verification providers:</strong> To complete creator KYC requirements.
                These providers process your identity documents under their own privacy policies.
              </li>
              <li>
                <strong>Analytics providers:</strong> To analyze Platform usage using aggregated or
                anonymized data. We do not share personally identifiable information with analytics
                providers for their own marketing purposes.
              </li>
              <li>
                <strong>Cloud infrastructure and CDN providers:</strong> To host the Platform and
                deliver content to viewers globally.
              </li>
              <li>
                <strong>Legal and regulatory authorities:</strong> When required by law, court order,
                legal process, or to protect the rights, safety, or property of YouMakeTV or others.
              </li>
              <li>
                <strong>Business transfers:</strong> In connection with a merger, acquisition,
                reorganization, or sale of assets, subject to the acquirer agreeing to honor this
                Privacy Policy or a materially equivalent policy.
              </li>
            </ul>
            <p>
              All third-party service providers are contractually required to protect your information
              and may use it only for the purposes for which it was shared.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. International Data Transfers">
            <p>
              YouMakeTV is based in the United States. If you use the Platform from outside the
              United States, your information may be transferred to, processed, and stored in the
              United States and other countries where data protection laws may differ from those in
              your home country.
            </p>
            <p>
              For users in the European Economic Area (EEA), United Kingdom, or Switzerland, we transfer
              personal data to the United States pursuant to Standard Contractual Clauses (SCCs) approved
              by the European Commission, or other appropriate transfer mechanisms. By using the Platform,
              you acknowledge and consent to such transfers.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Data Retention">
            <p>
              We retain personal information for as long as necessary to fulfill the purposes described
              in this Policy, maintain your account, comply with legal obligations, and resolve disputes.
              Specific retention periods:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account data:</strong> Retained while your account is active; deleted or anonymized within 90 days of account deletion, subject to legal retention requirements;</li>
              <li><strong>Transaction records:</strong> Retained for seven (7) years for tax and accounting compliance;</li>
              <li><strong>Creator KYC documents:</strong> Retained for the duration of your creator account and for five (5) years thereafter as required by anti-money laundering laws;</li>
              <li><strong>Usage logs:</strong> Retained for up to 24 months in identifiable form, then deleted or aggregated;</li>
              <li><strong>Support communications:</strong> Retained for three (3) years after resolution.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Security Practices">
            <p>
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Encryption in transit using Transport Layer Security (TLS);</li>
              <li>Encryption at rest for sensitive data including payment information and identity documents;</li>
              <li>Access controls limiting which personnel can access personal information based on job function;</li>
              <li>Regular security assessments and vulnerability management;</li>
              <li>Incident response procedures for potential data breaches.</li>
            </ul>
            <p>
              No security system is completely impenetrable. We cannot guarantee the absolute security
              of your information. If we become aware of a security breach materially affecting your
              personal data, we will notify you as required by applicable law.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="10. Your Rights and Choices">
            <p>
              Depending on your jurisdiction, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you;</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information;</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements and ongoing contractual obligations;</li>
              <li><strong>Portability:</strong> Request your information in a structured, commonly used, machine-readable format;</li>
              <li><strong>Objection:</strong> Object to processing of your information based on legitimate interests;</li>
              <li><strong>Restriction:</strong> Request that we restrict processing of your information in certain circumstances;</li>
              <li><strong>Withdrawal of consent:</strong> Withdraw consent for processing based on consent at any time (without affecting prior processing).</li>
            </ul>
            <p>
              <strong>California residents (CCPA):</strong> You have the right to know what personal
              information we collect, the right to delete your information, and the right to opt out
              of the "sale" of personal information. We do not sell personal information.
            </p>
            <p>
              To exercise any of these rights, contact us at{' '}
              <span className="text-brand-purple">privacy@youmaketv.ai</span>. We will respond within
              thirty (30) days. We may need to verify your identity before fulfilling your request.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="11. Children's Privacy">
            <p>
              The Platform is not directed at children under the age of 13. We do not knowingly collect
              personal information from children under 13. If we become aware that we have collected
              personal information from a child under 13 without verifiable parental consent, we will
              take steps to delete that information promptly.
            </p>
            <p>
              If you believe that a child under 13 has provided us with personal information, please
              contact us at <span className="text-brand-purple">privacy@youmaketv.ai</span>.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="12. Third-Party Links">
            <p>
              The Platform may contain links to third-party websites, services, or AI tool providers.
              We are not responsible for the privacy practices of those third parties. We encourage
              you to review the privacy policies of any third-party services you access through the Platform.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="13. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices,
              technology, legal requirements, or other factors. When we make material changes, we
              will notify you via email or a prominent notice on the Platform at least fifteen (15)
              days before the change takes effect.
            </p>
            <p>
              Your continued use of the Platform after the updated Policy takes effect constitutes
              your acceptance. We encourage you to review this Policy periodically.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="14. Contact and Data Protection">
            <p>
              For privacy-related questions, requests, or complaints, contact our Data Protection team:
            </p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-1">
              <p className="font-semibold text-slate-950">Privacy — YouMakeTV.ai</p>
              <p>Email: <span className="text-brand-purple">privacy@youmaketv.ai</span></p>
            </div>
            <p>
              EEA/UK residents who are not satisfied with our response may lodge a complaint with their
              local data protection authority.
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
