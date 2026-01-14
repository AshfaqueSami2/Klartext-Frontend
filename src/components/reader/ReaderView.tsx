"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import WordPopup from "./WordPopup";
import { celebrateCompletion, fireConfetti } from "@/components/ui/confetti";
import AudioPlayer from "@/components/ui/AudioPlayer";
import VoiceSelector from "@/components/ui/VoiceSelector";
import api from "@/lib/axios";
import { Settings, ChevronDown, ChevronUp, Headphones, Sparkles } from "lucide-react";

interface ReaderViewProps {
  lessonId: string;
  content: string;
  initialSavedWords: string[]; // Array of words user already knows ["haus", "hund"]
  isPreview?: boolean; // True when lesson is already completed
  // Pre-generated audio properties
  audioUrl?: string;
  audioStatus?: 'pending' | 'generating' | 'ready' | 'failed';
}

export default function ReaderView({ 
  lessonId, 
  content, 
  initialSavedWords, 
  isPreview = false,
  audioUrl,
  audioStatus = 'pending'
}: ReaderViewProps) {
  // Track saved words locally so we don't need to refresh the page
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set(initialSavedWords));
  const [selectedWord, setSelectedWord] = useState<{ text: string; x: number; y: number } | null>(null);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Helper: Clean word (remove punctuation)
  const cleanWord = (w: string) => w.replace(/[^\p{L}\d]/gu, "");

  // Process content to wrap words and highlight saved ones
  useEffect(() => {
    const processContent = (htmlContent: string) => {
      // Sanitize HTML content to prevent XSS attacks
      const sanitizedContent = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'span', 'div', 'a'],
        ALLOWED_ATTR: ['class', 'href', 'target', 'rel']
      });
      
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitizedContent;

      // Function to process text nodes
      const processTextNode = (node: Text) => {
        const text = node.textContent || '';
        const words = text.split(/(\s+|[^\p{L}\d]+)/gu);
        
        const fragment = document.createDocumentFragment();
        
        words.forEach(word => {
          if (word.trim() && /\p{L}/gu.test(word)) {
            // This is a word
            const cleanedWord = cleanWord(word.toLowerCase());
            const span = document.createElement('span');
            span.textContent = word;
            span.className = `clickable-word ${savedWords.has(cleanedWord) ? 'saved-word' : 'unsaved-word'}`;
            span.setAttribute('data-word', cleanedWord);
            fragment.appendChild(span);
          } else {
            // This is whitespace or punctuation
            const textNode = document.createTextNode(word);
            fragment.appendChild(textNode);
          }
        });
        
        return fragment;
      };

      // Walk through all text nodes and process them
      const walkTextNodes = (node: Node): void => {
        if (node.nodeType === Node.TEXT_NODE) {
          const fragment = processTextNode(node as Text);
          node.parentNode?.replaceChild(fragment, node);
        } else {
          // Process children (but create a copy since we're modifying)
          const children = Array.from(node.childNodes);
          children.forEach(child => walkTextNodes(child));
        }
      };

      walkTextNodes(tempDiv);
      return tempDiv.innerHTML;
    };

    setProcessedContent(processContent(content));
  }, [content, savedWords]);

  // Logic: Update state when word is saved
  const handleWordSaved = (word: string) => {
    const cleanedWord = cleanWord(word.toLowerCase());
    const newSet = new Set(savedWords);
    newSet.add(cleanedWord);
    setSavedWords(newSet);
    
    // The useEffect will automatically re-run and update highlighting
    // when savedWords changes
  };

  // Handle word click - single click on any word
  const handleContentClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Check if clicked element is a word span
    if (target.classList.contains('clickable-word')) {
      event.preventDefault();
      const word = target.getAttribute('data-word') || target.textContent || '';
      
      if (word) {
        setSelectedWord({
          text: word,
          x: event.clientX,
          y: event.clientY
        });
      }
    }
  };

  return (
    <>
      {/* Add CSS styles */}
      <style jsx global>{`
        .clickable-word {
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 6px;
          padding: 3px 6px;
          margin: 0 1px;
          display: inline-block;
        }
        
        .unsaved-word {
          background-color: transparent;
          color: hsl(var(--foreground));
        }
        
        .unsaved-word:hover {
          background-color: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          transform: translateY(-1px);
          box-shadow: 0 2px 8px hsl(var(--primary) / 0.2);
        }
        
        .saved-word {
          background-color: hsl(var(--success) / 0.15);
          color: hsl(var(--success-foreground));
          border: 1px solid hsl(var(--success) / 0.3);
          font-weight: 600;
          box-shadow: 0 2px 6px hsl(var(--success) / 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .saved-word::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, hsl(var(--success) / 0.2), transparent);
          transition: left 0.5s;
        }
        
        .saved-word:hover::before {
          left: 100%;
        }
        
        .saved-word:hover {
          background-color: hsl(var(--success) / 0.25);
          color: hsl(var(--success-foreground));
          transform: translateY(-2px);
          box-shadow: 0 4px 12px hsl(var(--success) / 0.25);
          border-color: hsl(var(--success) / 0.5);
        }
        
        /* Dark mode text readability */
        .prose {
          color: hsl(var(--foreground)) !important;
        }
        
        .prose p {
          color: hsl(var(--foreground)) !important;
          line-height: 2;
          margin-bottom: 1.5rem;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: hsl(var(--foreground)) !important;
        }
        
        /* Enhanced reading container styling */
        .reading-container {
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%);
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 
            0 4px 6px -1px hsl(var(--foreground) / 0.05),
            0 10px 15px -3px hsl(var(--foreground) / 0.05),
            inset 0 1px 0 hsl(var(--background) / 0.5);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        
        .reading-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent);
        }
        
        @media (min-width: 640px) {
          .reading-container {
            padding: 2.5rem 3rem;
            border-radius: 32px;
          }
        }
        
        @media (min-width: 768px) {
          .reading-container {
            padding: 3rem 4rem;
          }
        }
      `}</style>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        {/* Audio Controls Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-10"
        >
          {/* Audio Control Card */}
          <div className="relative bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-6 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/50">
            {/* Decorative gradient */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            <div className="relative space-y-4">
              {/* Header with toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Listen to Story</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">Audio narration with voice settings</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-xl transition-all duration-300"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Voice Settings</span>
                  {showVoiceSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Voice Settings Panel */}
              <AnimatePresence>
                {showVoiceSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <VoiceSelector variant="card" className="w-full" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Audio Player */}
              <div className="flex justify-center pt-2">
                <AudioPlayer
                  lessonContent={content}
                  lessonId={lessonId}
                  preGeneratedAudioUrl={audioUrl}
                  audioStatus={audioStatus}
                  variant="full"
                  showDownload={true}
                  className="w-full max-w-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reading Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="reading-container"
        >
          {/* Click instruction hint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6 text-xs sm:text-sm text-muted-foreground bg-primary/5 px-4 py-2 rounded-full mx-auto w-fit"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Click any word to see translation & save it</span>
          </motion.div>
          
          <div 
            dangerouslySetInnerHTML={{ __html: processedContent }}
            className="prose prose-lg max-w-none select-none leading-loose text-base sm:text-lg md:text-xl font-serif"
            onClick={handleContentClick}
            style={{ color: 'hsl(var(--foreground))' }}
          />
        </motion.div>
        
        {/* Enhanced Finish Lesson Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12 sm:mt-16 mb-8"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              setIsCompleting(true);
              
              if (isPreview) {
                // Review mode - call review endpoint then redirect
                try {
                  await api.post(`/progress/review/${lessonId}`);
                  console.log('[ReaderView] Review recorded successfully');
                } catch (err) {
                  console.log('[ReaderView] Review endpoint error (non-critical):', err);
                }
                window.location.href = '/dashboard';
                return;
              }
              
              // First time completion - hit backend
              try {
                // Use axios instance which already handles token authentication
                const response = await api.post('/progress/complete', { 
                  lessonId 
                });
                
                const completionData = response.data;
                  
                  // Check if user was promoted to next level
                  const wasPromoted = completionData.data?.levelPromoted || false;
                  const newLevel = completionData.data?.newLevel;
                  const oldLevel = completionData.data?.oldLevel;
                  const promotionBonus = completionData.data?.promotionBonus || 0;
                  const awardedCoins = completionData.data?.awardedCoins || 10;
                  const newBalance = completionData.data?.newBalance || 0;
                  
                  console.log('Lesson completion response:', completionData);
                  
                  // Show appropriate notification
                  if (typeof window !== 'undefined') {
                    const notification = document.createElement('div');
                    
                    if (wasPromoted) {
                      // Trigger big confetti celebration for level up
                      celebrateCompletion();
                      setTimeout(() => {
                        fireConfetti({
                          particleCount: 150,
                          spread: 90,
                          origin: { x: 0.5, y: 0.3 },
                          colors: ["#9333EA", "#EC4899", "#FFD700", "#FF6B6B"]
                        });
                      }, 500);
                      
                      // Level promotion notification
                      notification.innerHTML = `
                        <div class="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 max-w-md">
                          <div class="text-4xl">🎉</div>
                          <div>
                            <div class="font-bold text-lg">Level Up!</div>
                            <div class="text-sm opacity-90">Promoted from <strong>${oldLevel}</strong> to <strong>${newLevel}</strong>!</div>
                            <div class="text-xs opacity-75 mt-1">+${awardedCoins} coins${promotionBonus > 0 ? ` + ${promotionBonus} promotion bonus` : ''}!</div>
                            <div class="text-xs opacity-75">Balance: ${newBalance} coins</div>
                          </div>
                        </div>
                      `;
                    } else {
                      // Trigger confetti for lesson completion
                      fireConfetti({
                        particleCount: 80,
                        spread: 60,
                        origin: { x: 0.5, y: 0.4 },
                        colors: ["#10B981", "#34D399", "#FFD700", "#4ECDC4"]
                      });
                      
                      // Regular completion notification
                      notification.innerHTML = `
                        <div class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <div>
                            <div class="font-semibold">Lesson Completed! 🎉</div>
                            <div class="text-sm opacity-90">+${awardedCoins} coins! Balance: ${newBalance}</div>
                          </div>
                        </div>
                      `;
                    }
                    
                    document.body.appendChild(notification);
                    
                    // Store promotion data for dashboard to show celebration
                    if (wasPromoted) {
                      sessionStorage.setItem('recentPromotion', JSON.stringify({
                        newLevel,
                        oldLevel,
                        promotionBonus,
                        promotedAt: new Date().toISOString()
                      }));
                    }
                    
                    // Mark lesson as completed to disable the button
                    setIsLessonCompleted(true);
                    
                    // Redirect after showing notification (longer delay for promotion)
                    const redirectDelay = wasPromoted ? 5000 : 2500;
                    setTimeout(() => {
                      window.location.href = '/dashboard';
                    }, redirectDelay);
                  }
              } catch (error: any) {
                console.error('Error completing lesson:', error);
                
                // Check if it's an "already completed" error - treat this as success
                const errorMessage = error?.response?.data?.message || '';
                if (errorMessage.toLowerCase().includes('already completed')) {
                  console.log('Lesson was already completed, redirecting...');
                  setIsLessonCompleted(true);
                  
                  // Show info notification
                  if (typeof window !== 'undefined') {
                    const infoNotification = document.createElement('div');
                    infoNotification.innerHTML = `
                      <div class="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                          <div class="font-semibold">Lesson Already Completed!</div>
                          <div class="text-sm opacity-90">Redirecting to dashboard...</div>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(infoNotification);
                    
                    setTimeout(() => {
                      infoNotification.remove();
                      window.location.href = '/dashboard';
                    }, 1500);
                  }
                  setIsCompleting(false);
                  return;
                }
                
                // Show error notification for other errors
                if (typeof window !== 'undefined') {
                  const errorNotification = document.createElement('div');
                  errorNotification.innerHTML = `
                    <div class="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <div class="font-semibold">Failed to complete lesson</div>
                        <div class="text-sm opacity-90">Please try again or contact support</div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(errorNotification);
                  
                  // Auto-remove error notification after 3 seconds
                  setTimeout(() => {
                    errorNotification.remove();
                  }, 3000);
                }
                
                setIsCompleting(false);
              }
            }}
            disabled={isCompleting || isLessonCompleted}
            className={`relative group ${
              isPreview 
                ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600' 
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'
            } text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-2xl flex items-center gap-2 sm:gap-3 shadow-xl transition-all duration-500 ${
              isCompleting || isLessonCompleted ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-2xl'
            }`}
          >
            {/* Animated glow effect */}
            <div className={`absolute -inset-1 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500 ${
              isPreview 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`} />
            
            <div className="relative flex items-center gap-2 sm:gap-3">
              {isCompleting ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m8.485-8.485l-1.414 1.414M4.929 4.929L3.515 6.343M20 12h2M2 12h2m16.485 8.485l-1.414-1.414M4.929 19.071L3.515 17.657" />
                </svg>
              ) : isPreview ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-base sm:text-lg">
                {isCompleting ? 'Completing...' : isPreview ? 'Back to Dashboard' : 'Finish Lesson'}
              </span>
              {!isCompleting && (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </div>
          </motion.button>
        </motion.div>
        
        {/* Word Popup */}
        <AnimatePresence>
          {selectedWord && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed z-50"
              style={{ 
                left: Math.min(selectedWord.x, typeof window !== 'undefined' ? window.innerWidth - 340 : selectedWord.x), 
                top: selectedWord.y - 100 
              }}
            >
              <WordPopup 
                word={selectedWord.text} 
                lessonId={lessonId} 
                onSave={handleWordSaved}
                onClose={() => setSelectedWord(null)}
                isSaved={savedWords.has(selectedWord.text.toLowerCase())}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}