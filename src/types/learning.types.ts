export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Category {
  id: string;
  name: string;
  icon: string;
  topicCount: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  level: Level;
  orderIndex: number;
}

export interface LessonSection {
  type: 'explanation' | 'example' | 'tip' | 'exercise';
  title: string;
  content?: string;
  code?: string;
  prompt?: string;
  hints?: string[];
}

export interface Lesson {
  id: string;
  topicId?: string;
  language: string;
  level: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  contentJson: string;
}

export function parseSections(lesson: Lesson): LessonSection[] {
  try {
    const parsed = JSON.parse(lesson.contentJson);
    return parsed.sections ?? [];
  } catch {
    return [];
  }
}
