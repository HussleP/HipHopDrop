/**
 * newsService.js
 *
 * Currently uses mock data.
 * When NewsAPI is connected, swap the fetch calls below.
 *
 * Live flow (future):
 *   - NewsAPI fetches hip-hop articles every 15 minutes
 *   - New articles with category 'Beef' or 'Awards' auto-trigger poll generation
 *   - Firebase Cloud Function calls generatePollFromArticle()
 */

import { articles as mockArticles } from '../data/mockData';
import { generatePollFromArticle } from './pollsService';

const NEWS_API_KEY = 'YOUR_NEWS_API_KEY'; // TODO: Add your NewsAPI key
const NEWS_API_BASE = 'https://newsapi.org/v2';

/**
 * Fetch latest hip-hop news articles.
 * @param {'Drops'|'Tours'|'Beef'|'Awards'|null} category
 * @returns {Promise<Array>}
 */
export async function fetchArticles(category = null) {
  // TODO: Replace with live NewsAPI call:
  // const url = `${NEWS_API_BASE}/everything?q=hip+hop+rap&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
  // const res = await fetch(url);
  // const data = await res.json();
  // const articles = data.articles.map(mapNewsApiArticle);
  // Check for new beef/awards articles and auto-generate polls
  // articles.forEach(a => {
  //   if (a.category === 'Beef' || a.category === 'Awards') {
  //     generatePollFromArticle(a);
  //   }
  // });
  // return articles;

  return category
    ? mockArticles.filter(a => a.category === category)
    : mockArticles;
}

/**
 * Map a NewsAPI article to our app's article format.
 * @param {Object} item - raw NewsAPI article object
 */
function mapNewsApiArticle(item) {
  // TODO: Implement category detection from article content/tags
  return {
    id: item.url,
    category: detectCategory(item.title + ' ' + item.description),
    title: item.title,
    source: item.source.name,
    timestamp: timeAgo(item.publishedAt),
    readTime: estimateReadTime(item.content),
    isBreaking: false,
    imageUrl: item.urlToImage,
    body: [item.description, item.content],
  };
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('beef') || lower.includes('diss') || lower.includes('clap back')) return 'Beef';
  if (lower.includes('tour') || lower.includes('concert') || lower.includes('show')) return 'Tours';
  if (lower.includes('award') || lower.includes('grammy') || lower.includes('bet')) return 'Awards';
  if (lower.includes('merch') || lower.includes('drop') || lower.includes('collection')) return 'Drops';
  return 'News';
}

function estimateReadTime(content) {
  if (!content) return '2 min read';
  const words = content.split(' ').length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
