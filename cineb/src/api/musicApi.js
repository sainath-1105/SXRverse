// JioSaavn Unofficial API
const BASE = 'https://jiosaavn-api-privatecvc2.vercel.app';

async function saavnFetch(endpoint, params = {}) {
  const url = new URL(`${BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Saavn API error: ${res.status}`);
  return res.json();
}

// Helper: pick best quality image
export function getBestImage(images) {
  if (!images) return null;
  if (Array.isArray(images)) {
    const quality = ['500x500', '150x150', '50x50'];
    for (const q of quality) {
      const found = images.find(i => i.quality === q);
      if (found) return found.url || found.link;
    }
    return images[images.length - 1]?.url || images[images.length - 1]?.link || null;
  }
  return images;
}

// Helper: pick best audio quality
export function getBestAudio(downloadUrls) {
  if (!downloadUrls) return null;
  const quality = ['320kbps', '160kbps', '96kbps'];
  for (const q of quality) {
    const found = downloadUrls.find(u => u.quality === q);
    if (found) return found.url || found.link;
  }
  return downloadUrls[downloadUrls.length - 1]?.url || downloadUrls[downloadUrls.length - 1]?.link || null;
}

// Search songs
export async function searchSongs(query, page = 1, limit = 20) {
  const data = await saavnFetch('/search/songs', { query, page, limit });
  return data?.data || null;
}

// Search albums
export async function searchAlbums(query, page = 1, limit = 10) {
  const data = await saavnFetch('/search/albums', { query, page, limit });
  return data?.data || null;
}

// Search artists
export async function searchArtists(query, page = 1, limit = 10) {
  const data = await saavnFetch('/search/artists', { query, page, limit });
  return data?.data || null;
}

// Get song by ID
export async function getSongById(id) {
  const data = await saavnFetch('/songs', { id });
  return data?.data?.[0] || null;
}

// Get album by ID
export async function getAlbumById(id) {
  const data = await saavnFetch('/albums', { id });
  return data?.data || null;
}

// Get artist by ID
export async function getArtistById(id) {
  const data = await saavnFetch('/artists', { id });
  return data?.data || null;
}

// Get artist songs
export async function getArtistSongs(id, page = 0, sortBy = 'popularity') {
  const data = await saavnFetch(`/artists/${id}/songs`, { page, sortBy });
  return data?.data || null;
}

// Get playlist by ID
export async function getPlaylistById(id) {
  const data = await saavnFetch('/playlists', { id });
  return data?.data || null;
}

// Global search (all types)
export async function globalSearch(query) {
  const data = await saavnFetch('/search', { query });
  return data?.data || null;
}

// Get lyrics by song ID
export async function getLyrics(id) {
  try {
    const data = await saavnFetch('/lyrics', { id });
    return data?.data?.lyrics || null;
  } catch {
    return null;
  }
}

// Trending / Charts — using popular playlists
export const FEATURED_PLAYLISTS = [
  { id: '110858205', name: 'Trending Today', emoji: '🔥' },
  { id: '1134595537', name: 'Top 50 India', emoji: '🇮🇳' },
  { id: '902306817', name: 'Viral Nation', emoji: '📈' },
  { id: '845149969', name: 'Romantic Top 40', emoji: '❤️' },
  { id: '1208889749', name: 'Bollywood Love Songs', emoji: '🎬' },
];

// New releases search queries
export const NEW_RELEASE_QUERIES = [
  '2024 new songs', 'latest bollywood 2024', 'new hindi songs', 'trending now'
];
