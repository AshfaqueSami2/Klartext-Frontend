/**
 * Audio format utilities for handling different audio types
 * Helps with browser compatibility and format conversion
 */

export class AudioFormatUtils {
  private static supportedFormats: { [key: string]: boolean } = {};

  /**
   * Test if browser supports specific audio format
   */
  static canPlayFormat(format: string): boolean {
    if (typeof window === 'undefined') return false;
    
    if (this.supportedFormats[format] !== undefined) {
      return this.supportedFormats[format];
    }

    const audio = new Audio();
    let canPlay = false;

    switch (format.toLowerCase()) {
      case 'mp3':
      case 'mpeg':
        canPlay = audio.canPlayType('audio/mpeg') !== '';
        break;
      case 'wav':
        canPlay = audio.canPlayType('audio/wav') !== '';
        break;
      case 'ogg':
        canPlay = audio.canPlayType('audio/ogg') !== '';
        break;
      case 'webm':
        canPlay = audio.canPlayType('audio/webm') !== '';
        break;
      case 'm4a':
      case 'aac':
        canPlay = audio.canPlayType('audio/mp4') !== '' || audio.canPlayType('audio/aac') !== '';
        break;
      default:
        canPlay = false;
    }

    this.supportedFormats[format] = canPlay;
    return canPlay;
  }

  /**
   * Get best supported audio format from a list of options
   */
  static getBestFormat(formats: string[]): string | null {
    // Priority order: MP3 > AAC > OGG > WAV
    const priority = ['mp3', 'aac', 'm4a', 'ogg', 'webm', 'wav'];
    
    for (const format of priority) {
      if (formats.includes(format) && this.canPlayFormat(format)) {
        return format;
      }
    }

    // Fallback: return first supported format
    for (const format of formats) {
      if (this.canPlayFormat(format)) {
        return format;
      }
    }

    return null;
  }

  /**
   * Detect audio format from URL
   */
  static detectFormatFromUrl(url: string): string | null {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || null;
  }

  /**
   * Check if audio URL is likely to work
   */
  static async validateAudioUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (!contentType) return false;
      
      // Check if it's an audio MIME type
      return contentType.startsWith('audio/');
    } catch {
      return false;
    }
  }

  /**
   * Create audio element with best practices
   */
  static createAudioElement(): HTMLAudioElement {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    
    // Set volume to user preference or default
    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume) {
      audio.volume = Math.max(0, Math.min(1, parseFloat(savedVolume)));
    }

    return audio;
  }

  /**
   * Get audio format recommendations for TTS
   */
  static getRecommendedTTSFormat(): string {
    if (this.canPlayFormat('mp3')) return 'mp3';
    if (this.canPlayFormat('ogg')) return 'ogg';
    if (this.canPlayFormat('wav')) return 'wav';
    
    console.warn('No supported audio formats detected');
    return 'mp3'; // Default fallback
  }

  /**
   * Handle audio loading with retry logic
   */
  static async loadAudioWithRetry(
    audio: HTMLAudioElement, 
    url: string, 
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Audio loading timeout'));
          }, 10000); // 10 second timeout

          const handleLoad = () => {
            clearTimeout(timeoutId);
            audio.removeEventListener('canplaythrough', handleLoad);
            audio.removeEventListener('error', handleError);
            resolve();
          };

          const handleError = (e: Event) => {
            clearTimeout(timeoutId);
            audio.removeEventListener('canplaythrough', handleLoad);
            audio.removeEventListener('error', handleError);
            reject(new Error(`Audio loading failed: ${(e.target as HTMLAudioElement).error?.message}`));
          };

          audio.addEventListener('canplaythrough', handleLoad);
          audio.addEventListener('error', handleError);
          audio.src = url;
          audio.load();
        });
      } catch (error) {
        lastError = error as Error;
        console.warn(`Audio loading attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Audio loading failed after all retry attempts');
  }

  /**
   * Get browser audio capabilities summary
   */
  static getAudioCapabilities(): {
    formats: { [key: string]: boolean };
    recommended: string;
    hasAudioSupport: boolean;
  } {
    const formats = {
      mp3: this.canPlayFormat('mp3'),
      wav: this.canPlayFormat('wav'),
      ogg: this.canPlayFormat('ogg'),
      aac: this.canPlayFormat('aac'),
      webm: this.canPlayFormat('webm')
    };

    const hasAudioSupport = Object.values(formats).some(supported => supported);
    const recommended = this.getRecommendedTTSFormat();

    return {
      formats,
      recommended,
      hasAudioSupport
    };
  }
}

// Export for easier usage
export const audioUtils = AudioFormatUtils;