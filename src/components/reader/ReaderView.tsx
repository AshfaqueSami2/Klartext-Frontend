"use client";

import { useState, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";
import WordPopup from "./WordPopup";
import { celebrateCompletion, fireConfetti } from "@/components/ui/confetti";
import AudioPlayer from "@/components/ui/AudioPlayer";
import VoiceSelector from "@/components/ui/VoiceSelector";
import api from "@/lib/axios";

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
          line-height: 1.8;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: hsl(var(--foreground)) !important;
        }
        
        /* Reading container styling */
        .reading-container {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px hsl(var(--foreground) / 0.1);
        }
      `}</style>

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Audio Controls */}
        <div className="mb-8 space-y-4">
          {/* Voice Settings Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="text-sm text-primary hover:text-primary/80 underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {showVoiceSettings ? 'Hide' : 'Show'} Voice Settings
            </button>
          </div>

          {/* Voice Settings Panel */}
          {showVoiceSettings && (
            <div className="flex justify-center">
              <VoiceSelector variant="card" className="w-full max-w-md" />
            </div>
          )}

          {/* Main Audio Player */}
          <div className="flex justify-center">
            <AudioPlayer
              lessonContent={content}
              lessonId={lessonId}
              preGeneratedAudioUrl={audioUrl}
              audioStatus={audioStatus}
              variant="full"
              showDownload={true}
              className="min-w-[400px]"
            />
          </div>
        </div>

        <div className="reading-container">
          <div 
            dangerouslySetInnerHTML={{ __html: processedContent }}
            className="prose prose-lg max-w-none select-none leading-loose text-lg md:text-xl font-serif"
            onClick={handleContentClick}
            style={{ color: 'hsl(var(--foreground))' }}
          />
        </div>
        
        {/* Finish Lesson Button */}
        <div className="flex justify-center mt-16 mb-8">
          <button 
            onClick={async () => {
              setIsCompleting(true);
              
              if (isPreview) {
                // Preview mode - just redirect to dashboard
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
              } catch (error) {
                console.error('Error completing lesson:', error);
                
                // Show error notification
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
            className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-10 py-4 rounded-full flex items-center gap-3 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-green-400 ${
              isCompleting || isLessonCompleted ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isCompleting ? (
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m8.485-8.485l-1.414 1.414M4.929 4.929L3.515 6.343M20 12h2M2 12h2m16.485 8.485l-1.414-1.414M4.929 19.071L3.515 17.657" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-lg">
              {isCompleting ? 'Completing...' : isPreview ? 'Back to Dashboard' : 'Finish Lesson'}
            </span>
            {!isCompleting && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Word Popup */}
        {selectedWord && (
          <div 
            className="fixed z-50"
            style={{ 
              left: selectedWord.x, 
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
          </div>
        )}
      </div>
    </>
  );
}