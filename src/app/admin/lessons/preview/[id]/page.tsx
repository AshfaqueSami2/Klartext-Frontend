import AdminLessonPreview from "./AdminLessonPreview";

export const metadata = {
  title: "Preview Lesson | Admin Dashboard",
  description: "Preview lesson content as admin"
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminLessonPreview lessonId={id} />;
}