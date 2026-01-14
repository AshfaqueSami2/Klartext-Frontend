"use client";

import { useState, useEffect, useRef } from "react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Loader2, Save, Volume2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { ttsService } from "@/services/tts.service";

// Import your server actions
import { saveWordAction } from "../../serverAction/actions/vocabulary.actions";

// Global caches to persist across component mounts (faster repeated lookups)
const translationCache = new Map<string, string>();
const audioCache = new Map<string, string>(); // word -> audioUrl

interface WordPopupProps {
  word: string;
  lessonId: string;
  onClose: () => void;
  onSave: (word: string) => void;
  isSaved: boolean;
}

export default function WordPopup({ word, lessonId, onClose, onSave, isSaved }: WordPopupProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPronounceLoading, setIsPronounceLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        setCurrentAudio(null);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentAudio]);

  // Auto-Translate on Mount with caching
  useEffect(() => {
    let isMounted = true;
    
    const fetchTranslation = async () => {
      // Check cache first (instant!)
      const normalizedWord = word.toLowerCase().trim();
      if (translationCache.has(normalizedWord)) {
        setTranslation(translationCache.get(normalizedWord)!);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const requestPayload = {
          text: word
        };
        
        const response = await api.post('/translation/word', requestPayload);

        if (isMounted) {
          if (response.data.success) {
            const translationResult = response.data.data?.translation || 
                               response.data.translation || 
                               response.data.message ||
                               "Translation unavailable";
            
            // Cache the result
            translationCache.set(normalizedWord, translationResult);
            setTranslation(translationResult);
          } else {
            setTranslation("Translation unavailable");
          }
          setLoading(false);
        }
      } catch (error: any) {
        if (isMounted) {
          const errorMsg = error.response?.data?.message || error.message || "Translation unavailable";
          setTranslation(`Error: ${errorMsg}`);
          setLoading(false);
        }
      }
    };

    fetchTranslation();
    return () => { isMounted = false; };
  }, [word]);

  // Pre-fetch audio when popup opens (in background)
  useEffect(() => {
    const normalizedWord = word.toLowerCase().trim();
    
    // If not cached, pre-fetch in background
    if (!audioCache.has(normalizedWord)) {
      ttsService.generateTextAudio(word, {
        voiceName: 'de-DE-ConradNeural',
        language: 'de-DE',
        speed: 0.9,
        pitch: 0
      }).then(response => {
        if (response.success && response.audioUrl) {
          audioCache.set(normalizedWord, response.audioUrl);
          // Pre-create and preload audio element
          const audio = new Audio(response.audioUrl);
          audio.preload = 'auto';
          audioRef.current = audio;
        }
      }).catch(() => {
        // Silently fail - will use Web Speech API as fallback
      });
    }
  }, [word]);

  // Handle pronunciation with caching
  const handlePronunciation = async () => {
    if (isSpeaking) {
      // Stop current audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        setCurrentAudio(null);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Cancel any web speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    const normalizedWord = word.toLowerCase().trim();
    setIsSpeaking(true);
    let audioPlayed = false;

    try {
      // Check cache first (instant playback!)
      let audioUrl = audioCache.get(normalizedWord);
      
      if (!audioUrl) {
        // Not cached, need to fetch
        setIsPronounceLoading(true);
        const audioResponse = await ttsService.generateTextAudio(word, {
          voiceName: 'de-DE-ConradNeural',
          language: 'de-DE',
          speed: 0.9,
          pitch: 0
        });
        setIsPronounceLoading(false);

        if (audioResponse.success && audioResponse.audioUrl) {
          audioUrl = audioResponse.audioUrl;
          audioCache.set(normalizedWord, audioUrl);
        } else {
          throw new Error('Invalid audio response');
        }
      }

      // Validate audioUrl before using
      if (!audioUrl) {
        throw new Error('No audio URL available');
      }

      // Create new audio element (don't reuse pre-fetched one to avoid race conditions)
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        const error = audio.error;
        // Ignore empty src errors (race condition with cleanup)
        if (error && error.code && error.message && !error.message.includes('Empty src') && !audioPlayed) {
          console.error('Audio playback error:', error);
          setIsSpeaking(false);
          setCurrentAudio(null);
          speakWithWebSpeechAPI(word);
        }
      };
      
      audio.onplaying = () => {
        audioPlayed = true;
      };
      
      await audio.play();
      audioPlayed = true;
    } catch (error: any) {
      // Ignore AbortError - happens when user clicks quickly or navigates away
      if (error.name === 'AbortError') {
        setIsSpeaking(false);
        setIsPronounceLoading(false);
        return;
      }
      
      console.error('TTS Error:', error);
      setIsPronounceLoading(false);
      // Only fallback if no audio was played
      if (!audioPlayed) {
        speakWithWebSpeechAPI(word);
      } else {
        setIsSpeaking(false);
      }
    }
  };

  // Web Speech API fallback for pronunciation
  const speakWithWebSpeechAPI = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.85; // Slightly slower for learning
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
          // Ignore 'interrupted' and 'canceled' errors - happens when user clicks quickly
          if (e.error === 'interrupted' || e.error === 'canceled') {
            setIsSpeaking(false);
            return;
          }
          console.error('Speech synthesis error:', e);
          setIsSpeaking(false);
          toast.error('Pronunciation unavailable');
        };
        
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Web Speech API error:', error);
        setIsSpeaking(false);
        toast.error('Pronunciation unavailable');
      }
    } else {
      setIsSpeaking(false);
      toast.error('Pronunciation not supported in this browser');
    }
  };



  // 3. Handle Save (UPDATED)
  const handleSave = async () => {
    // Don't proceed if word is already saved
    if (isSaved) {
      toast.info(`"${word}" is already in your vocabulary!`);
      return;
    }

    // 🔑 GET TOKEN FROM BROWSER STORAGE
    const token = localStorage.getItem("accessToken");

    if (!token) {
        toast.error("You must be logged in to save words.");
        return;
    }

    // 🚀 PASS TOKEN TO SERVER ACTION
    const result = await saveWordAction(word, translation, lessonId, token);

    if (result.success) {
      toast.success(`Saved "${word}"`);
      onSave(word); 
      onClose();   
    } else if (result.error === "ALREADY_SAVED") {
        toast.warning(`You already know "${word}"!`);
    } else {
      toast.error("Failed to save word");
    }
  };



  return (
    <div className="absolute z-50 w-72 sm:w-80 animate-in zoom-in-95 slide-in-from-top-2 duration-200 mt-2">
      {/* Main Card */}
      <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 sm:p-5 overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-2xl" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-t-2xl" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-serif font-bold break-words bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {word}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">German → English</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200"
            >
              <span className="text-sm">✕</span>
            </button>
          </div>

          {/* Translation Area */}
          <div className="mb-4 min-h-[40px] bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
            {loading ? (
              <div className="flex items-center justify-center text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                <span className="animate-pulse">Translating...</span>
              </div>
            ) : (
              <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                {translation}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {/* Pronunciation Button */}
            <LiquidButton
              variant="outline"
              size="sm"
              onClick={handlePronunciation}
              disabled={isPronounceLoading}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl"
            >
              {isPronounceLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-blue-500 animate-pulse' : ''}`} />
              )}
              <span className="text-xs sm:text-sm">
                {isPronounceLoading ? 'Loading...' : isSpeaking ? 'Playing...' : 'Listen'}
              </span>
            </LiquidButton>

            {/* Save Button */}
            <LiquidButton 
              size="sm" 
              variant={isSaved ? "ghost" : "primary"}
              className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl ${
                isSaved 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25'
              }`}
              onClick={isSaved ? undefined : handleSave}
              disabled={loading || isSaved}
            >
              <Save className="h-4 w-4" /> 
              <span className="text-xs sm:text-sm">{isSaved ? 'Saved ✓' : 'Save'}</span>
            </LiquidButton>
          </div>
        </div>
      </div>
    </div>
  );
}