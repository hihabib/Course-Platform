import { Video, Course } from '@/types';
import { VideoPlayer } from '@/components/ui/video-player';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useCallback } from 'react';

interface VideoContentProps {
  course: Course;
  currentVideo: Video | null;
  onVideoSelect: (video: Video) => void;
}

export function VideoContent({ course, currentVideo, onVideoSelect }: VideoContentProps) {
  const { markVideoComplete } = useCourseProgress(course.id);

  const handleComplete = useCallback(() => {
    if (currentVideo) {
      markVideoComplete(currentVideo.id);
    }
  }, [currentVideo, markVideoComplete]);

  const handleNextVideo = useCallback(() => {
    if (!currentVideo) return;

    // Find the current chapter and video index
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

    // Try to find next video in current chapter
    if (currentVideoIndex < course.courseContent[currentChapterIndex].videos.length - 1) {
      const nextVideo = course.courseContent[currentChapterIndex].videos[currentVideoIndex + 1];
      onVideoSelect(nextVideo);
      return;
    }

    // If no more videos in current chapter, try next chapter
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
        <VideoPlayer
          url={currentVideo.path}
          title={currentVideo.title}
          onComplete={handleComplete}
          onNextVideo={handleNextVideo}
        />
      </div>
      <div className="p-4 border-t">
        <h2 className="text-xl font-semibold mb-2">{currentVideo.title}</h2>
        {currentVideo.description && (
          <p className="text-muted-foreground">{currentVideo.description}</p>
        )}
      </div>
    </div>
  );
}


