interface MockModalProps {
  type: 'payment' | 'trailer';
  onClose: () => void;
}

export default function MockModal({ type, onClose }: MockModalProps) {
  const headline = type === 'payment' ? 'Payment integration coming later' : 'Trailer experience is mocked for the prototype';
  const description =
    type === 'payment'
      ? 'This prototype shows where payment processing will appear. No real transactions are processed.'
      : 'Trailer playback is a placeholder. Real video hosting and streaming integration will be added later.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-10 backdrop-blur-sm">
      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/95 p-8 text-center shadow-cinematic">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Prototype Note</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">{headline}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={onClose} className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
