/**
 * The honest state of the creator side of the platform, shown wherever a number
 * with a dollar sign appears.
 *
 * Earnings, pending payouts and payout history in the creator workspace are
 * calculated from catalog figures — no payment processor is connected, no money
 * has moved, and no payout has been sent. Saying that plainly on the surfaces
 * that show those figures costs nothing and is the difference between a
 * prototype and a misrepresentation.
 *
 * A banner, not a modal: it informs without demanding a click.
 */
export default function BetaNotice({ className = '' }: { className?: string }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 ${className}`}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-400/30 text-[11px] font-bold text-amber-700"
      >
        i
      </span>
      <p className="text-sm leading-6 text-amber-900">
        <strong className="font-semibold">Creator beta.</strong> Billing is not connected yet, so
        earnings, pending payouts and payout history shown here are{' '}
        <strong className="font-semibold">simulated figures</strong> — no money has been collected
        from viewers and no payout has been sent. Uploads, films and studio profiles are real. We
        will email every creator before real payments begin.
      </p>
    </div>
  );
}
