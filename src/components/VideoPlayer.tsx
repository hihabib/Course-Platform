import { cn } from "@/lib/utils";
import { VideoPlayerProps } from "@/types";
import { BookmarkIcon, CheckCircleIcon } from "lucide-react";

export const VideoPlayer = ({ 
  video, 
  onComplete, 
  isBookmarked, 
  isCompleted, 
  onToggleBookmark 
}: VideoPlayerProps) => {
  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className="sticky top-0 bg-background z-10">
        <div className="aspect-video bg-black">
          <video 
            className="w-full h-full"
            controls
            autoPlay={false}
            src={video.path}
            onEnded={onComplete}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {video.title}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onToggleBookmark}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isBookmarked ? "text-yellow-500" : "text-muted-foreground"
              )}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <BookmarkIcon className="w-5 h-5 cursor-pointer" />
            </button>
            <button
              onClick={onComplete}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isCompleted ? "text-green-500" : "text-muted-foreground"
              )}
              aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              <CheckCircleIcon className="w-5 h-5 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;







