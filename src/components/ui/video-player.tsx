import { Maximize2Icon, Minimize2Icon, VolumeXIcon, Volume2Icon, Wind, SkipForwardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactPlayer from 'react-player';
import { useVideoPlayer } from './hooks/useVideoPlayer';

export interface VideoPlayerProps {
  url: string;
  title: string;
  onComplete?: () => void;
  onNextVideo?: () => void;
  autoPlay?: boolean;
  initialVolume?: number;
  initialMuted?: boolean;
  className?: string;
}

export function VideoPlayer({
  url,
  title,
  onComplete,
  onNextVideo,
  autoPlay = true,
  initialVolume = 0.8,
  initialMuted = false,
  className
}: VideoPlayerProps) {
  const {
    // Refs
    playerRef,
    containerRef,

    // State
    playing,
    volume,
    muted,
    played,
    duration,
    currentTime,
    fullscreen,
    controlsVisible,
    playbackRate,
    showPlaybackSpeedMenu,
    isCompleted,

    // Handlers
    showControls,
    handleProgress,
    handleDuration,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    handleSeekMouseDown,
    handleSeekChange,
    handleSeekMouseUp,
    handleVolumeMouseDown,
    handleVolumeMouseUp,
    togglePlay,
    togglePlaybackSpeedMenu,
    changePlaybackSpeed,

    // Utilities
    formatTime,
  } = useVideoPlayer({
    url,
    autoPlay,
    initialVolume,
    initialMuted,
    onComplete
  });

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-video overflow-hidden bg-black focus:outline-none", className)}
      tabIndex={0}
      onMouseMove={showControls}
      onMouseLeave={() => controlsVisible && showControls()}
      onClick={togglePlay}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        controls={false}
        onProgress={handleProgress}
        onDuration={handleDuration}
        progressInterval={100}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true,
              autoPlay: autoPlay,
            }
          }
        }}
      />

      {/* Title overlay at the top - only visible when controls are visible */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <h3 className="text-white font-medium text-lg truncate">{title}</h3>
      </div>

      {/* Play/Pause overlay icon */}
      {!playing && !isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/40 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      {/* Next Video button - shown when video is completed */}
      {isCompleted && onNextVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNextVideo();
            }}
            className="bg-black/40 hover:bg-black/60 rounded-full p-4 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <SkipForwardIcon className="h-10 w-10 text-white" />
              <span className="text-white font-medium">Next Video</span>
            </div>
          </button>
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
          <div className="relative w-full h-1.5 bg-white/30 cursor-pointer group">
            {/* Red progress bar (completed portion) */}
            <div
              className={cn(
                "absolute top-0 left-0 h-full",
                isCompleted ? "bg-green-600" : "bg-red-600"
              )}
              style={{ width: `${played * 100}%` }}
            />

            {/* Thumb/circle for current position */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                isCompleted ? "bg-green-600" : "bg-red-600"
              )}
              style={{ left: `calc(${played * 100}% - 7px)` }}
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

          {/* Time display and controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(e);
                }}
              >
                {playing ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </Button>

              {/* Time display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                {muted ? (
                  <VolumeXIcon className="h-5 w-5" />
                ) : (
                  <Volume2Icon className="h-5 w-5" />
                )}
              </Button>

              {/* Volume slider with red styling */}
              <div className="relative w-24 h-1.5 bg-white/30 cursor-pointer group">
                {/* Red volume level */}
                <div
                  className="absolute top-0 left-0 h-full bg-red-600"
                  style={{ width: `${volume * 100}%` }}
                />

                {/* Thumb/circle for volume level */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${volume * 100}% - 7px)` }}
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

            <div className="flex items-center gap-2">
              {/* Playback speed */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20"
                  onClick={togglePlaybackSpeedMenu}
                >
                  <Wind className="h-5 w-5" />
                </Button>

                {/* Playback speed menu */}
                {showPlaybackSpeedMenu && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md shadow-lg py-1 min-w-[100px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-white hover:bg-white/20 text-left",
                          speed === playbackRate && "bg-white/20"
                        )}
                        onClick={() => changePlaybackSpeed(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Full screen */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
              >
                {fullscreen ? (
                  <Minimize2Icon className="h-5 w-5" />
                ) : (
                  <Maximize2Icon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

