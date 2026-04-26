/**
 * Hot Drop — Automatic Drop Scraper
 *
 * Scrapes new merch from:
 *   Supreme        — mobile_stock.json (new Thursday items)
 *   NOCTA (Drake)  — nocta.com Shopify
 *   Golf Wang      — golfwang.com Shopify
 *   FA             — fuckingawesome.com Shopify
 *   Limosine       — limosineskateboards.com Shopify
 *
 * Writes new drops to Firestore. Skips anything already seen (via sourceId).
 * Runs automatically via GitHub Actions every Thursday + Monday.
 *
 * Requires env var: FIREBASE_SERVICE_ACCOUNT (JSON string of service account key)
 * Get it from: Firebase Console → Project Settings → Service Accounts → Generate new key
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// ── Firebase init ──────────────────────────────────────────────────────────────
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT env var not set. See setup instructions.');
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Time helpers ───────────────────────────────────────────────────────────────
const NOW  = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY  = 24 * HOUR;

/** Returns timestamp for the upcoming Thursday at 11:00am ET (16:00 UTC) */
function nextThursday11amET() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 4=Thu
  const daysUntil = day === 4 ? 7 : (4 - day + 7) % 7;
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysUntil);
  next.setUTCHours(16, 0, 0, 0); // 16:00 UTC = 11:00 ET
  return next.getTime();
}

/** Fetch with timeout + retry */
async function fetchJSON(url, options = {}, retries = 3) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Accept': 'application/json',
    ...options.headers,
  };
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

// ── Deduplication ──────────────────────────────────────────────────────────────
async function sourceIdExists(sourceId) {
  const snap = await db.collection('drops')
    .where('sourceId', '==', sourceId).limit(1).get();
  return !snap.empty;
}

async function saveDrop(drop) {
  if (await sourceIdExists(drop.sourceId)) return false;
  await db.collection('drops').add({
    ...drop,
    active:    true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return true;
}

// ── Category helpers ───────────────────────────────────────────────────────────
const SKIP_CATEGORIES = new Set(['pants', 'shorts', 'shoes', 'boots', 'bags', 'socks', 'underwear', 'other']);

function inferCategory(type = '', title = '', tags = []) {
  const t = `${type} ${title} ${tags.join(' ')}`.toLowerCase();
  if (t.includes('deck') || t.includes('skateboard')) return 'deck';
  if (t.includes('jacket') || t.includes('parka') || t.includes('coat') || t.includes('bomber')) return 'jacket';
  if (t.includes('hoodie') || t.includes('hooded') || t.includes('sweatshirt') || t.includes('crewneck') || t.includes('fleece')) return 'hoodie';
  if (t.includes('hat') || t.includes('cap') || t.includes('beanie') || t.includes('snapback')) return 'hat';
  if (t.includes('tee') || t.includes('t-shirt') || t.includes('shirt') || t.includes('top') || t.includes('tshirt')) return 'tee';
  if (t.includes('pant') || t.includes('short') || t.includes('bag') || t.includes('shoe') || t.includes('boot')) return null;
  return 'tee'; // default
}

function extractSizes(variants = []) {
  const sizes = variants
    .filter(v => v.available !== false)
    .map(v => {
      // "Pink Multi / SM" → "SM", "Size M" → "M"
      const parts = v.title.split('/');
      return parts[parts.length - 1].trim().replace(/^size\s+/i, '');
    })
    .filter(s => s && s !== 'Default Title' && s.length <= 6)
    .filter((s, i, arr) => arr.indexOf(s) === i); // dedupe
  return sizes.length > 0 ? sizes : null;
}

function defaultSizes(category) {
  if (category === 'deck') return ['8.0"', '8.25"', '8.5"'];
  if (category === 'hat')  return ['S/M', 'L/XL'];
  return ['S', 'M', 'L', 'XL'];
}

// ── Supreme ────────────────────────────────────────────────────────────────────
async function scrapeSupreme() {
  console.log('\n🔴 Supreme (Thursday drop)...');
  try {
    const data = await fetchJSON('https://www.supremenewyork.com/mobile_stock.json');
    const cats  = data.products_and_categories || {};
    const dropTime = nextThursday11amET();
    let added = 0, skipped = 0;

    for (const [catName, items] of Object.entries(cats)) {
      for (const item of items || []) {
        if (!item.new) { skipped++; continue; }

        const catMap = {
          'Tops/Sweaters': (n) => inferCategory('', n, []),
          'Jackets':        () => 'jacket',
          'Hats':           () => 'hat',
          'Skate':          () => 'deck',
        };
        const category = catMap[catName]?.(item.name) ?? inferCategory(catName, item.name, []);
        if (!category || SKIP_CATEGORIES.has(category)) continue;

        const drop = {
          sourceId:    `supreme_${item.id}`,
          artist:      'Supreme',
          item:        `Supreme — ${item.name}`,
          price:       Math.round((item.price || 0) / 100),
          category,
          dropTime:    Timestamp.fromMillis(dropTime),
          endTime:     Timestamp.fromMillis(dropTime + DAY),
          sizes:       defaultSizes(category),
          limited:     true,
          imageColor:  '#1a0000',
          accentColor: '#FF1A1A',
          buyUrl:      `https://www.supremenewyork.com/shop/${item.id}`,
          tags:        ['THURSDAY DROP', 'LIMITED'],
          brand:       'skate',
        };

        const wasAdded = await saveDrop(drop);
        if (wasAdded) { console.log(`  ✓ ${drop.item} $${drop.price}`); added++; }
      }
    }
    console.log(`  → ${added} new, ${skipped} existing/skipped`);
  } catch (e) {
    console.error(`  ✗ Supreme failed: ${e.message}`);
  }
}

// ── Shopify scraper (generic) ──────────────────────────────────────────────────
async function scrapeShopify(config) {
  console.log(`\n${config.emoji} ${config.artist}...`);
  try {
    const url = `${config.baseUrl}/products.json?limit=50&sort_by=created-descending`;
    const data = await fetchJSON(url);

    // Only products created in the last 21 days
    const cutoff = NOW - (21 * DAY);
    const recent = (data.products || []).filter(p =>
      new Date(p.created_at).getTime() > cutoff
    );

    let added = 0;
    for (const product of recent) {
      const category = inferCategory(product.product_type, product.title, product.tags || []);
      if (!category || SKIP_CATEGORIES.has(category)) continue;

      const price  = Math.round(parseFloat(product.variants?.[0]?.price || 0));
      const sizes  = extractSizes(product.variants) ?? defaultSizes(category);
      const isLimited = (product.tags || []).some(t =>
        ['limited', 'limited-edition', 'collab', 'collaboration'].includes(t.toLowerCase())
      );

      // Drop time: use product creation date if in future, else 2 days from now
      const createdMs = new Date(product.created_at).getTime();
      const dropTimeMs = createdMs > NOW ? createdMs : NOW + (2 * DAY);

      const tags = (product.tags || [])
        .filter(t => ['limited', 'collab', 'new', 'pro-model', 'exclusive'].some(k => t.toLowerCase().includes(k)))
        .map(t => t.toUpperCase())
        .slice(0, 3);
      if (tags.length === 0) tags.push('NEW');

      const drop = {
        sourceId:    `${config.id}_${product.id}`,
        artist:      config.artist,
        item:        `${config.prefix}${product.title}`,
        price,
        category,
        dropTime:    Timestamp.fromMillis(dropTimeMs),
        sizes,
        limited:     isLimited,
        imageColor:  config.imageColor,
        accentColor: config.accentColor,
        buyUrl:      `${config.baseUrl}/products/${product.handle}`,
        tags,
        brand:       config.brand,
      };

      const wasAdded = await saveDrop(drop);
      if (wasAdded) { console.log(`  ✓ ${drop.item} $${drop.price}`); added++; }
    }
    console.log(`  → ${added} new drops added`);
  } catch (e) {
    console.error(`  ✗ ${config.artist} failed: ${e.message}`);
  }
}

// ── Brand configs ──────────────────────────────────────────────────────────────
const SHOPIFY_BRANDS = [
  {
    id:         'nocta',
    artist:     'Drake',
    prefix:     'NOCTA — ',
    emoji:      '🎤',
    baseUrl:    'https://nocta.com',
    imageColor: '#1a0e1a',
    accentColor:'#a855f7',
    brand:      'hiphop',
  },
  {
    id:         'golfwang',
    artist:     'Tyler, the Creator',
    prefix:     'Golf Wang — ',
    emoji:      '🌹',
    baseUrl:    'https://golfwang.com',
    imageColor: '#0e2a1a',
    accentColor:'#4ade80',
    brand:      'hiphop',
  },
  {
    id:         'fa',
    artist:     'FA (Fucking Awesome)',
    prefix:     'FA — ',
    emoji:      '🛹',
    baseUrl:    'https://fuckingawesome.com',
    imageColor: '#0a140a',
    accentColor:'#00E676',
    brand:      'skate',
  },
  {
    id:         'limosine',
    artist:     'Limosine',
    prefix:     'Limosine — ',
    emoji:      '🚗',
    baseUrl:    'https://limosineskateboards.com',
    imageColor: '#0e0e0e',
    accentColor:'#C9A45A',
    brand:      'skate',
  },
];

// ── Main ───────────────────────────────────────────────────────────────────────
const startTime = Date.now();
console.log('🔥 Hot Drop Scraper starting...');
console.log(`   ${new Date().toUTCString()}\n`);

await scrapeSupreme();
for (const brand of SHOPIFY_BRANDS) {
  await scrapeShopify(brand);
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n✅ Done in ${elapsed}s`);
process.exit(0);
