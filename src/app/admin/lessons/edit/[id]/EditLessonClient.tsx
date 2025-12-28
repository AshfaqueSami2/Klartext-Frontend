"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, ArrowLeft } from "lucide-react";

// Dynamic import for heavy TipTap editor
const GermanTextEditor = dynamic(() => import("../../../createlesson/GermanTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 min-h-[300px]">
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-[250px] w-full" />
    </div>
  ),
});



interface LessonFormData {
  title: string;
  difficulty: string;
}

interface EditLessonPageProps {
  lessonId: string;
}

export default function EditLessonPage({ lessonId }: EditLessonPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [content, setContent] = useState("");
  const [lesson, setLesson] = useState<any>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LessonFormData>();

  // Fetch lesson data on mount
  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/analytics/admin-lessons`);
      const foundLesson = response.data.data.find((l: any) => l._id === lessonId);
      
      if (foundLesson) {
        setLesson(foundLesson);
        setValue("title", foundLesson.title);
        setValue("difficulty", foundLesson.difficulty);
        setContent(foundLesson.content);
      } else {
        toast.error("Lesson not found");
        router.push("/admin/lessons");
      }
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
      toast.error("Failed to load lesson");
      router.push("/admin/lessons");
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data: LessonFormData) => {
    setLoading(true);
    try {
      // Validate content
      if (!content || content.trim() === "" || content === "<p></p>" || content === "<p><br></p>") {
        toast.error("Please add story content");
        setLoading(false);
        return;
      }

      // Auto-generate slug from title
      const slug = data.title.toLowerCase().replace(/ /g, "-").replace(/[^\\w-]+/g, "");
      
      const payload = {
        title: data.title,
        difficulty: data.difficulty,
        content: content,
        slug,
        author: "admin"
      };

      const res = await api.put(`lessons/${lessonId}`, payload);
      
      if (res.data.success) {
        toast.success("Lesson updated successfully!");
        router.push("/admin/lessons");
      } else {
        toast.error(res.data.message || "Failed to update lesson");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update lesson");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
          <Button onClick={() => router.push("/admin/lessons")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/admin/lessons")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lessons
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lesson</h1>
          <p className="text-gray-600 mt-2">Update your German language lesson</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Lesson Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Lesson Title *
                </Label>
                <Input
                  id="title"
                  {...register("title", { 
                    required: "Title is required",
                    minLength: { value: 3, message: "Title must be at least 3 characters" }
                  })} 
                  placeholder="e.g. Ein Tag in Berlin"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Level Selector */}
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium">
                  Difficulty Level *
                </Label>
                <select 
                  id="difficulty"
                  {...register("difficulty", { required: "Please select a difficulty level" })}
                  className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    errors.difficulty ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Level</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficiency</option>
                </select>
                {errors.difficulty && (
                  <p className="text-sm text-red-600">{errors.difficulty.message}</p>
                )}
              </div>

              {/* Content - Using Tiptap Editor */}
              <div className="space-y-2">
                <Label>Story Content (German)</Label>
                <GermanTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your German story here..."
                  error={!content && errors.root ? true : false}
                />
                {!content && errors.root && (
                  <p className="text-sm text-red-600">Story content is required</p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full bg-primary hover:bg-teal-900" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Update Lesson
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}