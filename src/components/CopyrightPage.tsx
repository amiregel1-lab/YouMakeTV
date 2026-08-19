import SEOHead from './SEOHead';
import { PAGE_SEO } from '../lib/seo';

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="space-y-3 scroll-mt-24">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="text-sm text-slate-600 leading-7 space-y-3">{children}</div>
    </div>
  );
}

export default function CopyrightPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <SEOHead {...PAGE_SEO['/copyright']} />

      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
          Legal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Copyright &amp; DMCA Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Effective date: January 1, 2026 · Last updated: June 1, 2026</p>
        <p className="mt-4 text-slate-600 leading-7">
          YouMakeTV.ai respects intellectual property rights and expects all users and creators to do the same.
          This policy explains how we handle copyright complaints, DMCA takedown notices, and counter-notifications
          under the Digital Millennium Copyright Act (17 U.S.C. § 512).
        </p>
      </div>

      {/* Sections */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-10 divide-y divide-slate-100">

        <Section title="1. Our Copyright Policy">
          <p>
            It is our policy to respond to clear notices of alleged copyright infringement that comply with the
            Digital Millennium Copyright Act. If you believe that content on YouMakeTV.ai infringes your copyright,
            you may submit a DMCA takedown notice using the procedure described below.
          </p>
          <p>
            We reserve the right to remove content alleged to be infringing without prior notice, at our sole
            discretion, and without liability to you. We also reserve the right to terminate user accounts and
            creator accounts of repeat infringers.
          </p>
          <p>
            Please note that under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that
            content is infringing may be subject to liability. If you are not sure whether material available
            online infringes your copyright, we recommend consulting an attorney before sending a DMCA notice.
          </p>
        </Section>

        <div className="pt-10">
          <Section title="2. Filing a DMCA Takedown Notice">
            <p>
              To submit a valid DMCA takedown notice, you must be the copyright owner of the material in question,
              or an authorized representative acting on behalf of the copyright owner. Your notice must be submitted
              in writing (electronic form is acceptable) and must include all of the elements listed in Section 3 below.
            </p>
            <p>
              Incomplete or defective notices may not receive a response. We reserve the right to request additional
              information before processing your notice.
            </p>
          </Section>
        </div>

        <div className="pt-10" id="dmca-notice">
          <Section title="3. Required Elements of a DMCA Takedown Notice">
            <p>Your DMCA notice must include all of the following:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Identification of the copyrighted work:</strong> A description of the copyrighted work
                you claim has been infringed, or, if multiple works are covered by a single notification, a
                representative list of such works.
              </li>
              <li>
                <strong>Identification of the infringing material:</strong> A description of the material that
                you claim is infringing and the location on the platform where the material can be found
                (e.g., the URL of the specific film or page).
              </li>
              <li>
                <strong>Your contact information:</strong> Your name, address, telephone number, and email address.
              </li>
              <li>
                <strong>Good faith statement:</strong> A statement that you have a good faith belief that use of
                the material in the manner complained of is not authorized by the copyright owner, its agent,
                or the law.
              </li>
              <li>
                <strong>Accuracy statement:</strong> A statement that the information in the notification is
                accurate and, under penalty of perjury, that you are the copyright owner or are authorized to
                act on behalf of the copyright owner.
              </li>
              <li>
                <strong>Signature:</strong> Your physical or electronic signature.
              </li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Submitting Your Notice">
            <p>Send your completed DMCA takedown notice to our designated DMCA Agent:</p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-1">
              <p className="font-semibold text-slate-950">DMCA Agent — YouMakeTV.ai</p>
              <p>Email: <span className="text-brand-purple">info@youmaketv.ai</span></p>
              <p>Subject line: <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">DMCA Takedown Notice</span></p>
            </div>
            <p>
              We process all valid DMCA notices within five (5) business days. Upon receipt of a valid notice,
              we will promptly remove or disable access to the content identified as infringing and notify the
              creator account associated with that content.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Counter-Notification Procedure">
            <p>
              If you are a creator whose content has been removed following a DMCA takedown notice and you
              believe the removal was a mistake or misidentification, you may submit a counter-notification.
              A counter-notification must be submitted in writing to our DMCA Agent and must include all of
              the elements listed in Section 6 below.
            </p>
            <p>
              Upon receipt of a valid counter-notification, we will forward a copy to the original complainant.
              If the complainant does not file a court action against you within ten (10) business days of
              receiving the counter-notification, we may restore the removed content at our sole discretion.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. Required Elements of a Counter-Notification">
            <p>Your counter-notification must include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Identification of removed content:</strong> A description of the content that was
                removed and the location where it appeared before removal.
              </li>
              <li>
                <strong>Statement under penalty of perjury:</strong> A statement under penalty of perjury
                that you have a good faith belief that the material was removed as a result of a mistake
                or misidentification.
              </li>
              <li>
                <strong>Consent to jurisdiction:</strong> A statement that you consent to the jurisdiction
                of the Federal District Court for the judicial district in which your address is located
                (or, if located outside the U.S., any judicial district in which YouMakeTV.ai may be found),
                and that you will accept service of process from the person who provided the original DMCA notice.
              </li>
              <li>
                <strong>Your contact information:</strong> Your name, address, telephone number, and email address.
              </li>
              <li>
                <strong>Signature:</strong> Your physical or electronic signature.
              </li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. Repeat Infringer Policy">
            <p>
              It is our policy to terminate, in appropriate circumstances, the accounts of users and creators
              who are found to be repeat infringers of copyright. We consider a user or creator to be a repeat
              infringer if we have received more than two (2) valid DMCA notices regarding their uploaded content
              within any rolling twelve (12) month period, or if they have otherwise demonstrated a pattern of
              infringing behavior.
            </p>
            <p>
              Account termination for repeat infringement is permanent. Terminated creators forfeit any pending
              earnings below the minimum payout threshold. Forfeited earnings are subject to applicable law.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Good Faith and Abuse Prevention">
            <p>
              We take good faith seriously. Sending a DMCA notice for content that does not infringe your
              copyright — for example, to suppress competition or remove lawfully created content — may expose
              you to liability under 17 U.S.C. § 512(f) and applicable state law.
            </p>
            <p>
              Similarly, submitting a counter-notification for content that you know is infringing may expose
              you to liability. We reserve the right to refer cases of apparent DMCA abuse to legal authorities.
            </p>
            <p>
              If you have any doubt about whether a use of content infringes your copyright, or whether your
              own content is infringing, we strongly recommend consulting an intellectual property attorney
              before taking action.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Other Intellectual Property Complaints">
            <p>
              This policy addresses copyright claims under the DMCA. If you have a claim involving trademark
              infringement, defamation, violation of right of publicity, or other intellectual property concerns,
              please contact us at <span className="text-brand-purple">info@youmaketv.ai</span>. We will review
              such claims on a case-by-case basis and take appropriate action in our sole discretion.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="10. Contact">
            <p>For copyright-related questions or to submit a DMCA notice:</p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-1">
              <p className="font-semibold text-slate-950">DMCA &amp; Legal — YouMakeTV.ai</p>
              <p>Email: <span className="text-brand-purple">info@youmaketv.ai</span></p>
              <p>General legal matters: <span className="text-brand-purple">info@youmaketv.ai</span></p>
            </div>
          </Section>
        </div>

      </div>

      <p className="text-xs text-center text-slate-400 pb-4">
        YouMakeTV.ai · info@youmaketv.ai
      </p>
    </div>
  );
}
