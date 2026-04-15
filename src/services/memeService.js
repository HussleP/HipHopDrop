/**
 * memeService.js
 * Fetches hip-hop memes & culture images from Reddit's public JSON API.
 * Covers every artist in the app — legends, current era, underground, UK/drill.
 * No auth required. Each refresh samples a rotating batch so content stays fresh.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY    = 'hiphop_memes_v3';
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 min

// ── Complete subreddit roster — organized by artist / era ───────────────────
const ALL_SUBREDDITS = [
  // ── General hip-hop culture
  { sub: 'hiphopimages',      label: 'Hip-Hop',      tier: 1 },
  { sub: 'rap',               label: 'Rap',          tier: 1 },
  { sub: 'hiphop101',         label: 'Hip-Hop',      tier: 1 },
  { sub: 'hhh',               label: 'HipHopHeads',  tier: 1 },
  { sub: 'trapmusic',         label: 'Trap',         tier: 1 },
  { sub: 'undergroundhiphop', label: 'Underground',  tier: 2 },
  { sub: 'hiphop',            label: 'Hip-Hop',      tier: 2 },

  // ── Legends / Golden Era
  { sub: 'Eminem',            label: 'Eminem',       tier: 1 },
  { sub: 'jayz',              label: 'Jay-Z',        tier: 2 },
  { sub: 'nas',               label: 'Nas',          tier: 2 },
  { sub: '2pac',              label: '2Pac',         tier: 2 },
  { sub: 'biggie',            label: 'Biggie',       tier: 2 },
  { sub: 'snoopdog',          label: 'Snoop Dogg',   tier: 2 },
  { sub: 'IceCube',           label: 'Ice Cube',     tier: 2 },
  { sub: 'DrDre',             label: 'Dr. Dre',      tier: 2 },

  // ── Current mainstream
  { sub: 'Kanye',             label: 'Kanye',        tier: 1 },
  { sub: 'WestSubEver',       label: 'Ye',           tier: 1 },
  { sub: 'Drakeposting',      label: 'Drake',        tier: 1 },
  { sub: 'KendrickLamar',     label: 'Kendrick',     tier: 1 },
  { sub: 'travisscott',       label: 'Travis Scott', tier: 1 },
  { sub: 'tylerthecreator',   label: 'Tyler',        tier: 1 },
  { sub: 'jcole',             label: 'J. Cole',      tier: 1 },
  { sub: 'liluzivert',        label: 'Lil Uzi',      tier: 1 },
  { sub: 'playboicarti',      label: 'Carti',        tier: 1 },
  { sub: 'NickiMinaj',        label: 'Nicki',        tier: 1 },
  { sub: 'CardiB',            label: 'Cardi B',      tier: 2 },
  { sub: 'jackharlow',        label: 'Jack Harlow',  tier: 2 },
  { sub: 'MetroBoomin',       label: 'Metro',        tier: 2 },
  { sub: 'BabyKeem',          label: 'Baby Keem',    tier: 2 },
  { sub: '21savage',          label: '21 Savage',    tier: 2 },
  { sub: 'youngthug',         label: 'Young Thug',   tier: 2 },
  { sub: 'LilBaby',           label: 'Lil Baby',     tier: 2 },
  { sub: 'Gunna',             label: 'Gunna',        tier: 2 },
  { sub: 'LilWayne',          label: 'Lil Wayne',    tier: 2 },
  { sub: 'futurerapper',      label: 'Future',       tier: 2 },
  { sub: 'DonToliver',        label: 'Don Toliver',  tier: 2 },
  { sub: 'AsapRocky',         label: 'A$AP Rocky',   tier: 2 },

  // ── Gone too soon
  { sub: 'MacMiller',         label: 'Mac Miller',   tier: 1 },
  { sub: 'JuiceWRLD',         label: 'Juice WRLD',   tier: 1 },
  { sub: 'LilPeep',           label: 'Lil Peep',     tier: 1 },
  { sub: 'XXXTENTACION',      label: 'XXX',          tier: 2 },
  { sub: 'popsmoke',          label: 'Pop Smoke',    tier: 2 },

  // ── Underground / Grimy
  { sub: 'FreddieGibbs',      label: 'Freddie Gibbs',tier: 1 },
  { sub: 'JPEGMafia',         label: 'JPEGMAFIA',    tier: 2 },
  { sub: 'DenzelCurry',       label: 'Denzel Curry', tier: 2 },
  { sub: 'mfdoom',            label: 'MF DOOM',      tier: 1 },
  { sub: 'madlib',            label: 'Madlib',       tier: 2 },
  { sub: 'DannyBrown',        label: 'Danny Brown',  tier: 2 },
  { sub: 'ActionBronson',     label: 'Action Bronson',tier: 2 },
  { sub: 'FlatbushZombies',   label: 'Flatbush',     tier: 2 },
  { sub: 'JoeyBadass',        label: 'Joey Bada$$',  tier: 2 },
  { sub: 'VinceStaples',      label: 'Vince Staples',tier: 2 },
  { sub: 'EarthGang',         label: 'EARTHGANG',    tier: 2 },

  // ── UK drill / grime
  { sub: 'CentralCee',        label: 'Central Cee',  tier: 1 },
  { sub: 'LittleSimz',        label: 'Little Simz',  tier: 1 },
  { sub: 'Skepta',            label: 'Skepta',       tier: 2 },
  { sub: 'DaveMusic',         label: 'Dave',         tier: 2 },
  { sub: 'ukdrill',           label: 'UK Drill',     tier: 1 },
  { sub: 'ukhiphop',          label: 'UK Hip-Hop',   tier: 2 },
  { sub: 'grime',             label: 'Grime',        tier: 2 },

  // ── Culture / fashion / broader
  { sub: 'Sneakers',          label: 'Sneakers',     tier: 2 },
  { sub: 'Streetwear',        label: 'Streetwear',   tier: 2 },
  { sub: 'hiphopvinyl',       label: 'Vinyl',        tier: 2 },
  { sub: 'freshalbumart',     label: 'Album Art',    tier: 2 },
];

// Tier 1 = always included. Tier 2 = rotate for variety.
const TIER1 = ALL_SUBREDDITS.filter(s => s.tier === 1).map(s => s.sub);
const TIER2 = ALL_SUBREDDITS.filter(s => s.tier === 2).map(s => s.sub);

// Pick a fresh random sample of tier2 each fetch (keeps content rotating)
function pickBatch() {
  const shuffled = [...TIER2].sort(() => Math.random() - 0.5);
  return [...TIER1, ...shuffled.slice(0, 18)];
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function isImageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    IMAGE_EXTS.some(ext => lower.includes(ext)) ||
    lower.includes('i.redd.it') ||
    lower.includes('imgur.com') ||
    lower.includes('i.imgur.com')
  );
}

function getLabel(subreddit) {
  return ALL_SUBREDDITS.find(s => s.sub.toLowerCase() === subreddit.toLowerCase())?.label || subreddit;
}

function mapPost(post, subreddit) {
  const d = post.data;
  if (d.over_18) return null; // skip NSFW

  let imageUrl = null;
  if (d.preview?.images?.[0]?.source?.url) {
    imageUrl = d.preview.images[0].source.url.replace(/&amp;/g, '&');
  } else if (isImageUrl(d.url)) {
    imageUrl = d.url;
  }
  if (!imageUrl) return null;
  if (d.title === '[removed]' || d.title === '[deleted]') return null;

  return {
    id:        d.id,
    title:     d.title,
    imageUrl,
    upvotes:   d.ups || 0,
    comments:  d.num_comments || 0,
    subreddit: d.subreddit || subreddit,
    label:     getLabel(d.subreddit || subreddit),
    author:    d.author || 'unknown',
    permalink: `https://reddit.com${d.permalink}`,
    created:   d.created_utc ? new Date(d.created_utc * 1000).toISOString() : null,
    // Score for smart sorting — recency + upvotes
    score:     (d.ups || 0) + (Math.max(0, 48 - (Date.now() / 3600000 - (d.created_utc || 0))) * 10),
  };
}

async function fetchSubreddit(subreddit) {
  // Mix "hot" and "top?t=week" for freshness + quality
  const useTop = Math.random() > 0.3;
  const url = useTop
    ? `https://www.reddit.com/r/${subreddit}/hot.json?limit=15`
    : `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=15`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; mobile)',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.data?.children) return [];
    return json.data.children
      .map(c => mapPost(c, subreddit))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchMemes(forceRefresh = false) {
  try {
    if (!forceRefresh) {
      const cached = await getCache();
      if (cached) return cached;
    }

    const batch = pickBatch(); // ~32 subreddits each time, rotates tier2

    const results = await Promise.allSettled(batch.map(s => fetchSubreddit(s)));

    const all = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Deduplicate
    const seen   = new Set();
    const deduped = all.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // Smart sort: mix high-upvote classics with recent hot posts
    deduped.sort((a, b) => b.score - a.score);

    if (deduped.length === 0) throw new Error('No memes');

    await saveCache(deduped);
    return deduped;

  } catch (err) {
    console.warn('[MemeService] Error:', err.message);
    return (await getCache(true)) || [];
  }
}

async function saveCache(memes) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), memes }));
}

async function getCache(ignoreExpiry = false) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, memes } = JSON.parse(raw);
    if (!ignoreExpiry && Date.now() - ts > CACHE_TTL_MS) return null;
    return memes;
  } catch (_) {
    return null;
  }
}
