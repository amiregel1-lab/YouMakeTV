interface MockPaymentModalProps {
  type: 'transaction' | 'subscription' | 'trailer';
  title: string;
  details: string;
  onClose: () => void;
}

export default function MockPaymentModal({ type, title, details, onClose }: MockPaymentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10 backdrop-blur-sm">
      <div className="max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200/20 bg-white p-8 shadow-2xl">
        <div className="rounded-[1.75rem] bg-slate-950 px-6 py-5 text-white shadow-glow">
          <p className="text-sm uppercase tracking-[0.32em]">
            {type === 'subscription' ? 'Subscription preview' : type === 'trailer' ? 'Trailer preview' : 'Payment preview'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold">{title}</h2>
        </div>
        <div className="mt-6 text-sm leading-7 text-slate-600">
          <p>{details}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
