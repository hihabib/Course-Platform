// Course related types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructor: Instructor;
  courseContent: Chapter[];
  duration: string;
  totalVideos: number;
  category: string;
  level: CourseLevel;
  tags: string[];
  updatedAt: string;
}

export interface Chapter {
  id: string;
  chapter: string;
  description: string;
  videos: Video[];
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  duration: string;
  path: string;
  thumbnailUrl?: string;
  resources?: Resource[];
  type: 'video' | 'pdf';
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  socialLinks?: SocialLinks;
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

// Progress tracking types
export interface CourseProgress {
  completedVideos: string[];
  bookmarkedVideos: string[];
  lastWatched?: {
    videoId: string;
    timestamp: number;
  };
}

// Bookmarked Videos types
export interface BookmarkedVideo {
  courseId: string;
  videoId: string;
  title: string;
  courseName: string;
}

// Storage Keys type
export const STORAGE_KEYS = {
  courseProgress: (courseId: string) => `course-progress-${courseId}`,
  theme: 'theme',
} as const;

export type StorageKeys = typeof STORAGE_KEYS;

// Enums
export enum CourseLevel {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced"
}

export enum ResourceType {
  PDF = "pdf",
  Link = "link",
  Code = "code",
  Video = "video"
}

// Component Props Types
export interface VideoPlayerProps {
  video: Video;
  onComplete: () => void;
  isBookmarked: boolean;
  isCompleted: boolean;
  onToggleBookmark: () => void;
}

export interface CourseCardProps {
  course: Course;
}

export interface ChapterAccordionProps {
  chapter: Chapter;
  currentVideoId: string;
  onVideoSelect: (video: Video) => void;
  progress: CourseProgress;
  onToggleBookmark: (videoId: string) => void;
  onToggleComplete: (videoId: string) => void;
}

// Drawer Component Props
export interface BookmarkedVideosDrawerProps {
  onClose?: () => void;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ErrorResponse {
  error: string;
  status: number;
  details?: unknown;
}

// Theme Types
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

// Button Component Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// Local Storage Types
export interface LocalStorageData {
  bookmarkedVideos: string[];
  completedVideos: string[];
  lastWatched?: {
    videoId: string;
    timestamp: number;
  };
}


