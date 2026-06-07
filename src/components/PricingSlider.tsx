interface PricingSliderProps {
  value: number;
  onChange: (next: number) => void;
}

const priceOptions = [0, 0.49, 0.99, 1.49, 1.99, 2.49, 2.99, 3.49, 3.99, 4.49, 4.99, 5.49, 5.99, 6.49, 6.99, 7.49, 7.99, 8.49, 8.99, 9.49, 9.99];

export default function PricingSlider({ value, onChange }: PricingSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {priceOptions.map((price) => (
          <button
            key={price}
            type="button"
            onClick={() => onChange(price)}
            className={`rounded-full border px-4 py-2 text-sm transition ${value === price ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
          >
            {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
          </button>
        ))}
      </div>
      <div className="text-sm text-slate-600">Selected price: {value === 0 ? 'Free' : `$${value.toFixed(2)}`}</div>
    </div>
  );
}
