import { useEffect, useRef, useState } from 'react';
import { BookmarkIcon, CheckCircleIcon, Maximize2Icon, Minimize2Icon, VolumeXIcon, Volume2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VideoPlayerProps } from '@/types';
import ReactPlayer from 'react-player';

export default function ContentPlayer({
  video,
  onComplete,
  isBookmarked,
  isCompleted,
  onToggleBookmark
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const isInteractingWithControls = useRef(false);

  useEffect(() => {
    // Reset player state when video changes
    setPlayed(0);
    setPlaying(true);
  }, [video.id]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input field (except our own controls)
      if (
        (e.target instanceof HTMLInputElement || 
         e.target instanceof HTMLTextAreaElement ||
         (e.target instanceof HTMLElement && e.target.isContentEditable)) &&
        !containerRef.current?.contains(e.target as Node) &&
        !isInteractingWithControls.current
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setPlaying(prev => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(Math.max(currentTime - 5, 0));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(currentTime + 5);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(prev + 0.1, 1));
          setMuted(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(prev - 0.1, 0));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showControls = () => {
    setControlsVisible(true);
    
    // Clear any existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set a new timeout to hide controls after 3 seconds
    const timeout = setTimeout(() => {
      if (!seeking) {
        setControlsVisible(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  const handleProgress = (state: { played: number }) => {
    // Don't update state if user is seeking
    if (!seeking) {
      setPlayed(state.played);
      
      // Mark as completed when 90% watched
      if (state.played >= 0.9 && !isCompleted) {
        onComplete();
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
    isInteractingWithControls.current = true;
    // Store current playing state but don't change it
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
    // Don't change playing state here
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat((e.target as HTMLInputElement).value));
    }
    
    // Reset the controls timeout
    showControls();
    
    // Return focus to the container and reset interaction state
    containerRef.current?.focus();
    setTimeout(() => {
      isInteractingWithControls.current = false;
    }, 0);
    
    // Don't change playing state here
  };

  const handleVolumeMouseDown = () => {
    isInteractingWithControls.current = true;
  };

  const handleVolumeMouseUp = () => {
    containerRef.current?.focus();
    setTimeout(() => {
      isInteractingWithControls.current = false;
    }, 0);
  };

  return (
    <div className="flex-1 bg-background p-6">
      <div className="container mx-auto">
        <div 
          ref={containerRef}
          className="relative aspect-video overflow-hidden rounded-xl bg-black focus:outline-none"
          tabIndex={0}
          onMouseMove={showControls}
          onMouseLeave={() => setControlsVisible(false)}
          onClick={() => setPlaying(!playing)}
        >
          {video.type === 'video' ? (
            <>
              <ReactPlayer
                ref={playerRef}
                url={video.path}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                controls={false}
                onProgress={handleProgress}
                progressInterval={1000}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      disablePictureInPicture: true,
                      autoPlay: true,
                    }
                  }
                }}
              />
              
              {/* Play/Pause overlay icon */}
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Custom controls */}
              <div 
                className={cn(
                  "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300",
                  controlsVisible ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="flex flex-col gap-2">
                  {/* Progress bar with red completed portion */}
                  <div className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer group">
                    {/* Red progress bar (completed portion) */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-red-600 rounded-full" 
                      style={{ width: `${played * 100}%` }}
                    />
                    
                    {/* Thumb/circle for current position */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${played * 100}% - 6px)` }}
                    />
                    
                    {/* Invisible input range for seeking */}
                    <input
                      type="range"
                      min={0}
                      max={0.999999}
                      step="any"
                      value={played}
                      onMouseDown={handleSeekMouseDown}
                      onChange={handleSeekChange}
                      onMouseUp={handleSeekMouseUp}
                      onClick={(e) => e.stopPropagation()} // Prevent parent click handler
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaying(!playing);
                        }}
                      >
                        {playing ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                      >
                        {muted ? (
                          <VolumeXIcon className="h-4 w-4" />
                        ) : (
                          <Volume2Icon className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {/* Volume slider with red styling */}
                      <div className="relative w-20 h-1 bg-white/30 rounded-full cursor-pointer group">
                        {/* Red volume level */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-red-600 rounded-full" 
                          style={{ width: `${volume * 100}%` }}
                        />
                        
                        {/* Thumb/circle for volume level */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `calc(${volume * 100}% - 6px)` }}
                        />
                        
                        {/* Invisible input range for volume */}
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step="any"
                          value={volume}
                          onMouseDown={handleVolumeMouseDown}
                          onChange={handleVolumeChange}
                          onMouseUp={handleVolumeMouseUp}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                      }}
                    >
                      {fullscreen ? (
                        <Minimize2Icon className="h-4 w-4" />
                      ) : (
                        <Maximize2Icon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <iframe
              src={`${video.path}#toolbar=0`}
              className="w-full h-full"
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




