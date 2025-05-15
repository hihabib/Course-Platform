import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Course, CourseProgress, Video } from "@/types";
import { BookmarkIcon, CheckCircleIcon, FileIcon, MenuIcon, PlayCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { VideoContent } from "./VideoContent";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

    // Dispatch custom event to notify BookmarkedVideosDrawer
    window.dispatchEvent(new Event('bookmarkChange'));
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

  const calculateTotalDuration = (course: Course): { hours: number; minutes: number; seconds: number } => {
    let totalSeconds = 0;

    course.courseContent.forEach(chapter => {
      chapter.videos.forEach(video => {
        if (video.duration) {
          const parts = video.duration.split(':').map(Number);
          if (parts.length === 2) {
            // Format: MM:SS
            totalSeconds += (parts[0] * 60) + parts[1];
          } else if (parts.length === 3) {
            // Format: HH:MM:SS
            totalSeconds += (parts[0] * 3600) + (parts[1] * 60) + parts[2];
          }
        }
      });
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  const formatDuration = (duration: { hours: number; minutes: number; seconds: number }): string => {
    const { hours, minutes } = duration;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes} min`;
    }
  };

  const countTotalVideos = (course: Course): number => {
    return course.courseContent.reduce((total, chapter) => {
      return total + chapter.videos.length;
    }, 0);
  };

  // Add this function to calculate completed duration
  const calculateCompletedDuration = (course: Course, completedVideoIds: string[]): { hours: number; minutes: number; seconds: number } => {
    let totalSeconds = 0;

    course.courseContent.forEach(chapter => {
      chapter.videos.forEach(video => {
        if (video.duration && completedVideoIds.includes(video.id)) {
          const parts = video.duration.split(':').map(Number);
          if (parts.length === 2) {
            // Format: MM:SS
            totalSeconds += (parts[0] * 60) + parts[1];
          } else if (parts.length === 3) {
            // Format: HH:MM:SS
            totalSeconds += (parts[0] * 3600) + (parts[1] * 60) + parts[2];
          }
        }
      });
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  // Add this function to calculate progress percentage
  const calculateProgressPercentage = (completedDuration: { hours: number; minutes: number; seconds: number }, totalDuration: { hours: number; minutes: number; seconds: number }): number => {
    const completedSeconds = (completedDuration.hours * 3600) + (completedDuration.minutes * 60) + completedDuration.seconds;
    const totalSeconds = (totalDuration.hours * 3600) + (totalDuration.minutes * 60) + totalDuration.seconds;

    if (totalSeconds === 0) return 0;
    return Math.round((completedSeconds / totalSeconds) * 100);
  };

  const CourseContentSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Course Content</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4">
            <Accordion
              type="multiple"
              value={openChapters}
              onValueChange={setOpenChapters}
              className="w-full space-y-2"
            >
              {currentCourse?.courseContent.map((chapter, index) => (
                <AccordionItem
                  key={index}
                  value={`chapter-${index}`}
                  className="border-0"
                >
                  <AccordionTrigger className="text-sm hover:no-underline p-2 md:p-3 bg-[#252731] rounded-lg cursor-pointer">
                    {chapter.chapter}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 py-2">
                      {chapter.videos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-1 md:gap-2 w-full"
                        >
                          <button
                            onClick={() => handleVideoSelect(video)}
                            className={cn(
                              "flex-1 p-2 md:p-2.5 text-left rounded-lg transition-colors text-sm",
                              "hover:bg-primary/10",
                              video.id === currentVideo?.id && "bg-primary/20",
                              "flex items-center justify-between cursor-pointer"
                            )}
                          >
                            <span className="flex items-start gap-1 md:gap-2">
                              {video.type === 'video' ? (
                                <PlayCircleIcon className="w-3.5 md:w-4 h-3.5 md:h-4 mt-0.5 text-indigo-500" />
                              ) : (
                                <FileIcon className="w-3.5 md:w-4 h-3.5 md:h-4 mt-0.5 text-rose-500" />
                              )}
                              <span className={cn(
                                "flex-1",
                                courseProgress.completedVideos.includes(video.id) ? "text-primary" : "text-foreground"
                              )}>
                                {video.title}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground ml-1 md:ml-2">
                              {video?.duration}
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(video.id);
                            }}
                            className={cn(
                              "p-1 md:p-1.5 rounded-lg transition-colors",
                              courseProgress.bookmarkedVideos.includes(video.id) ? "text-yellow-500" : "text-muted-foreground"
                            )}
                          >
                            <BookmarkIcon className="w-3.5 md:w-4 h-3.5 md:h-4 cursor-pointer" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVideoComplete(video.id);
                            }}
                            className={cn(
                              "p-1 md:p-1.5 rounded-lg transition-colors",
                              courseProgress.completedVideos.includes(video.id) ? "text-green-500" : "text-muted-foreground"
                            )}
                          >
                            <CheckCircleIcon className="w-3.5 md:w-4 h-3.5 md:h-4 cursor-pointer" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  if (isLoading || !currentCourse || !currentVideo) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (courseId !== currentCourse.id) {
    return <Navigate to={`/course/${currentCourse.id}/video/${currentCourse.courseContent[0].videos[0].id}`} replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Mobile Course Info */}
      <div className="lg:hidden p-4 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{currentCourse.title}</h2>
        <div className="space-y-2">
          <div className="flex items-center w-full p-2 rounded-lg bg-gradient-to-r from-primary/20 to-transparent border border-primary/10">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-white uppercase tracking-wide">Duration</div>
              <div className="text-sm font-bold text-foreground">
                {currentCourse.duration || formatDuration(calculateTotalDuration(currentCourse))}
              </div>
            </div>
          </div>

          {courseProgress.completedVideos.length > 0 && (
            <>
              <div className="flex items-center w-full p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/10">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500/10 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-green-500"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white uppercase tracking-wide">Completed</div>
                  <div className="text-sm font-bold text-foreground">
                    {courseProgress.completedVideos.length}/{countTotalVideos(currentCourse)} lessons
                  </div>
                </div>
              </div>

              <div className="flex items-center w-full p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/10">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500/10 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-amber-500"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white uppercase tracking-wide">Progress</div>
                  <div className="text-sm font-bold text-foreground">
                    {(() => {
                      const totalDuration = calculateTotalDuration(currentCourse);
                      const completedDuration = calculateCompletedDuration(currentCourse, courseProgress.completedVideos);
                      const progressPercentage = calculateProgressPercentage(completedDuration, totalDuration);
                      return `${formatDuration(completedDuration)} (${progressPercentage}%)`;
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[400px] bg-card border-r">
        <ScrollArea className="h-full">
          <Card className="rounded-none border-0 shadow-none">
            <div className="p-4 border-0">
              <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                <img
                  src={currentCourse?.thumbnailUrl}
                  alt={currentCourse?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{currentCourse?.title}</h2>
              <div className="mt-3 space-y-2">
                <div className="flex items-center w-full p-3 rounded-lg bg-gradient-to-r from-primary/20 to-transparent border border-primary/10">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white uppercase tracking-wide">Duration</div>
                    <div className="text-sm font-bold text-foreground">
                      {currentCourse.duration || formatDuration(calculateTotalDuration(currentCourse))}
                    </div>
                  </div>
                </div>

                {courseProgress.completedVideos.length > 0 && (
                  <>
                    <div className="flex items-center w-full p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/10">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500/10 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-green-500"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-white uppercase tracking-wide">Completed</div>
                        <div className="text-sm font-bold text-foreground">
                          {courseProgress.completedVideos.length}/{countTotalVideos(currentCourse)} lessons
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center w-full p-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/10">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500/10 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-amber-500"
                        >
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-white uppercase tracking-wide">Progress</div>
                        <div className="text-sm font-bold text-foreground">
                          {(() => {
                            const totalDuration = calculateTotalDuration(currentCourse);
                            const completedDuration = calculateCompletedDuration(currentCourse, courseProgress.completedVideos);
                            const progressPercentage = calculateProgressPercentage(completedDuration, totalDuration);
                            return `${formatDuration(completedDuration)} (${progressPercentage}%)`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
                                "flex items-center justify-between cursor-pointer"
                              )}
                            >
                              <span className="flex items-start gap-2">
                                {video.type === 'video' ? (
                                  <PlayCircleIcon className="w-4 h-4 mt-0.5 text-indigo-500" />
                                ) : (
                                  <FileIcon className="w-4 h-4 mt-0.5 text-rose-500" />
                                )}
                                <span className={cn(
                                  "flex-1",
                                  courseProgress.completedVideos.includes(video.id) ? "text-primary" : "text-foreground"
                                )}>
                                  {video.title}
                                </span>
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {video?.duration}
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
                              aria-label={courseProgress.bookmarkedVideos.includes(video.id) ? "Remove bookmark" : "Add bookmark"}
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

      {/* Video Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 lg:px-8">
          {currentCourse && currentVideo && (
            <div className="w-full max-w-[1200px]">
              <VideoContent
                course={currentCourse}
                currentVideo={currentVideo}
                onVideoSelect={handleVideoSelect}
                courseProgress={courseProgress}
                toggleBookmark={toggleBookmark}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Course Content Sheet */}
      <CourseContentSheet />
    </div>
  );
}













