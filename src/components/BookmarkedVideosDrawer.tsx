import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { BookmarkIcon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  BookmarkedVideo, 
  Course, 
  STORAGE_KEYS, 
  LocalStorageData,
  BookmarkedVideosDrawerProps 
} from "@/types";

export function BookmarkedVideosDrawer({ onClose }: BookmarkedVideosDrawerProps) {
  const [bookmarkedVideos, setBookmarkedVideos] = useState<BookmarkedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const removeBookmark = (courseId: string, videoId: string) => {
    const storageKey = STORAGE_KEYS.courseProgress(courseId);
    const progressData = localStorage.getItem(storageKey);
    
    if (progressData) {
      const progress: LocalStorageData = JSON.parse(progressData);
      progress.bookmarkedVideos = progress.bookmarkedVideos.filter(id => id !== videoId);
      localStorage.setItem(storageKey, JSON.stringify(progress));
      
      setBookmarkedVideos(prev => 
        prev.filter(video => !(video.courseId === courseId && video.videoId === videoId))
      );
    }
  };

  useEffect(() => {
    const loadBookmarkedVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const keys = Object.keys(localStorage);
        const bookmarkedItems: BookmarkedVideo[] = [];

        const progressKeys = keys.filter(key => 
          key.startsWith(STORAGE_KEYS.courseProgress(""))
        );

        const response = await fetch('/src/allCourses.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch courses data: ${response.statusText}`);
        }
        
        const courses: Course[] = await response.json();

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

    loadBookmarkedVideos();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith(STORAGE_KEYS.courseProgress(""))) {
        loadBookmarkedVideos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Drawer onOpenChange={onClose}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BookmarkIcon className="h-5 w-5" />
          {bookmarkedVideos.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {bookmarkedVideos.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Bookmarked Videos</DrawerTitle>
            <DrawerDescription>
              Your saved videos across all courses
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : error ? (
              <p className="text-center text-destructive">{error}</p>
            ) : bookmarkedVideos.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No bookmarked videos yet
              </p>
            ) : (
              <div className="space-y-6">
                {bookmarkedVideos.map((video) => (
                  <div key={`${video.courseId}-${video.videoId}`} className="relative pt-2">
                    <button
                      onClick={() => removeBookmark(video.courseId, video.videoId)}
                      className="absolute -right-2 -top-1 z-10"
                      aria-label="Remove bookmark"
                    >
                      <XCircleIcon className="h-5 w-5 text-muted-foreground bg-black rounded-full cursor-pointer hover:text-foreground transition-colors" />
                    </button>
                    <Link
                      to={`/course/${video.courseId}/video/${video.videoId}`}
                      className="block"
                    >
                      <div className="rounded-lg border p-3 hover:bg-accent transition-colors group cursor-pointer">
                        <h4 className="font-medium text-white group-hover:text-black">{video.title}</h4>
                        <p className="text-sm text-white/70 group-hover:text-black">
                          {video.courseName}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="cursor-pointer">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}






