import SEOHead from './SEOHead';

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="space-y-3 scroll-mt-24">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="text-sm text-slate-600 leading-7 space-y-3">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <SEOHead
        title="Terms of Service | YouMakeTV.ai"
        description="Read the YouMakeTV.ai Terms of Service, Creator Agreement, and DMCA / Copyright Policy."
        canonical="/terms"
      />

      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
          Legal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Terms of Service</h1>
        <p className="mt-3 text-sm text-slate-500">Effective date: January 1, 2026 · Last updated: June 1, 2026</p>
        <p className="mt-4 text-slate-600 leading-7">
          Welcome to YouMakeTV.ai. By accessing or using our platform, you agree to be bound by these Terms of Service.
          Please read them carefully. If you do not agree, do not use the platform.
        </p>
      </div>

      {/* Sections */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-10 divide-y divide-slate-100">

        <Section title="1. Acceptance of Terms">
          <p>
            By creating an account, uploading content, or purchasing access to any film on YouMakeTV.ai,
            you agree to these Terms of Service and our Privacy Policy. These terms apply to all visitors,
            viewers, and creators.
          </p>
        </Section>

        <div className="pt-10">
          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years of age to use YouMakeTV.ai. Creator accounts require you to be
              at least 18 years of age and to complete identity verification (KYC). By using the platform,
              you represent that you meet these requirements.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. Viewer Terms">
            <p>
              Viewers may browse content for free and purchase access to paid films on a per-film basis.
              Purchases are final and non-refundable unless the content is materially unavailable.
              YouMake+ subscriptions renew monthly and may be cancelled at any time.
            </p>
            <p>
              Content accessed through YouMakeTV.ai is licensed for personal, non-commercial viewing only.
              You may not copy, distribute, or re-upload any content from the platform.
            </p>
          </Section>
        </div>

        <div className="pt-10" id="creator-agreement">
          <Section id="creator-agreement" title="4. Creator Agreement">
            <p>
              By uploading content to YouMakeTV.ai, creators agree to the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Creators retain full intellectual property rights over all uploaded content.</li>
              <li>Creators grant YouMakeTV.ai a non-exclusive, worldwide license to distribute, display, and promote their content on the platform.</li>
              <li>Creators are responsible for ensuring they hold all necessary rights to any AI tools, assets, voice acting, music, or other elements used in their films.</li>
              <li>Creators earn a revenue share of 30% on paid watches, increasing to 40% after 500 paid watches per film.</li>
              <li>Earnings are paid out monthly on the 1st of each month, subject to a minimum threshold of $25.</li>
              <li>YouMakeTV.ai reserves the right to remove content that violates these terms, applicable law, or platform content guidelines.</li>
              <li>Creators may remove their content at any time, subject to a 30-day processing period for pending payouts.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Content Guidelines">
            <p>All content uploaded to YouMakeTV.ai must:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Be primarily or substantially AI-generated.</li>
              <li>Not contain illegal content, including content that sexualizes minors.</li>
              <li>Not contain content that incites violence or discrimination.</li>
              <li>Not infringe on third-party intellectual property rights.</li>
              <li>Be accurately represented in its title, description, and rating.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10" id="dmca">
          <Section id="dmca" title="6. DMCA / Copyright Policy">
            <p>
              YouMakeTV.ai respects intellectual property rights and complies with the Digital Millennium
              Copyright Act (DMCA). If you believe content on our platform infringes your copyright,
              please submit a DMCA takedown notice to:
            </p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-1">
              <p className="font-semibold text-slate-950">DMCA Agent — YouMakeTV.ai</p>
              <p>Email: <span className="text-brand-purple">dmca@youmaketv.ai</span></p>
            </div>
            <p>Your notice must include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identification of the copyrighted work claimed to be infringed.</li>
              <li>Identification of the infringing material and its location on the platform.</li>
              <li>Your contact information.</li>
              <li>A statement of good faith belief that the use is not authorized.</li>
              <li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
              <li>Your electronic or physical signature.</li>
            </ul>
            <p>
              Counter-notifications may be submitted to the same address. Repeated infringement may result
              in account termination.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. Limitation of Liability">
            <p>
              YouMakeTV.ai provides the platform on an "as is" and "as available" basis. We make no
              warranties, express or implied, regarding the platform's availability, accuracy, or fitness
              for a particular purpose. To the maximum extent permitted by law, YouMakeTV.ai shall not be
              liable for any indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Changes to These Terms">
            <p>
              We may update these Terms of Service from time to time. Continued use of the platform after
              changes are posted constitutes your acceptance of the revised terms. We will provide notice
              of material changes via email or platform announcement.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Governing Law">
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard
              to its conflict of law provisions. Disputes shall be resolved in binding arbitration except
              where prohibited by law.
            </p>
          </Section>
        </div>

      </div>

      <p className="text-xs text-center text-slate-400 pb-4">
        Questions about these terms? Contact us at <span className="text-brand-purple">legal@youmaketv.ai</span>
      </p>
    </div>
  );
}
