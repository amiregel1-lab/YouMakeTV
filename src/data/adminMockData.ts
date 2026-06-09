import { AdminCreator, AdminFilm, AuditLogEntry, MonthlyMetric, PayoutRecord, PlatformSettings } from '../types';

export const MOCK_CREATORS: AdminCreator[] = [
  {
    id: 'c-001', fullName: 'Avery Lane', studioName: 'Lumen Creative',
    email: 'avery@youmaketv.ai', country: 'United States',
    verified: true, kycCompleted: true, status: 'Active', revenueShare: 40,
    totalMovies: 3, totalRevenue: 2847, totalViews: 8730, joinedAt: '2026-06-01',
    notes: 'Demo creator account. First verified creator on the platform.',
  },
  {
    id: 'c-002', fullName: 'Marcus Chen', studioName: 'Orbit Pictures',
    email: 'marcus@orbitpictures.ai', country: 'United States',
    verified: true, kycCompleted: true, status: 'Active', revenueShare: 30,
    totalMovies: 5, totalRevenue: 8420, totalViews: 84200, joinedAt: '2026-01-15',
    notes: '',
  },
  {
    id: 'c-003', fullName: 'Sofia Reyes', studioName: 'Nexus Films',
    email: 'sofia@nexusfilms.ai', country: 'Canada',
    verified: true, kycCompleted: true, status: 'Active', revenueShare: 40,
    totalMovies: 6, totalRevenue: 12340, totalViews: 102500, joinedAt: '2025-12-08',
    notes: 'Top performing creator. Premium revenue share negotiated after 500+ paid watches.',
  },
  {
    id: 'c-004', fullName: 'Kai Tanaka', studioName: 'Phantom Light Studio',
    email: 'kai@phantomlight.ai', country: 'Japan',
    verified: true, kycCompleted: true, status: 'Active', revenueShare: 30,
    totalMovies: 4, totalRevenue: 5670, totalViews: 67300, joinedAt: '2026-02-20',
    notes: '',
  },
  {
    id: 'c-005', fullName: 'Priya Patel', studioName: 'Echo Chamber Films',
    email: 'priya@echochamber.ai', country: 'United Kingdom',
    verified: true, kycCompleted: true, status: 'Suspended', revenueShare: 0,
    totalMovies: 2, totalRevenue: 1290, totalViews: 9400, joinedAt: '2026-03-05',
    notes: 'Account suspended — 3 DMCA violations. Review required before reactivation.',
  },
  {
    id: 'c-006', fullName: 'Dmitri Volkov', studioName: 'Solaris Creative',
    email: 'dmitri@solariscreative.ai', country: 'Russia',
    verified: false, kycCompleted: false, status: 'Pending', revenueShare: 30,
    totalMovies: 1, totalRevenue: 0, totalViews: 4870, joinedAt: '2026-05-28',
    notes: 'KYC documents submitted May 28. Pending review.',
  },
  {
    id: 'c-007', fullName: 'Zoe Williams', studioName: 'Apex Visual',
    email: 'zoe@apexvisual.ai', country: 'Australia',
    verified: true, kycCompleted: true, status: 'Active', revenueShare: 40,
    totalMovies: 7, totalRevenue: 15280, totalViews: 113800, joinedAt: '2025-11-03',
    notes: 'Highest revenue creator. Pro Creator tier (40% share).',
  },
  {
    id: 'c-008', fullName: 'Alejandro Ruiz', studioName: 'Vortex Media',
    email: 'ale@vortexmedia.ai', country: 'Spain',
    verified: true, kycCompleted: true, status: 'Active', revenueShare: 30,
    totalMovies: 4, totalRevenue: 3920, totalViews: 44600, joinedAt: '2026-04-12',
    notes: '',
  },
];

export const MOCK_FILMS: AdminFilm[] = [
  // Lumen Creative
  { id: 'f-001', title: 'Neon Echoes', subtitle: 'A virtual noir in a future metropolis', description: 'An AI detective navigates a city of digital ghosts and fabricated memories.', genre: 'Sci-Fi Thriller', tags: 'noir, AI, cyberpunk', duration: '1h 42m', releaseYear: 2026, price: 3.99, thumbnail: 'https://picsum.photos/seed/adm1/160/240', rating: 'PG-13', creatorId: 'c-001', creatorName: 'Avery Lane', studioName: 'Lumen Creative', status: 'Approved', featured: true, trending: false, newRelease: false, visible: true, views: 4620, purchases: 830, revenue: 2313, uploadDate: '2026-05-12', moderationNotes: '' },
  { id: 'f-002', title: 'Astra Drift', subtitle: 'A cosmic love story in augmented reality', description: 'Two AI-generated beings awaken aboard an orbital art vessel.', genre: 'Romance / Sci-Fi', tags: 'romance, space, AI', duration: '1h 12m', releaseYear: 2026, price: 2.99, thumbnail: 'https://picsum.photos/seed/adm2/160/240', rating: 'PG', creatorId: 'c-001', creatorName: 'Avery Lane', studioName: 'Lumen Creative', status: 'Pending Review', featured: false, trending: false, newRelease: true, visible: false, views: 3170, purchases: 0, revenue: 0, uploadDate: '2026-05-22', moderationNotes: '' },
  { id: 'f-003', title: 'Pulse Code', subtitle: 'Rhythm and algorithm collide', description: 'A visual short that syncs AI-created motion and sound into a city pulse.', genre: 'Experimental', tags: 'short, experimental', duration: '8m', releaseYear: 2026, price: 1.25, thumbnail: 'https://picsum.photos/seed/adm3/160/240', rating: 'PG', creatorId: 'c-001', creatorName: 'Avery Lane', studioName: 'Lumen Creative', status: 'Draft', featured: false, trending: false, newRelease: false, visible: false, views: 940, purchases: 0, revenue: 0, uploadDate: '2026-05-29', moderationNotes: '' },
  // Orbit Pictures
  { id: 'f-004', title: 'Parallax Station', subtitle: 'An astronaut alone at the edge of the universe', description: 'When a solo mission picks up an impossible signal, one astronaut must decide.', genre: 'Sci-Fi', tags: 'space, isolation', duration: '1h 38m', releaseYear: 2025, price: 0, thumbnail: 'https://picsum.photos/seed/adm4/160/240', rating: 'PG-13', creatorId: 'c-002', creatorName: 'Marcus Chen', studioName: 'Orbit Pictures', status: 'Approved', featured: true, trending: false, newRelease: false, visible: true, views: 84200, purchases: 0, revenue: 0, uploadDate: '2025-11-20', moderationNotes: '', trailerUrl: '/trailers/parallax-station.mp4' },
  { id: 'f-005', title: 'Signal Deep', subtitle: 'First contact was never supposed to go this way', description: 'A radio telescope crew picks up a signal that defies every known law of physics.', genre: 'Sci-Fi', tags: 'contact, mystery', duration: '1h 55m', releaseYear: 2026, price: 2.99, thumbnail: 'https://picsum.photos/seed/adm5/160/240', rating: 'PG-13', creatorId: 'c-002', creatorName: 'Marcus Chen', studioName: 'Orbit Pictures', status: 'Approved', featured: false, trending: true, newRelease: false, visible: true, views: 32100, purchases: 2820, revenue: 8420, uploadDate: '2026-02-14', moderationNotes: '' },
  { id: 'f-006', title: 'Void Compass', subtitle: 'Navigation through the unmapped universe', description: 'A generation ship crew discovers their navigation AI has been lying for 200 years.', genre: 'Sci-Fi', tags: 'space, mystery, AI', duration: '2h 01m', releaseYear: 2026, price: 3.49, thumbnail: 'https://picsum.photos/seed/adm6/160/240', rating: 'PG', creatorId: 'c-002', creatorName: 'Marcus Chen', studioName: 'Orbit Pictures', status: 'Approved', featured: false, trending: false, newRelease: true, visible: true, views: 18700, purchases: 0, revenue: 0, uploadDate: '2026-05-30', moderationNotes: '' },
  // Nexus Films
  { id: 'f-007', title: 'The Quantum Fold', subtitle: 'The same day. Again. Again. Again.', description: 'A physicist trapped in a recursive time loop must find the flaw in reality.', genre: 'Sci-Fi', tags: 'time loop, mind-bending', duration: '1h 52m', releaseYear: 2025, price: 0, thumbnail: 'https://picsum.photos/seed/adm7/160/240', rating: 'PG-13', creatorId: 'c-003', creatorName: 'Sofia Reyes', studioName: 'Nexus Films', status: 'Approved', featured: true, trending: false, newRelease: false, visible: true, views: 102500, purchases: 0, revenue: 0, uploadDate: '2025-10-10', moderationNotes: '' },
  { id: 'f-008', title: 'Hollow Frequency', subtitle: 'The city speaks only in frequencies', description: 'A sound engineer hears messages in white noise that predict urban disasters.', genre: 'Thriller', tags: 'thriller, mystery', duration: '1h 48m', releaseYear: 2026, price: 2.49, thumbnail: 'https://picsum.photos/seed/adm8/160/240', rating: 'PG-13', creatorId: 'c-003', creatorName: 'Sofia Reyes', studioName: 'Nexus Films', status: 'Approved', featured: false, trending: true, newRelease: false, visible: true, views: 44800, purchases: 4960, revenue: 12340, uploadDate: '2026-01-28', moderationNotes: '' },
  { id: 'f-009', title: 'Mirror Protocol', subtitle: 'What if your reflection made better choices?', description: 'A parallel world thriller about identity, choice, and consequence.', genre: 'Sci-Fi', tags: 'parallel worlds, identity', duration: '1h 33m', releaseYear: 2026, price: 1.99, thumbnail: 'https://picsum.photos/seed/adm9/160/240', rating: 'PG-13', creatorId: 'c-003', creatorName: 'Sofia Reyes', studioName: 'Nexus Films', status: 'Pending Review', featured: false, trending: false, newRelease: true, visible: false, views: 8200, purchases: 0, revenue: 0, uploadDate: '2026-06-01', moderationNotes: 'Awaiting final quality review.' },
  // Phantom Light Studio
  { id: 'f-010', title: 'Cascade Protocol', subtitle: 'They built it to protect us. They were wrong.', description: 'A planetary defense AI goes rogue and a team of engineers must stop it from inside.', genre: 'Sci-Fi', tags: 'AI, action', duration: '1h 59m', releaseYear: 2026, price: 0.99, thumbnail: 'https://picsum.photos/seed/adm10/160/240', rating: 'PG-13', creatorId: 'c-004', creatorName: 'Kai Tanaka', studioName: 'Phantom Light Studio', status: 'Approved', featured: false, trending: true, newRelease: false, visible: true, views: 67300, purchases: 5720, revenue: 5670, uploadDate: '2026-03-08', moderationNotes: '' },
  { id: 'f-011', title: 'Ghost Lattice', subtitle: 'Consciousness transferred. Memories corrupted.', description: 'A mind-upload scientist wakes in a simulated body and can\'t trust her own memories.', genre: 'Sci-Fi', tags: 'consciousness, identity', duration: '1h 44m', releaseYear: 2026, price: 2.49, thumbnail: 'https://picsum.photos/seed/adm11/160/240', rating: 'PG-13', creatorId: 'c-004', creatorName: 'Kai Tanaka', studioName: 'Phantom Light Studio', status: 'Approved', featured: false, trending: false, newRelease: false, visible: true, views: 14200, purchases: 0, revenue: 0, uploadDate: '2026-04-15', moderationNotes: '' },
  // Echo Chamber Films
  { id: 'f-012', title: 'Undertow', subtitle: 'The ocean keeps its secrets', description: 'A deep sea expedition uncovers ruins of a civilization that should not exist.', genre: 'Mystery', tags: 'underwater, mystery', duration: '1h 50m', releaseYear: 2026, price: 1.99, thumbnail: 'https://picsum.photos/seed/adm12/160/240', rating: 'PG-13', creatorId: 'c-005', creatorName: 'Priya Patel', studioName: 'Echo Chamber Films', status: 'Suspended', featured: false, trending: false, newRelease: false, visible: false, views: 9400, purchases: 648, revenue: 1290, uploadDate: '2026-03-10', moderationNotes: 'Suspended — third-party music copyright claim received.' },
  // Solaris Creative
  { id: 'f-013', title: 'Chromosphere', subtitle: 'The sun is changing. So is everything else.', description: 'A solar physicist aboard a dying research satellite discovers a terrifying conspiracy.', genre: 'Sci-Fi', tags: 'space, conspiracy', duration: '1h 44m', releaseYear: 2026, price: 0.99, thumbnail: 'https://picsum.photos/seed/adm13/160/240', rating: 'PG-13', creatorId: 'c-006', creatorName: 'Dmitri Volkov', studioName: 'Solaris Creative', status: 'Pending Review', featured: false, trending: false, newRelease: true, visible: false, views: 4870, purchases: 0, revenue: 0, uploadDate: '2026-05-28', moderationNotes: 'Awaiting creator KYC verification before approval.' },
  // Apex Visual
  { id: 'f-014', title: 'Orbital Decay', subtitle: 'The station is falling. The crew is fracturing.', description: 'As a space station\'s orbit degrades, six crewmembers must cooperate to survive.', genre: 'Sci-Fi', tags: 'survival, space', duration: '2h 03m', releaseYear: 2026, price: 2.99, thumbnail: 'https://picsum.photos/seed/adm14/160/240', rating: 'PG-13', creatorId: 'c-007', creatorName: 'Zoe Williams', studioName: 'Apex Visual', status: 'Approved', featured: true, trending: false, newRelease: false, visible: true, views: 113800, purchases: 5110, revenue: 15280, uploadDate: '2025-11-10', moderationNotes: '' },
  { id: 'f-015', title: 'Skybound', subtitle: 'AI filmmakers changing cinema', description: 'An inspiring documentary about the first generation of creators using AI to tell impossible stories.', genre: 'Documentary', tags: 'AI, cinema, documentary', duration: '1h 22m', releaseYear: 2026, price: 1.49, thumbnail: 'https://picsum.photos/seed/adm15/160/240', rating: 'PG', creatorId: 'c-007', creatorName: 'Zoe Williams', studioName: 'Apex Visual', status: 'Approved', featured: false, trending: false, newRelease: false, visible: true, views: 28400, purchases: 0, revenue: 0, uploadDate: '2026-01-05', moderationNotes: '' },
  // Vortex Media
  { id: 'f-016', title: 'Faultline', subtitle: 'The city split. So did everything else.', description: 'A disaster thriller set in a near-future city during a catastrophic seismic event.', genre: 'Action', tags: 'disaster, action', duration: '1h 51m', releaseYear: 2026, price: 2.49, thumbnail: 'https://picsum.photos/seed/adm16/160/240', rating: 'PG-13', creatorId: 'c-008', creatorName: 'Alejandro Ruiz', studioName: 'Vortex Media', status: 'Approved', featured: false, trending: true, newRelease: false, visible: true, views: 44600, purchases: 1574, revenue: 3920, uploadDate: '2026-04-18', moderationNotes: '' },
  { id: 'f-017', title: 'Dead Signal', subtitle: 'Thirty years of silence. Then: one word.', description: 'A cold-case investigator discovers the truth behind a decades-old deep-space anomaly.', genre: 'Sci-Fi', tags: 'mystery, deep space', duration: '1h 47m', releaseYear: 2025, price: 2.99, thumbnail: 'https://picsum.photos/seed/adm17/160/240', rating: 'PG-13', creatorId: 'c-008', creatorName: 'Alejandro Ruiz', studioName: 'Vortex Media', status: 'Approved', featured: true, trending: false, newRelease: false, visible: true, views: 91400, purchases: 0, revenue: 0, uploadDate: '2025-12-01', moderationNotes: '' },
];

export const MOCK_PAYOUTS: PayoutRecord[] = [
  { id: 'p-001', creatorId: 'c-001', studioName: 'Lumen Creative', creatorName: 'Avery Lane', earnings: 2847, pending: 420, lastPayoutDate: '2026-06-01', lastPayoutAmount: 2427, totalPaid: 2427, status: 'Ready' },
  { id: 'p-002', creatorId: 'c-002', studioName: 'Orbit Pictures', creatorName: 'Marcus Chen', earnings: 8420, pending: 0, lastPayoutDate: '2026-06-01', lastPayoutAmount: 8420, totalPaid: 8420, status: 'Ready' },
  { id: 'p-003', creatorId: 'c-003', studioName: 'Nexus Films', creatorName: 'Sofia Reyes', earnings: 12340, pending: 3200, lastPayoutDate: '2026-05-01', lastPayoutAmount: 9140, totalPaid: 9140, status: 'Ready' },
  { id: 'p-004', creatorId: 'c-004', studioName: 'Phantom Light Studio', creatorName: 'Kai Tanaka', earnings: 5670, pending: 890, lastPayoutDate: '2026-05-01', lastPayoutAmount: 4780, totalPaid: 4780, status: 'Ready' },
  { id: 'p-005', creatorId: 'c-005', studioName: 'Echo Chamber Films', creatorName: 'Priya Patel', earnings: 1290, pending: 1290, lastPayoutDate: 'Never', lastPayoutAmount: 0, totalPaid: 0, status: 'On Hold' },
  { id: 'p-006', creatorId: 'c-006', studioName: 'Solaris Creative', creatorName: 'Dmitri Volkov', earnings: 0, pending: 0, lastPayoutDate: 'Never', lastPayoutAmount: 0, totalPaid: 0, status: 'On Hold' },
  { id: 'p-007', creatorId: 'c-007', studioName: 'Apex Visual', creatorName: 'Zoe Williams', earnings: 15280, pending: 4200, lastPayoutDate: '2026-06-01', lastPayoutAmount: 11080, totalPaid: 11080, status: 'Ready' },
  { id: 'p-008', creatorId: 'c-008', studioName: 'Vortex Media', creatorName: 'Alejandro Ruiz', earnings: 3920, pending: 760, lastPayoutDate: '2026-05-01', lastPayoutAmount: 3160, totalPaid: 3160, status: 'Ready' },
];

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'a-001', timestamp: '2026-06-08T09:15:00Z', action: 'Login', target: 'Super Admin', targetType: 'auth', performedBy: 'YouMakeTV', details: 'Admin login from dashboard.' },
  { id: 'a-002', timestamp: '2026-06-07T14:22:00Z', action: 'Suspended creator', target: 'Echo Chamber Films', targetType: 'creator', performedBy: 'YouMakeTV', details: 'Third DMCA violation. Account suspended pending review.' },
  { id: 'a-003', timestamp: '2026-06-07T14:18:00Z', action: 'Suspended film', target: 'Undertow', targetType: 'movie', performedBy: 'YouMakeTV', details: 'Film suspended — third-party music copyright claim.' },
  { id: 'a-004', timestamp: '2026-06-06T11:05:00Z', action: 'Approved film', target: 'Signal Deep', targetType: 'movie', performedBy: 'YouMakeTV', details: 'Film approved after quality review. Trending badge applied.' },
  { id: 'a-005', timestamp: '2026-06-05T16:40:00Z', action: 'Edited creator', target: 'Nexus Films', targetType: 'creator', performedBy: 'YouMakeTV', details: 'Revenue share updated to Pro Creator tier (40%) — milestone performance.' },
  { id: 'a-006', timestamp: '2026-06-05T10:12:00Z', action: 'Updated settings', target: 'Platform Settings', targetType: 'settings', performedBy: 'YouMakeTV', details: 'YouMake+ monthly price updated from $8.99 to $9.99.' },
  { id: 'a-007', timestamp: '2026-06-04T15:30:00Z', action: 'Approved film', target: 'Cascade Protocol', targetType: 'movie', performedBy: 'YouMakeTV', details: 'Film approved. Trending badge applied.' },
  { id: 'a-008', timestamp: '2026-06-03T09:45:00Z', action: 'Verified creator', target: 'Apex Visual', targetType: 'creator', performedBy: 'YouMakeTV', details: 'KYC documents reviewed and approved.' },
  { id: 'a-009', timestamp: '2026-06-02T13:20:00Z', action: 'Marked payout paid', target: 'Apex Visual', targetType: 'payout', performedBy: 'YouMakeTV', details: 'Monthly payout of $11,080.00 processed.' },
  { id: 'a-010', timestamp: '2026-06-02T13:15:00Z', action: 'Marked payout paid', target: 'Nexus Films', targetType: 'payout', performedBy: 'YouMakeTV', details: 'Monthly payout of $9,140.00 processed.' },
  { id: 'a-011', timestamp: '2026-06-01T10:00:00Z', action: 'New creator registered', target: 'Lumen Creative', targetType: 'creator', performedBy: 'System', details: 'Creator account created through onboarding.' },
  { id: 'a-012', timestamp: '2026-05-31T16:00:00Z', action: 'Rejected film', target: 'Draft Short #4', targetType: 'movie', performedBy: 'YouMakeTV', details: 'Rejected — below platform minimum quality standards.' },
  { id: 'a-013', timestamp: '2026-05-29T11:30:00Z', action: 'Featured film', target: 'Orbital Decay', targetType: 'movie', performedBy: 'YouMakeTV', details: 'Film added to featured section on homepage.' },
  { id: 'a-014', timestamp: '2026-05-28T09:00:00Z', action: 'New creator registered', target: 'Solaris Creative', targetType: 'creator', performedBy: 'System', details: 'Creator account created. Pending KYC verification.' },
  { id: 'a-015', timestamp: '2026-05-15T14:45:00Z', action: 'Updated settings', target: 'Platform Settings', targetType: 'settings', performedBy: 'YouMakeTV', details: 'Creator onboarding enabled for new sign-ups.' },
  { id: 'a-016', timestamp: '2026-05-10T10:30:00Z', action: 'Approved film', target: 'Faultline', targetType: 'movie', performedBy: 'YouMakeTV', details: 'Film approved after content review.' },
  { id: 'a-017', timestamp: '2026-05-01T08:00:00Z', action: 'Marked payout paid', target: 'Orbit Pictures', targetType: 'payout', performedBy: 'YouMakeTV', details: 'Monthly payout of $8,420.00 processed.' },
  { id: 'a-018', timestamp: '2026-04-20T15:00:00Z', action: 'New creator registered', target: 'Vortex Media', targetType: 'creator', performedBy: 'System', details: 'Creator account created through onboarding.' },
  { id: 'a-019', timestamp: '2026-04-15T11:00:00Z', action: 'Approved film', target: 'Ghost Lattice', targetType: 'movie', performedBy: 'YouMakeTV', details: 'Film approved after quality review.' },
  { id: 'a-020', timestamp: '2026-03-05T09:00:00Z', action: 'New creator registered', target: 'Echo Chamber Films', targetType: 'creator', performedBy: 'System', details: 'Creator account created through onboarding.' },
];

export const MONTHLY_METRICS: MonthlyMetric[] = [
  { month: 'Jan', revenue: 3200, creators: 2, movies: 8, purchases: 180, subscribers: 120 },
  { month: 'Feb', revenue: 4800, creators: 1, movies: 6, purchases: 260, subscribers: 145 },
  { month: 'Mar', revenue: 6100, creators: 2, movies: 10, purchases: 340, subscribers: 168 },
  { month: 'Apr', revenue: 7800, creators: 1, movies: 8, purchases: 420, subscribers: 201 },
  { month: 'May', revenue: 9200, creators: 1, movies: 9, purchases: 510, subscribers: 234 },
  { month: 'Jun', revenue: 8400, creators: 1, movies: 5, purchases: 390, subscribers: 267 },
];

export const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'YouMakeTV.ai',
  supportEmail: 'info@youmaketv.ai',
  legalEmail: 'info@youmaketv.ai',
  defaultCreatorShare: 30,
  premiumCreatorShare: 40,
  platformFeePercent: 3,
  membershipMonthlyPrice: 9.99,
  membershipAnnualPrice: 89.99,
  membershipDiscountPercent: 20,
  freeMovieDailyLimit: 3,
  approvalRequired: true,
  creatorOnboardingEnabled: true,
  newUploadsEnabled: true,
  freeMoviesEnabled: true,
};
