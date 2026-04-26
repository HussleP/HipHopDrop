/**
 * Hot Drop — Affiliate Configuration
 *
 * HOW TO ACTIVATE:
 *  1. Sign up for each program below (links included)
 *  2. Replace the placeholder strings with your real IDs
 *  3. UTM tracking is already live even before you have IDs
 *
 * EARNING POTENTIAL (conservative):
 *  StockX  ~3%  — $65 tee → $1.95/sale
 *  GOAT    ~5%  — $65 tee → $3.25/sale
 *  Nike    ~11% — $220 NOCTA fleece → $24/sale
 *  Direct  negotiable — aim for 10-15%
 */

// ─── YOUR AFFILIATE IDs ──────────────────────────────────────────────────────
// Replace each placeholder once you've signed up for the program.

export const AFFILIATE_IDS = {
  // ✅ StockX — sign up: https://stockx.com/affiliate
  // Network: Impact  |  Commission: ~3%  |  Cookie: 30 days
  stockx: 'YOUR_STOCKX_IMPACT_ID',

  // ✅ GOAT — sign up: https://www.goat.com/affiliate
  // Network: Rakuten  |  Commission: ~5%  |  Cookie: 30 days
  goat: 'YOUR_GOAT_RAKUTEN_ID',

  // ✅ Nike (covers NOCTA) — sign up: https://www.nike.com/help/a/affiliates
  // Network: Impact  |  Commission: up to 11%  |  Cookie: 30 days
  nike: 'YOUR_NIKE_IMPACT_ID',

  // ✅ Golf Wang — sign up: https://www.shareasale.com (search "Golf Wang")
  // Network: ShareASale  |  Commission: ~10%  |  Cookie: 30 days
  golfwang: 'YOUR_GOLFWANG_SHAREASALE_ID',

  // ✅ Direct brand deals — email their merch teams:
  //   travisscott.com  →  merch@cactus-jack.com
  //   opiumlabel.com   →  contact via Instagram DM
  //   fuckingawesome.com → reach out via their contact page
  cactusJack: 'YOUR_CACTUS_JACK_AFFILIATE_ID',
  opium:      'YOUR_OPIUM_AFFILIATE_ID',
  fa:         'YOUR_FA_AFFILIATE_ID',
  hockey:     'YOUR_HOCKEY_AFFILIATE_ID',
  limosine:   'YOUR_LIMOSINE_AFFILIATE_ID',
};

// ─── BRAND → PROGRAM MAP ─────────────────────────────────────────────────────
// platform:  which affiliate program to use
// fallback:  if true, route to StockX search when no direct deal exists
//            (StockX sells almost everything — you still earn)
// stockxQuery: custom search string for StockX fallback

export const BRAND_AFFILIATE_MAP = {
  'Travis Scott': {
    platform: 'cactusJack',
    fallback: true,
    stockxQuery: 'Cactus Jack Travis Scott',
  },
  'Drake': {
    platform: 'nike',
    fallback: false,
  },
  'Tyler, the Creator': {
    platform: 'golfwang',
    fallback: false,
  },
  'A$AP Rocky': {
    platform: 'stockx',
    fallback: true,
    stockxQuery: 'AWGE A$AP Rocky',
  },
  'Kanye West': {
    platform: 'stockx',
    fallback: true,
    stockxQuery: 'Yeezy',
  },
  'Kendrick Lamar': {
    platform: 'stockx',
    fallback: true,
    stockxQuery: 'Kendrick Lamar GNX',
  },
  'Playboi Carti': {
    platform: 'opium',
    fallback: true,
    stockxQuery: 'Playboi Carti Opium',
  },
  'Future': {
    platform: 'stockx',
    fallback: true,
    stockxQuery: 'Future Pluto merch',
  },
  'Metro Boomin': {
    platform: 'stockx',
    fallback: true,
    stockxQuery: 'Metro Boomin Heroes Villains',
  },
  'J. Cole': {
    platform: 'stockx',
    fallback: true,
    stockxQuery: 'J Cole Dreamville',
  },

  // Skate brands
  'Supreme': {
    platform: 'stockx',
    fallback: true,
    stockxQuery: 'Supreme',
  },
  'FA (Fucking Awesome)': {
    platform: 'fa',
    fallback: true,
    stockxQuery: 'Fucking Awesome FA',
  },
  'Hockey': {
    platform: 'hockey',
    fallback: true,
    stockxQuery: 'Hockey Skateboards',
  },
  'Limosine': {
    platform: 'limosine',
    fallback: true,
    stockxQuery: 'Limosine brand',
  },
};
