/**
 * spotifyService.js
 * Spotify Web API integration using Client Credentials flow.
 * Used for fetching artist data, albums, and charts — no user login required.
 */

const CLIENT_ID = 'a6f7743095d148ab935b90c2b50507ca';
const CLIENT_SECRET = '7d2338fc3fcf44d8b16ea72e2f826e16';
const SPOTIFY_BASE = 'https://api.spotify.com/v1';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

let cachedToken = null;
let tokenExpiry = null;

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function spotifyFetch(endpoint) {
  const token = await getAccessToken();
  const res = await fetch(`${SPOTIFY_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

/**
 * Search for artists, albums, and tracks.
 * @param {string} query
 * @returns {{ artists, albums, tracks }}
 */
export async function searchSpotify(query) {
  try {
    const data = await spotifyFetch(
      `/search?q=${encodeURIComponent(query)}&type=artist,album,track&limit=5`
    );
    return {
      artists: data.artists?.items?.map(mapArtist) || [],
      albums: data.albums?.items?.map(mapAlbum) || [],
      tracks: data.tracks?.items?.map(mapTrack) || [],
    };
  } catch (err) {
    console.warn('[Spotify] search error:', err.message);
    return { artists: [], albums: [], tracks: [] };
  }
}

// ─── ARTISTS ─────────────────────────────────────────────────────────────────

/**
 * Get artist details by Spotify ID.
 */
export async function getArtist(artistId) {
  try {
    const data = await spotifyFetch(`/artists/${artistId}`);
    return mapArtist(data);
  } catch (err) {
    console.warn('[Spotify] getArtist error:', err.message);
    return null;
  }
}

/**
 * Get artist's top tracks.
 */
export async function getArtistTopTracks(artistId) {
  try {
    const data = await spotifyFetch(`/artists/${artistId}/top-tracks?market=US`);
    return data.tracks?.map(mapTrack) || [];
  } catch (err) {
    console.warn('[Spotify] getArtistTopTracks error:', err.message);
    return [];
  }
}

/**
 * Get artist's albums.
 */
export async function getArtistAlbums(artistId) {
  try {
    const data = await spotifyFetch(
      `/artists/${artistId}/albums?include_groups=album&market=US&limit=10`
    );
    return data.items?.map(mapAlbum) || [];
  } catch (err) {
    console.warn('[Spotify] getArtistAlbums error:', err.message);
    return [];
  }
}

/**
 * Search for a hip-hop artist by name and return their Spotify data.
 */
export async function findArtist(name) {
  try {
    const data = await spotifyFetch(
      `/search?q=${encodeURIComponent(name)}&type=artist&limit=1`
    );
    const artist = data.artists?.items?.[0];
    return artist ? mapArtist(artist) : null;
  } catch (err) {
    console.warn('[Spotify] findArtist error:', err.message);
    return null;
  }
}

/**
 * Get trending hip-hop tracks from a playlist.
 */
export async function getHipHopCharts() {
  try {
    // Hip-Hop chart playlist (Spotify's official Hip-Hop playlist)
    const data = await spotifyFetch(
      `/search?q=hip+hop+rap+2025&type=track&limit=10&market=US`
    );
    return data.tracks?.items?.map(mapTrack) || [];
  } catch (err) {
    console.warn('[Spotify] getHipHopCharts error:', err.message);
    return [];
  }
}

// ─── MAPPERS ─────────────────────────────────────────────────────────────────

function mapArtist(a) {
  return {
    id: a.id,
    name: a.name,
    imageUrl: a.images?.[0]?.url || null,
    followers: a.followers?.total || 0,
    genres: a.genres || [],
    popularity: a.popularity || 0,
    spotifyUrl: a.external_urls?.spotify,
  };
}

function mapAlbum(a) {
  return {
    id: a.id,
    name: a.name,
    artist: a.artists?.[0]?.name || '',
    artistId: a.artists?.[0]?.id || '',
    imageUrl: a.images?.[0]?.url || null,
    releaseDate: a.release_date || '',
    totalTracks: a.total_tracks || 0,
    spotifyUrl: a.external_urls?.spotify,
  };
}

function mapTrack(t) {
  return {
    id: t.id,
    name: t.name,
    artist: t.artists?.[0]?.name || '',
    artistId: t.artists?.[0]?.id || '',
    album: t.album?.name || '',
    imageUrl: t.album?.images?.[0]?.url || null,
    durationMs: t.duration_ms || 0,
    popularity: t.popularity || 0,
    previewUrl: t.preview_url || null,
    spotifyUrl: t.external_urls?.spotify,
  };
}
