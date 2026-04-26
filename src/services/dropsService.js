/**
 * Hot Drop — Drops Service
 *
 * Provides a useDrops() hook that:
 *  1. Renders instantly with local hardcoded data (zero loading flash)
 *  2. Silently upgrades to live Firestore data when available
 *  3. Falls back to local data if Firestore is unreachable
 *  4. Updates in real-time via onSnapshot — no pull-to-refresh needed
 *
 * Status is computed from timestamps, never stored — drops automatically
 * transition upcoming → live → ended without any manual updates.
 */

import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { DROPS as LOCAL_DROPS } from '../data/drops';

// ─── Timestamp helpers ────────────────────────────────────────────────────────

export function toMillis(v) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  if (v?.toMillis) return v.toMillis();       // Firestore Timestamp object
  if (v?.seconds)  return v.seconds * 1000;   // Firestore Timestamp serialized
  return new Date(v).getTime();
}

// ─── Status computation ───────────────────────────────────────────────────────
// Status derives from timestamps so you never manually flip live/ended.

export function computeStatus(drop) {
  const now      = Date.now();
  const dropTime = toMillis(drop.dropTime);
  const endTime  = drop.endTime ? toMillis(drop.endTime) : null;

  if (dropTime > now) return 'upcoming';
  if (endTime && now > endTime) return 'ended';
  if (!endTime && now > dropTime + 24 * 60 * 60 * 1000) return 'ended'; // auto-end 24h after drop
  return 'live';
}

function normalise(id, data) {
  const drop = {
    ...data,
    id,
    dropTime: toMillis(data.dropTime),
    endTime:  data.endTime ? toMillis(data.endTime) : null,
  };
  drop.status = computeStatus(drop);
  return drop;
}

// ─── useDrops hook ────────────────────────────────────────────────────────────

export function useDrops() {
  const [drops,   setDrops]   = useState(LOCAL_DROPS); // instant render — no spinner
  const [loading, setLoading] = useState(true);
  const [source,  setSource]  = useState('local');     // 'local' | 'firestore'

  useEffect(() => {
    const q = query(
      collection(db, 'drops'),
      where('active', '==', true),
      orderBy('dropTime', 'asc'),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          setDrops(snap.docs.map(d => normalise(d.id, d.data())));
          setSource('firestore');
        }
        // If empty, keep local data — seed hasn't run yet
        setLoading(false);
      },
      (err) => {
        // Firestore unreachable (no internet, rules, etc.) — silently stay on local
        console.warn('[dropsService] Using local fallback:', err.message);
        setLoading(false);
      },
    );

    return unsub; // cleanup on unmount
  }, []);

  return { drops, loading, source };
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

export async function addDrop(data) {
  return addDoc(collection(db, 'drops'), {
    ...data,
    active:    true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDrop(id, data) {
  return updateDoc(doc(db, 'drops', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function softDeleteDrop(id) {
  return updateDoc(doc(db, 'drops', id), {
    active:    false,
    updatedAt: serverTimestamp(),
  });
}
