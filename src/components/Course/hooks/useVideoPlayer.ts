import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Course, Video } from "@/types";

interface UseVideoPlayerProps {
  video: Video;
  onComplete: () => void;
}

export const useVideoPlayer = ({ video, onComplete }: UseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.focus();
    }
  }, [video.id]);

  const findNextVideo = async () => {
    try {
      const response = await fetch('/src/allCourses.json');
      const courses = await response.json() as Course[];
      const currentCourse = courses.find((c) => c.id === courseId);
      
      if (!currentCourse) return null;

      let foundCurrent = false;
      for (const chapter of currentCourse.courseContent) {
        for (let i = 0; i < chapter.videos.length; i++) {
          if (foundCurrent) {
            return chapter.videos[i];
          }
          if (chapter.videos[i].id === video.id) {
            foundCurrent = true;
            // If this is the last video in the chapter, check next chapter
            if (i === chapter.videos.length - 1) continue;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding next video:', error);
      return null;
    }
  };

  const handleVideoEnd = async () => {
    onComplete();
    
    const nextVideo = await findNextVideo();
    if (nextVideo) {
      navigate(`/course/${courseId}/video/${nextVideo.id}`);
    }
  };

  return {
    videoRef,
    handleVideoEnd,
  };
};