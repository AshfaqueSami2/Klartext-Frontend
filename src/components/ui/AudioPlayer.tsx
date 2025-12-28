"use client";

import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Loader2,
  AlertCircle,
  Download,
  SkipForward,
  SkipBack,
  Settings,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidButton } from '@/components/ui/liquid-button';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { TTSOptions } from '@/services/tts.service';

interface AudioPlayerProps {
  text?: string;
  lessonId?: string;
  lessonContent?: string;
  preGeneratedAudioUrl?: string;  // Pre-generated audio URL
  audioStatus?: 'pending' | 'generating' | 'ready' | 'failed'; // Audio generation status
  options?: TTSOptions;
  variant?: 'compact' | 'full' | 'minimal';
  showDownload?: boolean;
  autoPlay?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  lessonId,
  lessonContent,
  preGeneratedAudioUrl: _preGeneratedAudioUrl, // Reserved for future pre-cached audio support
  audioStatus: _audioStatus = 'pending', // Reserved for future audio status handling
  options = {},
  variant = 'compact',
  showDownload = false,
  autoPlay = false,
  className = '',
  onPlay,
  onPause,
  onError
}) => {
  const waveformRef = React.useRef<HTMLDivElement>(null);
  
  // Enhanced state for new features
  const [showSettings, setShowSettings] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  const {
    isLoading,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    volume,
    playbackRate,
    error,
    progress: _progress, // Reserved for future progress bar UI
    canPlay,
    canPause,
    canResume,
    canStop,
    play,
    pause,
    stop,
    resume,
    setVolume,
    seek: _seek, // Reserved for future seek bar UI
    setPlaybackRate,
    seekForward,
    seekBack,
    generateAndPlay,
    generateLessonAudio,
    clearError,
    audioUrl,
    initializeWavesurfer,
    destroyWavesurfer
  } = useAudioPlayer();



  // Initialize Wavesurfer when component mounts
  React.useEffect(() => {
    if (waveformRef.current && variant !== 'minimal') {
      initializeWavesurfer(waveformRef.current);
    }
    
    return () => {
      destroyWavesurfer();
    };
  }, [initializeWavesurfer, destroyWavesurfer, variant]);

  // Auto-generate and play audio on mount
  React.useEffect(() => {
    if (autoPlay && text && !audioUrl && !isLoading) {
      generateAndPlay(text, options);
    }
  }, [autoPlay, text, audioUrl, isLoading, generateAndPlay, options]);

  // Auto-generate lesson audio on mount
  React.useEffect(() => {
    if (autoPlay && lessonId && !audioUrl && !isLoading) {
      generateLessonAudio(lessonId, options);
    }
  }, [autoPlay, lessonId, audioUrl, isLoading, generateLessonAudio, options]);

  // Callback effects
  React.useEffect(() => {
    if (isPlaying && onPlay) onPlay();
  }, [isPlaying, onPlay]);

  React.useEffect(() => {
    if (isPaused && onPause) onPause();
  }, [isPaused, onPause]);

  React.useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Instant audio generation with user settings
  const handleInstantAudio = async () => {
    if (isGenerating || (!text && !lessonContent && !lessonId)) return;
    
    setIsGenerating(true);
    try {
      const audioOptions: TTSOptions = {
        voiceName: 'de-DE-ConradNeural', // Fixed male German voice
        language: 'de-DE',
        speed: playbackRate,
        pitch: 0,
        ...options
      };

      if (text) {
        await generateAndPlay(text, audioOptions);
      } else if (lessonContent) {
        await generateAndPlay(lessonContent, audioOptions);
      } else if (lessonId) {
        await generateLessonAudio(lessonId, audioOptions);
      }
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle play/pause toggle
  const handlePlayPause = async () => {
    if (isLoading || isGenerating) return;

    // If no audio exists, generate instantly
    if (!audioUrl) {
      await handleInstantAudio();
      return;
    }

    if (canPause) {
      pause();
    } else if (canResume) {
      resume();
    } else if (canPlay) {
      await play();
    }
  };

  // Use hook methods for seeking
  const handleSeekForward = () => seekForward(10);
  const handleSeekBack = () => seekBack(10);

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // Handle download
  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `audio-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Error display
  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">Audio Error</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearError}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
          >
            Dismiss
          </Button>
          {(text || lessonId) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearError();
                if (text) generateAndPlay(text, options);
                else if (lessonId) generateLessonAudio(lessonId, options);
              }}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Minimal variant - just play button
  if (variant === 'minimal') {
    return (
      <LiquidButton
        variant="ghost"
        size="sm"
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`w-8 h-8 p-0 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying && !isPaused ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </LiquidButton>
    );
  }

  // Compact variant - play/pause + volume with mini waveform
  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <LiquidButton
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying && !isPaused ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : isPlaying ? 'Pause' : 'Play'}
          </LiquidButton>

          {audioUrl && (
            <>
              <div className="flex items-center gap-1">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>

              {canStop && (
                <LiquidButton
                  variant="ghost"
                  size="sm"
                  onClick={stop}
                  className="w-8 h-8 p-0"
                >
                  <Square className="h-4 w-4" />
                </LiquidButton>
              )}
            </>
          )}
        </div>
        
        {/* Error display for compact variant */}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        {/* Mini waveform for compact variant */}
        {audioUrl && !error && (
          <div 
            ref={waveformRef} 
            className="w-full h-8 rounded bg-muted/20 overflow-hidden"
          />
        )}
      </div>
    );
  }

  // Enhanced full variant with all new features
  return (
    <div className={`bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-6 shadow-2xl ${className}`}>


      {/* Header with audio info and settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Premium Audio</h3>
            <p className="text-xs text-muted-foreground">High-quality German pronunciation</p>
          </div>
        </div>
        <LiquidButton
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 p-0"
        >
          <Settings className="w-4 h-4" />
        </LiquidButton>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-muted/20 rounded-xl p-4 mb-4 space-y-4">
          {/* Playback Rate */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Playback Speed: {playbackRate}x
            </label>
            <div className="flex gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <LiquidButton
                  key={rate}
                  variant={playbackRate === rate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlaybackRate(rate)}
                  className="text-xs"
                >
                  {rate}x
                </LiquidButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Waveform visualization */}
      <div className="mb-6">
        <div 
          ref={waveformRef} 
          className="w-full rounded-xl overflow-hidden bg-muted/10 border border-primary/10"
          style={{ minHeight: '80px' }}
        />
        {duration > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground mt-3">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="text-xs">Speed: {playbackRate}x</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Enhanced control panel */}
      <div className="space-y-4">
        {/* Main playback controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Seek back 10s */}
          <LiquidButton
            variant="ghost"
            size="sm"
            onClick={handleSeekBack}
            disabled={!audioUrl || duration === 0}
            className="w-10 h-10 p-0 rounded-full"
          >
            <SkipBack className="w-5 h-5" />
          </LiquidButton>

          {/* Main play/pause */}
          <LiquidButton
            variant="default"
            size="lg"
            onClick={handlePlayPause}
            disabled={isLoading || isGenerating}
            className="w-16 h-16 p-0 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            {isLoading || isGenerating ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isPlaying && !isPaused ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </LiquidButton>

          {/* Seek forward 10s */}
          <LiquidButton
            variant="ghost"
            size="sm"
            onClick={handleSeekForward}
            disabled={!audioUrl || duration === 0}
            className="w-10 h-10 p-0 rounded-full"
          >
            <SkipForward className="w-5 h-5" />
          </LiquidButton>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canStop && (
              <LiquidButton
                variant="ghost"
                size="sm"
                onClick={stop}
                className="w-8 h-8 p-0"
              >
                <Square className="w-4 h-4" />
              </LiquidButton>
            )}

            <LiquidButton
              variant="ghost"
              size="sm"
              onClick={handleInstantAudio}
              disabled={isGenerating || (!text && !lessonContent && !lessonId)}
              className="w-8 h-8 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </LiquidButton>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs font-mono w-8">{Math.round(volume * 100)}%</span>
            </div>

            {/* Download button */}
            {showDownload && audioUrl && (
              <LiquidButton
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="w-8 h-8 p-0"
              >
                <Download className="w-4 h-4" />
              </LiquidButton>
            )}
          </div>
        </div>
      </div>

      {/* Status indicator */}
      {(isLoading || isGenerating || isPlaying || isPaused) && (
        <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-muted/20 rounded-xl text-sm">
          {(isLoading || isGenerating) && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-muted-foreground">Generating premium audio...</span>
            </>
          )}
          {isPlaying && !isLoading && !isGenerating && (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-foreground font-medium">Playing at {playbackRate}x speed</span>
            </>
          )}
          {isPaused && !isLoading && !isGenerating && (
            <>
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-muted-foreground">Paused</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;