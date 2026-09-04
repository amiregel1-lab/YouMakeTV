import { useMemo, useState } from 'react';
import { formatCurrency } from '../lib/formatters';
import { CreatorFilm } from '../types';
import PricingSlider from './PricingSlider';

interface FilmUploadFormProps {
  creatorName: string;
  onSubmit: (film: Omit<CreatorFilm, 'id' | 'status' | 'views' | 'trailerViews' | 'paidWatches' | 'freeWatches' | 'uploadDate' | 'updatedDate'>) => void;
  onCancel: () => void;
}

export default function FilmUploadForm({ creatorName, onSubmit, onCancel }: FilmUploadFormProps) {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Sci-Fi',
    duration: '10m',
    language: 'English',
    tools: '',
    rating: 'PG-13',
    price: 1.99,
    thumbnail: '',
    trailer: '',
    filmFile: '',
  });

  const canSubmit = useMemo(() => form.title.trim().length > 0 && form.description.trim().length > 10, [form]);

  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-8 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Upload new film</p>
          <h2 className="text-2xl font-semibold text-slate-950">Create your first AI film release</h2>
          <p className="text-sm leading-7 text-slate-600">Fill in the details now, or save your film as a draft and publish later from the dashboard.</p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
          <p className="text-sm text-slate-500">Creator</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{creatorName}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Film title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="input-field"
              placeholder="Eternal Credits"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Subtitle
            <input
              value={form.subtitle}
              onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
              className="input-field"
              placeholder="A cinematic AI journey through a neon skyline"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-700">
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            className="input-field min-h-[140px]"
            placeholder="Write a short description of the film, what makes it unique, and what viewers can expect."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-700">
            Category
            <select
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="input-field"
            >
              <option>Sci-Fi</option>
              <option>Fantasy</option>
              <option>Drama</option>
              <option>Action</option>
              <option>Short</option>
              <option>Experimental</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Runtime
            <input
              value={form.duration}
              onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
              className="input-field"
              placeholder="12m"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Language
            <select
              value={form.language}
              onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
              className="input-field"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Japanese</option>
              <option>Portuguese</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            AI tools used
            <input
              value={form.tools}
              onChange={(event) => setForm((current) => ({ ...current, tools: event.target.value }))}
              className="input-field"
              placeholder="Midjourney, Runway"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Rating
            <select
              value={form.rating}
              onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
              className="input-field"
            >
              <option>G</option>
              <option>PG</option>
              <option>PG-13</option>
              <option>R</option>
            </select>
          </label>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Price</p>
          <div className="mt-4">
            <PricingSlider value={form.price} onChange={(next) => setForm((current) => ({ ...current, price: next }))} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Thumbnail', key: 'thumbnail', value: form.thumbnail, placeholder: 'Thumbnail URL' },
            { label: 'Trailer', key: 'trailer', value: form.trailer, placeholder: 'Trailer URL' },
            { label: 'Film file', key: 'filmFile', value: form.filmFile, placeholder: 'Film file URL' },
          ].map((item) => (
            <label key={item.key} className="space-y-2 text-sm text-slate-700">
              {item.label}
              <input
                value={item.value}
                onChange={(event) => setForm((current) => ({ ...current, [item.key]: event.target.value }))}
                className="input-field"
                placeholder={item.placeholder}
              />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onSubmit({
              title: form.title,
              subtitle: form.subtitle,
              description: form.description,
              genre: form.category,
              duration: form.duration,
              creator: creatorName,
              category: form.category,
              price: form.price,
              thumbnail: form.thumbnail || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
              rating: form.rating,
              language: form.language,
              tools: form.tools.split(',').map((tool) => tool.trim()).filter(Boolean),
              trailerUrl: form.trailer.trim() || undefined,
              filmUrl: form.filmFile.trim() || undefined,
            })}
            disabled={!canSubmit}
            className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save film draft
          </button>
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
