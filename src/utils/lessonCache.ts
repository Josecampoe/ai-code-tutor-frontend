export function getCachedLesson(topicId: string, language: string, level: string): unknown | null {
  const key = `lesson_${topicId}_${language}_${level}`;
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

export function setCachedLesson(topicId: string, language: string, level: string, lesson: unknown): void {
  const key = `lesson_${topicId}_${language}_${level}`;
  try {
    localStorage.setItem(key, JSON.stringify(lesson));
  } catch { /* storage full */ }
}

export function clearLessonCache(): void {
  Object.keys(localStorage)
    .filter(k => k.startsWith('lesson_'))
    .forEach(k => localStorage.removeItem(k));
}
