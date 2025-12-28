"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { ttsService, TTSOptions, AudioResponse } from '@/services/tts.service';

export interface AudioState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  error: string | null;
  audioUrl: string | null;
}

export interface AudioControls {
  // Playback controls
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  resume: () => void;
  
  // Audio generation
  generateAndPlay: (text: string, options?: TTSOptions) => Promise<void>;
  generateLessonAudio: (lessonId: string, options?: TTSOptions) => Promise<void>;
  
  // Settings
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  seekForward: (seconds?: number) => void;
  seekBack: (seconds?: number) => void;
  
  // Utilities
  clearError: () => void;
  reset: () => void;
  
  // Wavesurfer
  initializeWavesurfer: (container: HTMLDivElement) => void;
  destroyWavesurfer: () => void;
}

const initialState: AudioState = {
  isLoading: false,
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  error: null,
  audioUrl: null
};

export const useAudioPlayer = () => {
  const [state, setState] = useState<AudioState>(initialState);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);



  // Initialize Wavesurfer
  const initializeWavesurfer = useCallback((container: HTMLDivElement) => {
    if (!container || wavesurferRef.current) return;
    
    containerRef.current = container;
    
    try {
      // Create audio element to avoid CORS issues with Azure Blob Storage
      // Audio elements handle cross-origin differently than fetch()
      const audioElement = document.createElement('audio');
      audioElement.crossOrigin = 'anonymous';
      audioElement.preload = 'auto';
      audioElementRef.current = audioElement;

      const wavesurfer = WaveSurfer.create({
        container,
        waveColor: 'hsl(var(--primary))',
        progressColor: 'hsl(var(--primary-foreground))',
        cursorColor: 'hsl(var(--accent))',
        barWidth: 2,
        barGap: 1,
        height: 60,
        normalize: true,
        // Use the audio element to avoid CORS fetch issues
        media: audioElement,
      });

      
      wavesurferRef.current = wavesurfer;
      
      // Set up event listeners
      wavesurfer.on('ready', () => {
        setState(prev => ({
          ...prev,
          duration: wavesurfer.getDuration(),
          isLoading: false
        }));
      });
      
      wavesurfer.on('play', () => {
        setState(prev => ({
          ...prev,
          isPlaying: true,
          isPaused: false
        }));
      });
      
      wavesurfer.on('pause', () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isPaused: true
        }));
      });
      
      wavesurfer.on('finish', () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentTime: 0
        }));
      });
      
      wavesurfer.on('audioprocess', () => {
        setState(prev => ({
          ...prev,
          currentTime: wavesurfer.getCurrentTime()
        }));
      });
      
      wavesurfer.on('interaction', () => {
        setState(prev => ({
          ...prev,
          currentTime: wavesurfer.getCurrentTime()
        }));
      });
      
      wavesurfer.on('error', (error: Error) => {
        console.error('Wavesurfer error:', error);
        let errorMessage = 'Audio playback error';
        
        // Handle specific errors for Azure Blob Storage
        if (error.name === 'EncodingError' || error.message.includes('decode') || error.message.includes('DEMUXER_ERROR')) {
          errorMessage = 'Audio playback failed. Please try generating new audio.';
        } else if (error.message.includes('network') || error.message.includes('CORS')) {
          errorMessage = 'Network error loading audio. Please check your connection.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Audio access denied. The link may have expired - please try again.';
        } else if (error.message.includes('MediaError')) {
          errorMessage = 'Audio format error. Please request new audio from the server.';
        } else {
          errorMessage = `Audio error: ${error.message}`;
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
          isPlaying: false,
          isPaused: false
        }));
      });
      
      wavesurfer.on('loading', (percent: number) => {
        setState(prev => ({
          ...prev,
          isLoading: percent < 100
        }));
      });
      
      // Set volume from localStorage
      const savedVolume = localStorage.getItem('audioVolume');
      if (savedVolume) {
        const volume = parseFloat(savedVolume);
        wavesurfer.setVolume(volume);
        setState(prev => ({ ...prev, volume }));
      }
      
      // Set playback rate from localStorage
      const savedPlaybackRate = localStorage.getItem('audioPlaybackRate');
      if (savedPlaybackRate) {
        const rate = parseFloat(savedPlaybackRate);
        wavesurfer.setPlaybackRate(rate);
        setState(prev => ({ ...prev, playbackRate: rate }));
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to initialize audio player: ${error}`,
        isLoading: false
      }));
    }
  }, []);
  
  // Destroy Wavesurfer
  const destroyWavesurfer = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
    // Clean up audio element
    if (audioElementRef.current) {
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyWavesurfer();
    };
  }, [destroyWavesurfer]);

  // Control functions
  const play = useCallback(async () => {
    if (!wavesurferRef.current || !state.audioUrl) return;
    
    try {
      setState(prev => ({ ...prev, error: null }));
      await wavesurferRef.current.play();
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: `Playback failed: ${error.message}`,
        isLoading: false,
        isPlaying: false 
      }));
    }
  }, [state.audioUrl]);

  const pause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop();
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false,
        currentTime: 0 
      }));
    }
  }, []);

  const resume = useCallback(() => {
    if (wavesurferRef.current && state.isPaused) {
      wavesurferRef.current.play().catch(error => {
        setState(prev => ({ 
          ...prev, 
          error: `Resume failed: ${error.message}` 
        }));
      });
    }
  }, [state.isPaused]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(clampedVolume);
    }
    
    setState(prev => ({ ...prev, volume: clampedVolume }));
    localStorage.setItem('audioVolume', clampedVolume.toString());
  }, []);

  const seek = useCallback((time: number) => {
    if (wavesurferRef.current && state.duration > 0) {
      const progress = time / state.duration;
      const clampedProgress = Math.max(0, Math.min(1, progress));
      wavesurferRef.current.seekTo(clampedProgress);
    }
  }, [state.duration]);

  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(clampedRate);
    }
    
    setState(prev => ({ ...prev, playbackRate: clampedRate }));
    localStorage.setItem('audioPlaybackRate', clampedRate.toString());
  }, []);

  const seekForward = useCallback((seconds: number = 10) => {
    if (state.duration > 0) {
      const newTime = Math.min(state.currentTime + seconds, state.duration);
      seek(newTime);
    }
  }, [state.currentTime, state.duration, seek]);

  const seekBack = useCallback((seconds: number = 10) => {
    if (state.duration > 0) {
      const newTime = Math.max(state.currentTime - seconds, 0);
      seek(newTime);
    }
  }, [state.currentTime, seek]);

  const generateAndPlay = useCallback(async (text: string, options: TTSOptions = {}) => {
    if (!text.trim()) {
      setState(prev => ({ ...prev, error: 'No text provided for audio generation' }));
      return;
    }

    console.log('🎤 Processing audio for:', text.substring(0, 50) + '...', 'with options:', options);

    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        isPlaying: false,
        isPaused: false 
      }));

      // Check if this looks like a pre-generated Azure Blob URL
      if (text.includes('blob.core.windows.net') && text.includes('lessonaudio')) {
        console.log('🎵 Detected pre-generated audio URL, loading directly...');
        
        setState(prev => ({ 
          ...prev, 
          audioUrl: text,
          isLoading: true,
          error: null 
        }));
        
        try {
          console.log('✅ Loading pre-generated audio from Azure:', text);
          await wavesurferRef.current!.load(text);
          return; // Exit early for pre-generated audio
        } catch (loadError: any) {
          console.error('❌ Pre-generated audio load error:', loadError);
          throw new Error(`Failed to load pre-generated audio: ${loadError.message}`);
        }
      }

      // Regular TTS generation flow
      const userSettings = ttsService.getTTSSettings();
      const preferredVoice = ttsService.getPreferredVoice();
      
      const ttsOptions: TTSOptions = {
        voiceName: preferredVoice || options.voiceName,
        language: 'de-DE',
        speed: userSettings.speed || options.speed || 1.0,
        pitch: userSettings.pitch || options.pitch || 0,
        ...options
      };

      const response: AudioResponse = await ttsService.generateTextAudio(text, ttsOptions);
      
      console.log('🔍 TTS Service Response:', response);
      
      if (response.success && response.audioUrl && wavesurferRef.current) {
        // Validate Azure Blob URL
        if (!response.audioUrl || typeof response.audioUrl !== 'string') {
          console.error('❌ Invalid audio URL received from backend');
          throw new Error('Invalid audio URL received. Please try again.');
        }

        console.log('🎵 Loading Azure Blob URL directly:', response.audioUrl);
        
        setState(prev => ({ 
          ...prev, 
          audioUrl: response.audioUrl,
          isLoading: true,
          error: null 
        }));
        
        try {
          // Set audio source on the media element first (avoids CORS fetch)
          if (audioElementRef.current) {
            audioElementRef.current.src = response.audioUrl;
          }
          // Then load it into wavesurfer
          wavesurferRef.current.empty();
          await wavesurferRef.current.load(response.audioUrl);
        } catch (loadError: any) {
          console.error('❌ Wavesurfer load error:', loadError);
          // Friendly error message for SAS token expiry or network issues
          const errorMsg = loadError.message?.includes('DEMUXER_ERROR') || loadError.message?.includes('MediaError') 
            ? 'Audio playback failed. The audio link may have expired. Please try generating new audio.'
            : `Failed to load audio: ${loadError.message}`;
          throw new Error(errorMsg);
        }
      } else {
        throw new Error(response.message || 'Failed to generate audio');
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to generate audio',
        isLoading: false,
        isPlaying: false,
        isPaused: false
      }));
    }
  }, [play]);

  const generateLessonAudio = useCallback(async (lessonId: string, options: TTSOptions = {}) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        isPlaying: false,
        isPaused: false 
      }));

      // Apply user preferences
      const userSettings = ttsService.getTTSSettings();
      const preferredVoice = ttsService.getPreferredVoice();
      
      const ttsOptions: TTSOptions = {
        voiceName: preferredVoice || options.voiceName,
        language: 'de-DE',
        speed: userSettings.speed || options.speed || 1.0,
        pitch: userSettings.pitch || options.pitch || 0,
        ...options
      };

      const response: AudioResponse = await ttsService.generateLessonAudio(lessonId, ttsOptions);
      
      if (response.success && response.audioUrl && wavesurferRef.current) {
        // Validate Azure Blob URL
        if (!response.audioUrl || typeof response.audioUrl !== 'string') {
          console.error('❌ Invalid lesson audio URL received from backend');
          throw new Error('Invalid lesson audio URL received. Please try again.');
        }

        console.log('🎵 Loading lesson Azure Blob URL directly:', response.audioUrl);
        
        setState(prev => ({ 
          ...prev, 
          audioUrl: response.audioUrl,
          isLoading: true,
          error: null 
        }));
        
        try {
          // Set audio source on the media element first (avoids CORS fetch)
          if (audioElementRef.current) {
            audioElementRef.current.src = response.audioUrl;
          }
          // Then load it into wavesurfer
          wavesurferRef.current.empty();
          await wavesurferRef.current.load(response.audioUrl);
        } catch (loadError: any) {
          console.error('❌ Wavesurfer lesson load error:', loadError);
          // Friendly error message for SAS token expiry or network issues
          const errorMsg = loadError.message?.includes('DEMUXER_ERROR') || loadError.message?.includes('MediaError')
            ? 'Lesson audio playback failed. The audio link may have expired. Please try again.'
            : `Failed to load lesson audio: ${loadError.message}`;
          throw new Error(errorMsg);
        }
      } else {
        throw new Error(response.message || 'Failed to generate lesson audio');
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to generate lesson audio',
        isLoading: false,
        isPlaying: false,
        isPaused: false
      }));
    }
  }, [play]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState(initialState);
    if (wavesurferRef.current) {
      wavesurferRef.current.empty();
    }
  }, [stop]);

  // Return state and controls
  const controls: AudioControls = {
    play,
    pause,
    stop,
    resume,
    generateAndPlay,
    generateLessonAudio,
    setVolume,
    seek,
    setPlaybackRate,
    seekForward,
    seekBack,
    clearError,
    reset,
    initializeWavesurfer,
    destroyWavesurfer
  };

  return {
    ...state,
    ...controls,
    // Computed properties
    canPlay: !state.isLoading && state.audioUrl && !state.isPlaying,
    canPause: state.isPlaying && !state.isPaused,
    canResume: state.isPaused && state.audioUrl,
    canStop: (state.isPlaying || state.isPaused) && state.audioUrl,
    progress: state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0
  };
};