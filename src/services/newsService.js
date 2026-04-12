/**
 * newsService.js
 * Live NewsAPI integration with mock data fallback.
 */

import Constants from 'expo-constants';
import { articles as mockArticles } from '../data/mockData';

const NEWS_API_KEY = '41f222440d4543a09a5445f58aa1e85d';
const NEWS_API_BASE = 'https://newsapi.org/v2';

// Hip-hop related search query
const HIP_HOP_QUERY = 'hip hop OR rap OR kendrick lamar OR drake OR travis scott OR tyler the creator';

/**
 * Fetch latest hip-hop news articles.
 * Falls back to mock data if the API call fails.
 * @param {'Drops'|'Tours'|'Beef'|'Awards'|null} category
 * @returns {Promise<Array>}
 */
export async function fetchArticles(category = null) {
  try {
    const url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(HIP_HOP_QUERY)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);

    const data = await res.json();

    if (data.status !== 'ok' || !data.articles?.length) {
      throw new Error('No articles returned');
    }

    const mapped = data.articles
      .filter(a => a.title && a.description && a.title !== '[Removed]')
      .map(mapNewsApiArticle);

    return category ? mapped.filter(a => a.category === category) : mapped;

  } catch (err) {
    console.warn('[NewsAPI] Falling back to mock data:', err.message);
    return category
      ? mockArticles.filter(a => a.category === category)
      : mockArticles;
  }
}

/**
 * Map a NewsAPI article to our app's article format.
 */
function mapNewsApiArticle(item, index) {
  const category = detectCategory(item.title + ' ' + (item.description || ''));
  const imageColors = ['#2a1a0e', '#0e1a2a', '#1a0e0e', '#1a1a0e', '#0e1a0e', '#1a0e2a'];

  return {
    id: item.url || String(index),
    category,
    title: item.title,
    source: item.source?.name || 'Unknown',
    timestamp: timeAgo(item.publishedAt),
    readTime: estimateReadTime(item.content),
    isBreaking: index === 0,
    imageColor: imageColors[index % imageColors.length],
    imageUrl: item.urlToImage,
    body: [
      item.description || '',
      item.content
        ? item.content.replace(/\[\+\d+ chars\]$/, '').trim()
        : 'Read the full article for more details.',
      'Stay tuned to Hip-Hop Drop for the latest updates.',
    ].filter(Boolean),
  };
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('beef') || lower.includes('diss') || lower.includes('clap back') || lower.includes('feud') || lower.includes('respond')) return 'Beef';
  if (lower.includes('tour') || lower.includes('concert') || lower.includes('show') || lower.includes('perform')) return 'Tours';
  if (lower.includes('award') || lower.includes('grammy') || lower.includes('bet ') || lower.includes('nominated')) return 'Awards';
  if (lower.includes('merch') || lower.includes('drop') || lower.includes('collection') || lower.includes('release') || lower.includes('sneaker')) return 'Drops';
  return 'News';
}

function estimateReadTime(content) {
  if (!content) return '2 min read';
  const words = content.split(' ').length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function timeAgo(dateString) {
  if (!dateString) return 'Recently';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
