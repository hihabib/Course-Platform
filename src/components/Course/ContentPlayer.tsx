import { VideoPlayer } from '@/components/ui/video-player';
import { BookmarkIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VideoPlayerProps as CourseVideoPlayerProps } from '@/types';

export default function ContentPlayer({
  video,
  onComplete,
  isBookmarked,
  isCompleted,
  onToggleBookmark
}: CourseVideoPlayerProps) {
  return (
    <div className="flex-1 bg-background p-6">
      <div className="container mx-auto">
        <div className="rounded-xl overflow-hidden">
          {video.type === 'video' ? (
            <VideoPlayer
              url={video.path}
              title={video.title}
              onComplete={onComplete}
              autoPlay={true}
              initialVolume={0.8}
              className="rounded-xl"
            />
          ) : (
            <iframe
              src={`${video.path}#toolbar=0`}
              className="w-full h-full aspect-video rounded-xl"
              title={video.title}
            />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{video.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{video.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleBookmark}
              className={cn(isBookmarked && "text-yellow-500")}
            >
              <BookmarkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onComplete()}
              className={cn(isCompleted && "text-green-500")}
            >
              <CheckCircleIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {video.resources && video.resources.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground">Resources</h2>
            <div className="mt-2 space-y-2">
              {video.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-primary hover:underline"
                >
                  {resource.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


