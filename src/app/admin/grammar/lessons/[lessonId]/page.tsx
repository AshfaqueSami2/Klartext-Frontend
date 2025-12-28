'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  Table2,
  Lightbulb,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminGrammarService, CreateLessonPayload, ExplanationBlockPayload } from '@/services/admin-grammar.service';
import { GrammarTopic } from '@/types/grammar.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const difficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const difficultyColors: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  A2: 'bg-teal-100 text-teal-700 border-teal-300',
  B1: 'bg-blue-100 text-blue-700 border-blue-300',
  B2: 'bg-purple-100 text-purple-700 border-purple-300',
  C1: 'bg-orange-100 text-orange-700 border-orange-300',
  C2: 'bg-red-100 text-red-700 border-red-300',
};

const blockTypeIcons: Record<string, any> = {
  text: FileText,
  table: Table2,
  example: MessageSquare,
  tip: Lightbulb,
  warning: AlertTriangle,
};

const blockTypeColors: Record<string, string> = {
  text: 'bg-gray-100 text-gray-700',
  table: 'bg-blue-100 text-blue-700',
  example: 'bg-purple-100 text-purple-700',
  tip: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
};

interface KeyPoint {
  point: string;
  pointDe: string;
}

interface CommonMistake {
  mistake: string;
  correction: string;
  explanation: string;
  explanationDe?: string;
}

interface PracticeExample {
  german: string;
  english: string;
}

export default function LessonFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const lessonId = params.lessonId as string;
  const isEditing = lessonId && lessonId !== 'new';
  const preselectedTopicId = searchParams.get('topicId');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([0]));

  const [formData, setFormData] = useState<CreateLessonPayload>({
    topic: preselectedTopicId || '',
    title: '',
    titleDe: '',
    slug: '',
    difficulty: 'A1',
    order: 1,
    introduction: '',
    introductionDe: '',
    explanationBlocks: [],
    keyPoints: [],
    commonMistakes: [],
    practiceExamples: [],
    estimatedTime: 15,
    isPublished: false
  });

  useEffect(() => {
    fetchTopics();
    if (isEditing) {
      fetchLesson();
    }
  }, [isEditing, lessonId]);

  const fetchTopics = async () => {
    try {
      const data = await adminGrammarService.getTopics({ showAll: true });
      setTopics(data.topics);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchLesson = async () => {
    try {
      const lesson = await adminGrammarService.getLessonById(lessonId);
      setFormData({
        topic: typeof lesson.topic === 'string' ? lesson.topic : lesson.topic._id,
        title: lesson.title,
        titleDe: lesson.titleDe,
        slug: lesson.slug,
        difficulty: lesson.difficulty,
        order: lesson.order,
        introduction: lesson.introduction,
        introductionDe: lesson.introductionDe,
        explanationBlocks: lesson.explanationBlocks || [],
        keyPoints: lesson.keyPoints || [],
        commonMistakes: lesson.commonMistakes || [],
        practiceExamples: lesson.practiceExamples || [],
        estimatedTime: lesson.estimatedTime,
        isPublished: lesson.isPublished
      });
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      toast.error('Failed to load lesson');
      router.push('/admin/grammar/topics');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
  };

  // Explanation Blocks
  const addExplanationBlock = (type: ExplanationBlockPayload['type']) => {
    const newBlock: ExplanationBlockPayload = {
      type,
      title: '',
      titleDe: '',
      content: '',
      contentDe: '',
      ...(type === 'table' && {
        tableData: { headers: ['', ''], rows: [['', '']] }
      }),
      ...(type === 'example' && {
        examples: [{ german: '', english: '', breakdown: '' }]
      })
    };
    setFormData(prev => ({
      ...prev,
      explanationBlocks: [...prev.explanationBlocks, newBlock]
    }));
    setExpandedBlocks(prev => new Set(prev).add(formData.explanationBlocks.length));
  };

  const updateExplanationBlock = (index: number, updates: Partial<ExplanationBlockPayload>) => {
    setFormData(prev => ({
      ...prev,
      explanationBlocks: prev.explanationBlocks.map((block, i) => 
        i === index ? { ...block, ...updates } : block
      )
    }));
  };

  const removeExplanationBlock = (index: number) => {
    setFormData(prev => ({
      ...prev,
      explanationBlocks: prev.explanationBlocks.filter((_, i) => i !== index)
    }));
  };

  // Key Points
  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, { point: '', pointDe: '' }]
    }));
  };

  const updateKeyPoint = (index: number, updates: Partial<KeyPoint>) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.map((kp, i) => 
        i === index ? { ...kp, ...updates } : kp
      )
    }));
  };

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  // Common Mistakes
  const addCommonMistake = () => {
    setFormData(prev => ({
      ...prev,
      commonMistakes: [...prev.commonMistakes, { mistake: '', correction: '', explanation: '', explanationDe: '' }]
    }));
  };

  const updateCommonMistake = (index: number, updates: Partial<CommonMistake>) => {
    setFormData(prev => ({
      ...prev,
      commonMistakes: prev.commonMistakes.map((cm, i) => 
        i === index ? { ...cm, ...updates } : cm
      )
    }));
  };

  const removeCommonMistake = (index: number) => {
    setFormData(prev => ({
      ...prev,
      commonMistakes: prev.commonMistakes.filter((_, i) => i !== index)
    }));
  };

  // Practice Examples
  const addPracticeExample = () => {
    setFormData(prev => ({
      ...prev,
      practiceExamples: [...prev.practiceExamples, { german: '', english: '' }]
    }));
  };

  const updatePracticeExample = (index: number, updates: Partial<PracticeExample>) => {
    setFormData(prev => ({
      ...prev,
      practiceExamples: prev.practiceExamples.map((pe, i) => 
        i === index ? { ...pe, ...updates } : pe
      )
    }));
  };

  const removePracticeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      practiceExamples: prev.practiceExamples.filter((_, i) => i !== index)
    }));
  };

  const toggleBlockExpanded = (index: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic || !formData.title || !formData.titleDe) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await adminGrammarService.updateLesson(lessonId, formData);
        toast.success('Lesson updated successfully');
      } else {
        await adminGrammarService.createLesson(formData);
        toast.success('Lesson created successfully');
      }
      
      router.push(`/admin/grammar/topics/${formData.topic}/lessons`);
    } catch (error: any) {
      console.error('Failed to save lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded" />
            <Skeleton className="h-8 w-48" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update lesson content' : 'Add detailed grammar explanations'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Basic Information
              </h2>
              
              <div className="grid gap-4">
                {/* Topic Selection */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <select
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    required
                  >
                    <option value="">Select a topic...</option>
                    {topics.map(topic => (
                      <option key={topic._id} value={topic._id}>
                        {topic.title} ({topic.difficulty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (English) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., The Nominative Case"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleDe">Title (German) *</Label>
                    <Input
                      id="titleDe"
                      value={formData.titleDe}
                      onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                      placeholder="e.g., Der Nominativ"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Duration (min)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      min={1}
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 15 })}
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({ ...formData, difficulty: d })}
                        className={cn(
                          "px-4 py-2 rounded-lg border-2 font-medium transition-all",
                          formData.difficulty === d
                            ? difficultyColors[d] + ' border-current'
                            : 'border-border hover:border-muted-foreground/50'
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Introduction */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Introduction</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="introduction">Introduction (English)</Label>
                  <Textarea
                    id="introduction"
                    value={formData.introduction}
                    onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    placeholder="Brief introduction to the lesson..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="introductionDe">Introduction (German)</Label>
                  <Textarea
                    id="introductionDe"
                    value={formData.introductionDe}
                    onChange={(e) => setFormData({ ...formData, introductionDe: e.target.value })}
                    placeholder="Kurze Einführung zur Lektion..."
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* Explanation Blocks */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Explanation Blocks</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Block
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addExplanationBlock('text')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Text Block
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addExplanationBlock('table')}>
                      <Table2 className="w-4 h-4 mr-2" />
                      Table Block
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addExplanationBlock('example')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Example Block
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addExplanationBlock('tip')}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Tip Block
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addExplanationBlock('warning')}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Warning Block
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {formData.explanationBlocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No explanation blocks yet. Add blocks to explain the grammar concept.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.explanationBlocks.map((block, index) => {
                    const Icon = blockTypeIcons[block.type] || FileText;
                    const isExpanded = expandedBlocks.has(index);
                    
                    return (
                      <div 
                        key={index}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div 
                          className="flex items-center gap-3 p-3 bg-muted/50 cursor-pointer"
                          onClick={() => toggleBlockExpanded(index)}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <Badge className={cn("text-xs", blockTypeColors[block.type])}>
                            <Icon className="w-3 h-3 mr-1" />
                            {block.type}
                          </Badge>
                          <span className="flex-1 font-medium truncate">
                            {block.title || block.titleDe || `Block ${index + 1}`}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeExplanationBlock(index);
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 space-y-4 border-t">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Title (English)</Label>
                                    <Input
                                      value={block.title || ''}
                                      onChange={(e) => updateExplanationBlock(index, { title: e.target.value })}
                                      placeholder="Block title..."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Title (German)</Label>
                                    <Input
                                      value={block.titleDe || ''}
                                      onChange={(e) => updateExplanationBlock(index, { titleDe: e.target.value })}
                                      placeholder="Blocktitel..."
                                    />
                                  </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Content (English)</Label>
                                    <Textarea
                                      value={block.content}
                                      onChange={(e) => updateExplanationBlock(index, { content: e.target.value })}
                                      placeholder="Explanation content..."
                                      rows={4}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Content (German)</Label>
                                    <Textarea
                                      value={block.contentDe}
                                      onChange={(e) => updateExplanationBlock(index, { contentDe: e.target.value })}
                                      placeholder="Erklärungsinhalt..."
                                      rows={4}
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Key Points */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Key Points</h2>
                <Button type="button" variant="outline" size="sm" onClick={addKeyPoint} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Point
                </Button>
              </div>

              {formData.keyPoints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No key points yet. Add important takeaways for students.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.keyPoints.map((kp, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1 grid md:grid-cols-2 gap-3">
                        <Input
                          value={kp.point}
                          onChange={(e) => updateKeyPoint(index, { point: e.target.value })}
                          placeholder="Key point in English..."
                        />
                        <Input
                          value={kp.pointDe}
                          onChange={(e) => updateKeyPoint(index, { pointDe: e.target.value })}
                          placeholder="Hauptpunkt auf Deutsch..."
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKeyPoint(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Common Mistakes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Common Mistakes</h2>
                <Button type="button" variant="outline" size="sm" onClick={addCommonMistake} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Mistake
                </Button>
              </div>

              {formData.commonMistakes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No common mistakes yet. Add mistakes learners typically make.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.commonMistakes.map((cm, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <Badge variant="destructive" className="text-xs">Mistake {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCommonMistake(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          value={cm.mistake}
                          onChange={(e) => updateCommonMistake(index, { mistake: e.target.value })}
                          placeholder="Wrong usage..."
                        />
                        <Input
                          value={cm.correction}
                          onChange={(e) => updateCommonMistake(index, { correction: e.target.value })}
                          placeholder="Correct usage..."
                        />
                      </div>
                      <Input
                        value={cm.explanation}
                        onChange={(e) => updateCommonMistake(index, { explanation: e.target.value })}
                        placeholder="Why it's wrong and how to remember..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Practice Examples */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Practice Examples</h2>
                <Button type="button" variant="outline" size="sm" onClick={addPracticeExample} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Example
                </Button>
              </div>

              {formData.practiceExamples.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No practice examples yet. Add German sentences with translations.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.practiceExamples.map((pe, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1 grid md:grid-cols-2 gap-3">
                        <Input
                          value={pe.german}
                          onChange={(e) => updatePracticeExample(index, { german: e.target.value })}
                          placeholder="German sentence..."
                        />
                        <Input
                          value={pe.english}
                          onChange={(e) => updatePracticeExample(index, { english: e.target.value })}
                          placeholder="English translation..."
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePracticeExample(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Publish Settings */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Publish Status</h2>
                  <p className="text-sm text-muted-foreground">
                    {formData.isPublished 
                      ? 'This lesson is visible to students' 
                      : 'This lesson is hidden from students'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={formData.isPublished ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                  className="gap-2"
                >
                  {formData.isPublished ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Draft
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 gap-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Lesson' : 'Create Lesson'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
