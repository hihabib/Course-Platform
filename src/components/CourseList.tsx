import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Video {
  id: string;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  thumbnailUrl: string;
  courseContent: {
    chapter: string;
    videos: Video[];
  }[];
}

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const response = await fetch('/src/allCourses.json');
      const data = await response.json();
      setCourses(data);
    };

    fetchCourses();
  }, []);

  const calculateTotalDuration = (course: Course) => {
    let totalMinutes = 0;
    course.courseContent.forEach(chapter => {
      chapter.videos.forEach(video => {
        const [minutes, seconds] = video.duration.split(':').map(Number);
        totalMinutes += minutes + seconds / 60;
      });
    });
    return Math.round(totalMinutes / 60) + 'h';
  };

  const getFirstVideoId = (course: Course): string => {
    return course.courseContent[0]?.videos[0]?.id || '';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Available Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}/video/${getFirstVideoId(course)}`}
              className="group bg-card rounded-xl overflow-hidden transition-transform hover:scale-105"
            >
              {/* Course Image */}
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {course.title}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {calculateTotalDuration(course)}
                  </span>
                </div>

                {/* Course Description - First chapter as preview */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.courseContent[0]?.chapter}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
