import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CreatorFilm, CreatorProfile } from '../types';
import { formatCurrency, formatNumber, roundToCents } from '../lib/formatters';

const metricOptions = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'views', label: 'Views' },
  { key: 'paidWatches', label: 'Paid watches' },
  { key: 'trailerViews', label: 'Trailer views' },
  { key: 'creatorEarnings', label: 'Creator earnings' },
] as const;

type MetricKey = (typeof metricOptions)[number]['key'];

type RangeKey = '7D' | '30D' | '90D' | '1Y' | 'All';

const rangeOptions: RangeKey[] = ['7D', '30D', '90D', '1Y', 'All'];

const metricColor: Record<MetricKey, string> = {
  revenue: '#8b5cf6',
  views: '#22d3ee',
  paidWatches: '#ec4899',
  trailerViews: '#a855f7',
  creatorEarnings: '#38bdf8',
};

const rangeDays: Record<RangeKey, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
  All: 365,
};

const chartColors = ['#8b5cf6', '#22d3ee', '#ec4899', '#a855f7', '#38bdf8'];

type ChartRow = {
  date: string;
  revenue: number;
  views: number;
  paidWatches: number;
  trailerViews: number;
  creatorEarnings: number;
};

function buildDailyFilmSeries(film: CreatorFilm, days: number, filmIndex: number) {
  const today = new Date();
  const dailyViewsBase = film.views / Math.max(7, Math.min(days, 30));
  const dailyPaidBase = film.paidWatches / Math.max(7, Math.min(days, 30));
  const dailyTrailerBase = film.trailerViews / Math.max(7, Math.min(days, 30));

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const trend = 0.8 + (index / days) * 0.7;
    const wobble = Math.sin((index + filmIndex * 4) / 5) * 0.12;
    const volumeFactor = 0.85 + filmIndex * 0.05;

    const views = Math.max(4, dailyViewsBase * trend * (1 + wobble) * volumeFactor);
    const paidWatches = Math.max(1, dailyPaidBase * (0.95 + wobble * 0.7) * (0.8 + trend * 0.2));
    const trailerViews = Math.max(2, dailyTrailerBase * (0.9 + wobble * 0.6) * (0.9 + trend * 0.1));
    const revenue = paidWatches * film.price;
    const creatorEarnings = revenue * (film.paidWatches > 500 ? 0.4 : 0.3);

    return {
      date: label,
      revenue: roundToCents(revenue),
      views: Math.round(views),
      paidWatches: Math.round(paidWatches),
      trailerViews: Math.round(trailerViews),
      creatorEarnings: roundToCents(creatorEarnings),
    };
  });
}

function buildMonthlyFilmSeries(film: CreatorFilm, months = 12, filmIndex = 0) {
  const monthlyBaseRevenue = film.price * film.paidWatches * 0.9;
  const monthlyBaseViews = film.views * 0.9;
  const monthlyBasePaid = film.paidWatches * 0.9;
  const monthlyBaseTrailer = film.trailerViews * 0.9;

  return Array.from({ length: months }, (_, index) => {
    const monthLabel = new Date(new Date().setMonth(new Date().getMonth() - (months - 1 - index))).toLocaleDateString('en-US', {
      month: 'short',
    });
    const momentum = 0.75 + (index / months) * 0.5 + filmIndex * 0.08;
    const seasonal = 1 + Math.sin((index + filmIndex * 2) / 2.4) * 0.12;

    const revenue = Math.max(20, monthlyBaseRevenue * momentum * seasonal / months);
    const views = Math.max(120, monthlyBaseViews * momentum * seasonal / months);
    const paidWatches = Math.max(8, monthlyBasePaid * momentum * seasonal / months);
    const trailerViews = Math.max(12, monthlyBaseTrailer * momentum * seasonal / months);
    const creatorEarnings = revenue * (film.paidWatches > 500 ? 0.4 : 0.3);

    return {
      month: monthLabel,
      revenue: roundToCents(revenue),
      views: Math.round(views),
      paidWatches: Math.round(paidWatches),
      trailerViews: Math.round(trailerViews),
      creatorEarnings: roundToCents(creatorEarnings),
    };
  });
}

function formatMetricValue(metric: MetricKey, value: number) {
  if (metric === 'revenue' || metric === 'creatorEarnings') return formatCurrency(value);
  return formatNumber(value);
}

function getChange(data: ChartRow[], metric: MetricKey) {
  const first = data[0]?.[metric] ?? 0;
  const last = data[data.length - 1]?.[metric] ?? 0;
  if (!first) return 0;
  return Math.round(((last - first) / Math.max(1, first)) * 100);
}

function buildComparisonLines(creator: CreatorProfile, metric: MetricKey) {
  return creator.films.slice(0, 3).map((film, index) => {
    const series = buildDailyFilmSeries(film, 30, index);
    return {
      filmTitle: film.title,
      color: chartColors[index % chartColors.length],
      data: series.map((point) => ({ date: point.date, value: point[metric] })),
    };
  });
}

function getLegendLabel(metric: MetricKey) {
  return metricOptions.find((option) => option.key === metric)?.label ?? metric;
}

interface CreatorAnalyticsProps {
  creator: CreatorProfile;
}

export default function CreatorAnalytics({ creator }: CreatorAnalyticsProps) {
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [timeRange, setTimeRange] = useState<RangeKey>('30D');
  const [showCreatorEarnings, setShowCreatorEarnings] = useState(false);
  const [selectedFilmId, setSelectedFilmId] = useState<string | 'all'>('all');

  const creatorSeries = useMemo(() => {
    const days = rangeDays[timeRange];
    const startDate = new Date();
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() - (days - 1 - index));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        views: 0,
        paidWatches: 0,
        trailerViews: 0,
        creatorEarnings: 0,
      };
    });
  }, [timeRange]);

  const allSeries = useMemo(() => {
    const aggregated = creatorSeries.map((item, index) => ({ ...item }));
    creator.films.forEach((film, filmIndex) => {
      const series = buildDailyFilmSeries(film, creatorSeries.length, filmIndex);
      series.forEach((value, dailyIndex) => {
        aggregated[dailyIndex].revenue += value.revenue;
        aggregated[dailyIndex].views += value.views;
        aggregated[dailyIndex].paidWatches += value.paidWatches;
        aggregated[dailyIndex].trailerViews += value.trailerViews;
        aggregated[dailyIndex].creatorEarnings += value.creatorEarnings;
      });
    });
    return aggregated.map((entry) => ({
      ...entry,
      revenue: roundToCents(entry.revenue),
      creatorEarnings: roundToCents(entry.creatorEarnings),
    }));
  }, [creator.films, creatorSeries]);

  const selectedSeries = useMemo(() => {
    if (selectedFilmId === 'all') return allSeries;
    const film = creator.films.find((item) => item.id === selectedFilmId);
    return film ? buildDailyFilmSeries(film, creatorSeries.length, creator.films.indexOf(film)) : allSeries;
  }, [allSeries, creator.films, creatorSeries.length, selectedFilmId]);

  const activeSeries = selectedFilmId === 'all' ? allSeries : selectedSeries;
  const displayedMetric: MetricKey = showCreatorEarnings && metric === 'revenue' ? 'creatorEarnings' : metric;
  const percentChange = getChange(activeSeries, displayedMetric);
  const monthlySeries = creator.films.map((film, index) => buildMonthlyFilmSeries(film, 12, index));
  const comparisonLines = useMemo(() => buildComparisonLines(creator, displayedMetric), [creator, displayedMetric]);
  const comparisonData = useMemo(() => {
    if (!comparisonLines.length) return [];
    return comparisonLines[0].data.map((point, itemIndex) => {
      return comparisonLines.reduce((row, line) => {
        row.date = point.date;
        row[line.filmTitle] = line.data[itemIndex]?.value ?? 0;
        return row;
      }, { date: point.date } as Record<string, string | number>);
    });
  }, [comparisonLines]);
  const monthlyRevenueData = useMemo(() => {
    const rows: Array<Record<string, string | number>> = [];
    const count = monthlySeries[0]?.length ?? 0;
    for (let index = 0; index < count; index += 1) {
      const row: Record<string, string | number> = { month: monthlySeries[0]?.[index]?.month ?? '' };
      creator.films.slice(0, 3).forEach((film, filmIndex) => {
        row[film.title] = monthlySeries[filmIndex]?.[index]?.revenue ?? 0;
      });
      rows.push(row);
    }
    return rows;
  }, [creator.films, monthlySeries]);

  const revenueByFilm = creator.films.map((film) => ({ name: film.title, value: roundToCents(film.price * film.paidWatches) }));
  const viewsByFilm = creator.films.map((film) => ({ name: film.title, value: film.views + film.trailerViews }));
  const watchBreakdown = [
    { name: 'Paid watches', value: creator.films.reduce((sum, film) => sum + film.paidWatches, 0) },
    { name: 'Free watches', value: creator.films.reduce((sum, film) => sum + film.freeWatches, 0) },
    { name: 'Trailer views', value: creator.films.reduce((sum, film) => sum + film.trailerViews, 0) },
  ];
  const trafficSources = [
    { name: 'Homepage', value: 38 },
    { name: 'Search', value: 24 },
    { name: 'Direct link', value: 19 },
    { name: 'Creator profile', value: 12 },
    { name: 'Featured placement', value: 7 },
  ];
  const topRevenueFilms = [...revenueByFilm].sort((a, b) => b.value - a.value);
  const topViewsFilms = [...viewsByFilm].sort((a, b) => b.value - a.value);
  const conversionRates = creator.films.map((film) => ({
    name: film.title,
    value: film.trailerViews ? Math.round((film.paidWatches / film.trailerViews) * 100) : 0,
  }));

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Creator analytics</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Studio performance</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Explore revenue, views, and creator earnings across your films with dynamic ranges, interactive tooltips, and film comparison analytics.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Selected metric</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{getLegendLabel(metric)}</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Time range</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{timeRange}</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Period change</p>
              <p className={`mt-2 text-xl font-semibold ${percentChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {percentChange >= 0 ? '+' : ''}{percentChange}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Performance over time</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{getLegendLabel(metric)} trend</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {metricOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setMetric(option.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${metric === option.key ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedSeries} margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
                  <defs>
                    <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={metricColor[displayedMetric]} stopOpacity={0.65} />
                      <stop offset="100%" stopColor={metricColor[displayedMetric]} stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip
                    contentStyle={{ borderRadius: 20, borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}
                    formatter={(value: any) => [formatMetricValue(displayedMetric, Number(value)), getLegendLabel(displayedMetric)]}
                  />
                  <Area type="monotone" dataKey={displayedMetric} stroke={metricColor[displayedMetric]} fill="url(#metricGradient)" strokeWidth={3} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {rangeOptions.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${timeRange === range ? 'bg-brand-purple text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Metric toggle</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatorEarnings(false)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!showCreatorEarnings ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Gross revenue
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatorEarnings(true)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${showCreatorEarnings ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Creator earnings
                </button>
              </div>

              <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Film scope</p>
                <select
                  value={selectedFilmId}
                  onChange={(event) => setSelectedFilmId(event.target.value as string | 'all')}
                  className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                >
                  <option value="all">All films</option>
                  {creator.films.map((film) => (
                    <option key={film.id} value={film.id}>{film.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Comparison snapshot</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Total viewers</span>
                  <span className="text-base font-semibold text-slate-950">{formatNumber(allSeries.reduce((sum, item) => sum + item.views, 0))}</span>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Paid watches</span>
                  <span className="text-base font-semibold text-slate-950">{formatNumber(allSeries.reduce((sum, item) => sum + item.paidWatches, 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Revenue by film</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Top earning films</h3>
            </div>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueByFilm} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={4} stroke="none">
                  {revenueByFilm.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Views by film</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Audience distribution</h3>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={viewsByFilm} dataKey="value" nameKey="name" innerRadius={52} outerRadius={92} paddingAngle={4} stroke="none">
                    {viewsByFilm.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'Views']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Watch mix</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Paid vs free vs trailers</h3>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={watchBreakdown} dataKey="value" nameKey="name" innerRadius={56} outerRadius={96} paddingAngle={4} stroke="none">
                    {watchBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'Watches']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Top films</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Revenue leaders</h3>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRevenueFilms} margin={{ top: 10, right: 4, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Top films</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Views leaders</h3>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViewsFilms} margin={{ top: 10, right: 4, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(value: any) => [formatNumber(Number(value)), 'Views']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
                <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Conversion</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Paid conversion by film</h3>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionRates} margin={{ top: 10, right: 4, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(value: any) => [`${formatNumber(Number(value))}%`, 'Conversion']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Monthly revenue</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Revenue by film over 12 months</h3>
          <div className="mt-6 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 4, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
                <Legend />
                {creator.films.slice(0, 3).map((film, index) => (
                  <Bar key={film.id} dataKey={film.title} stackId="a" fill={chartColors[index % chartColors.length]} radius={[8, 8, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Traffic sources</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Where your viewers come from</h3>
          <div className="mt-6 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficSources} dataKey="value" nameKey="name" innerRadius={56} outerRadius={96} paddingAngle={4} stroke="none">
                  {trafficSources.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${Number(value)}%`, 'Traffic']} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-white shadow-soft p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Film comparison</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Compare top films over the last 30 days</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-brand-purple" />
            {creator.films.slice(0, 3).map((film, index) => (
              <span key={film.id} className={index === 0 ? 'text-slate-950' : 'text-slate-600'}>{film.title}</span>
            ))}
          </div>
        </div>
        <div className="mt-6 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#0f172a', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(value: any, name: any) => [formatMetricValue(displayedMetric, Number(value)), String(name)]} contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }} />
              {comparisonLines.map((line) => (
                <Line key={line.filmTitle} type="monotone" dataKey={line.filmTitle} stroke={line.color} strokeWidth={3} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
