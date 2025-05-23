// utils/sortContent.ts

import type { RedditPost, RedditComment } from '../types';

type SortableItem = RedditPost | RedditComment;


interface SortParams {
  items: SortableItem[];  // Accept union of post or comment, no base interface
  sort: 'new' | 'top' | 'hot';
  page: 'subreddit' | 'user' | 'post';
  timespan?: 'day' | 'month' | 'year' | 'all';
}

export function sortContent({ items, sort, page, timespan = 'all' }: SortParams): SortableItem[] {
  const now = Date.now() / 1000;

  const filterByTimespan = (list: SortableItem[]) => {
    const ranges: Record<string, number> = {
      day: 86400,
      month: 2592000,
      year: 31536000,
      all: Infinity
    };
    return list.filter(item => now - item.created_utc <= ranges[timespan]);
  };

  const sortTop = (list: SortableItem[]) =>
    [...list].sort((a, b) => ((b.score ?? 0) as number) - ((a.score ?? 0) as number));

const sortHot = (list: RedditPost[]) => {
  return list
    .filter(post => now - post.created_utc <= 86400)
    .map(post => {
      // Ensure score is number; if 'hidden' fallback to 0
      const scoreNum = typeof post.score === 'number' ? post.score : 0;
      const ageHours = (now - post.created_utc) / 3600;
      const decay = Math.pow(ageHours + 2, 1.5);
      const base = scoreNum / decay;
      const jiggle = Math.random() * 0.1 * base;
      return { ...post, _hotScore: base + jiggle };
    })
    .sort((a, b) => (b._hotScore ?? 0) - (a._hotScore ?? 0));
};


  if (sort === 'new') {
    return [...items].sort((a, b) => b.created_utc - a.created_utc);
  }
  
  if (sort === 'top') {
    return sortTop(page === 'post' ? items : filterByTimespan(items));
  }
  
  if (sort === 'hot' && page === 'subreddit') {
    // Only posts for hot sorting
    const posts = items.filter((i): i is RedditPost => 'title' in i); // type guard
    return sortHot(posts);
  }

  return items;
}
