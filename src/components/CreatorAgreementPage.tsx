import SEOHead from './SEOHead';

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="space-y-3 scroll-mt-24">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="text-sm text-slate-600 leading-7 space-y-3">{children}</div>
    </div>
  );
}

export default function CreatorAgreementPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <SEOHead
        title="Creator Agreement | YouMakeTV.ai"
        description="The YouMakeTV.ai Creator Agreement governing content uploads, revenue share, licensing, and creator responsibilities."
        canonical="/creator-agreement"
      />

      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-purple/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-brand-purple mb-4">
          Legal · Creators
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Creator Agreement</h1>
        <p className="mt-3 text-sm text-slate-500">Effective date: January 1, 2026 · Last updated: June 1, 2026</p>
        <p className="mt-4 text-slate-600 leading-7">
          This Creator Agreement ("Agreement") is entered into between you ("Creator") and YouMakeTV.ai
          ("YouMakeTV," "we," "us," or "our") and governs your use of the YouMakeTV.ai creator tools,
          dashboard, and content distribution platform. By completing creator onboarding, uploading any
          content, or accessing creator-specific features, you agree to be bound by this Agreement in
          its entirety.
        </p>
        <p className="mt-3 text-slate-600 leading-7">
          If you do not agree to all terms of this Agreement, you may not create a creator account or
          upload content to the platform. This Agreement is incorporated by reference into the
          YouMakeTV.ai Terms of Service.
        </p>
      </div>

      {/* Agreement Body */}
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-8 sm:p-10 space-y-10 divide-y divide-slate-100">

        <Section title="1. Definitions">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>"Content"</strong> means any film, short film, video, audio, image, script, subtitle, description, thumbnail, trailer, or other material you upload to the platform.</li>
            <li><strong>"Platform"</strong> means the YouMakeTV.ai website, applications, APIs, and all related services operated by YouMakeTV.</li>
            <li><strong>"Revenue Share"</strong> means the portion of paid watch revenue distributed to you per the rates described in Section 8 of this Agreement.</li>
            <li><strong>"Gross Revenue"</strong> means the total amount paid by viewers to watch your content, before deduction of payment processing fees, taxes, chargebacks, or platform fees.</li>
            <li><strong>"Net Revenue"</strong> means Gross Revenue after deduction of payment processing fees (typically 2.9% + $0.30 per transaction) and applicable chargeback amounts.</li>
            <li><strong>"Viewer"</strong> means any person who accesses or purchases access to content on the platform.</li>
          </ul>
        </Section>

        <div className="pt-10">
          <Section title="2. Content Ownership">
            <p>
              You retain full intellectual property ownership of all Content you upload to the platform.
              This Agreement does not transfer ownership of your Content to YouMakeTV. YouMakeTV acquires
              only the license rights expressly granted in Section 3 of this Agreement.
            </p>
            <p>
              You are solely responsible for ensuring that you hold all necessary rights, licenses, and
              permissions required to upload, distribute, and monetize your Content on the platform,
              including rights to any AI tools, generative models, voice performances, musical compositions,
              sound recordings, visual assets, scripts, and any other elements incorporated into your Content.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="3. License Granted to YouMakeTV">
            <p>
              By uploading Content to the platform, you grant YouMakeTV a worldwide, non-exclusive,
              royalty-free, sublicensable, and transferable license to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Host, store, and transmit your Content on and through the platform;</li>
              <li>Stream and deliver your Content to viewers on the platform;</li>
              <li>Display your Content, including title, description, thumbnail, and trailer, to viewers and potential viewers;</li>
              <li>Reproduce and create clips or excerpts of your Content for promotional purposes;</li>
              <li>Promote and market your Content through platform interfaces, email communications, and third-party advertising channels;</li>
              <li>Distribute your Content to viewers who have purchased access or hold an active subscription;</li>
              <li>Adapt or reformat your Content as necessary for technical compatibility with platform infrastructure, including encoding, transcoding, and optimization;</li>
              <li>Use your Content, title, studio name, and likeness in promotional materials relating to the platform.</li>
            </ul>
            <p>
              This license continues for as long as your Content remains on the platform and for a reasonable
              period thereafter to allow YouMakeTV to fulfill existing viewer access obligations. Upon your
              removal of Content from the platform (subject to Section 11), YouMakeTV will cease active
              promotion and distribution of that Content within thirty (30) days.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="4. Creator Warranties and Representations">
            <p>
              By uploading Content and maintaining a creator account, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are the original creator of the Content or have obtained all necessary rights to upload, distribute, and monetize it;</li>
              <li>You hold all intellectual property rights in and to the Content, or have valid licenses from all rights holders for all elements incorporated in the Content;</li>
              <li>The Content does not infringe any third-party copyright, trademark, trade secret, patent, right of publicity, privacy right, or any other proprietary or legal right;</li>
              <li>The Content complies with all applicable laws, including laws regarding obscenity, defamation, false advertising, consumer protection, and content ratings;</li>
              <li>Any AI-generated elements of your Content were produced using tools and services that permit commercial use and monetization, and you have complied with the terms of service of all such tools;</li>
              <li>You have not and will not upload Content depicting real individuals without their consent in a manner that is false, defamatory, or violates their right of publicity or privacy;</li>
              <li>Your Content does not contain malware, spyware, or any other harmful or disruptive code;</li>
              <li>All information you provide regarding your Content (including title, description, rating, and genre) is accurate and not misleading;</li>
              <li>You are at least 18 years of age and legally capable of entering into binding contracts.</li>
            </ul>
            <p>
              These warranties and representations are continuous. If you become aware that any warranty
              is no longer accurate, you must notify YouMakeTV immediately at{' '}
              <span className="text-brand-purple">creators@youmaketv.ai</span> and remove or correct
              the affected Content.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="5. AI-Generated Content">
            <p>
              YouMakeTV is a platform designed for AI-generated and AI-assisted films. You acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The legal status of copyright in AI-generated content varies by jurisdiction and is subject
                to change. You accept sole responsibility for monitoring and complying with applicable legal
                developments regarding AI-generated content rights.
              </li>
              <li>
                You must ensure that all AI tools and generative models you use permit commercial use and
                distribution of outputs. Tools that prohibit commercial use of their outputs may not be used
                to create Content on this platform.
              </li>
              <li>
                You may not use AI tools to generate Content that depicts real, identifiable individuals in
                a false, harmful, or unauthorized manner, including "deepfake" content created without the
                subject's explicit consent.
              </li>
              <li>
                YouMakeTV may require you to disclose which AI tools were used to create your Content and
                may display such disclosures to viewers.
              </li>
              <li>
                YouMakeTV makes no warranties regarding the enforceability of any copyright you may claim
                in AI-generated Content.
              </li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="6. Content Moderation">
            <p>
              YouMakeTV reserves the right, in its sole and absolute discretion, to review, reject, remove,
              disable, suspend, or restrict access to any Content at any time, for any reason or no reason,
              with or without prior notice to you. Reasons for content action may include, but are not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violation of this Agreement or the platform's Terms of Service;</li>
              <li>Receipt of a valid DMCA takedown notice;</li>
              <li>Complaints from viewers, creators, or third parties;</li>
              <li>Platform quality standards, including minimum resolution, runtime, or content standards;</li>
              <li>Legal requirements or court orders;</li>
              <li>Risk of reputational harm to the platform;</li>
              <li>Platform redesign or changes to content categories;</li>
              <li>Suspension or investigation of your creator account.</li>
            </ul>
            <p>
              Content removal does not automatically entitle you to any compensation for lost earnings
              associated with the removed Content. YouMakeTV shall not be liable to you for any loss of
              revenue, earnings, opportunities, or other damages arising from content removal, suspension,
              or restriction.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="7. Prohibited Content">
            <p>You may not upload Content that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Contains or depicts child sexual abuse material (CSAM) or any sexual content involving minors;</li>
              <li>Depicts, promotes, or facilitates real violence, terrorism, or illegal activity;</li>
              <li>Constitutes targeted harassment of any individual or group;</li>
              <li>Is defamatory, fraudulent, or intentionally deceptive;</li>
              <li>Infringes the copyright, trademark, or other intellectual property rights of a third party;</li>
              <li>Depicts real, identifiable individuals without their consent in a sexual, humiliating, or defamatory manner;</li>
              <li>Violates any applicable export control laws or sanctions regimes;</li>
              <li>Contains advertisements, solicitations, or spam unrelated to the film itself;</li>
              <li>Is primarily or substantially not AI-generated or AI-assisted;</li>
              <li>Violates any applicable local, state, national, or international law or regulation.</li>
            </ul>
            <p>
              Uploading prohibited Content may result in immediate account termination, reporting to
              law enforcement authorities, and legal action by YouMakeTV.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="8. Revenue Share and Payments">
            <p>
              Subject to this Agreement and your compliance with all platform policies, YouMakeTV will
              pay you the following revenue share on Net Revenue generated by viewer purchases of your Content:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Standard rate:</strong> 70% of Net Revenue per paid watch, for the first 500 paid watches per film;</li>
              <li><strong>Milestone rate:</strong> 80% of Net Revenue per paid watch, for paid watches after the first 500 per film.</li>
            </ul>
            <p>
              Payouts are processed monthly on or around the 1st of each month for earnings accumulated
              in the prior calendar month. Payouts are subject to a minimum threshold of $25.00 USD.
              Earnings below the threshold will be carried forward to the following month.
            </p>
            <p>
              You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Revenue share rates are subject to change upon thirty (30) days' written notice;</li>
              <li>Platform fees, transaction fees, and processing costs may be deducted before revenue share is calculated;</li>
              <li>Payouts may be delayed by up to sixty (60) days for fraud review, dispute resolution, or regulatory compliance purposes;</li>
              <li>YouMakeTV may withhold payment if it reasonably suspects fraudulent activity, including artificially inflated view counts;</li>
              <li>Chargebacks initiated by viewers will be deducted from your earnings, regardless of the reason for the chargeback;</li>
              <li>YouMakeTV reserves the right to offset future earnings against any amounts owed by you to YouMakeTV.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="9. Taxes and Regulatory Compliance">
            <p>
              You are solely responsible for all taxes, levies, and duties arising from your earnings
              on the platform, including but not limited to income taxes, self-employment taxes, value-added
              taxes (VAT), and withholding taxes. YouMakeTV will not withhold taxes from your earnings
              unless required by applicable law.
            </p>
            <p>
              You may be required to provide a valid tax identification number (TIN), W-9, W-8BEN,
              or equivalent form before payouts are processed. Failure to provide required tax documentation
              may delay or suspend payouts.
            </p>
            <p>
              YouMakeTV may be required to report your earnings to tax authorities in applicable
              jurisdictions. By accepting this Agreement, you authorize YouMakeTV to make such reports
              as required by law.
            </p>
            <p>
              You represent that you will comply with all applicable laws and regulations in connection
              with your use of the platform and receipt of earnings, including anti-money laundering (AML)
              and know-your-customer (KYC) requirements.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="10. Creator Account">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and
              for all activity that occurs under your account. You agree to notify YouMakeTV immediately
              of any unauthorized use of your account.
            </p>
            <p>
              You may not share, sell, transfer, or sublicense your creator account to any third party.
              Each creator account must correspond to a single natural person or a single legal entity.
              Use of automated tools, bots, or scripts to interact with the platform is prohibited.
            </p>
            <p>
              YouMakeTV reserves the right to require re-verification of your identity or re-completion
              of KYC procedures at any time, for any reason, including changes in regulatory requirements
              or suspected fraud.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="11. Removal of Content">
            <p>
              You may request removal of your Content from the platform at any time by contacting
              <span className="text-brand-purple"> creators@youmaketv.ai</span> or using the dashboard
              removal tools, subject to the following:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Removal requests will be processed within thirty (30) days;</li>
              <li>Viewers who have already purchased access to removed Content may retain access for a period determined by YouMakeTV in its sole discretion;</li>
              <li>Earnings accrued up to the point of removal will be paid out in the next regular payout cycle, provided they meet the minimum threshold;</li>
              <li>Removal of Content does not terminate this Agreement with respect to Content that remains on the platform.</li>
            </ul>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="12. Termination">
            <p>
              Either party may terminate this Agreement at any time. You may terminate by ceasing use
              of the platform and requesting deletion of your account.
            </p>
            <p>
              YouMakeTV may terminate your creator account and this Agreement immediately, without prior
              notice or liability, if you:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violate any provision of this Agreement or the platform's Terms of Service;</li>
              <li>Upload Content that violates applicable law or platform policies;</li>
              <li>Are found to be a repeat copyright infringer;</li>
              <li>Engage in fraudulent activity, including but not limited to view inflation, fake purchases, or identity fraud;</li>
              <li>Engage in conduct that YouMakeTV reasonably determines is harmful to the platform, other creators, or viewers;</li>
              <li>Fail to maintain compliance with KYC or tax documentation requirements.</li>
            </ul>
            <p>
              Upon termination, your right to access creator tools and the dashboard ceases immediately.
              Pending earnings at the time of termination for cause may be forfeited in YouMakeTV's
              sole discretion. Sections 2, 4, 13, 14, 15, and 16 of this Agreement survive termination.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="13. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOUMAKETV AND ITS OFFICERS, DIRECTORS,
              EMPLOYEES, AGENTS, LICENSORS, AND AFFILIATES SHALL NOT BE LIABLE TO YOU FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
              LIMITED TO LOSS OF PROFITS, REVENUES, DATA, EARNINGS, GOODWILL, OR OTHER INTANGIBLE LOSSES,
              ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, YOUR USE OF THE PLATFORM, OR ANY CONTENT
              YOU UPLOAD, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              YOUMAKETV'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS UNDER THIS AGREEMENT SHALL
              NOT EXCEED THE GREATER OF (A) THE TOTAL AMOUNT OF REVENUE SHARE PAID TO YOU IN THE THREE
              (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED
              U.S. DOLLARS ($100.00 USD).
            </p>
            <p>
              These limitations apply to all causes of action, whether based on warranty, contract, tort
              (including negligence), strict liability, or any other legal theory.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="14. Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless YouMakeTV and its officers, directors,
              employees, contractors, agents, licensors, affiliates, successors, and assigns from and
              against any and all claims, damages, liabilities, losses, costs, and expenses (including
              reasonable attorneys' fees and litigation costs) arising out of or relating to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your Content, including any claim that your Content infringes any third-party intellectual property right;</li>
              <li>Your use of the platform in violation of this Agreement or any applicable law;</li>
              <li>Your breach of any warranty or representation in this Agreement;</li>
              <li>Any claim by a viewer arising from your Content or your failure to accurately describe your Content;</li>
              <li>Any tax liability, withholding obligation, or regulatory penalty arising from your earnings on the platform;</li>
              <li>Any claim related to AI-generated elements of your Content, including claims by AI tool providers or third parties whose works were allegedly used without authorization to train or prompt the AI.</li>
            </ul>
            <p>
              YouMakeTV reserves the right, at its own expense, to assume exclusive defense and control
              of any matter subject to indemnification by you. You agree to cooperate fully with YouMakeTV's
              defense of any such claims.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="15. Dispute Resolution">
            <p>
              Any dispute, controversy, or claim arising out of or relating to this Agreement, your creator
              account, or your use of the platform shall be resolved by binding arbitration administered
              by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The
              arbitration shall be conducted in the English language in the State of Delaware.
            </p>
            <p>
              Prior to initiating arbitration, you agree to provide YouMakeTV with written notice of
              the dispute and allow thirty (30) days for informal resolution. Notices should be sent to{' '}
              <span className="text-brand-purple">legal@youmaketv.ai</span>.
            </p>
            <p>
              You waive any right to participate in a class action lawsuit or class-wide arbitration
              against YouMakeTV. All disputes must be brought individually.
            </p>
            <p>
              Notwithstanding the foregoing, either party may seek injunctive or other equitable relief
              in any court of competent jurisdiction to prevent or stop unauthorized use of intellectual
              property or a breach of confidentiality obligations.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="16. Modification of This Agreement">
            <p>
              YouMakeTV reserves the right to modify this Agreement at any time. We will provide at
              least thirty (30) days' advance notice of material changes via email to your registered
              address or via a prominent notice on the platform.
            </p>
            <p>
              Your continued use of the creator dashboard or upload of Content after the effective date
              of any modification constitutes your acceptance of the modified Agreement. If you do not
              agree to the modified Agreement, you must remove your Content and close your creator account
              before the effective date of the modification.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="17. Governing Law">
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of the State
              of Delaware, United States, without regard to its conflict of law principles.
            </p>
          </Section>
        </div>

        <div className="pt-10">
          <Section title="18. Contact">
            <p>For questions about this Agreement:</p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 space-y-1">
              <p className="font-semibold text-slate-950">Creator Support — YouMakeTV.ai</p>
              <p>Email: <span className="text-brand-purple">creators@youmaketv.ai</span></p>
              <p>Legal: <span className="text-brand-purple">legal@youmaketv.ai</span></p>
            </div>
          </Section>
        </div>

      </div>

      <p className="text-xs text-center text-slate-400 pb-4">
        Questions about the Creator Agreement? Contact <span className="text-brand-purple">creators@youmaketv.ai</span>
      </p>
    </div>
  );
}
