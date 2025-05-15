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
import { Link } from "react-router-dom";
import { BookmarkedVideosDrawerProps } from "@/types";
import { useBookmarkedVideos } from "@/hooks/useBookmarkedVideos";

export function BookmarkedVideosDrawer({ onClose }: BookmarkedVideosDrawerProps) {
  const { bookmarkedVideos, isLoading, error, removeBookmark } = useBookmarkedVideos();

  return (
    <Drawer onOpenChange={onClose}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BookmarkIcon className="h-4 w-4 md:h-5 md:w-5" />
          {bookmarkedVideos.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-primary text-[10px] md:text-xs text-primary-foreground flex items-center justify-center">
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
              <div className="space-y-4 md:space-y-6">
                {bookmarkedVideos.map((video) => (
                  <div key={`${video.courseId}-${video.videoId}`} className="relative pt-2">
                    <button
                      onClick={() => removeBookmark(video.courseId, video.videoId)}
                      className="absolute -right-2 -top-1 z-10"
                      aria-label="Remove bookmark"
                    >
                      <XCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground bg-black rounded-full cursor-pointer hover:text-foreground transition-colors" />
                    </button>
                    <Link
                      to={`/course/${video.courseId}/video/${video.videoId}`}
                      className="block"
                    >
                      <div className="rounded-lg border p-2.5 md:p-3 hover:bg-accent transition-colors group cursor-pointer">
                        <h4 className="font-medium text-sm md:text-base text-white group-hover:text-black">{video.title}</h4>
                        <p className="text-xs md:text-sm text-white/70 group-hover:text-black">
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






