import type { Lesson } from '../types/learning.types';

const LESSON_PREFIX = 'aict_lesson_';

export function getCachedLesson(topicId: string, level: string, lessonNumber: number): Lesson | null {
  try {
    const raw = localStorage.getItem(`${LESSON_PREFIX}${topicId}_${level}_${lessonNumber}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedLesson(topicId: string, level: string, lessonNumber: number, lesson: Lesson): void {
  try {
    localStorage.setItem(`${LESSON_PREFIX}${topicId}_${level}_${lessonNumber}`, JSON.stringify(lesson));
  } catch {}
}

export function getCompletedLessons(topicId: string, level: string): number[] {
  try {
    const raw = localStorage.getItem(`aict_completed_${topicId}_${level}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCompletedLesson(topicId: string, level: string, lessonNumber: number): void {
  try {
    const key = `aict_completed_${topicId}_${level}`;
    const current = getCompletedLessons(topicId, level);
    if (!current.includes(lessonNumber)) {
      current.push(lessonNumber);
      localStorage.setItem(key, JSON.stringify(current));
    }
  } catch {}
}

export function getCompletedLevels(topicId: string): string[] {
  try {
    const raw = localStorage.getItem(`aict_completed_levels_${topicId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCompletedLevel(topicId: string, level: string): void {
  try {
    const key = `aict_completed_levels_${topicId}`;
    const current = getCompletedLevels(topicId);
    if (!current.includes(level)) {
      current.push(level);
      localStorage.setItem(key, JSON.stringify(current));
    }
  } catch {}
}

export function clearLessonCache(): void {
  Object.keys(localStorage)
    .filter(k => k.startsWith('aict_'))
    .forEach(k => localStorage.removeItem(k));
}
