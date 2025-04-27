import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Course, CourseProgress, Video } from "@/types";
import { BookmarkIcon, CheckCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";



export function AccessCourse() {
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    completedVideos: [],
    bookmarkedVideos: []
  });

  const { courseId, videoId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/src/allCourses.json');
        const allCourses: Course[] = await response.json();

        const course = allCourses.find((c: Course) => c.id === courseId);

        if (!course) {
          throw new Error('Course not found');
        }

        setCurrentCourse(course);

        const allChapterValues = course.courseContent.map((_, index) => `chapter-${index}`);
        setOpenChapters(allChapterValues);

        if (videoId) {
          const video = findVideoById(course, videoId);
          setCurrentVideo(video || course.courseContent[0].videos[0]);
        } else {
          setCurrentVideo(course.courseContent[0].videos[0]);
          navigate(`/course/${course.id}/video/${course.courseContent[0].videos[0].id}`);
        }

        // Load progress from localStorage
        const savedProgress = localStorage.getItem(`course-progress-${courseId}`);
        if (savedProgress) {
          setCourseProgress(JSON.parse(savedProgress));
        }
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [courseId, videoId, navigate]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (courseId && (courseProgress.completedVideos.length > 0 || courseProgress.bookmarkedVideos.length > 0)) {
      localStorage.setItem(
        `course-progress-${courseId}`,
        JSON.stringify(courseProgress)
      );
    }
  }, [courseProgress, courseId]);

  const findVideoById = (courseData: Course, id: string): Video | null => {
    for (const chapter of courseData.courseContent) {
      const video = chapter.videos.find(v => v.id === id);
      if (video) return video;
    }
    return null;
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    navigate(`/course/${currentCourse?.id}/video/${video.id}`);
  };

  const toggleBookmark = (videoId: string) => {
    setCourseProgress(prev => {
      const isBookmarked = prev.bookmarkedVideos.includes(videoId);
      const newBookmarkedVideos = isBookmarked
        ? prev.bookmarkedVideos.filter(id => id !== videoId)
        : [...prev.bookmarkedVideos, videoId];

      return {
        ...prev,
        bookmarkedVideos: newBookmarkedVideos
      };
    });
  };

  const toggleVideoComplete = (videoId: string) => {
    setCourseProgress(prev => {
      const isCompleted = prev.completedVideos.includes(videoId);
      const newCompletedVideos = isCompleted
        ? prev.completedVideos.filter(id => id !== videoId)
        : [...prev.completedVideos, videoId];

      return {
        ...prev,
        completedVideos: newCompletedVideos
      };
    });
  };

  if (isLoading || !currentCourse || !currentVideo) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (courseId !== currentCourse.id) {
    return <Navigate to={`/course/${currentCourse.id}/video/${currentCourse.courseContent[0].videos[0].id}`} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-1/4 bg-card">
        <ScrollArea className="h-full">
          <Card className="rounded-none border-0 shadow-none">
            <div className="p-4 border-0">
              <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                <img
                  src={currentCourse.thumbnailUrl}
                  alt={currentCourse.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{currentCourse.title}</h2>
            </div>
            <div className="p-4">
              <Accordion
                type="multiple"
                value={openChapters}
                onValueChange={setOpenChapters}
                className="w-full space-y-2"
              >
                {currentCourse.courseContent.map((chapter, index) => (
                  <AccordionItem
                    key={index}
                    value={`chapter-${index}`}
                    className="border-0"
                  >
                    <AccordionTrigger className="text-sm hover:no-underline p-3 bg-[#252731] rounded-lg cursor-pointer">
                      {chapter.chapter}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 py-2">
                        {chapter.videos.map((video) => (
                          <div
                            key={video.id}
                            className="flex items-center gap-2 w-full"
                          >
                            <button
                              onClick={() => handleVideoSelect(video)}
                              className={cn(
                                "flex-1 p-2.5 text-left rounded-lg transition-colors text-sm",
                                "hover:bg-primary/10",
                                video.id === currentVideo.id && "bg-primary/20",
                                "flex justify-between items-center cursor-pointer"
                              )}
                            >
                              <span className={cn(
                                "flex-1",
                                courseProgress.completedVideos.includes(video.id) ? "text-primary" : "text-foreground"
                              )}>
                                {video.title}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {video.duration}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(video.id);
                              }}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                courseProgress.bookmarkedVideos.includes(video.id) ? "text-yellow-500" : "text-muted-foreground"
                              )}
                            >
                              <BookmarkIcon className="w-4 h-4 cursor-pointer" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVideoComplete(video.id);
                              }}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                courseProgress.completedVideos.includes(video.id) ? "text-green-500" : "text-muted-foreground"
                              )}
                            >
                              <CheckCircleIcon className="w-4 h-4 cursor-pointer" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Card>
        </ScrollArea>
      </div>

      {currentVideo && (
        <VideoPlayer
          video={currentVideo}
          onComplete={() => {
            toggleVideoComplete(currentVideo.id)

            setTimeout(() => {
              navigate(`/course/${currentCourse.id}/video/${parseInt(currentVideo.id) + 1}`);
            }, 3000);
          }}
          isBookmarked={courseProgress.bookmarkedVideos.includes(currentVideo.id)}
          isCompleted={courseProgress.completedVideos.includes(currentVideo.id)}
          onToggleBookmark={() => toggleBookmark(currentVideo.id)}
        />
      )}
    </div>
  );
}

