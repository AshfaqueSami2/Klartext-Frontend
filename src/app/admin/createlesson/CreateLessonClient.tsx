"use client";

import { useState } from "react";
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
const GermanTextEditor = dynamic(() => import("./GermanTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 min-h-[300px]">
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-[250px] w-full" />
    </div>
  ),
});

// Helper function to load and format content from database
const formatContentFromDB = (htmlContent: string): string => {
  if (!htmlContent) return "";
  
  // Fix common HTML formatting issues from database
  return htmlContent
    .replace(/(<span)([^>]*>)/g, '$1 $2') // Ensure space after <span
    .replace(/style="([^"]*)"([^>]*>)/g, 'style="$1" $2') // Ensure space after style attribute
    .replace(/class="([^"]*)"([^>]*>)/g, 'class="$1" $2') // Ensure space after class attribute
    .replace(/>\s*</g, '><') // Remove extra spaces between tags
    .trim();
};

interface LessonFormData {
  title: string;
  difficulty: string;
}

interface CreateLessonPageProps {
  initialData?: {
    title?: string;
    difficulty?: string;
    content?: string;
  };
  isEditing?: boolean;
}

export default function CreateLessonPage({ initialData, isEditing = false }: CreateLessonPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [content, setContent] = useState(
    initialData?.content ? formatContentFromDB(initialData.content) : ""
  );
  
  const { register, handleSubmit, formState: { errors } } = useForm<LessonFormData>({
    defaultValues: {
      title: initialData?.title || "",
      difficulty: initialData?.difficulty || "beginner"
    }
  });

  // Handle image selection and preview
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      const slug = data.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      
      // Create FormData to send both file and other data
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('difficulty', data.difficulty);
      formData.append('content', content);
      formData.append('slug', slug);
      formData.append('author', 'admin');
      
      // Add image file if selected (backend expects 'coverImage' field name)
      if (selectedImage) {
        formData.append('coverImage', selectedImage);
      }

      const res = await api.post("/lessons/create-lesson", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data.success) {
        toast.success("Lesson published successfully! Audio generation started in background.");
        router.push("/admin");
      }
    } catch (error: any) {
      console.error("Create lesson error:", error);
      toast.error(error.response?.data?.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Texture Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>
      
      <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 relative z-10 p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-primary">Create New Lesson</CardTitle>
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
              </select>
              {errors.difficulty && (
                <p className="text-sm text-red-600">{errors.difficulty.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="coverImage" className="text-sm font-medium">
                Cover Image (Optional)
              </Label>
              <div className="flex flex-col gap-4">
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Lesson cover preview" 
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Ready to upload
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview("");
                        // Reset file input
                        const fileInput = document.getElementById('coverImage') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
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

            {/* Audio Generation Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6a3 3 0 000-6v6z" />
                </svg>
                <h4 className="font-semibold">Audio Generation</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                When you publish this lesson, high-quality German audio will be automatically generated in the background. 
                Students will be able to listen immediately once generation is complete (~1-2 minutes).
              </p>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full bg-primary hover:bg-teal-900" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {loading ? "Publishing & Generating Audio..." : isEditing ? "Update Lesson" : "Publish Lesson"}
            </Button>

          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}













