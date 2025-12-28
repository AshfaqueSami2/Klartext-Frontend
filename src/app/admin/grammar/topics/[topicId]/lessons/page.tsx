'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  FileText,
  Clock,
  ClipboardList,
  GripVertical
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
import { GrammarTopic, GrammarLesson } from '@/types/grammar.types';
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

export default function TopicLessonsPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicData, lessonsData] = await Promise.all([
        adminGrammarService.getTopicById(topicId),
        adminGrammarService.getLessonsByTopic(topicId)
      ]);
      setTopic(topicData);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.titleDe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePublish = async (lesson: GrammarLesson) => {
    try {
      await adminGrammarService.updateLesson(lesson._id, { 
        isPublished: !lesson.isPublished 
      });
      setLessons(prev => prev.map(l => 
        l._id === lesson._id ? { ...l, isPublished: !l.isPublished } : l
      ));
      toast.success(lesson.isPublished ? 'Lesson unpublished' : 'Lesson published');
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update lesson');
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This will also delete all exercises.')) {
      return;
    }

    try {
      setDeleting(lessonId);
      await adminGrammarService.deleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l._id !== lessonId));
      toast.success('Lesson deleted successfully');
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      toast.error('Failed to delete lesson');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card className="p-4">
            <Skeleton className="h-10 w-full" />
          </Card>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/grammar/topics')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{topic?.title}</h1>
              <Badge className={cn("text-xs", difficultyColors[topic?.difficulty || 'A1'])}>
                {topic?.difficulty}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {topic?.titleDe} • {lessons.length} lessons
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href={`/admin/grammar/lessons/new?topicId=${topicId}`}>
              <Plus className="w-4 h-4" />
              New Lesson
            </Link>
          </Button>
        </div>

        {/* Topic Info Card */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{topic?.description}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/grammar/topics/${topicId}`}>
                <Edit className="w-3 h-3 mr-1" />
                Edit Topic
              </Link>
            </Button>
          </div>
        </Card>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Lessons List */}
        {filteredLessons.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {lessons.length === 0 ? 'No Lessons Yet' : 'No Matching Lessons'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {lessons.length === 0 
                ? 'Create your first lesson for this topic'
                : 'Try adjusting your search'}
            </p>
            {lessons.length === 0 && (
              <Button asChild>
                <Link href={`/admin/grammar/lessons/new?topicId=${topicId}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Lesson
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredLessons.map((lesson, index) => (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "p-5 hover:shadow-md transition-all",
                    deleting === lesson._id && "opacity-50"
                  )}>
                    <div className="flex items-center gap-4">
                      {/* Order Handle */}
                      <div className="text-muted-foreground cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Order Number */}
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                        {lesson.order}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{lesson.title}</h3>
                          <Badge className={cn("text-xs", difficultyColors[lesson.difficulty])}>
                            {lesson.difficulty}
                          </Badge>
                          {!lesson.isPublished && (
                            <Badge variant="secondary" className="text-xs">Draft</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lesson.titleDe}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.estimatedTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {lesson.explanationBlocks?.length || 0} blocks
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" />
                            {lesson.exerciseSets?.length || 0} exercise sets
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/grammar/lessons/${lesson._id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Lesson
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/grammar/lessons/${lesson._id}/exercises`)}>
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Manage Exercises
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTogglePublish(lesson)}>
                            {lesson.isPublished ? (
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
                            onClick={() => handleDelete(lesson._id)}
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
        {lessons.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {filteredLessons.length} of {lessons.length} lessons
          </div>
        )}
      </div>
    </div>
  );
}
