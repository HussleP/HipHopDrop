import AsyncStorage from '@react-native-async-storage/async-storage';
import { musicVideos } from '../data/mockData';

const API_KEY  = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || 'PASTE_YOUR_KEY_HERE';
const BASE     = 'https://www.googleapis.com/youtube/v3';

console.log('[YouTube] API_KEY loaded:', API_KEY ? `${API_KEY.slice(0, 8)}...` : 'MISSING');
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

// Full artist roster — drives all queries and featured injection
const ROSTER = [
  'Kendrick Lamar', 'Baby Keem',  'ASAP Rocky',    'Playboi Carti',
  'Future',         'SLAYR',      'Yeat',           'Don Toliver',
  'Kanye West',     'Tupac',      'JID',            'Nas',
  'Fred Again',     'Danny Brown','Freddie Gibbs',  'Tyler the Creator',
  'Paris Texas',    'Thundercat', 'Kneecap',        'Young Thug',
  'YoungBoy Never Broke Again',   'Denzel Curry',   'The Scythe',
];

// Helper: build a YouTube OR query from a slice of the roster
function rosterQuery(slice, suffix = 'official music video') {
  return `${slice.join(' OR ')} ${suffix}`;
}

const QUERIES = {
  All:         rosterQuery(ROSTER.slice(0, 10),  'official music video 2024 2025'),
  New:         rosterQuery(ROSTER.slice(0, 12),  'official music video 2025'),
  Hot:         rosterQuery(ROSTER.slice(0, 10),  'official music video most viewed'),
  Classics:    rosterQuery(['Tupac','Nas','Kanye West','Tyler the Creator','Denzel Curry','Danny Brown','Freddie Gibbs'], 'classic official music video'),
  Underground: rosterQuery(['JID','Denzel Curry','Freddie Gibbs','Danny Brown','Paris Texas','Kneecap','The Scythe','SLAYR','Yeat'], 'official music video 2025'),
  Producers:   rosterQuery([
    // Legends
    'Alchemist','Madlib','J Dilla','DJ Premier','Pete Rock','RZA',
    'Just Blaze','Swizz Beatz','Timbaland','Scott Storch','No ID',
    // Current heavyweights
    'Kanye West','Metro Boomin','Dr Dre','Pharrell','Hit-Boy',
    'Mike Will Made It','Pi\'erre Bourne','Kenny Beats','Murda Beatz',
    'Southside','Tay Keith','Boi-1da','Take A Daytrip','Mustard',
  ], 'official music video hip hop'),
};

// Sort order per filter
const ORDER = {
  All:         'date',
  New:         'date',
  Hot:         'viewCount',
  Classics:    'relevance',
  Underground: 'date',
};

const ACCENT_COLORS = [
  '#E07B0A', '#00C4D4', '#a855f7', '#E8305A', '#4ade80',
];

function pickAccent(index) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

// Convert ISO 8601 duration (PT4M32S) → "4:32"
function parseDuration(iso = '') {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = parseInt(m[1] || 0);
  const min = parseInt(m[2] || 0);
  const s = parseInt(m[3] || 0);
  if (h > 0) {
    return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${min}:${String(s).padStart(2, '0')}`;
}

// Format raw view count → "1.2M", "450K" etc.
function formatViews(n = 0) {
  const v = parseInt(n);
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

// Format ISO date → "Apr 2025"
function formatDate(iso = '') {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

// Clean up channel names (remove VEVO, Topic suffixes)
function cleanArtist(name = '') {
  return name
    .replace(/\s*VEVO$/i, '')
    .replace(/\s*Vevo$/i, '')
    .replace(/\s*- Topic$/i, '')
    .replace(/\s*- Official$/i, '')
    .trim();
}

// Fetch duration + view count for a batch of video IDs
async function fetchVideoDetails(ids) {
  if (!ids.length) return {};
  const url = `${BASE}/videos?part=contentDetails,statistics&id=${ids.join(',')}&key=${API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  const map  = {};
  for (const item of (json.items || [])) {
    map[item.id] = {
      duration: parseDuration(item.contentDetails?.duration),
      views:    formatViews(item.statistics?.viewCount),
    };
  }
  return map;
}

// Map a YouTube search item + detail to our video object shape
function mapItem(item, details, index, category) {
  const id      = item.id?.videoId;
  const snippet = item.snippet || {};
  const detail  = details[id] || {};
  return {
    id:          `yt_${id}`,
    videoId:     id,
    title:       snippet.title        || 'Untitled',
    artist:      cleanArtist(snippet.channelTitle),
    category,
    views:       detail.views         || '—',
    duration:    detail.duration      || '—',
    uploadDate:  formatDate(snippet.publishedAt),
    description: (snippet.description || '').slice(0, 200),
    accentColor: pickAccent(index),
  };
}

// Fetch the latest video for a specific artist query
async function fetchArtistVideo(query, index) {
  const url = [
    `${BASE}/search`,
    `?part=snippet`,
    `&q=${encodeURIComponent(query)}`,
    `&type=video`,
    `&videoCategoryId=10`,
    `&order=date`,
    `&maxResults=3`,
    `&regionCode=US`,
    `&key=${API_KEY}`,
  ].join('');

  const res  = await fetch(url);
  const json = await res.json();
  const items = (json.items || []).filter(i => i.id?.videoId);
  if (!items.length) return null;

  const ids     = items.map(i => i.id.videoId);
  const details = await fetchVideoDetails(ids);
  return mapItem(items[0], details, index, 'New');
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Fetch hip-hop videos for a given filter category.
 * Returns cached results if fresh; falls back to mockData if no API key or on error.
 */
export async function fetchVideos(category = 'All') {
  const cacheKey = `yt_videos_${category}`;

  // Return cached data if still fresh
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      const { data, fetchedAt } = JSON.parse(raw);
      if (Date.now() - fetchedAt < CACHE_TTL) {
        return data;
      }
    }
  } catch { /* ignore cache errors */ }

  // No API key configured — use mock data as fallback
  if (!API_KEY || API_KEY === 'YOUR_KEY_HERE') {
    console.warn('[YouTube] No API key — using mock data');
    return musicVideos.filter(v => category === 'All' || v.category === category);
  }

  try {
    const query = encodeURIComponent(QUERIES[category] || QUERIES.All);
    const order = ORDER[category] || 'date';

    const searchUrl = [
      `${BASE}/search`,
      `?part=snippet`,
      `&q=${query}`,
      `&type=video`,
      `&videoCategoryId=10`,
      `&videoDefinition=high`,
      `&order=${order}`,
      `&maxResults=20`,
      `&regionCode=US`,
      `&relevanceLanguage=en`,
      `&safeSearch=moderate`,
      `&key=${API_KEY}`,
    ].join('');

    const res  = await fetch(searchUrl);
    const json = await res.json();

    // Surface API errors clearly
    if (json.error) {
      throw new Error(`YouTube API: ${json.error.message} (code ${json.error.code})`);
    }

    const items   = (json.items || []).filter(i => i.id?.videoId);
    const ids     = items.map(i => i.id.videoId);
    const details = await fetchVideoDetails(ids);
    let videos    = items.map((item, i) => mapItem(item, details, i, category));

    // For the All tab, inject 3 randomly chosen artists from the full roster
    if (category === 'All') {
      const featured = [...ROSTER].sort(() => Math.random() - 0.5).slice(0, 3);
      const featuredVideos = await Promise.all(
        featured.map((artist, i) =>
          fetchArtistVideo(`${artist} official music video`, i)
        )
      );
      const valid = featuredVideos.filter(Boolean);
      const existingIds = new Set(videos.map(v => v.videoId));
      const fresh = valid.filter(v => !existingIds.has(v.videoId));
      videos = [...fresh, ...videos];
    }

    // Persist to cache
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data: videos,
      fetchedAt: Date.now(),
    }));

    return videos;
  } catch (err) {
    console.warn('[YouTube] Fetch failed, using mock data:', err.message);
    return musicVideos.filter(v => category === 'All' || v.category === category);
  }
}

/**
 * Force-refresh a specific category (or all) by clearing cache first.
 */
export async function refreshVideos(category = null) {
  if (category) {
    await AsyncStorage.removeItem(`yt_videos_${category}`);
  } else {
    const keys = ['All', 'New', 'Hot', 'Classics', 'Underground']
      .map(c => `yt_videos_${c}`);
    await AsyncStorage.multiRemove(keys);
  }
}
