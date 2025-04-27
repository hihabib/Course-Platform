
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AccessCourse } from '@/components/Course/AccessCourse';
import { CourseList } from '@/components/CourseList';
import { Header } from '@/components/Header';
import { Toaster } from "@/components/ui/sonner"


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Toaster  richColors/>
        <main className="flex-1">
          <Routes>
            <Route path="/course/:courseId/video/:videoId" element={<AccessCourse />} />
            <Route path="/course/:courseId" element={<AccessCourse />} />
            <Route path="/" element={<CourseList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;



