'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  ArrowLeft,
  FileText,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminGrammarService } from '@/services/admin-grammar.service';
import { GrammarTopic } from '@/types/grammar.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const difficultyColors: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  A2: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  B1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  B2: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  C1: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  C2: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    let filtered = [...topics];
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.titleDe.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterDifficulty) {
      filtered = filtered.filter(t => t.difficulty === filterDifficulty);
    }
    
    if (filterPublished !== null) {
      filtered = filtered.filter(t => t.isPublished === filterPublished);
    }
    
    setFilteredTopics(filtered);
  }, [topics, searchQuery, filterDifficulty, filterPublished]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await adminGrammarService.getTopics({ showAll: true });
      setTopics(data.topics);
      setFilteredTopics(data.topics);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (topic: GrammarTopic) => {
    try {
      await adminGrammarService.updateTopic(topic._id, { 
        isPublished: !topic.isPublished 
      });
      setTopics(prev => prev.map(t => 
        t._id === topic._id ? { ...t, isPublished: !t.isPublished } : t
      ));
      toast.success(topic.isPublished ? 'Topic unpublished' : 'Topic published');
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update topic');
    }
  };

  const handleDelete = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all lessons and exercises.')) {
      return;
    }

    try {
      setDeleting(topicId);
      await adminGrammarService.deleteTopic(topicId);
      setTopics(prev => prev.filter(t => t._id !== topicId));
      toast.success('Topic deleted successfully');
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast.error('Failed to delete topic');
    } finally {
      setDeleting(null);
    }
  };

  const difficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/grammar')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Grammar Topics</h1>
            <p className="text-muted-foreground">
              Manage grammar categories and their lessons
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/grammar/topics/new">
              <Plus className="w-4 h-4" />
              New Topic
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {/* Difficulty Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {filterDifficulty || 'All Levels'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterDifficulty(null)}>
                    All Levels
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {difficulties.map(d => (
                    <DropdownMenuItem key={d} onClick={() => setFilterDifficulty(d)}>
                      {d}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Published Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {filterPublished === null ? 'All Status' : filterPublished ? 'Published' : 'Drafts'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterPublished(null)}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterPublished(true)}>
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPublished(false)}>
                    Drafts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>

        {/* Topics List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {topics.length === 0 ? 'No Topics Yet' : 'No Matching Topics'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {topics.length === 0 
                ? 'Create your first grammar topic to get started'
                : 'Try adjusting your search or filters'}
            </p>
            {topics.length === 0 && (
              <Button asChild>
                <Link href="/admin/grammar/topics/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Topic
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "p-5 hover:shadow-md transition-all",
                    deleting === topic._id && "opacity-50"
                  )}>
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{topic.title}</h3>
                          <Badge className={cn("text-xs", difficultyColors[topic.difficulty])}>
                            {topic.difficulty}
                          </Badge>
                          {!topic.isPublished && (
                            <Badge variant="secondary" className="text-xs">Draft</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {topic.titleDe}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {topic.lessonsCount || 0} lessons
                          </span>
                          <span>Order: {topic.order}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge variant={topic.isPublished ? "default" : "outline"} className="hidden md:flex">
                        {topic.isPublished ? 'Published' : 'Draft'}
                      </Badge>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/grammar/topics/${topic._id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Topic
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/grammar/topics/${topic._id}/lessons`)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Manage Lessons
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTogglePublish(topic)}>
                            {topic.isPublished ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(topic._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Summary */}
        {!loading && topics.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredTopics.length} of {topics.length} topics
          </div>
        )}
      </div>
    </div>
  );
}
