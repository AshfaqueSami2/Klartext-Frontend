"use client";

import { useState, useEffect } from "react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Loader2, Save, Volume2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { ttsService } from "@/services/tts.service";

// Import your server actions
import { saveWordAction } from "../../serverAction/actions/vocabulary.actions";

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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  // Auto-Translate on Mount using new backend API
  useEffect(() => {
    let isMounted = true;
    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const requestPayload = {
          text: word
        };
        
        const response = await api.post('/translation/word', requestPayload);

        if (isMounted) {
          if (response.data.success) {
            // Check different possible response formats
            const translation = response.data.data?.translation || 
                               response.data.translation || 
                               response.data.message ||
                               "Translation unavailable";
            
            setTranslation(translation);
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

  // Handle pronunciation using Azure TTS
  const handlePronunciation = async () => {
    if (isSpeaking && currentAudio) {
      // Stop current audio
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      
      // Generate audio using Azure TTS with male German voice
      const audioResponse = await ttsService.generateTextAudio(word, {
        voiceName: 'de-DE-ConradNeural', // Male German voice
        language: 'de-DE',
        speed: 0.8, // Slightly slower for learning
        pitch: 0
      });

      if (audioResponse.success) {
        const audio = new Audio(audioResponse.audioUrl);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
          toast.error('Pronunciation failed');
        };
        
        await audio.play();
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (error: any) {
      setIsSpeaking(false);
      setCurrentAudio(null);
      toast.error('Pronunciation failed');
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
    <div className="absolute z-50 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-80 animate-in zoom-in-95 duration-200 mt-2 left-0 top-full">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-serif font-bold text-foreground break-words max-w-[80%]">
          {word}
        </h3>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="text-muted-foreground hover:text-red-500 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Translation Area */}
      <div className="mb-4 min-h-[20px]">
        {loading ? (
          <div className="flex items-center text-xs text-teal-600 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin mr-2" /> Translating...
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
            {translation}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Pronunciation Button */}
        <div className="flex items-center justify-center">
          <LiquidButton
            variant="outline"
            size="sm"
            onClick={handlePronunciation}
            disabled={!translation || translation === "Translation unavailable"}
            className="flex items-center gap-2 w-full justify-center"
          >
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-blue-500' : ''}`} />
            {isSpeaking ? 'Speaking...' : 'Pronounce'}
          </LiquidButton>
        </div>

        {/* Save Button */}
        <LiquidButton 
          size="sm" 
          variant={isSaved ? "ghost" : "primary"}
          className="w-full"
          onClick={isSaved ? undefined : handleSave}
          disabled={loading || isSaved}
        >
          <Save className="h-4 w-4 mr-2" /> 
          {isSaved ? 'Already Saved' : 'Save Word'}
        </LiquidButton>
      </div>
    </div>
  );
}