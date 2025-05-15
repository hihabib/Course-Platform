import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface UseVideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  initialVolume?: number;
  initialMuted?: boolean;
  onComplete?: () => void;
}

export function useVideoPlayer({
  url,
  autoPlay = true,
  initialVolume = 0.8,
  initialMuted = false,
  onComplete
}: UseVideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(initialMuted);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackSpeedMenu, setShowPlaybackSpeedMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const isInteractingWithControls = useRef(false);
  const hasCompleted = useRef(false);

  // Reset player state when video changes or when seeking back
  useEffect(() => {
    setPlayed(0);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(autoPlay);
    setIsCompleted(false);
    hasCompleted.current = false;
  }, [url, autoPlay]);

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

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

      let shortcutUsed = true;
      
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
        default:
          shortcutUsed = false;
      }
      
      // Show controls briefly if a shortcut was used
      if (shortcutUsed) {
        // Force a reset of the controls visibility
        setControlsVisible(false);
        // Use setTimeout to ensure state update completes
        setTimeout(() => {
          showControls();
        }, 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  const showControls = () => {
    setControlsVisible(true);
    
    // Clear any existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
    
    // Set a new timeout to hide controls after 3 seconds
    const timeout = setTimeout(() => {
      if (!seeking) {
        setControlsVisible(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    // Don't update state if user is seeking
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
      
      // Mark as completed when video reaches the end
      if (state.played >= 0.999 && onComplete && !hasCompleted.current) {
        hasCompleted.current = true;
        setIsCompleted(true);
        onComplete();
      } else if (state.played < 0.999) {
        // Reset completed state if not at the end
        hasCompleted.current = false;
        setIsCompleted(false);
      }
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
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
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlayed(value);
    setCurrentTime(value * duration);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      const seekTo = parseFloat((e.target as HTMLInputElement).value);
      playerRef.current.seekTo(seekTo);
      setCurrentTime(seekTo * duration);
      
      // Reset completed state if seeking back
      if (seekTo < 0.999) {
        setIsCompleted(false);
        hasCompleted.current = false;
      }
    }
    
    // Reset the controls timeout
    showControls();
    
    // Return focus to the container and reset interaction state
    containerRef.current?.focus();
    setTimeout(() => {
      isInteractingWithControls.current = false;
    }, 0);
  };

  const handleVolumeMouseDown = () => {
    isInteractingWithControls.current = true;
  };

  const handleVolumeMouseUp = () => {
    setTimeout(() => {
      isInteractingWithControls.current = false;
    }, 0);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setPlaying(prev => !prev);
  };

  const togglePlaybackSpeedMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowPlaybackSpeedMenu(prev => !prev);
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackRate(speed);
    setShowPlaybackSpeedMenu(false);
  };

  return {
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
  };
}