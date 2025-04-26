// Course related types
export interface Video {
  id: string;
  title: string;
  path: string;
  duration: number;
  description?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  videos: Video[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: number;
  courseContent: Chapter[];
}

// Progress tracking types
export interface VideoProgress {
  completed: boolean;
  bookmarked: boolean;
  lastPosition?: number;
}

export interface ChapterProgress {
  [videoId: string]: VideoProgress;
}

export interface CourseProgress {
  currentChapter: string;
  currentVideo: string;
  bookmarkedVideos: string[];
  chapters: {
    [chapterId: string]: ChapterProgress;
  };
}

// Component specific types
export interface VideoPlayerProps {
  video: Video;
  onComplete: () => void;
  isBookmarked: boolean;
  isCompleted: boolean;
  onToggleBookmark: () => void;
}

export interface BookmarkedVideo {
  courseId: string;
  videoId: string;
  title: string;
  courseName: string;
}

// Storage related types
export interface StorageKeys {
  courseProgress: (courseId: string) => string;
}

export const STORAGE_KEYS: StorageKeys = {
  courseProgress: (courseId: string) => `course-progress-${courseId}`,
};