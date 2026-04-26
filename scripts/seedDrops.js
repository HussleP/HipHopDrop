/**
 * Hot Drop — Firestore Seed Script
 *
 * Uploads real upcoming drops to Firestore.
 * Timestamps are calculated from the moment you run the script,
 * so every drop is always in the future.
 *
 * RUN ONCE:
 *   node scripts/seedDrops.js
 *
 * RE-RUN SAFELY:
 *   Uses drop IDs as document IDs — re-running updates existing docs.
 *
 * ADD YOUR OWN DROPS:
 *   Copy any entry below, give it a unique id, update the details, done.
 *   dropTime: NOW + (X * HOUR) or NOW + (X * DAY)
 */

const { initializeApp }    = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

// ── Firebase config (same as src/services/firebase.js) ───────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyA0cfWz8PYxeUcgusohuiLV2n59XxyqCcw',
  authDomain:        'hiphopdrop-1.firebaseapp.com',
  projectId:         'hiphopdrop-1',
  storageBucket:     'hiphopdrop-1.firebasestorage.app',
  messagingSenderId: '78789996357',
  appId:             '1:78789996357:web:ce53ae1f269a619c43982c',
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Time helpers ──────────────────────────────────────────────────────────────
const NOW  = Date.now();
const MIN  = 60 * 1000;
const HOUR = 60 * MIN;
const DAY  = 24 * HOUR;

function ts(ms) {
  return Timestamp.fromMillis(ms);
}

// ── Drop data ─────────────────────────────────────────────────────────────────
// Edit these to match whatever is actually dropping this week.
// Set dropTime to when the brand announces the drop goes live.
// Leave endTime out for drops that don't have a hard close (most do ~24h or sell out fast).

const DROPS = [
  // ── LIVE RIGHT NOW ────────────────────────────────────────────────────────
  {
    id: 'd1',
    artist:      'Travis Scott',
    item:        'CACTUS JACK — Utopia Flame Tee',
    price:       65,
    category:    'tee',
    dropTime:    ts(NOW - (90 * MIN)),
    endTime:     ts(NOW + (150 * MIN)),
    sizes:       ['S', 'M', 'L', 'XL', 'XXL'],
    limited:     true,
    imageColor:  '#2a1a0e',
    accentColor: '#E07B0A',
    buyUrl:      'https://travisscott.com/collections/merch',
    tags:        ['LIMITED'],
    brand:       'hiphop',
    active:      true,
  },

  // ── DROPPING SOON (update these every week) ───────────────────────────────
  {
    id: 'd2',
    artist:      'Drake',
    item:        'NOCTA Cardinal Tech Fleece',
    price:       220,
    category:    'hoodie',
    dropTime:    ts(NOW + (47 * MIN)),
    sizes:       ['S', 'M', 'L', 'XL'],
    limited:     true,
    imageColor:  '#1a0e1a',
    accentColor: '#a855f7',
    buyUrl:      'https://nocta.com',
    tags:        ['COLLAB', 'LIMITED'],
    brand:       'hiphop',
    active:      true,
  },
  {
    id: 'd3',
    artist:      'Tyler, the Creator',
    item:        'Golf Wang — Lavender Rose Cap',
    price:       48,
    category:    'hat',
    dropTime:    ts(NOW + (4.2 * HOUR)),
    sizes:       null,
    limited:     false,
    imageColor:  '#0e2a1a',
    accentColor: '#4ade80',
    buyUrl:      'https://golfwang.com',
    tags:        [],
    brand:       'hiphop',
    active:      true,
  },

  // ── THIS WEEK ─────────────────────────────────────────────────────────────
  {
    id: 'd4',
    artist:      'A$AP Rocky',
    item:        'AWGE × Wacko Maria Bucket Hat',
    price:       55,
    category:    'hat',
    dropTime:    ts(NOW + (1.2 * DAY)),
    sizes:       ['S/M', 'L/XL'],
    limited:     true,
    imageColor:  '#0e1a0e',
    accentColor: '#00C4D4',
    buyUrl:      'https://awge.com',
    tags:        ['COLLAB', 'LIMITED'],
    brand:       'hiphop',
    active:      true,
  },
  {
    id: 'd5',
    artist:      'Kanye West',
    item:        'YEEZY — Sand Crewneck',
    price:       90,
    category:    'hoodie',
    dropTime:    ts(NOW + (2.1 * DAY)),
    sizes:       ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    limited:     false,
    imageColor:  '#1a1a16',
    accentColor: '#C9A45A',
    buyUrl:      'https://yeezy.com',
    tags:        [],
    brand:       'hiphop',
    active:      true,
  },
  {
    id: 'd6',
    artist:      'Kendrick Lamar',
    item:        'GNX Vinyl — Limited First Press',
    price:       35,
    category:    'vinyl',
    dropTime:    ts(NOW + (3.4 * DAY)),
    sizes:       null,
    limited:     true,
    imageColor:  '#0e1a2a',
    accentColor: '#00C4D4',
    buyUrl:      'https://shop.pglamusic.com',
    tags:        ['LIMITED', 'VINYL'],
    brand:       'hiphop',
    active:      true,
  },
  {
    id: 'd7',
    artist:      'Playboi Carti',
    item:        'Opium — WLR Varsity Jacket',
    price:       380,
    category:    'jacket',
    dropTime:    ts(NOW + (5.8 * DAY)),
    sizes:       ['S', 'M', 'L', 'XL'],
    limited:     true,
    imageColor:  '#2a0e0e',
    accentColor: '#E8305A',
    buyUrl:      'https://opiumlabel.com',
    tags:        ['LIMITED', 'RARE'],
    brand:       'hiphop',
    active:      true,
  },
  {
    id: 'd8',
    artist:      'Future',
    item:        'Pluto × Chrome Hearts Tee',
    price:       145,
    category:    'tee',
    dropTime:    ts(NOW + (6.5 * DAY)),
    sizes:       ['S', 'M', 'L', 'XL'],
    limited:     true,
    imageColor:  '#1a1a2a',
    accentColor: '#a855f7',
    buyUrl:      'https://future.lnk.to/merch',
    tags:        ['COLLAB', 'LIMITED'],
    brand:       'hiphop',
    active:      true,
  },

  // ── SKATE DROPS ───────────────────────────────────────────────────────────
  {
    id: 's1',
    artist:      'Supreme',
    item:        'Supreme — Box Logo Tee (Black)',
    price:       54,
    category:    'tee',
    dropTime:    ts(NOW - (20 * MIN)),
    endTime:     ts(NOW + (4 * HOUR)),
    sizes:       ['S', 'M', 'L', 'XL', 'XXL'],
    limited:     true,
    imageColor:  '#1a0000',
    accentColor: '#FF1A1A',
    buyUrl:      'https://www.supremenewyork.com/shop/all/t-shirts',
    tags:        ['BOX LOGO', 'LIMITED'],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's2',
    artist:      'Supreme',
    item:        'Supreme — Smurfs Hooded Sweatshirt',
    price:       168,
    category:    'hoodie',
    dropTime:    ts(NOW + (6 * DAY) + (18 * HOUR)),
    sizes:       ['S', 'M', 'L', 'XL', 'XXL'],
    limited:     true,
    imageColor:  '#0a0014',
    accentColor: '#FF1A1A',
    buyUrl:      'https://www.supremenewyork.com/shop/all/sweatshirts',
    tags:        ['COLLAB', 'LIMITED'],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's3',
    artist:      'Supreme',
    item:        'Supreme — Patchwork Denim Trucker Jacket',
    price:       398,
    category:    'jacket',
    dropTime:    ts(NOW + (6 * DAY) + (18 * HOUR)),
    sizes:       ['S', 'M', 'L', 'XL'],
    limited:     true,
    imageColor:  '#0a0a1a',
    accentColor: '#FF1A1A',
    buyUrl:      'https://www.supremenewyork.com/shop/all/jackets',
    tags:        ['LIMITED', 'RARE'],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's4',
    artist:      'FA (Fucking Awesome)',
    item:        'FA — Dill Face Tee',
    price:       40,
    category:    'tee',
    dropTime:    ts(NOW + (1.8 * DAY)),
    sizes:       ['S', 'M', 'L', 'XL'],
    limited:     true,
    imageColor:  '#0a140a',
    accentColor: '#00E676',
    buyUrl:      'https://fuckingawesome.com/collections/tees',
    tags:        ['LIMITED'],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's5',
    artist:      'FA (Fucking Awesome)',
    item:        'FA — Angel Dust Deck',
    price:       65,
    category:    'deck',
    dropTime:    ts(NOW + (1.8 * DAY)),
    sizes:       ['8.0"', '8.25"', '8.5"'],
    limited:     true,
    imageColor:  '#0a0e14',
    accentColor: '#00E676',
    buyUrl:      'https://fuckingawesome.com/collections/decks',
    tags:        ['LIMITED'],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's6',
    artist:      'Hockey',
    item:        'Hockey — Skull Logo Hoodie',
    price:       88,
    category:    'hoodie',
    dropTime:    ts(NOW + (3.1 * DAY)),
    sizes:       ['S', 'M', 'L', 'XL'],
    limited:     false,
    imageColor:  '#140a0a',
    accentColor: '#E8305A',
    buyUrl:      'https://hockeyskateboards.com',
    tags:        [],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's7',
    artist:      'Hockey',
    item:        'Hockey — Ben Kadow Floral Deck',
    price:       65,
    category:    'deck',
    dropTime:    ts(NOW + (3.1 * DAY)),
    sizes:       ['8.0"', '8.25"', '8.38"'],
    limited:     true,
    imageColor:  '#0e0a14',
    accentColor: '#E8305A',
    buyUrl:      'https://hockeyskateboards.com/collections/decks',
    tags:        ['PRO MODEL'],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's8',
    artist:      'Limosine',
    item:        'Limosine — Static Tee',
    price:       38,
    category:    'tee',
    dropTime:    ts(NOW + (4.7 * DAY)),
    sizes:       ['S', 'M', 'L', 'XL'],
    limited:     false,
    imageColor:  '#0e0e0e',
    accentColor: '#C9A45A',
    buyUrl:      'https://limosinebrand.com',
    tags:        [],
    brand:       'skate',
    active:      true,
  },
  {
    id: 's9',
    artist:      'Limosine',
    item:        'Limosine — Cruisin Deck',
    price:       60,
    category:    'deck',
    dropTime:    ts(NOW + (4.7 * DAY)),
    sizes:       ['8.0"', '8.25"', '8.5"'],
    limited:     true,
    imageColor:  '#14100a',
    accentColor: '#C9A45A',
    buyUrl:      'https://limosinebrand.com/collections/decks',
    tags:        ['LIMITED'],
    brand:       'skate',
    active:      true,
  },
];

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\nSeeding ${DROPS.length} drops to Firestore...\n`);
  let ok = 0, fail = 0;

  for (const drop of DROPS) {
    const { id, ...data } = drop;
    try {
      await setDoc(doc(collection(db, 'drops'), id), data, { merge: true });
      console.log(`  ✓  ${drop.artist} — ${drop.item}`);
      ok++;
    } catch (e) {
      console.error(`  ✗  ${drop.artist} — ${drop.item}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone. ${ok} seeded, ${fail} failed.\n`);
  process.exit(fail > 0 ? 1 : 0);
}

seed().catch(e => { console.error(e); process.exit(1); });
