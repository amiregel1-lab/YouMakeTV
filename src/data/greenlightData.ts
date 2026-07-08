// Greenlight — the "fund it before it's made" side of the marketplace.
// Creators pitch a film with a trailer + budget goal; viewers pledge a few
// dollars. If a project clears its goal it gets made, and pledgers get it free
// plus a credit. This validates demand before a single frame is produced.

export interface GreenlightProject {
  id: string;
  title: string;
  logline: string;
  synopsis: string;
  genre: string;
  creator: string;
  creatorLocation: string;
  posterSeed: string;
  goal: number;          // dollars needed to green-light
  pledged: number;       // dollars pledged so far (seed value)
  backers: number;       // backers so far (seed value)
  daysLeft: number;
  minPledge: number;     // smallest pledge that unlocks the film + credit
  tools: string[];
  reward: string;
}

export const greenlightProjects: GreenlightProject[] = [
  {
    id: 'gl-01',
    title: 'The Lighthouse Keeper of Titan',
    logline: 'The last human on Saturn\'s moon keeps a light burning for ships that may never come.',
    synopsis:
      'A meditative sci-fi feature about solitude, hope, and the stubborn human need to signal into the dark. Shot entirely as AI-generated cinematography with an original orchestral score.',
    genre: 'Sci-Fi',
    creator: 'Mara Okonkwo',
    creatorLocation: 'Lagos, Nigeria',
    posterSeed: 'gl-titan',
    goal: 4000,
    pledged: 3120,
    backers: 612,
    daysLeft: 9,
    minPledge: 5,
    tools: ['Veo 3', 'Suno', 'ElevenLabs'],
    reward: 'Stream on release + your name in the closing credits',
  },
  {
    id: 'gl-02',
    title: 'Grandmother\'s Kitchen',
    logline: 'Five estranged siblings inherit a recipe box that rewrites their memories.',
    synopsis:
      'A warm magical-realist drama about food, family, and forgiveness. Each recipe unlocks a scene from a childhood none of them remember the same way.',
    genre: 'Drama',
    creator: 'Diego Vargas',
    creatorLocation: 'Medellín, Colombia',
    posterSeed: 'gl-kitchen',
    goal: 2500,
    pledged: 2410,
    backers: 488,
    daysLeft: 3,
    minPledge: 5,
    tools: ['Runway Gen-4', 'Midjourney'],
    reward: 'Stream on release + digital recipe zine',
  },
  {
    id: 'gl-03',
    title: 'Neon Monsoon',
    logline: 'A courier races across a flooded megacity to deliver a package that shouldn\'t exist.',
    synopsis:
      'A neon-drenched cyberpunk chase thriller set over a single stormy night. High-velocity AI action with a pulsing synth score.',
    genre: 'Action',
    creator: 'Priya Nair',
    creatorLocation: 'Mumbai, India',
    posterSeed: 'gl-monsoon',
    goal: 6000,
    pledged: 1890,
    backers: 371,
    daysLeft: 21,
    minPledge: 4,
    tools: ['Kling 2', 'Sora', 'Udio'],
    reward: 'Stream on release + behind-the-prompts breakdown',
  },
  {
    id: 'gl-04',
    title: 'The Quiet Ones',
    logline: 'A deaf detective reads a killer\'s lips through a decade of security footage.',
    synopsis:
      'A tense procedural mystery told largely without dialogue, leaning on visual storytelling and an immersive sound design that flips between silence and noise.',
    genre: 'Thriller',
    creator: 'Sam Feldman',
    creatorLocation: 'Toronto, Canada',
    posterSeed: 'gl-quiet',
    goal: 3500,
    pledged: 940,
    backers: 203,
    daysLeft: 15,
    minPledge: 5,
    tools: ['Veo 3', 'ElevenLabs'],
    reward: 'Stream on release + your name in the credits',
  },
  {
    id: 'gl-05',
    title: 'Paper Astronauts',
    logline: 'Two kids build a cardboard rocket that somehow reaches the edge of space.',
    synopsis:
      'A family adventure about imagination outrunning reality. Hand-drawn AI animation blended with photoreal skies — a bedtime story at feature scale.',
    genre: 'Animation',
    creator: 'Yuki Tanaka',
    creatorLocation: 'Osaka, Japan',
    posterSeed: 'gl-paper',
    goal: 3000,
    pledged: 2760,
    backers: 690,
    daysLeft: 6,
    minPledge: 4,
    tools: ['Midjourney', 'Runway Gen-4', 'Suno'],
    reward: 'Stream on release + printable poster',
  },
  {
    id: 'gl-06',
    title: 'Last Call at the Everdark',
    logline: 'A bartender at the end of the universe serves one final round to the dead.',
    synopsis:
      'An anthology horror-comedy set in a bar that only appears to those about to cross over. Six patrons, six stories, one very patient bartender.',
    genre: 'Horror',
    creator: 'Nadia Haddad',
    creatorLocation: 'Beirut, Lebanon',
    posterSeed: 'gl-everdark',
    goal: 4500,
    pledged: 4510,
    backers: 902,
    daysLeft: 1,
    minPledge: 5,
    tools: ['Sora', 'Kling 2', 'ElevenLabs'],
    reward: 'Stream on release + exclusive alternate ending',
  },
];
