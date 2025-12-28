import EditLessonPage from "./EditLessonClient";

export const metadata = {
  title: "Edit Lesson | Admin Dashboard",
  description: "Edit and update lesson content"
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditLessonPage lessonId={id} />;
}