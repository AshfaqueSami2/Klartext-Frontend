import api from '@/lib/axios';

export interface Voice {
  name: string;
  displayName: string;
  gender: 'Male' | 'Female';
  locale: string;
  shortName: string;
}

export interface TTSOptions {
  voiceName?: string;
  language?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // -50 to 50
}

export interface AudioResponse {
  success: boolean;
  audioUrl: string;
  fileName: string;
  duration?: number;
  message?: string;
}

export interface BatchAudioResponse {
  success: boolean;
  audioFiles: Array<{
    text: string;
    audioUrl: string;
    fileName: string;
  }>;
  message?: string;
}

export class TTSService {
  private static instance: TTSService;
  private voicesCache: Voice[] | null = null;
  private audioCache = new Map<string, string>(); // text -> audioUrl

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Clean HTML content to plain text for TTS
   */
  private cleanTextForTTS(htmlContent: string): string {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Extract text content only
    let cleanText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up extra whitespace and line breaks
    cleanText = cleanText
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .replace(/\n+/g, '. ')          // Replace line breaks with periods
      .trim();
    
    return cleanText;
  }

  /**
   * Get available voices from Azure TTS
   */
  async getVoices(): Promise<Voice[]> {
    if (this.voicesCache) {
      return this.voicesCache;
    }

    try {
      const response = await api.get<{ success: boolean; voices: Voice[] }>('/tts/voices');
      
      if (response.data.success && response.data.voices && Array.isArray(response.data.voices)) {
        this.voicesCache = response.data.voices;
        return this.voicesCache;
      } else {
        console.warn('Invalid voices response, using defaults');
        // Return default voices if API fails
        this.voicesCache = [
          {
            name: 'de-DE-ConradNeural',
            displayName: 'Conrad (Male)',
            gender: 'Male',
            locale: 'de-DE',
            shortName: 'de-DE-ConradNeural'
          },
          {
            name: 'de-DE-KatjaNeural',
            displayName: 'Katja (Female)',
            gender: 'Female', 
            locale: 'de-DE',
            shortName: 'de-DE-KatjaNeural'
          }
        ];
        return this.voicesCache;
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
      // Return default voices as fallback
      this.voicesCache = [
        {
          name: 'de-DE-ConradNeural',
          displayName: 'Conrad (Male)',
          gender: 'Male',
          locale: 'de-DE',
          shortName: 'de-DE-ConradNeural'
        }
      ];
      return this.voicesCache;
    }
  }

  /**
   * Generate audio for a single text
   */
  async generateTextAudio(text: string, options: TTSOptions = {}): Promise<AudioResponse> {
    // Detect and clean HTML content
    let cleanText = text;
    if (text.includes('<') && text.includes('>')) {
      console.log('🧹 Detected HTML content, cleaning for TTS...');
      cleanText = this.cleanTextForTTS(text);
      console.log('✨ Cleaned text:', cleanText.substring(0, 100) + '...');
    }

    // Trim and validate text
    cleanText = cleanText.trim();
    if (!cleanText) {
      throw new Error('No text provided for audio generation');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(cleanText, options);
    if (this.audioCache.has(cacheKey)) {
      console.log('✅ Using cached audio for:', cleanText.substring(0, 30));
      return {
        success: true,
        audioUrl: this.audioCache.get(cacheKey)!,
        fileName: `cached-${Date.now()}.mp3`
      };
    }

    try {
      console.log('🎤 Generating audio for:', cleanText.substring(0, 50));
      
      const response = await api.post<AudioResponse>('/tts/generate-text', {
        text: cleanText,
        voiceName: options.voiceName || 'de-DE-ConradNeural',
        language: options.language || 'de-DE',
        speed: options.speed || 1.0,
        pitch: options.pitch || 0
      }, {
        timeout: 10000 // 10 second timeout for word pronunciation
      });

      if (response.data && response.data.success && response.data.audioUrl) {
        console.log('✅ Audio generated successfully');
        // Cache the audio URL using cleaned text
        this.audioCache.set(cacheKey, response.data.audioUrl);
        return response.data;
      } else {
        console.error('Invalid TTS response:', response.data);
        throw new Error(response.data?.message || 'Invalid audio response from server');
      }
    } catch (error: any) {
      console.error('❌ Error generating text audio:', error);
      
      // Better error messages
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Could not generate audio. Server may be unavailable.';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Generate audio for an entire lesson using lesson content
   */
  async generateLessonAudioFromContent(lessonContent: string, options: TTSOptions = {}): Promise<AudioResponse> {
    try {
      // Clean HTML content before sending to TTS
      const cleanText = this.cleanTextForTTS(lessonContent);
      
      console.log('🧹 Cleaned lesson text for TTS:', cleanText.substring(0, 100) + '...');
      
      if (!cleanText.trim()) {
        throw new Error('No valid text content found in lesson');
      }
      
      // Use the text audio endpoint with cleaned content
      return await this.generateTextAudio(cleanText, options);
    } catch (error: any) {
      console.error('Error generating lesson audio from content:', error);
      throw new Error(error.message || 'Could not generate lesson audio');
    }
  }

  /**
   * Generate audio for an entire lesson (legacy method for backend processing)
   */
  async generateLessonAudio(lessonId: string, options: TTSOptions = {}): Promise<AudioResponse> {
    try {
      const response = await api.post<AudioResponse>(`/tts/generate-lesson/${lessonId}`, {
        voiceName: options.voiceName,
        language: options.language || 'de-DE',
        speed: options.speed || 1.0,
        pitch: options.pitch || 0
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate lesson audio');
      }
    } catch (error: any) {
      console.error('Error generating lesson audio:', error);
      throw new Error(error.response?.data?.message || 'Could not generate lesson audio');
    }
  }

  /**
   * Generate audio for multiple texts in batch
   */
  async generateBatchAudio(texts: string[], options: TTSOptions = {}): Promise<BatchAudioResponse> {
    try {
      const response = await api.post<BatchAudioResponse>('/tts/generate-batch', {
        texts,
        voiceName: options.voiceName,
        language: options.language || 'de-DE',
        speed: options.speed || 1.0,
        pitch: options.pitch || 0
      });

      if (response.data.success) {
        // Cache the audio URLs
        response.data.audioFiles.forEach(file => {
          const cacheKey = this.getCacheKey(file.text, options);
          this.audioCache.set(cacheKey, file.audioUrl);
        });
        
        return response.data;
      } else {
        throw new Error('Failed to generate batch audio');
      }
    } catch (error: any) {
      console.error('Error generating batch audio:', error);
      throw new Error(error.response?.data?.message || 'Could not generate batch audio');
    }
  }

  /**
   * Get German voices specifically
   */
  async getGermanVoices(): Promise<Voice[]> {
    try {
      const allVoices = await this.getVoices();
      if (!allVoices || !Array.isArray(allVoices)) {
        console.warn('No voices available, returning default German voices');
        return [
          {
            name: 'de-DE-ConradNeural',
            displayName: 'Conrad (Male)',
            gender: 'Male',
            locale: 'de-DE',
            shortName: 'de-DE-ConradNeural'
          },
          {
            name: 'de-DE-KatjaNeural',
            displayName: 'Katja (Female)', 
            gender: 'Female',
            locale: 'de-DE',
            shortName: 'de-DE-KatjaNeural'
          }
        ];
      }
      return allVoices.filter(voice => 
        voice.locale && (voice.locale.startsWith('de-') || voice.locale === 'de-DE')
      );
    } catch (error) {
      console.error('Error getting German voices:', error);
      // Return default German voices as fallback
      return [
        {
          name: 'de-DE-ConradNeural',
          displayName: 'Conrad (Male)',
          gender: 'Male',
          locale: 'de-DE',
          shortName: 'de-DE-ConradNeural'
        }
      ];
    }
  }

  /**
   * Get preferred voice from localStorage
   */
  getPreferredVoice(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('preferredTTSVoice');
  }

  /**
   * Save preferred voice to localStorage
   */
  setPreferredVoice(voiceName: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('preferredTTSVoice', voiceName);
  }

  /**
   * Get TTS settings from localStorage
   */
  getTTSSettings(): TTSOptions {
    if (typeof window === 'undefined') return {};
    
    try {
      const settings = localStorage.getItem('ttsSettings');
      return settings ? JSON.parse(settings) : {};
    } catch {
      return {};
    }
  }

  /**
   * Save TTS settings to localStorage
   */
  saveTTSSettings(settings: TTSOptions): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('ttsSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save TTS settings:', error);
    }
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
    this.voicesCache = null;
  }

  /**
   * Create cache key for audio files
   */
  private getCacheKey(text: string, options: TTSOptions): string {
    const normalized = text.toLowerCase().trim();
    const optionsKey = JSON.stringify({
      voice: options.voiceName || 'default',
      speed: options.speed || 1.0,
      pitch: options.pitch || 0,
      lang: options.language || 'de-DE'
    });
    return `${normalized}:${optionsKey}`;
  }

  /**
   * Regenerate audio for a lesson (admin only)
   */
  async regenerateLessonAudio(lessonId: string): Promise<{ success: boolean; message?: string; audioStatus?: string }> {
    try {
      const response = await api.post(`/lessons/${lessonId}/regenerate-audio`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Audio regeneration started',
          audioStatus: response.data.audioStatus || 'generating'
        };
      } else {
        throw new Error(response.data.message || 'Failed to regenerate audio');
      }
    } catch (error: any) {
      console.error('Error regenerating lesson audio:', error);
      throw new Error(error.response?.data?.message || 'Could not regenerate lesson audio');
    }
  }

  /**
   * Extract plain text from HTML
   */
  extractPlainText(htmlContent: string): string {
    if (typeof document === 'undefined') {
      // Server-side: basic HTML tag removal
      return htmlContent.replace(/<[^>]*>/g, '').trim();
    }
    
    // Client-side: proper HTML parsing
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
}

// Export singleton instance
export const ttsService = TTSService.getInstance();