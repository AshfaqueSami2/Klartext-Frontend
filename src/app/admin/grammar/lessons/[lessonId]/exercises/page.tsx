'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle2,
  ListOrdered,
  Type,
  ArrowRightLeft,
  AlertCircle
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
import { adminGrammarService, CreateExerciseSetPayload } from '@/services/admin-grammar.service';
import { GrammarLesson, Exercise, ExerciseType } from '@/types/grammar.types';
import { toast } from 'sonner';

const exerciseTypes: { type: ExerciseType; label: string; icon: any }[] = [
  { type: 'fill-blank', label: 'Fill in the Blank', icon: Type },
  { type: 'multiple-choice', label: 'Multiple Choice', icon: CheckCircle2 },
  { type: 'word-order', label: 'Word Order', icon: ListOrdered },
  { type: 'article-selection', label: 'Article Selection', icon: Type },
  { type: 'error-correction', label: 'Error Correction', icon: AlertCircle },
  { type: 'matching', label: 'Matching', icon: ArrowRightLeft },
];

const difficultyOptions = ['easy', 'medium', 'hard'] as const;

export default function ExerciseFormPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set([0]));

  const [formData, setFormData] = useState<CreateExerciseSetPayload>({
    lesson: lessonId,
    title: '',
    titleDe: '',
    slug: '',
    difficulty: 'A1',
    passingScore: 70,
    timeLimit: 15,
    order: 1,
    exercises: [],
    isPublished: false
  });

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const lessonData = await adminGrammarService.getLessonById(lessonId);
      setLesson(lessonData);
      setFormData(prev => ({
        ...prev,
        title: `${lessonData.title} - Practice`,
        titleDe: `${lessonData.titleDe} - Übungen`,
        slug: `${lessonData.slug}-practice`,
        difficulty: lessonData.difficulty
      }));
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      toast.error('Failed to load lesson');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const createEmptyExercise = (type: ExerciseType): Omit<Exercise, 'id'> => {
    const base = {
      type,
      instruction: '',
      instructionDe: '',
      difficulty: 'easy' as const,
      points: 10,
      explanation: '',
      explanationDe: ''
    };

    switch (type) {
      case 'fill-blank':
        return {
          ...base,
          sentence: '',
          sentenceTranslation: '',
          correctAnswer: '',
          acceptableAnswers: []
        } as any;
      case 'multiple-choice':
        return {
          ...base,
          question: '',
          questionTranslation: '',
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        } as any;
      case 'word-order':
        return {
          ...base,
          words: [],
          correctOrder: [],
          translation: ''
        } as any;
      case 'article-selection':
        return {
          ...base,
          sentence: '',
          sentenceTranslation: '',
          options: ['der', 'die', 'das', 'den', 'dem'],
          correctAnswer: '',
          noun: '',
          nounGender: '',
          caseUsed: ''
        } as any;
      case 'error-correction':
        return {
          ...base,
          incorrectSentence: '',
          correctSentence: '',
          errorType: 'article',
          translation: ''
        } as any;
      case 'matching':
        return {
          ...base,
          pairs: [
            { left: '', right: '' },
            { left: '', right: '' },
            { left: '', right: '' }
          ]
        } as any;
      default:
        return base as any;
    }
  };

  const addExercise = (type: ExerciseType) => {
    const newExercise = createEmptyExercise(type);
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
    setExpandedExercises(prev => new Set(prev).add(formData.exercises.length));
  };

  const updateExercise = (index: number, updates: Partial<Exercise>) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, ...updates } : ex
      )
    }));
  };

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const toggleExerciseExpanded = (index: number) => {
    setExpandedExercises(prev => {
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

    if (!formData.title || formData.exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    try {
      setSaving(true);
      await adminGrammarService.createExerciseSet(formData);
      toast.success('Exercise set created successfully');
      router.back();
    } catch (error: any) {
      console.error('Failed to save exercises:', error);
      toast.error(error.response?.data?.message || 'Failed to save exercises');
    } finally {
      setSaving(false);
    }
  };

  const renderExerciseForm = (exercise: Omit<Exercise, 'id'>, index: number) => {
    switch (exercise.type) {
      case 'fill-blank':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sentence (use ___ for blank)</Label>
              <Input
                value={(exercise as any).sentence || ''}
                onChange={(e) => updateExercise(index, { sentence: e.target.value } as any)}
                placeholder="e.g., ___ Mann arbeitet."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sentence Translation</Label>
                <Input
                  value={(exercise as any).sentenceTranslation || ''}
                  onChange={(e) => updateExercise(index, { sentenceTranslation: e.target.value } as any)}
                  placeholder="The man works."
                />
              </div>
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  value={(exercise as any).correctAnswer || ''}
                  onChange={(e) => updateExercise(index, { correctAnswer: e.target.value } as any)}
                  placeholder="Der"
                />
              </div>
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={(exercise as any).question || ''}
                  onChange={(e) => updateExercise(index, { question: e.target.value } as any)}
                  placeholder="Which article: ___ Kind spielt?"
                />
              </div>
              <div className="space-y-2">
                <Label>Question Translation</Label>
                <Input
                  value={(exercise as any).questionTranslation || ''}
                  onChange={(e) => updateExercise(index, { questionTranslation: e.target.value } as any)}
                  placeholder="The child plays."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Options (check the correct answer)</Label>
              <div className="grid grid-cols-2 gap-2">
                {((exercise as any).options || []).map((opt: any, optIndex: number) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={opt.isCorrect}
                      onChange={() => {
                        const newOptions = (exercise as any).options.map((o: any, i: number) => ({
                          ...o,
                          isCorrect: i === optIndex
                        }));
                        updateExercise(index, { options: newOptions } as any);
                      }}
                      className="w-4 h-4"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => {
                        const newOptions = [...(exercise as any).options];
                        newOptions[optIndex] = { ...opt, text: e.target.value };
                        updateExercise(index, { options: newOptions } as any);
                      }}
                      placeholder={`Option ${optIndex + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'word-order':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Words (comma separated)</Label>
              <Input
                value={((exercise as any).words || []).join(', ')}
                onChange={(e) => updateExercise(index, { 
                  words: e.target.value.split(',').map(w => w.trim()).filter(Boolean) 
                } as any)}
                placeholder="geht, Der, Schule, zur, Junge"
              />
            </div>
            <div className="space-y-2">
              <Label>Correct Order (comma separated)</Label>
              <Input
                value={((exercise as any).correctOrder || []).join(', ')}
                onChange={(e) => updateExercise(index, { 
                  correctOrder: e.target.value.split(',').map(w => w.trim()).filter(Boolean) 
                } as any)}
                placeholder="Der, Junge, geht, zur, Schule"
              />
            </div>
            <div className="space-y-2">
              <Label>Translation</Label>
              <Input
                value={(exercise as any).translation || ''}
                onChange={(e) => updateExercise(index, { translation: e.target.value } as any)}
                placeholder="The boy goes to school."
              />
            </div>
          </div>
        );

      case 'article-selection':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sentence (use ___ for article blank)</Label>
              <Input
                value={(exercise as any).sentence || ''}
                onChange={(e) => updateExercise(index, { sentence: e.target.value } as any)}
                placeholder="___ Hund bellt."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sentence Translation</Label>
                <Input
                  value={(exercise as any).sentenceTranslation || ''}
                  onChange={(e) => updateExercise(index, { sentenceTranslation: e.target.value } as any)}
                  placeholder="The dog barks."
                />
              </div>
              <div className="space-y-2">
                <Label>Correct Article</Label>
                <select
                  value={(exercise as any).correctAnswer || ''}
                  onChange={(e) => updateExercise(index, { correctAnswer: e.target.value } as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select...</option>
                  {['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer'].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Noun</Label>
                <Input
                  value={(exercise as any).noun || ''}
                  onChange={(e) => updateExercise(index, { noun: e.target.value } as any)}
                  placeholder="Hund"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select
                  value={(exercise as any).nounGender || ''}
                  onChange={(e) => updateExercise(index, { nounGender: e.target.value } as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select...</option>
                  <option value="masculine">Masculine</option>
                  <option value="feminine">Feminine</option>
                  <option value="neuter">Neuter</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Case</Label>
                <select
                  value={(exercise as any).caseUsed || ''}
                  onChange={(e) => updateExercise(index, { caseUsed: e.target.value } as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select...</option>
                  <option value="Nominativ">Nominativ</option>
                  <option value="Akkusativ">Akkusativ</option>
                  <option value="Dativ">Dativ</option>
                  <option value="Genitiv">Genitiv</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'error-correction':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Incorrect Sentence</Label>
                <Input
                  value={(exercise as any).incorrectSentence || ''}
                  onChange={(e) => updateExercise(index, { incorrectSentence: e.target.value } as any)}
                  placeholder="Den Mann liest die Zeitung."
                />
              </div>
              <div className="space-y-2">
                <Label>Correct Sentence</Label>
                <Input
                  value={(exercise as any).correctSentence || ''}
                  onChange={(e) => updateExercise(index, { correctSentence: e.target.value } as any)}
                  placeholder="Der Mann liest die Zeitung."
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Translation</Label>
                <Input
                  value={(exercise as any).translation || ''}
                  onChange={(e) => updateExercise(index, { translation: e.target.value } as any)}
                  placeholder="The man reads the newspaper."
                />
              </div>
              <div className="space-y-2">
                <Label>Error Type</Label>
                <select
                  value={(exercise as any).errorType || ''}
                  onChange={(e) => updateExercise(index, { errorType: e.target.value } as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="article">Article</option>
                  <option value="case">Case</option>
                  <option value="verb">Verb</option>
                  <option value="word-order">Word Order</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <Label>Match Pairs</Label>
            {((exercise as any).pairs || []).map((pair: any, pairIndex: number) => (
              <div key={pairIndex} className="flex items-center gap-2">
                <Input
                  value={pair.left}
                  onChange={(e) => {
                    const newPairs = [...(exercise as any).pairs];
                    newPairs[pairIndex] = { ...pair, left: e.target.value };
                    updateExercise(index, { pairs: newPairs } as any);
                  }}
                  placeholder="Left item"
                  className="flex-1"
                />
                <span className="text-muted-foreground">↔</span>
                <Input
                  value={pair.right}
                  onChange={(e) => {
                    const newPairs = [...(exercise as any).pairs];
                    newPairs[pairIndex] = { ...pair, right: e.target.value };
                    updateExercise(index, { pairs: newPairs } as any);
                  }}
                  placeholder="Right item"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newPairs = (exercise as any).pairs.filter((_: any, i: number) => i !== pairIndex);
                    updateExercise(index, { pairs: newPairs } as any);
                  }}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newPairs = [...((exercise as any).pairs || []), { left: '', right: '' }];
                updateExercise(index, { pairs: newPairs } as any);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Pair
            </Button>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Unknown exercise type</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card className="p-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </Card>
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
              <h1 className="text-2xl font-bold">Create Exercises</h1>
              <p className="text-muted-foreground">
                For: {lesson?.title}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Exercise Set Info</h2>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Exercise set title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (German)</Label>
                    <Input
                      value={formData.titleDe}
                      onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                      placeholder="Übungstitel"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Passing Score (%)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Limit (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 15 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Exercises */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                  Exercises ({formData.exercises.length})
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Exercise
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {exerciseTypes.map(({ type, label, icon: Icon }) => (
                      <DropdownMenuItem key={type} onClick={() => addExercise(type)}>
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {formData.exercises.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No exercises yet</p>
                  <p className="text-sm">Add exercises to create interactive practice for students</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.exercises.map((exercise, index) => {
                    const isExpanded = expandedExercises.has(index);
                    const typeInfo = exerciseTypes.find(t => t.type === exercise.type);
                    const Icon = typeInfo?.icon || HelpCircle;

                    return (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center gap-3 p-3 bg-muted/50 cursor-pointer"
                          onClick={() => toggleExerciseExpanded(index)}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {index + 1}
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Icon className="w-3 h-3" />
                            {typeInfo?.label}
                          </Badge>
                          <span className="flex-1 text-sm text-muted-foreground truncate">
                            {exercise.instruction || 'No instruction set'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {exercise.points} pts
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeExercise(index);
                            }}
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                                {/* Common Fields */}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Instruction (English)</Label>
                                    <Input
                                      value={exercise.instruction}
                                      onChange={(e) => updateExercise(index, { instruction: e.target.value })}
                                      placeholder="Fill in the correct article"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Instruction (German)</Label>
                                    <Input
                                      value={exercise.instructionDe}
                                      onChange={(e) => updateExercise(index, { instructionDe: e.target.value })}
                                      placeholder="Setzen Sie den richtigen Artikel ein"
                                    />
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <div className="flex gap-2">
                                      {difficultyOptions.map(d => (
                                        <Button
                                          key={d}
                                          type="button"
                                          variant={exercise.difficulty === d ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => updateExercise(index, { difficulty: d })}
                                        >
                                          {d}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Points</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={exercise.points}
                                      onChange={(e) => updateExercise(index, { points: parseInt(e.target.value) || 10 })}
                                      className="w-24"
                                    />
                                  </div>
                                </div>

                                {/* Type-specific fields */}
                                <div className="pt-4 border-t">
                                  {renderExerciseForm(exercise, index)}
                                </div>

                                {/* Explanation */}
                                <div className="pt-4 border-t grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Explanation (English)</Label>
                                    <Textarea
                                      value={exercise.explanation}
                                      onChange={(e) => updateExercise(index, { explanation: e.target.value })}
                                      placeholder="Why this answer is correct..."
                                      rows={2}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Explanation (German)</Label>
                                    <Textarea
                                      value={exercise.explanationDe}
                                      onChange={(e) => updateExercise(index, { explanationDe: e.target.value })}
                                      placeholder="Warum diese Antwort richtig ist..."
                                      rows={2}
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

            {/* Publish */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Publish Status</h2>
                  <p className="text-sm text-muted-foreground">
                    {formData.isPublished ? 'Visible to students' : 'Hidden from students'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={formData.isPublished ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                  className="gap-2"
                >
                  {formData.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {formData.isPublished ? 'Published' : 'Draft'}
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
                    Create Exercise Set
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
