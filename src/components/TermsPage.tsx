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
        description="Read the YouMakeTV.ai Terms of Service governing viewer and creator use of the platform."
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
          Welcome to YouMakeTV.ai. These Terms of Service ("Terms") govern your access to and use of
          the YouMakeTV.ai website, mobile applications, creator tools, and all related services
          (collectively, the "Platform") operated by YouMakeTV.ai ("YouMakeTV," "we," "us," or "our").
          By accessing or using the Platform in any manner, you agree to be bound by these Terms.
          If you do not agree, do not use the Platform.
        </p>
      </div>

      {/* Sections */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-10 divide-y divide-slate-100">

        <Section title="1. Acceptance of Terms">
          <p>
            By creating an account, browsing the Platform, purchasing access to any film, or uploading
            content, you confirm that you have read, understood, and agree to these Terms and our
            Privacy Policy. These Terms apply to all visitors, viewers, and creators. If you are using
            the Platform on behalf of an organization, you represent that you have authority to bind
            that organization to these Terms.
          </p>
          <p>
            These Terms incorporate by reference our Privacy Policy, Copyright &amp; DMCA Policy, and
            (for creators) the Creator Agreement. In the event of any conflict between these Terms and
            the Creator Agreement, the Creator Agreement shall control with respect to creator-specific matters.
          </p>
        </Section>

        <div className="pt-10">
          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years of age to use the Platform. If you are between the ages of
              13 and 18, you may only use the Platform with the consent and supervision of a parent or
              legal guardian who agrees to be bound by these Terms.
            </p>
            <p>
              Creator accounts require you to be at least 18 years of age and to complete identity
              verification (KYC) before accessing creator-specific features. By applying for a creator
              account, you represent that you meet these requirements.
            </p>
            <p>
              The Platform is not available to persons barred from receiving services under the laws of
              the United States or any other applicable jurisdiction. By using the Platform, you represent
              that you are not subject to any such bar.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. User Accounts">
            <p>
              You may browse certain content without creating an account. To purchase content, subscribe,
              or access personalized features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate, current, and complete information when creating your account;</li>
              <li>Maintain and promptly update your account information;</li>
              <li>Maintain the security and confidentiality of your account credentials;</li>
              <li>Not share your account with any third party or allow anyone else to access your account;</li>
              <li>Notify us immediately of any unauthorized access to or use of your account.</li>
            </ul>
            <p>
              You are solely responsible for all activity that occurs under your account. YouMakeTV
              shall not be liable for any loss or damage arising from your failure to maintain account
              security. YouMakeTV reserves the right to disable accounts that violate these Terms.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Platform Rules and Prohibited Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable law or regulation;</li>
              <li>Attempt to reverse engineer, scrape, or extract data from the Platform by automated means without our express written permission;</li>
              <li>Circumvent, disable, or otherwise interfere with any security or access-control features of the Platform;</li>
              <li>Upload, transmit, or distribute malware, viruses, or any other disruptive or harmful code;</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity;</li>
              <li>Use the Platform to send unsolicited communications (spam);</li>
              <li>Attempt to gain unauthorized access to any portion of the Platform or any other accounts, systems, or networks;</li>
              <li>Interfere with or disrupt the Platform's servers, networks, or infrastructure;</li>
              <li>Facilitate or enable any third party to do any of the foregoing.</li>
            </ul>
            <p>
              YouMakeTV reserves the right, in its sole discretion, to remove content, restrict access,
              suspend accounts, or take any other action it deems necessary in response to suspected
              violations of these rules.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. Prohibited Content">
            <p>Users and creators may not post, upload, or distribute any content that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Depicts child sexual abuse material (CSAM) or sexual content involving minors;</li>
              <li>Promotes, glorifies, or facilitates violence, terrorism, or illegal activity;</li>
              <li>Constitutes targeted harassment, hate speech, or incitement to discrimination;</li>
              <li>Is defamatory, fraudulent, deceptive, or constitutes unlawful false advertising;</li>
              <li>Infringes any third-party intellectual property, privacy, or publicity rights;</li>
              <li>Contains personally identifiable information of a third party without their consent;</li>
              <li>Is subject to export control restrictions without appropriate licenses;</li>
              <li>Violates any applicable content rating or age-restriction laws.</li>
            </ul>
            <p>
              We reserve the right to remove any content that we determine, in our sole discretion,
              violates these prohibitions or is otherwise objectionable, with or without prior notice.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. Payment Terms">
            <p>
              Certain content and features on the Platform require payment. All payments are processed
              by our third-party payment processor(s). By providing payment information, you authorize
              us to charge you for any purchases you confirm.
            </p>
            <p>
              All prices are displayed in U.S. dollars unless otherwise indicated. Prices are subject
              to change at any time. We will provide advance notice of price changes to existing
              subscribers consistent with subscription law requirements.
            </p>
            <p>
              You agree to pay all applicable fees, taxes, and surcharges. If your payment method fails
              or your account is in arrears, we may restrict your access to the Platform until payment
              is received.
            </p>
            <p>
              All purchases of individual films are final and non-refundable, except where content is
              materially unavailable or where required by applicable consumer protection law.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. Subscription Terms (YouMake+)">
            <p>
              YouMake+ is a monthly subscription providing access to premium content and features.
              By subscribing, you agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your subscription automatically renews each month on the anniversary of your initial subscription date;</li>
              <li>You authorize us to charge your payment method for each renewal period;</li>
              <li>You may cancel your subscription at any time through your account settings; cancellation takes effect at the end of the current billing period;</li>
              <li>Subscription benefits are non-transferable and available only to the account holder;</li>
              <li>We may change subscription pricing upon thirty (30) days' advance notice; continued subscription after the price change constitutes acceptance;</li>
              <li>We may modify, add, or remove features included in a subscription at any time.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Refund Policy">
            <p>
              All purchases of individual films are final and non-refundable. YouMake+ subscription
              fees are non-refundable for any partial subscription month. We do not provide credits or
              refunds for periods during which you did not use the Platform.
            </p>
            <p>
              Exceptions: We may offer refunds or credits, in our sole discretion, where (a) a film
              you purchased is removed from the platform before you have had a reasonable opportunity
              to watch it, or (b) a technical error attributable solely to YouMakeTV prevented access
              to purchased content for more than 72 consecutive hours.
            </p>
            <p>
              To request a refund under an exception, contact{' '}
              <span className="text-brand-purple">support@youmaketv.ai</span> within 30 days of the
              qualifying event.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Intellectual Property">
            <p>
              The Platform, including its design, code, graphics, interface, and non-creator content,
              is owned by or licensed to YouMakeTV and is protected by copyright, trademark, and other
              intellectual property laws. You may not reproduce, distribute, or create derivative works
              from Platform materials without our express written permission.
            </p>
            <p>
              Content uploaded by creators is owned by the respective creators (subject to the Creator
              Agreement). All other platform content — including our logo, brand assets, platform text,
              and platform-generated metadata — is the exclusive property of YouMakeTV.
            </p>
            <p>
              Your license to access and view content purchased on the Platform is personal,
              non-transferable, and non-sublicensable. You may not download, copy, record, or
              redistribute any content from the Platform by any means.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="10. User-Generated and AI-Generated Content">
            <p>
              YouMakeTV is a platform for AI-generated and AI-assisted films. Creators retain ownership
              of their uploaded content, subject to the Creator Agreement. YouMakeTV does not endorse
              any content uploaded by creators and is not responsible for the accuracy, quality, legality,
              or appropriateness of creator-uploaded content.
            </p>
            <p>
              By uploading content, creators grant YouMakeTV the licenses described in the Creator
              Agreement. Viewers acknowledge that content has been created using AI tools and that
              the legal status of AI-generated content may vary by jurisdiction.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="11. DMCA / Copyright Infringement">
            <p>
              If you believe that content on the Platform infringes your copyright, please refer to
              our <a href="/copyright" className="text-brand-purple hover:underline">Copyright &amp; DMCA Policy</a>{' '}
              for instructions on filing a takedown notice. We respond to valid DMCA notices promptly
              and maintain a repeat infringer policy in accordance with the DMCA.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="12. Content Removal and Account Actions">
            <p>
              YouMakeTV may, in its sole and absolute discretion and without prior notice or liability:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Remove, suspend, or restrict any content at any time for any reason;</li>
              <li>Suspend or terminate any user or creator account;</li>
              <li>Modify, restrict, or discontinue any feature or aspect of the Platform;</li>
              <li>Change pricing for any content or subscription tier;</li>
              <li>Suspend access to the Platform for maintenance, updates, or any other reason;</li>
              <li>Take any other action we deem necessary to protect the Platform, its users, or its business interests.</li>
            </ul>
            <p>
              We are not obligated to provide prior notice of account actions, though we will generally
              attempt to do so where legally required or practically feasible. Suspended or terminated
              accounts may not create new accounts without our prior written permission.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="13. Service Interruptions">
            <p>
              We do not guarantee that the Platform will be available at all times, uninterrupted,
              or error-free. We may perform maintenance, updates, or improvements that result in
              temporary unavailability. We will use commercially reasonable efforts to minimize
              unplanned downtime.
            </p>
            <p>
              YouMakeTV shall not be liable for any loss or damage arising from interruptions,
              outages, data loss, or performance degradation, whether caused by factors within or
              outside our control, including network failures, acts of nature, or third-party
              service failures.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="14. Disclaimer of Warranties">
            <p>
              THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES
              OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p>
              YOUMAKETV DOES NOT WARRANT THAT THE PLATFORM WILL MEET YOUR REQUIREMENTS, THAT ACCESS
              WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE
              PLATFORM OR ITS SERVERS ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
            <p>
              YOUMAKETV MAKES NO WARRANTIES REGARDING THE ACCURACY, COMPLETENESS, QUALITY, OR
              LEGALITY OF ANY CONTENT AVAILABLE ON THE PLATFORM.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="15. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOUMAKETV AND ITS OFFICERS,
              DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AFFILIATES, AND SERVICE PROVIDERS SHALL
              NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
              PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUES, DATA,
              GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR
              USE OF OR INABILITY TO USE THE PLATFORM, ANY CONTENT ON THE PLATFORM, OR ANY
              OTHER MATTER RELATING TO THESE TERMS, EVEN IF ADVISED OF THE POSSIBILITY OF
              SUCH DAMAGES.
            </p>
            <p>
              IN NO EVENT SHALL YOUMAKETV'S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS
              ARISING UNDER THESE TERMS EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU PAID
              TO YOUMAKETV IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED
              U.S. DOLLARS ($100.00 USD).
            </p>
            <p>
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES,
              SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="16. Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless YouMakeTV and its officers, directors,
              employees, contractors, agents, licensors, affiliates, successors, and assigns from and
              against any claims, liabilities, damages, losses, costs, and expenses (including reasonable
              attorneys' fees) arising from or relating to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your use of the Platform or any content you access or upload;</li>
              <li>Your violation of these Terms or any applicable law;</li>
              <li>Any content or information you provide to the Platform;</li>
              <li>Your violation of any third-party rights, including intellectual property or privacy rights.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="17. Dispute Resolution and Arbitration">
            <p>
              PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR
              RIGHT TO FILE A LAWSUIT IN COURT.
            </p>
            <p>
              Any dispute arising out of or relating to these Terms, the Platform, or any transaction
              with YouMakeTV shall be resolved exclusively through binding arbitration administered by
              the American Arbitration Association (AAA) under its Consumer Arbitration Rules, rather
              than in court. The arbitration shall take place in the State of Delaware. Each party shall
              bear its own costs, except that the arbitrator may award attorneys' fees to the prevailing
              party in accordance with applicable law.
            </p>
            <p>
              Before initiating arbitration, you agree to provide us with written notice of your dispute
              and allow thirty (30) days to attempt informal resolution. Notices should be sent to{' '}
              <span className="text-brand-purple">legal@youmaketv.ai</span>.
            </p>
            <p>
              Either party may seek injunctive or other equitable relief in any court of competent
              jurisdiction to prevent unauthorized use of intellectual property.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="18. Class Action Waiver">
            <p>
              YOU AND YOUMAKETV AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS, WHETHER IN ARBITRATION
              OR COURT, WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED,
              MASS, OR REPRESENTATIVE ACTION. YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION
              LAWSUIT OR CLASS-WIDE ARBITRATION AGAINST YOUMAKETV.
            </p>
            <p>
              If this class action waiver is found unenforceable, then the arbitration clause shall be
              null and void with respect to any dispute covered by the waiver, and such disputes shall
              be resolved in a court of competent jurisdiction.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="19. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of
              Delaware, United States, without regard to its conflict of law provisions. Any disputes
              not subject to arbitration under Section 17 shall be subject to the exclusive jurisdiction
              of the state and federal courts located in the State of Delaware, and you consent to
              personal jurisdiction in those courts.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="20. Modification of Terms">
            <p>
              We reserve the right to modify these Terms at any time. When we make material changes,
              we will provide advance notice via email to your registered address or a prominent notice
              on the Platform, at least fifteen (15) days before the changes take effect (or thirty (30)
              days for changes that materially affect your rights).
            </p>
            <p>
              Your continued use of the Platform after the effective date of any modification constitutes
              your acceptance of the modified Terms. If you do not agree to the modified Terms, you must
              stop using the Platform.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="21. Miscellaneous">
            <p>
              <strong>Entire Agreement.</strong> These Terms, together with the Privacy Policy, Creator
              Agreement (for creators), and any other policies incorporated by reference, constitute
              the entire agreement between you and YouMakeTV with respect to the Platform and supersede
              all prior agreements.
            </p>
            <p>
              <strong>Severability.</strong> If any provision of these Terms is found unenforceable,
              that provision shall be modified to the minimum extent necessary to make it enforceable,
              and the remaining provisions shall continue in full force and effect.
            </p>
            <p>
              <strong>Waiver.</strong> No waiver by YouMakeTV of any term or condition shall be deemed
              a further or continuing waiver of that term or any other term.
            </p>
            <p>
              <strong>Assignment.</strong> You may not assign your rights under these Terms without our
              prior written consent. YouMakeTV may assign these Terms freely, including in connection
              with a merger, acquisition, or sale of assets.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="22. Contact Information">
            <p>For questions about these Terms:</p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-1">
              <p className="font-semibold text-slate-950">YouMakeTV.ai — Legal</p>
              <p>Email: <span className="text-brand-purple">legal@youmaketv.ai</span></p>
              <p>General support: <span className="text-brand-purple">support@youmaketv.ai</span></p>
            </div>
          </Section>
        </div>

      </div>

      <p className="text-xs text-center text-slate-400 pb-4">
        Questions? Contact us at <span className="text-brand-purple">legal@youmaketv.ai</span>
      </p>
    </div>
  );
}
