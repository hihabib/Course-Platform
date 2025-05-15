import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CourseCardProps } from '@/types';

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link to={`/course/${course.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
        <CardHeader className="p-0">
          <div className="aspect-video overflow-hidden">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-1">{course.title}</h3>
          <p className="mt-1.5 md:mt-2 line-clamp-2 text-xs md:text-sm text-muted-foreground">
            {course.description}
          </p>
        </CardContent>
        {/* <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <img
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                className="h-6 w-6 rounded-full"
              />
              <span className="text-sm text-muted-foreground">
                {course.instructor.name}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {course.level}
            </span>
          </div>
        </CardFooter> */}
      </Card>
    </Link>
  );
}