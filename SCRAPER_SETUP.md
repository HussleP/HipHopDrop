# Hot Drop — Automatic Scraper Setup

One-time setup. After this, new drops appear in the app automatically every Thursday and Monday — no action needed from you.

---

## What it scrapes

| Brand | What | When |
|---|---|---|
| **Supreme** | New Thursday drop items | Thursday 11am ET |
| **NOCTA (Drake)** | New releases on nocta.com | Monday 10am ET |
| **Golf Wang** | New releases on golfwang.com | Monday 10am ET |
| **FA** | New releases on fuckingawesome.com | Monday 10am ET |
| **Limosine** | New releases on limosineskateboards.com | Monday 10am ET |

---

## Setup (15 minutes, one time)

### Step 1 — Get your Firebase service account key

1. Go to **console.firebase.google.com**
2. Select project **hiphopdrop-1**
3. Click the ⚙️ gear → **Project Settings**
4. Click the **Service Accounts** tab
5. Click **Generate new private key** → **Generate Key**
6. A JSON file downloads — keep it safe, don't share it

### Step 2 — Add it as a GitHub secret

1. Go to **github.com/HussleP/HipHopDrop**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: paste the **entire contents** of the JSON file you downloaded
6. Click **Add secret**

### Step 3 — Test it manually

1. Go to **github.com/HussleP/HipHopDrop/actions**
2. Click **Scrape Drops** in the left sidebar
3. Click **Run workflow** → **Run workflow** (green button)
4. Watch the logs — you should see drops being added

That's it. The scraper now runs automatically every Thursday and Monday forever.

---

## What happens when it runs

```
🔥 Hot Drop Scraper starting...

🔴 Supreme (Thursday drop)...
  ✓ Supreme — Box Logo Tee (Red) $54
  ✓ Supreme — Plaid Flannel Shirt $128
  → 2 new, 47 existing/skipped

🎤 Drake...
  ✓ NOCTA — Cardinal Long Sleeve $85
  → 1 new drops added

🌹 Tyler, the Creator...
  → 0 new drops added

🛹 FA (Fucking Awesome)...
  ✓ FA — Spiral Hoodie $95
  → 1 new drops added

🚗 Limosine...
  → 0 new drops added

✅ Done in 8.3s
```

New drops appear in the Hot Drop app within ~1 second of the scraper finishing (Firestore real-time sync).

---

## Troubleshooting

**"FIREBASE_SERVICE_ACCOUNT env var not set"**
→ You didn't add the secret. Repeat Step 2.

**"Supreme failed: HTTP 403"**
→ Supreme's Cloudflare is blocking the request. This is rare from GitHub's servers. Wait until Thursday and try the manual trigger — it often resolves itself.

**"X failed: fetch failed"**
→ The brand's website was temporarily down. The scraper skips failures gracefully — other brands still get scraped.

**Drops aren't showing in the app**
→ Check Firestore rules are deployed (`npx firebase-tools deploy --only firestore:rules`). The `drops` collection needs `allow read: if true`.

---

## Adding more brands manually

Use the Admin panel in the app:
- Profile → tap **"Alerts"** 5 times fast → Admin Drops panel
- Tap **+** → fill in the form → ADD DROP

The drop appears instantly for all users.
