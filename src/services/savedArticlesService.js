import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'saved_articles';

async function getAll() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getSavedArticles() {
  return getAll();
}

export async function isArticleSaved(id) {
  const saved = await getAll();
  return saved.some(a => a.id === id);
}

export async function saveArticle(article) {
  const saved = await getAll();
  if (saved.some(a => a.id === article.id)) return;
  await AsyncStorage.setItem(KEY, JSON.stringify([article, ...saved]));
}

export async function unsaveArticle(id) {
  const saved = await getAll();
  await AsyncStorage.setItem(KEY, JSON.stringify(saved.filter(a => a.id !== id)));
}

export async function getSavedCount() {
  const saved = await getAll();
  return saved.length;
}
