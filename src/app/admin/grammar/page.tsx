'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  FileText,
  Layers,
  ClipboardList,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminGrammarService } from '@/services/admin-grammar.service';
import { GrammarTopic } from '@/types/grammar.types';

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTopics: 0,
    publishedTopics: 0,
    totalLessons: 0,
    totalExercises: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminGrammarService.getTopics({ showAll: true });
        setTopics(data.topics);
        
        // Calculate stats
        const published = data.topics.filter(t => t.isPublished).length;
        const lessons = data.topics.reduce((acc, t) => acc + (t.lessonsCount || 0), 0);
        const exercises = data.topics.reduce((acc, t) => acc + (t.exerciseSetsCount || 0), 0);
        
        setStats({
          totalTopics: data.topics.length,
          publishedTopics: published,
          totalLessons: lessons,
          totalExercises: exercises
        });
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      title: 'Create Topic',
      description: 'Add a new grammar category',
      icon: Layers,
      href: '/admin/grammar/topics/new',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Create Lesson',
      description: 'Add lesson content to a topic',
      icon: FileText,
      href: '/admin/grammar/lessons/new',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Create Exercises',
      description: 'Add practice exercises',
      icon: ClipboardList,
      href: '/admin/grammar/exercises/new',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const statCards = [
    { label: 'Total Topics', value: stats.totalTopics, icon: Layers, color: 'text-blue-500' },
    { label: 'Published', value: stats.publishedTopics, icon: BookOpen, color: 'text-emerald-500' },
    { label: 'Total Lessons', value: stats.totalLessons, icon: FileText, color: 'text-purple-500' },
    { label: 'Exercise Sets', value: stats.totalExercises, icon: ClipboardList, color: 'text-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Grammar Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage grammar topics, lessons, and exercises
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/grammar/topics">
              <Layers className="w-4 h-4" />
              View All Topics
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))
          ) : (
            statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="p-6 hover:shadow-lg transition-all group cursor-pointer border-2 hover:border-primary/30">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Get started <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Topics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Topics</h2>
            <Button variant="ghost" asChild className="gap-1">
              <Link href="/admin/grammar/topics">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : topics.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Grammar Topics Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first grammar topic
              </p>
              <Button asChild>
                <Link href="/admin/grammar/topics/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Topic
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {topics.slice(0, 5).map((topic, index) => (
                <motion.div
                  key={topic._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link href={`/admin/grammar/topics/${topic._id}`}>
                    <Card className="p-4 hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{topic.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {topic.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {topic.lessonsCount || 0} lessons • {topic.exerciseSetsCount || 0} exercise sets
                          </p>
                        </div>
                        <Badge variant={topic.isPublished ? "default" : "secondary"}>
                          {topic.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow Guide */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Content Creation Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Create a Topic</h4>
                <p className="text-sm text-muted-foreground">
                  Define the grammar category (e.g., "German Cases")
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Add Lessons</h4>
                <p className="text-sm text-muted-foreground">
                  Create detailed explanations with examples
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Add Exercises</h4>
                <p className="text-sm text-muted-foreground">
                  Create practice exercises for each lesson
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
