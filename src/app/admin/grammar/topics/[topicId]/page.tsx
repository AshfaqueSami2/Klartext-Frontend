'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { adminGrammarService, CreateTopicPayload } from '@/services/admin-grammar.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const difficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const icons = ['book-open', 'layers', 'file-text', 'puzzle', 'zap', 'target', 'star', 'award'] as const;

const difficultyColors: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400',
  A2: 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400',
  B1: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
  B2: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400',
  C1: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
  C2: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
};

export default function TopicFormPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;
  const isEditing = topicId && topicId !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateTopicPayload>({
    title: '',
    titleDe: '',
    slug: '',
    description: '',
    descriptionDe: '',
    icon: 'book-open',
    difficulty: 'A1',
    order: 1,
    coverImage: '',
    isPublished: false
  });

  useEffect(() => {
    if (isEditing) {
      fetchTopic();
    }
  }, [isEditing, topicId]);

  const fetchTopic = async () => {
    try {
      const topic = await adminGrammarService.getTopicById(topicId);
      setFormData({
        title: topic.title,
        titleDe: topic.titleDe,
        slug: topic.slug,
        description: topic.description,
        descriptionDe: topic.descriptionDe,
        icon: topic.icon,
        difficulty: topic.difficulty,
        order: topic.order,
        coverImage: topic.coverImage || '',
        isPublished: topic.isPublished
      });
    } catch (error) {
      console.error('Failed to fetch topic:', error);
      toast.error('Failed to load topic');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.titleDe) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.slug) {
      toast.error('Please provide a valid URL slug');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await adminGrammarService.updateTopic(topicId, formData);
        toast.success('Topic updated successfully');
      } else {
        await adminGrammarService.createTopic(formData);
        toast.success('Topic created successfully');
      }
      
      router.push('/admin/grammar/topics');
    } catch (error: any) {
      console.error('Failed to save topic:', error);
      toast.error(error.response?.data?.message || 'Failed to save topic');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card className="p-6">
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Topic' : 'Create New Topic'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update topic details' : 'Add a new grammar category'}
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (English) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., German Cases"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleDe">Title (German) *</Label>
                    <Input
                      id="titleDe"
                      value={formData.titleDe}
                      onChange={(e) => setFormData({ ...formData, titleDe: e.target.value })}
                      placeholder="e.g., Die deutschen Fälle"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., german-cases"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used in the URL: /grammar/{formData.slug || 'your-slug'}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (English) *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the topic..."
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionDe">Description (German) *</Label>
                    <Textarea
                      id="descriptionDe"
                      value={formData.descriptionDe}
                      onChange={(e) => setFormData({ ...formData, descriptionDe: e.target.value })}
                      placeholder="Kurze Beschreibung des Themas..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Settings</h2>
              
              <div className="grid gap-6">
                {/* Difficulty */}
                <div className="space-y-2">
                  <Label>Difficulty Level *</Label>
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

                {/* Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all",
                          formData.icon === icon
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <BookOpen className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coverImage"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    {formData.coverImage && (
                      <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0">
                        <img 
                          src={formData.coverImage} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Publish Settings */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Publish Status</h2>
                  <p className="text-sm text-muted-foreground">
                    {formData.isPublished 
                      ? 'This topic is visible to students' 
                      : 'This topic is hidden from students'}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Topic' : 'Create Topic'}
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
