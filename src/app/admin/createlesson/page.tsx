import CreateLessonPage from "./CreateLessonClient";

// app/admin/create-lesson/page.tsx
export const metadata = {
  title: "Create New Lesson | Admin Dashboard",
  description: "Create and publish a new lesson for German learning."
};



export default function Page() {
  return <CreateLessonPage />;
}
