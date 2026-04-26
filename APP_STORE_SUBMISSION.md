# Hot Drop — App Store Submission Package

Everything below is ready to paste directly into App Store Connect.

---

## APP INFORMATION

**Name** (30 char max — currently 8)
```
Hot Drop
```

**Subtitle** (30 char max — currently 29)
```
Merch Drops. Live Alerts. Now.
```

**Bundle ID**
```
com.hotdrop.app
```

**Primary Category**
```
Shopping
```

**Secondary Category**
```
Music
```

**Age Rating**
```
4+ (no objectionable content)
```

**Price**
```
Free
```

---

## KEYWORDS (100 char max — currently 99)
> Paste this entire string into the Keywords field. Do NOT use spaces after commas.

```
supreme drop,merch tracker,streetwear,drop alert,limited release,hip hop merch,skate brand,nocta
```

---

## PROMOTIONAL TEXT (170 char max — can be updated anytime without re-review)
```
Supreme. Travis Scott. Golf Wang. FA. Hockey. Know exactly what's dropping, when it drops, and cop it before it's gone. Live alerts. Zero FOMO.
```

---

## DESCRIPTION (4000 char max)
> Paste this exactly. Line breaks are preserved in App Store Connect.

```
Hot Drop is the only app built for serious merch buyers.

Know what's dropping before it drops. Get alerted the second it goes live. Buy in one tap. Never take an L again.

──────────────────────────
LIVE DROP FEED
──────────────────────────
See what's dropping right now — a glowing live card shows the active release with a real-time countdown to sellout. Supreme Box Logo Tees. Travis Scott Cactus Jack collabs. NOCTA Cardinal Fleece. Golf Wang capsules. If it's dropping, it's here.

──────────────────────────
COUNTDOWN CALENDAR
──────────────────────────
Every upcoming drop laid out in chronological order. Countdowns tick to the second. Filter by Tees, Hoodies, Jackets, Decks, Vinyl, and more so you only see what you care about.

──────────────────────────
NOTIFY ME — ONE TAP ALERTS
──────────────────────────
Tap the bell on any upcoming drop and we'll push you a notification the moment it goes live. Set it and forget it — Hot Drop watches the clock so you don't have to.

──────────────────────────
SUPREME THURSDAYS, COVERED
──────────────────────────
Supreme drops every Thursday and sells out in minutes. Hot Drop shows exactly what's in the drop, the countdown to the second, and a direct link to the item — so you spend zero time searching and all your time copping.

──────────────────────────
HIP-HOP + SKATE IN ONE FEED
──────────────────────────
The two cultures that define streetwear, tracked in one place:

Hip-Hop: Travis Scott, Drake (NOCTA), Tyler the Creator (Golf Wang), Kanye (YEEZY), Kendrick Lamar, Playboi Carti (Opium), A$AP Rocky, Future

Skate: Supreme, Fucking Awesome (FA), Hockey, Limosine

──────────────────────────
SUBMIT A TIP
──────────────────────────
Know about a drop before it's announced? Submit a tip — our team reviews every submission. The culture runs on inside info. Share it.

──────────────────────────
BUILT FOR BUYERS, NOT BROWSERS
──────────────────────────
No algorithms. No clutter. No news you don't care about. Just drops, countdowns, and buy links — organized by what's happening right now.

Hot Drop is free. The drops won't be available forever.
```

---

## WHAT'S NEW (Version 1.0.0)
```
Hot Drop is here.

Live merch drop feed. Second-by-second countdowns. One-tap alerts. Supreme, Travis Scott, NOCTA, Golf Wang, FA, Hockey, Limosine — all in one place.

Never miss a drop again.
```

---

## SUPPORT & LEGAL URLS

**Support URL**
```
https://hot-drop.app/support
```

**Marketing URL** (optional but recommended)
```
https://hot-drop.app
```

**Privacy Policy URL** ← REQUIRED by Apple
```
https://hot-drop.app/privacy
```

> The privacy policy screen already exists in-app. You'll also need it at this URL.
> Quickest way: deploy the GitHub Pages site that's already in the repo.

---

## APP REVIEW INFORMATION

**Notes for Reviewer**
```
Hot Drop is a merch drop tracker for streetwear and hip-hop culture.

Test account credentials:
  Email:    reviewer@hot-drop.app
  Password: HotDrop2024!

The app allows anonymous browsing of the drop feed without an account.
Firebase Authentication is used for saved articles and notification preferences only.
Buy buttons open brand websites in an in-app browser — no purchases are processed within the app.
Affiliate tracking uses standard UTM parameters appended to external URLs.
```

> ⚠️  Create this test account before submitting so the reviewer can log in.

---

## SCREENSHOTS — WHAT TO CAPTURE

Apple requires screenshots for:
- **6.9" display** (iPhone 16 Pro Max) — 1320×2868 px  ← required
- **6.7" display** (iPhone 14 Plus) — 1284×2778 px  ← required
- **5.5" display** (iPhone 8 Plus) — 1242×2208 px  ← required

### Recommended 5-screenshot sequence:

| # | Screen | Caption overlay |
|---|--------|----------------|
| 1 | Live Feed — Supreme Box Logo card glowing | **"Know what's live. Right now."** |
| 2 | Calendar tab — full drop list with countdowns | **"Every drop. Every countdown."** |
| 3 | Notify Me toggle active on NOCTA fleece | **"Get alerted before it sells out."** |
| 4 | Live card BUY NOW → in-app browser | **"One tap to cop."** |
| 5 | Category filter chips — Tees / Decks / Hoodies | **"Filter to what matters to you."** |

### How to take them:
1. Run the app in Expo Go on an iPhone 16 Pro Max (or use Xcode Simulator)
2. Navigate to each screen
3. Press Side Button + Volume Up to screenshot
4. Export from Photos at full resolution
5. Add text overlays in Canva or Figma (font: bold sans-serif, white text, bottom third of screen)

---

## ICON COMPLIANCE CHECKLIST

- [x] 1024×1024 px
- [x] PNG format
- [x] No alpha channel (flattened to #0A0907 background)
- [x] No rounded corners (Apple adds them)
- [ ] Visually distinct at 60×60 px — **verify this looks good at small size**

---

## PRE-SUBMISSION CHECKLIST

### Technical
- [ ] Run `npx eas login` and create account
- [ ] Run `npx eas init` to get real EAS project ID
- [ ] Replace `YOUR_EAS_PROJECT_ID` in app.json with real ID
- [ ] Fill in eas.json: appleId, ascAppId, appleTeamId
- [ ] Run `npx eas build --platform ios --profile production`
- [ ] Confirm build passes in EAS dashboard

### App Store Connect
- [ ] Apple Developer Program enrolled (developer.apple.com/enroll — $99/yr)
- [ ] New app created in App Store Connect with bundle ID `com.hotdrop.app`
- [ ] All listing content above pasted in
- [ ] 5 screenshots uploaded for each required display size
- [ ] Privacy policy URL live and accessible
- [ ] Test account created (reviewer@hot-drop.app)
- [ ] Age rating questionnaire completed (should be 4+)
- [ ] Pricing set to Free

### Submit
- [ ] Run `npx eas submit --platform ios --profile production`
- [ ] App submitted for review in App Store Connect
- [ ] Monitor review status (typically 24–48 hrs, first submission can be longer)

---

## AFTER APPROVAL — FIRST WEEK MOVES

1. **Post on Reddit**: r/supremeclothing, r/hiphopheads, r/streetwear — "Built a free app that tracks merch drops. Supreme, Travis Scott, FA, Hockey etc." — no spam, genuine post, include screenshots
2. **Instagram**: Short Reels showing the live countdown ticking on a Supreme drop
3. **Activate affiliate IDs**: Sign up for StockX + Nike Impact programs (see affiliateConfig.js)
4. **TikTok**: "POV: you never miss a Supreme Thursday drop" — trending audio + screen recording
5. **DM 5 streetwear accounts**: Offer free promo shoutout in exchange for a story post

---

*Generated by Claude Code — Hot Drop v1.0.0*
