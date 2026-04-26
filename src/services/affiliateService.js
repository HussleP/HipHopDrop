/**
 * Hot Drop — Affiliate Service
 *
 * Two jobs:
 *  1. buildAffiliateUrl(drop)  — wraps buyUrl with affiliate tracking params
 *  2. trackBuyClick(drop)      — logs every tap to Firestore for reporting
 *
 * UTM params fire immediately. Affiliate IDs activate as you fill them in
 * affiliateConfig.js — no other code changes needed.
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { AFFILIATE_IDS, BRAND_AFFILIATE_MAP } from '../config/affiliateConfig';

// ─── URL builder ─────────────────────────────────────────────────────────────

/**
 * Returns a tracked URL for the given drop.
 *
 * Priority:
 *  1. Direct affiliate program with a valid ID  → append affiliate + UTM params
 *  2. StockX fallback with a valid StockX ID    → StockX search with affiliate link
 *  3. StockX fallback without ID                → StockX search with UTM only
 *  4. No config                                 → original URL + UTM only
 */
export function buildAffiliateUrl(drop) {
  const config = BRAND_AFFILIATE_MAP[drop.artist];
  const utmSuffix = buildUtmParams(drop);

  // ── Case: no config for this brand ──
  if (!config) return appendParams(drop.buyUrl, utmSuffix);

  const affiliateId = AFFILIATE_IDS[config.platform];
  const hasId = affiliateId && !affiliateId.startsWith('YOUR_');

  // ── Case: Nike / NOCTA ──
  if (config.platform === 'nike' && hasId) {
    return appendParams(drop.buyUrl, `${utmSuffix}&ranMID=${affiliateId}&ranEAID=hotdrop`);
  }

  // ── Case: Golf Wang (ShareASale) ──
  if (config.platform === 'golfwang' && hasId) {
    return appendParams(drop.buyUrl, `${utmSuffix}&afftrack=${affiliateId}`);
  }

  // ── Case: StockX (direct or fallback) ──
  const stockxId = AFFILIATE_IDS.stockx;
  const hasStockxId = stockxId && !stockxId.startsWith('YOUR_');

  if (config.platform === 'stockx' || (config.fallback && !hasId)) {
    const query = encodeURIComponent(
      config.stockxQuery || `${drop.artist} ${drop.item.split('—').pop().trim()}`
    );
    const base = `https://stockx.com/search?s=${query}`;
    const affParam = hasStockxId ? `&ranMID=${stockxId}&ranEAID=hotdrop` : '';
    return `${base}${affParam}&${utmSuffix}`;
  }

  // ── Case: direct deal with valid ID ──
  if (hasId) {
    return appendParams(drop.buyUrl, `${utmSuffix}&ref=hotdrop&aff=${affiliateId}`);
  }

  // ── Fallback: UTM only ──
  return appendParams(drop.buyUrl, utmSuffix);
}

// ─── Click tracker ────────────────────────────────────────────────────────────

/**
 * Fire-and-forget. Logs a tap to Firestore.
 * Never blocks or throws — the buy flow must not be interrupted.
 *
 * Collection: affiliate_clicks
 * Use this data to:
 *  - Show brands how much traffic you drive (negotiation leverage)
 *  - Calculate your own conversion rates
 *  - Prioritise which programs to join first
 */
export async function trackBuyClick(drop) {
  try {
    await addDoc(collection(db, 'affiliate_clicks'), {
      dropId:    drop.id,
      artist:    drop.artist,
      item:      drop.item,
      price:     drop.price,
      category:  drop.category,
      brand:     drop.brand || 'hiphop',
      status:    drop.status,
      platform:  BRAND_AFFILIATE_MAP[drop.artist]?.platform || 'none',
      timestamp: serverTimestamp(),
    });
  } catch {
    // Silently swallow — never block a purchase
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUtmParams(drop) {
  const content = drop.artist.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return [
    'utm_source=hotdrop',
    'utm_medium=affiliate',
    `utm_campaign=${drop.id}`,
    `utm_content=${content}`,
  ].join('&');
}

function appendParams(url, params) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params}`;
}
