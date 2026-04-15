/**
 * newsService.js
 * Live NewsAPI integration — targeted hip-hop queries, smart caching, real BREAKING logic.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const NEWS_API_KEY  = '41f222440d4543a09a5445f58aa1e85d';
const NEWS_API_BASE = 'https://newsapi.org/v2';
const CACHE_KEY     = 'news_cache_v2';
const CACHE_TTL_MS  = 30 * 60 * 1000;   // 30 minutes

// ── Hip-hop specific domains — only pull from these outlets ─────────────────
const HH_DOMAINS = [
  'complex.com',
  'xxlmag.com',
  'hotnewhiphop.com',
  'allhiphop.com',
  'hiphopwired.com',
  'rap-up.com',
  'pitchfork.com',
  'rollingstone.com',
  'billboard.com',
  'thefader.com',
  'hypebeast.com',
  'genius.com',
  'vulture.com',
  'nme.com',
].join(',');

// ── Queries rotate across fetches for variety ───────────────────────────────
const QUERIES = [
  // Core artists
  '"hip hop" OR "rap" kendrick lamar OR drake OR travis scott OR kanye west OR tyler the creator OR lil wayne',
  // Rising artists
  '"hip hop" OR "rap" baby keem OR playboi carti OR future OR nicki minaj OR 21 savage OR metro boomin',
  // Culture
  'hip hop album OR rap album OR mixtape OR rap beef OR diss track OR freestyle 2025',
  // Collabs / business
  'rapper collab OR hip hop tour 2025 OR rap award OR grammy rap OR BET hip hop',
];

// ── Legal queries — run all in parallel for maximum coverage ─────────────────
const LEGAL_QUERIES = [
  // Criminal cases
  'rapper arrested OR rapper charged OR rapper indicted OR rapper prison OR rapper sentenced OR rapper bail OR rapper parole OR rapper probation',
  // Civil & financial
  'rapper lawsuit OR rapper sued OR rapper court OR rapper settlement OR rapper trial OR rapper acquitted OR rapper verdict OR rapper appeal',
  // Music industry legal
  'rapper royalties lawsuit OR record label dispute OR music copyright lawsuit OR rapper contract dispute OR rapper defamation OR music rights lawsuit OR rapper restraining order OR rapper subpoena',
];

// ── Must contain at least one of these to pass relevance filter ─────────────
const HH_KEYWORDS = [
  'hip hop', 'hip-hop', 'rap', 'rapper', 'mc ', 'emcee', 'trap', 'drill',
  'kendrick', 'drake', 'travis scott', 'kanye', 'ye ', 'tyler', 'lil wayne',
  'nicki minaj', 'cardi b', 'future', 'playboi carti', 'baby keem', 'j. cole',
  'asap rocky', 'a$ap', '21 savage', 'young thug', 'gunna', 'lil baby',
  'metro boomin', 'jack harlow', 'central cee', 'little simz', 'kneecap',
  'biggie', 'tupac', '2pac', 'jay-z', 'nas', 'eminem', 'snoop', 'ice cube',
  'diss track', 'freestyled', 'mixtape', 'album drop', 'music video',
  'streetwear', 'merch drop', 'sneaker', 'collab', 'feature', 'verse',
  // More artists for broader legal/news coverage
  'megan thee stallion', 'offset', 'quavo', 'takeoff', 'polo g', 'lil durk',
  'roddy ricch', 'dababy', 'pooh shiesty', 'yung bleu', 'moneybagg yo',
  'mozzy', 'g herbo', 'nba youngboy', 'quando rondo', 'kodak black',
  'blueface', '6ix9ine', 'tekashi', 'a boogie', 'fivio foreign',
  'fetty wap', 'bobby shmurda', 'chief keef', 'rick ross', 'meek mill',
  'french montana', 'lil uzi', 'desiigner', 'max b', 'gillie da kid',
  'wale', 'big sean', 'kid cudi', 'mac miller', 'juice wrld', 'pop smoke',
  'drakeo', 'nipsey', 'xxxtentacion', 'lil peep', 'birdman', 'suge knight',
  'dr dre', 'eazy e', 'death row', 'bad boy', 'cash money', 'young money',
  'record label', 'music rights', 'royalt',
];

// ── Known hip-hop outlets get priority ──────────────────────────────────────
const PRIORITY_SOURCES = [
  'complex', 'xxlmag', 'hotnewhiphop', 'allhiphop', 'hiphopwired',
  'pitchfork', 'rolling-stone', 'billboard', 'thefader',
];

// ── Main export ─────────────────────────────────────────────────────────────
export async function fetchArticles(forceRefresh = false) {
  try {
    if (!forceRefresh) {
      const cached = await getCache();
      if (cached) return cached;
    }

    // Rotating general query + all 3 legal queries in parallel
    const rotatingQuery = QUERIES[Math.floor(Date.now() / CACHE_TTL_MS) % QUERIES.length];

    const [generalRes, ...legalResults] = await Promise.allSettled([
      fetchQuery(rotatingQuery, 20, true),                        // hip-hop outlets only
      ...LEGAL_QUERIES.map(q => fetchQuery(q, 15, false)),        // legal from any outlet
    ]);

    const generalArticles = generalRes.status === 'fulfilled' ? generalRes.value : [];
    const legalArticles   = legalResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    if (!generalArticles.length && !legalArticles.length) throw new Error('No articles');

    // Deduplicate by URL, merge legal + general, sort
    const seen   = new Set();
    const merged = [...legalArticles, ...generalArticles].filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    }).sort(sortByRelevance);

    await saveCache(merged);
    return merged;

  } catch (err) {
    console.warn('[NewsAPI] Falling back to cache:', err.message);
    const cached = await getCache(true);
    return cached || [];
  }
}

async function fetchQuery(query, pageSize = 20, useDomainsFilter = true) {
  const url = `${NEWS_API_BASE}/everything`
    + `?q=${encodeURIComponent(query)}`
    + `&language=en`
    + `&sortBy=publishedAt`
    + `&pageSize=${pageSize}`
    + (useDomainsFilter ? `&domains=${HH_DOMAINS}` : '')
    + `&apiKey=${NEWS_API_KEY}`;

  const res  = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error('Bad response');

  return (data.articles || [])
    .filter(a =>
      a.title &&
      a.description &&
      a.title !== '[Removed]' &&
      a.urlToImage &&
      isHipHopRelevant(a.title, a.description)
    )
    .map(mapArticle);
}

// ── Relevance guard — drop anything not actually about hip-hop ───────────────
function isHipHopRelevant(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase();
  return HH_KEYWORDS.some(kw => text.includes(kw));
}

// ── Mapping ──────────────────────────────────────────────────────────────────
function mapArticle(item, index) {
  const text     = (item.title + ' ' + (item.description || '')).toLowerCase();
  const category = detectCategory(text);
  const ageMs    = Date.now() - new Date(item.publishedAt).getTime();
  const ageHours = ageMs / 3600000;

  const isLegal = category === 'Legal';

  // BREAKING = published < 3h ago AND hot keywords — legal news always qualifies if < 6h
  const isBreaking = (
    (ageHours < 6 && isLegal) ||
    (ageHours < 3 && (
      text.includes('just dropped') ||
      text.includes('breaking') ||
      text.includes('announces') ||
      text.includes('releases') ||
      text.includes('drops') ||
      text.includes('beef') ||
      text.includes('diss') ||
      text.includes('responds') ||
      PRIORITY_SOURCES.some(s => item.source?.id === s)
    ))
  );

  return {
    id:        item.url || String(index),
    url:       item.url || null,
    category,
    title:     item.title,
    source:    item.source?.name || 'Unknown',
    timestamp: timeAgo(item.publishedAt),
    publishedAt: item.publishedAt,
    readTime:  estimateReadTime(item.content),
    isBreaking,
    imageUrl:  item.urlToImage,
    imageColor: '#1a1412',
    body: [
      item.description || '',
      item.content
        ? item.content.replace(/\[\+\d+ chars\]$/, '').trim()
        : 'Read the full article for more details.',
    ].filter(Boolean),
  };
}

// ── Sorting — breaking first, then by recency, boosted by priority source ───
function sortByRelevance(a, b) {
  // Breaking always floats to top
  if (a.isBreaking && !b.isBreaking) return -1;
  if (!a.isBreaking && b.isBreaking) return  1;
  // Then newest first
  return new Date(b.publishedAt) - new Date(a.publishedAt);
}

// ── Category detection ───────────────────────────────────────────────────────
function detectCategory(text) {
  // Legal always wins — check first
  if (/arrest|arrested|charged|indicted|indictment|lawsuit|sued|suing|trial|court|pleads? guilty|sentenced|verdict|probation|parole|bail|detained|prison|jail|federal|prosecutor|acquitted|conviction|subpoena|deposition|settlement|restraining order|copyright infringement|royalt|record label dispute|contract dispute|defamation|appeal|bond|released from|pled not guilty|criminal charge|civil suit|legal battle|music rights|injunction|cease and desist/.test(text)) return 'Legal';
  if (/beef|diss|clap back|feud|respond|shots? at|war of words|subliminal/.test(text))    return 'Beef';
  if (/tour|concert|live show|perform|headline|festival|stadium/.test(text))               return 'Tours';
  if (/award|grammy|bet |vma|ama|nominated|wins best/.test(text))                          return 'Awards';
  if (/drop|release|album|mixtape|ep |single|merch|collab|features/.test(text))            return 'Drops';
  if (/vs\.?|versus|battle|who.*better|who.*best|debate/.test(text))                      return 'Versus';
  if (/underground|independent|unsigned|buzzworthy|emerging|rising/.test(text))            return 'Underground';
  return 'Drops';
}

// ── AsyncStorage cache ───────────────────────────────────────────────────────
async function saveCache(articles) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), articles }));
}

async function getCache(ignoreExpiry = false) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, articles } = JSON.parse(raw);
    if (!ignoreExpiry && Date.now() - ts > CACHE_TTL_MS) return null;
    return articles;
  } catch (_) {
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function estimateReadTime(content) {
  if (!content) return '2 min read';
  const words = content.split(' ').length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function timeAgo(dateString) {
  if (!dateString) return 'Recently';
  const diff    = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  if (minutes < 1)  return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours   < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
