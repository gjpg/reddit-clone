// src/utils/redditMappings.ts
import type { RedditAPIUser, User } from '../types';

import type { RedditPost, RedditComment, Post } from '../types';
// import type { RedditPost, RedditComment, Post, UserComment } from '../types';


export function mapPostToRedditPost(post: Post): RedditPost {
  return {
    kind: 'post',
    id: post.id,
    title: post.title,
    author: post.author,
    subreddit_name_prefixed: post.subreddit_name_prefixed,
    permalink: `/r/${post.subreddit_name_prefixed}/comments/${post.id}`,
    created_utc: post.created_utc,
    url: post.url,
    thumbnail: post.thumbnail,
    score: 0,
    likes: post.likes ?? null,
    archived: post.archived ?? false
  };
}

export function mapCommentToRedditComment(comment: RedditComment): RedditComment {
  return {
    kind: 'comment',
    id: comment.id,
    body: comment.body,
    author: comment.author ?? 'unknown',
    subreddit_name_prefixed: comment.subreddit_name_prefixed ?? 'unknown',
    permalink: comment.permalink ?? '#',
    created_utc: comment.created_utc,
    score: 0,
    likes: comment.likes ?? null,
    archived: false
  };
}

export const mapRedditUserToAppUser = (redditUser: RedditAPIUser): User => ({
  id: redditUser.id,
  name: redditUser.name,
  icon_img: redditUser.icon_img,
  created_utc: redditUser.created_utc,
  link_karma: redditUser.link_karma,
  comment_karma: redditUser.comment_karma
});
