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
  level: 'beginner' | 'intermediate' | 'advanced';
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
  topicId: string;
  language: string;
  level: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  contentJson?: string;
}

export interface LearningState {
  categories: Category[];
  selectedTopic: Topic | null;
  selectedLanguage: string;
  selectedLevel: 'beginner' | 'intermediate' | 'advanced';
  currentLesson: Lesson | null;
  currentSectionIndex: number;
  completedTopics: string[];
  isLoadingLesson: boolean;
  isGeneratingLesson: boolean;
  openCategories: string[];
}
