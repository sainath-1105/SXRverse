export const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
// Using api.tmdb.org instead of api.themoviedb.org to avoid ISP blocking !
export const BASE_URL = 'https://api.tmdb.org/3';
export const IMG_URL = 'https://image.tmdb.org/t/p/';

export const fetchApi = async (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set('api_key', API_KEY);
    const userLang = localStorage.getItem('app_lang') || 'en-US';
    url.searchParams.set('language', userLang);
    Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

    try {
        const res = await fetch(url.toString());
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export const getImageUrl = (path, size = 'w342') => {
    if (!path) return 'https://placehold.co/160x240?text=No+Image';
    return `${IMG_URL}${size}${path}`;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let lastMangaRequestTime = 0;

export const fetchManga = async (path, params = {}, retryCount = 0) => {
    // Global throttle to ensure 400ms between any two Jikan requests
    const now = Date.now();
    const timeSinceLast = now - lastMangaRequestTime;
    if (timeSinceLast < 400) {
        await delay(400 - timeSinceLast);
    }
    lastMangaRequestTime = Date.now();

    const url = new URL(`https://api.jikan.moe/v4${path}`);
    Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

    try {
        const res = await fetch(url.toString());
        
        if (res.status === 429 && retryCount < 3) {
            console.warn(`Rate Limit Hit. Exponential backoff retry ${retryCount + 1}...`);
            await delay(2000 * (retryCount + 1)); 
            return fetchManga(path, params, retryCount + 1);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Manga API Error:', error);
        return null;
    }
};
