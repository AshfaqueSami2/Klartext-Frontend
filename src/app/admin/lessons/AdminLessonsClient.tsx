"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  BookOpen,
  Users,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Lesson {
  _id: string;
  title: string;
  difficulty: string;
  content: string;
  slug: string;
  author: string;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}



// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

// Difficulty level colors
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

export default function AdminLessonsClient() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; lesson: Lesson | null }>({ isOpen: false, lesson: null });

  // Fetch lessons on component mount
  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await api.get("/analytics/admin-lessons");
      setLessons(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (lesson: Lesson) => {
    setDeleteModal({ isOpen: true, lesson });
  };

  const handleDelete = async () => {
    if (!deleteModal.lesson) return;
    
    const lessonId = deleteModal.lesson._id;
    setDeleteLoading(lessonId);
    
    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons(prev => prev.filter(lesson => lesson._id !== lessonId));
      toast.success("Lesson deleted successfully");
      setDeleteModal({ isOpen: false, lesson: null });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete lesson");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stripHtmlTags(lesson.content).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === "all" || lesson.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty && !lesson.isDeleted;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Background Texture Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Lessons</h1>
              <p className="text-muted-foreground mt-2">View, edit, and manage all German language lessons</p>
            </div>
            <Link href="/admin/createlesson">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Create New Lesson
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search lessons by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Difficulty Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Levels</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficiency</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">{lessons.filter(l => !l.isDeleted).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lessons.filter(l => l.isPublished && !l.isDeleted).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lessons.filter(l => !l.isPublished && !l.isDeleted).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lessons.filter(l => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(l.createdAt) > weekAgo && !l.isDeleted;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lessons ({filteredLessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading lessons...</p>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterDifficulty !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "Get started by creating your first lesson"
                  }
                </p>
                <Link href="/admin/createLesson">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lesson
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-gray-900">Title</th>
                      <th className="text-left p-4 font-medium text-gray-900">Level</th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Created</th>
                      <th className="text-left p-4 font-medium text-gray-900">Preview</th>
                      <th className="text-right p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLessons.map((lesson) => (
                      <tr key={lesson._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{lesson.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            by {lesson.author}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getDifficultyColor(lesson.difficulty)} border`}>
                            {lesson.difficulty}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={lesson.isPublished ? "default" : "secondary"}
                            className={lesson.isPublished ? "bg-green-100 text-green-800" : ""}
                          >
                            {lesson.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(lesson.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                            {stripHtmlTags(lesson.content).substring(0, 80)}...
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/lessons/preview/${lesson._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Link href={`/admin/lessons/edit/${lesson._id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(lesson)}
                              disabled={deleteLoading === lesson._id}
                            >
                              {deleteLoading === lesson._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.lesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Lesson
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{deleteModal.lesson.title}"</span>?
                This will permanently remove the lesson from your database.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ isOpen: false, lesson: null })}
                disabled={deleteLoading === deleteModal.lesson._id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading === deleteModal.lesson._id}
                className="gap-2"
              >
                {deleteLoading === deleteModal.lesson._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Lesson
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}