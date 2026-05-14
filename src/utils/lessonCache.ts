import type { Lesson } from '../types/learning.types';

const PREFIX = 'aict_lesson_';

export function getCachedLesson(topicId: string, language: string, level: string): Lesson | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${topicId}_${language}_${level}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedLesson(topicId: string, language: string, level: string, lesson: Lesson): void {
  try {
    localStorage.setItem(`${PREFIX}${topicId}_${language}_${level}`, JSON.stringify(lesson));
  } catch {}
}

export function clearLessonCache(): void {
  Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
}
