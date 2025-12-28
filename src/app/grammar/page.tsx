'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Filter,
  Sparkles,
  GraduationCap,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TopicCard } from '@/components/grammar/TopicCard';
import { TopicCardSkeleton, ProgressStatsSkeleton } from '@/components/grammar/GrammarSkeletons';
import { ProgressOverview } from '@/components/grammar/ProgressOverview';
import { GrammarService } from '@/services/grammar.service';
import { GrammarTopic, GrammarProgress } from '@/types/grammar.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DIFFICULTY_LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'];

export default function GrammarPage() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [progress, setProgress] = useState<GrammarProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedLevel]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = selectedLevel !== 'All' ? { difficulty: selectedLevel } : {};
      
      const [topicsData, progressData] = await Promise.all([
        GrammarService.getTopics(params),
        GrammarService.getProgress().catch(() => null)
      ]);
      
      console.log('Grammar API Response:', topicsData);
      setTopics(topicsData?.topics || []);
      setProgress(progressData);
    } catch (error: any) {
      toast.error('Failed to load grammar topics');
      console.error('Error loading topics:', error);
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTopics = (topics || []).filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.titleDe.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Interactive German Grammar</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Master German{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary">
                Grammar
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Learn the foundations of German language with clear explanations, 
              practical examples, and interactive exercises.
            </p>
          </motion.div>

          {/* Progress Overview */}
          {!isLoading && progress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <ProgressOverview progress={progress} />
            </motion.div>
          )}
          {isLoading && <ProgressStatsSkeleton />}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search grammar topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Level Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-11 min-w-[140px] justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>{selectedLevel === 'All' ? 'All Levels' : selectedLevel}</span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {DIFFICULTY_LEVELS.map((level) => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(selectedLevel === level && 'bg-muted font-medium')}
                >
                  {level === 'All' ? 'All Levels' : level}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Grammar Topics</h2>
            <p className="text-sm text-muted-foreground">
              {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </motion.div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TopicCardSkeleton key={i} />
                ))}
              </>
            ) : filteredTopics.length > 0 ? (
              filteredTopics.map((topic, index) => (
                <TopicCard key={topic._id} topic={topic} index={index} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-16"
              >
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No topics found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No topics match "${searchQuery}"`
                    : 'No grammar topics available yet.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Learning Tips Section */}
        {!isLoading && filteredTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 rounded-2xl bg-gradient-to-br from-primary/5 via-violet-500/5 to-primary/5 border border-primary/10 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tips for Learning Grammar</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Start with Basics',
                  description: 'Begin with A1 topics and build a strong foundation before moving to advanced levels.'
                },
                {
                  title: 'Practice Daily',
                  description: 'Spend 15-20 minutes each day on grammar. Consistency is key to mastery.'
                },
                {
                  title: 'Use in Context',
                  description: 'Apply grammar rules in real sentences. Reading and writing help reinforce learning.'
                }
              ].map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
