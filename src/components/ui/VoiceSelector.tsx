"use client";

import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Volume2, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidButton } from '@/components/ui/liquid-button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ttsService, Voice, TTSOptions } from '@/services/tts.service';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { toast } from 'sonner';

interface VoiceSelectorProps {
  onVoiceChange?: (voiceName: string) => void;
  onSettingsChange?: (settings: TTSOptions) => void;
  variant?: 'dropdown' | 'card' | 'compact';
  className?: string;
  testText?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  onVoiceChange,
  onSettingsChange,
  variant = 'dropdown',
  className = '',
  testText = 'Hallo, wie geht es dir heute?'
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [settings, setSettings] = useState<TTSOptions>({});
  const [isOpen, setIsOpen] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  const { generateAndPlay, isLoading: audioLoading } = useAudioPlayer();

  // Load voices and settings on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load German voices
        const germanVoices = await ttsService.getGermanVoices();
        setVoices(germanVoices);

        // Load saved preferences
        const savedVoice = ttsService.getPreferredVoice();
        const savedSettings = ttsService.getTTSSettings();
        
        setSelectedVoice(savedVoice || (germanVoices[0]?.name || null));
        setSettings(savedSettings);
        
      } catch (error: any) {
        toast.error('Failed to load voice options');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle voice selection
  const handleVoiceSelect = (voiceName: string) => {
    setSelectedVoice(voiceName);
    ttsService.setPreferredVoice(voiceName);
    
    if (onVoiceChange) {
      onVoiceChange(voiceName);
    }
    
    setIsOpen(false);
    toast.success(`Voice changed to ${voices.find(v => v.name === voiceName)?.displayName}`);
  };

  // Handle settings change
  const handleSettingsChange = (newSettings: Partial<TTSOptions>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    ttsService.saveTTSSettings(updatedSettings);
    
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };

  // Test voice
  const handleTestVoice = async (voiceName: string) => {
    if (audioLoading || testingVoice) return;
    
    try {
      setTestingVoice(voiceName);
      await generateAndPlay(testText, {
        voiceName,
        ...settings
      });
    } catch (error: any) {
      toast.error(`Failed to test voice: ${error.message}`);
    } finally {
      setTestingVoice(null);
    }
  };

  // Get selected voice info
  const selectedVoiceInfo = voices.find(v => v.name === selectedVoice);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  // Compact variant - just the current voice name
  if (variant === 'compact') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`justify-between ${className}`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm">
                {selectedVoiceInfo?.displayName || 'Select Voice'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <VoiceList
            voices={voices}
            selectedVoice={selectedVoice}
            testingVoice={testingVoice}
            onVoiceSelect={handleVoiceSelect}
            onTestVoice={handleTestVoice}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Card variant - full settings card
  if (variant === 'card') {
    return (
      <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Audio Settings</h3>
        </div>

        {/* Voice Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              German Voice
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedVoiceInfo?.displayName || 'Select Voice'}</span>
                    {selectedVoiceInfo && (
                      <span className="text-xs text-muted-foreground">
                        ({selectedVoiceInfo.gender})
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <VoiceList
                  voices={voices}
                  selectedVoice={selectedVoice}
                  testingVoice={testingVoice}
                  onVoiceSelect={handleVoiceSelect}
                  onTestVoice={handleTestVoice}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Speed Control */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Speech Speed: {settings.speed?.toFixed(1) || '1.0'}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speed || 1.0}
              onChange={(e) => handleSettingsChange({ speed: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slow (0.5x)</span>
              <span>Normal (1.0x)</span>
              <span>Fast (2.0x)</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Voice Pitch: {settings.pitch || 0 > 0 ? '+' : ''}{settings.pitch || 0}
            </label>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={settings.pitch || 0}
              onChange={(e) => handleSettingsChange({ pitch: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Lower (-50)</span>
              <span>Normal (0)</span>
              <span>Higher (+50)</span>
            </div>
          </div>

          {/* Test Button */}
          <LiquidButton
            variant="outline"
            onClick={() => selectedVoice && handleTestVoice(selectedVoice)}
            disabled={!selectedVoice || !!testingVoice || audioLoading}
            className="w-full"
          >
            {testingVoice || audioLoading ? (
              <>
                <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                Testing Voice...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Test Current Settings
              </>
            )}
          </LiquidButton>
        </div>
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-64 justify-between ${className}`}
        >
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <span>{selectedVoiceInfo?.displayName || 'Select German Voice'}</span>
            {selectedVoiceInfo && (
              <span className="text-xs text-muted-foreground">
                ({selectedVoiceInfo.gender})
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <VoiceList
          voices={voices}
          selectedVoice={selectedVoice}
          testingVoice={testingVoice}
          onVoiceSelect={handleVoiceSelect}
          onTestVoice={handleTestVoice}
        />
      </PopoverContent>
    </Popover>
  );
};

// Voice list component
interface VoiceListProps {
  voices: Voice[];
  selectedVoice: string | null;
  testingVoice: string | null;
  onVoiceSelect: (voiceName: string) => void;
  onTestVoice: (voiceName: string) => void;
}

const VoiceList: React.FC<VoiceListProps> = ({
  voices,
  selectedVoice,
  testingVoice,
  onVoiceSelect,
  onTestVoice
}) => {
  return (
    <div className="max-h-80 overflow-y-auto">
      <div className="p-3 border-b border-border">
        <h4 className="font-medium text-sm text-foreground">German Voices</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Choose your preferred German voice
        </p>
      </div>
      
      <div className="p-1">
        {voices.map((voice) => (
          <div
            key={voice.name}
            className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer group"
            onClick={() => onVoiceSelect(voice.name)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {voice.displayName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {voice.gender}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {voice.locale}
                </p>
              </div>

              {selectedVoice === voice.name && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTestVoice(voice.name);
              }}
              disabled={!!testingVoice}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
            >
              {testingVoice === voice.name ? (
                <Volume2 className="h-4 w-4 animate-pulse" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
      
      {voices.length === 0 && (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No German voices available
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;