// utils/sortContent.ts

import type { RedditItem, RedditPost } from '../types';

type PageContext = 'subreddit' | 'user' | 'post';

interface SortParams {
  items: RedditItem[];
  sort: 'new' | 'top' | 'hot';
  page: PageContext;
  timespan?: 'day' | 'month' | 'year' | 'all';
}

export function sortContent({ items, sort, page, timespan = 'all' }: SortParams): RedditItem[] {
  const now = Date.now() / 1000;

  const filterByTimespan = (list: RedditItem[]) => {
    const ranges: Record<string, number> = {
      day: 86400,
      month: 2592000,
      year: 31536000,
      all: Infinity
    };
    return list.filter(item => now - item.created_utc <= ranges[timespan]);
  };

  const sortTop = (list: RedditItem[]) =>
    [...list].sort((a, b) => ((b as any).score ?? 0) - ((a as any).score ?? 0));

  const sortHot = (list: RedditPost[]) => {
    return list
      .filter(post => now - post.created_utc <= 86400)
      .map(post => {
        const ageHours = (now - post.created_utc) / 3600;
        const decay = Math.pow(ageHours + 2, 1.5);
        const base = (post.score ?? 0) / decay;
        const jiggle = Math.random() * 0.1 * base;
        return { ...post, _hotScore: base + jiggle };
      })
      .sort((a, b) => (b._hotScore ?? 0) - (a._hotScore ?? 0));
  };

  if (sort === 'new') return [...items].sort((a, b) => b.created_utc - a.created_utc);
  if (sort === 'top') return sortTop(page === 'post' ? items : filterByTimespan(items));
  if (sort === 'hot' && page === 'subreddit') {
    const posts = items.filter((i): i is RedditPost => i.kind === 'post');
    return sortHot(posts);
  }

  return items;
}
