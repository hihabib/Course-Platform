import { Video, Course, CourseProgress } from '@/types';
import { VideoPlayer } from '@/components/ui/video-player';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useCallback } from 'react';
import { BookmarkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoContentProps {
  course: Course;
  currentVideo: Video | null;
  onVideoSelect: (video: Video) => void;
  courseProgress: CourseProgress;
  toggleBookmark: (videoId: string) => void;
}

export function VideoContent({ course, currentVideo, onVideoSelect, courseProgress, toggleBookmark }: VideoContentProps) {
  const { markVideoComplete } = useCourseProgress(course.id);

  const handleComplete = useCallback(() => {
    if (currentVideo) {
      markVideoComplete(currentVideo.id);
    }
  }, [currentVideo, markVideoComplete]);

  const handleNextVideo = useCallback(() => {
    if (!currentVideo) return;
    let currentChapterIndex = -1;
    let currentVideoIndex = -1;
    for (let i = 0; i < course.courseContent.length; i++) {
      const chapter = course.courseContent[i];
      const videoIndex = chapter.videos.findIndex(v => v.id === currentVideo.id);
      if (videoIndex !== -1) {
        currentChapterIndex = i;
        currentVideoIndex = videoIndex;
        break;
      }
    }
    if (currentChapterIndex === -1 || currentVideoIndex === -1) return;
    if (currentVideoIndex < course.courseContent[currentChapterIndex].videos.length - 1) {
      const nextVideo = course.courseContent[currentChapterIndex].videos[currentVideoIndex + 1];
      onVideoSelect(nextVideo);
      return;
    }
    if (currentChapterIndex < course.courseContent.length - 1) {
      const nextChapter = course.courseContent[currentChapterIndex + 1];
      if (nextChapter.videos.length > 0) {
        onVideoSelect(nextChapter.videos[0]);
        return;
      }
    }
  }, [course, currentVideo, onVideoSelect]);

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a video to start watching</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {currentVideo.type === 'video' ? (
          <VideoPlayer
            url={currentVideo.path}
            title={currentVideo.title}
            onComplete={handleComplete}
            onNextVideo={handleNextVideo}
          />
        ) : (
          <iframe
            src={currentVideo.path}
            title={currentVideo.title}
            className="w-full h-[70vh] rounded-lg border bg-white"
            frameBorder={0}
            allowFullScreen
          />
        )}
      </div>
      <div className="p-4 border-t">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              {currentVideo.title}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleBookmark(currentVideo.id)}
                className={cn(
                  "h-9 w-9",
                  courseProgress.bookmarkedVideos.includes(currentVideo.id) ? "text-yellow-500" : "text-muted-foreground"
                )}
                aria-label={courseProgress.bookmarkedVideos.includes(currentVideo.id) ? "Remove bookmark" : "Add bookmark"}
              >
                <BookmarkIcon className="h-5 w-5" />
              </Button>
            </h2>
            {currentVideo.description && (
              <p className="text-muted-foreground">{currentVideo.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


