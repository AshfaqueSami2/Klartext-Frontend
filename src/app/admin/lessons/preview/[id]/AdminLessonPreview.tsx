"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  difficulty: string;
  content: string;
  slug: string;
  author: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLessonPreview({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/analytics/admin-lessons`);
      const foundLesson = response.data.data.find((l: any) => l._id === lessonId);
      setLesson(foundLesson);
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
      toast.error("Could not load lesson");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lesson not found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      A1: "bg-green-100 text-green-800 border-green-200",
      A2: "bg-blue-100 text-blue-800 border-blue-200", 
      B1: "bg-yellow-100 text-yellow-800 border-yellow-200",
      B2: "bg-orange-100 text-orange-800 border-orange-200",
      C1: "bg-red-100 text-red-800 border-red-200",
      C2: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lessons
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant={lesson.isPublished ? "default" : "secondary"}>
              {lesson.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge className={`${getDifficultyColor(lesson.difficulty)} border`}>
              {lesson.difficulty}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {lesson.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {lesson.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div 
              className="prose prose-lg max-w-none leading-loose text-lg font-serif text-gray-800"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'span', 'div', 'a'],
                ALLOWED_ATTR: ['class', 'href', 'target', 'rel']
              }) }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}