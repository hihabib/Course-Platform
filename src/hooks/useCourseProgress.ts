import { useCallback, useEffect, useState } from 'react';
import { CourseProgress, STORAGE_KEYS } from '@/types';

const defaultProgress: CourseProgress = {
  completedVideos: [],
  bookmarkedVideos: [],
};

export function useCourseProgress(courseId: string) {
  const [progress, setProgress] = useState<CourseProgress>(defaultProgress);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.courseProgress(courseId));
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing course progress:', e);
        setProgress(defaultProgress);
      }
    }
  }, [courseId]);

  const saveProgress = useCallback((newProgress: CourseProgress) => {
    setProgress(newProgress);
    localStorage.setItem(
      STORAGE_KEYS.courseProgress(courseId),
      JSON.stringify(newProgress)
    );
  }, [courseId]);

  const toggleBookmark = useCallback((videoId: string) => {
    setProgress(prev => {
      const newBookmarks = prev.bookmarkedVideos.includes(videoId)
        ? prev.bookmarkedVideos.filter(id => id !== videoId)
        : [...prev.bookmarkedVideos, videoId];

      const newProgress = {
        ...prev,
        bookmarkedVideos: newBookmarks,
      };

      localStorage.setItem(
        STORAGE_KEYS.courseProgress(courseId),
        JSON.stringify(newProgress)
      );

      return newProgress;
    });
  }, [courseId]);

  const markVideoComplete = useCallback((videoId: string) => {
    setProgress(prev => {
      const newCompletedVideos = prev.completedVideos.includes(videoId)
        ? prev.completedVideos
        : [...prev.completedVideos, videoId];

      const newProgress = {
        ...prev,
        completedVideos: newCompletedVideos,
      };

      localStorage.setItem(
        STORAGE_KEYS.courseProgress(courseId),
        JSON.stringify(newProgress)
      );

      return newProgress;
    });
  }, [courseId]);

  return {
    progress,
    saveProgress,
    toggleBookmark,
    markVideoComplete,
  };
}