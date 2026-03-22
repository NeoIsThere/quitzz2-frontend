/**
 * Rank definitions — 13 ranks (0–12).
 * Backend returns rank as a number; frontend maps it to title + image.
 */
export interface RankDef {
  index: number;
  title: string;
  minProgress: number;
  image: string;
}

export const RANKS: RankDef[] = [
  { index: 0,  title: 'Mortal',     minProgress: 0,   image: '/images/ranks/0.png' },
  { index: 1,  title: 'Hoplite',    minProgress: 5,   image: '/images/ranks/1.png' },
  { index: 2,  title: 'Warrior',    minProgress: 10,  image: '/images/ranks/2.png' },
  { index: 3,  title: 'Hero',       minProgress: 15,  image: '/images/ranks/3.png' },
  { index: 4,  title: 'Champion',   minProgress: 20,  image: '/images/ranks/4.png' },
  { index: 5,  title: 'Demigod',    minProgress: 30,  image: '/images/ranks/5.png' },
  { index: 6,  title: 'Titan',      minProgress: 40,  image: '/images/ranks/6.png' },
  { index: 7,  title: 'Olympian',   minProgress: 50,  image: '/images/ranks/7.png' },
  { index: 8,  title: 'Ascendant',  minProgress: 60,  image: '/images/ranks/8.png' },
  { index: 9,  title: 'God',        minProgress: 70,  image: '/images/ranks/9.png' },
  { index: 10, title: 'Primordial', minProgress: 80,  image: '/images/ranks/10.png' },
  { index: 11, title: 'Eternal',    minProgress: 90,  image: '/images/ranks/11.png' },
  { index: 12, title: 'Unbreaker',  minProgress: 100, image: '/images/ranks/12.png' },
];

export function getRankTitle(rankIndex: number): string {
  return RANKS[rankIndex]?.title ?? RANKS[0].title;
}

export function getRankImage(rankIndex: number): string {
  return RANKS[rankIndex]?.image ?? RANKS[0].image;
}
