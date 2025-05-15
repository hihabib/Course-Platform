import { useState, useEffect } from 'react';
import { BookmarkedVideo, Course, STORAGE_KEYS, LocalStorageData } from '@/types';

export function useBookmarkedVideos() {
  const [bookmarkedVideos, setBookmarkedVideos] = useState<BookmarkedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("bookmarkedVideos", bookmarkedVideos);
  }, [bookmarkedVideos])

  const loadBookmarkedVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const keys = Object.keys(localStorage);
      const bookmarkedItems: BookmarkedVideo[] = [];

      // Get all course progress keys
      const progressKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEYS.courseProgress(""))
      );

      // Fetch courses data for video titles
      const response = await fetch('/src/allCourses.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch courses data: ${response.statusText}`);
      }
      
      const courses: Course[] = await response.json();

      console.log("progressKeys", progressKeys);

      // Process each course's progress
      progressKeys.forEach(key => {
        const courseId = key.replace(STORAGE_KEYS.courseProgress(""), "");
        const progressData = localStorage.getItem(key);
        
        if (!progressData) return;
        
        try {
          const progress: LocalStorageData = JSON.parse(progressData);
          const course = courses.find(c => c.id === courseId);

          if (course && Array.isArray(progress.bookmarkedVideos)) {
            progress.bookmarkedVideos.forEach((videoId: string) => {
              for (const chapter of course.courseContent) {
                const video = chapter.videos.find(v => v.id === videoId);
                if (video) {
                  bookmarkedItems.push({
                    courseId,
                    videoId,
                    title: video.title,
                    courseName: course.title
                  });
                  break;
                }
              }
            });
          }
        } catch (e) {
          console.error(`Error parsing progress data for course ${courseId}:`, e);
        }
      });

      setBookmarkedVideos(bookmarkedItems);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading bookmarked videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = (courseId: string, videoId: string) => {
    const storageKey = STORAGE_KEYS.courseProgress(courseId);
    const progressData = localStorage.getItem(storageKey);
    
    if (progressData) {
      const progress: LocalStorageData = JSON.parse(progressData);
      progress.bookmarkedVideos = progress.bookmarkedVideos.filter(id => id !== videoId);
      localStorage.setItem(storageKey, JSON.stringify(progress));
      
      // Update local state immediately
      setBookmarkedVideos(prev => 
        prev.filter(video => !(video.courseId === courseId && video.videoId === videoId))
      );

      // Dispatch a custom event to notify other components
      window.dispatchEvent(new Event('storage'));
    }
  };

  useEffect(() => {
    loadBookmarkedVideos();

    // Listen for both storage events and custom events
    const handleStorageChange = () => {
      loadBookmarkedVideos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarkChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkChange', handleStorageChange);
    };
  }, []);

  return {
    bookmarkedVideos,
    isLoading,
    error,
    removeBookmark,
    refreshBookmarks: loadBookmarkedVideos
  };
} 