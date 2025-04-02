import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';
import { Module } from '@/types/types';

// Custom hook for course modules
import { useCourseModules } from '@/hooks/useCourseModules';

// Course components
import CourseHeader from '@/components/course/CourseHeader';
import ModuleSidebar from '@/components/course/ModuleSidebar';
import ModuleContent from '@/components/course/ModuleContent';
import ModuleQuiz from '@/components/course/ModuleQuiz';
import EmptyModuleState from '@/components/course/EmptyModuleState';
import CourseModules from '@/components/course/CourseModules';
import { fetchCourseById } from '@/services/courseService';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { enrolledCourses, userCourses } = useUser();
  
  type CourseType = {
    id: string;
    title: string;
    description: string;
    skillsOffered: string[];
    coverImage: string;
    viewCount: number;
    courseModules: Module[];
    systemPrompt?: string;
  };

  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModuleList, setShowModuleList] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  type ModuleContentType = {
    id: string;
    moduleId:string,
    title: string;
    content: string;
    [key: string]: string | number | boolean | object | null | undefined; // Add additional fields as needed
  };

  const [moduleContent, setModuleContent] = useState<ModuleContentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch the course directly from the database if not found in enrolled or created courses
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        
        // First check if the course is in our enrolled or created courses
        const allCourses = [...enrolledCourses, ...userCourses];
        const foundCourse = allCourses.find(c => c.id === courseId);
        
        if (foundCourse) {
          setCourse({
            ...foundCourse,
            courseModules: foundCourse.courseModules || [],
          });
        } else {
          const fetchedCourse = await fetchCourseById(courseId);
          setCourse({
            ...fetchedCourse,
            courseModules: fetchedCourse.courseModules || [],
          });
          if (fetchedCourse) {
            setCourse({
              ...fetchedCourse,
              courseModules: fetchedCourse.courseModules || [],
            });
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId, enrolledCourses, userCourses]);

  // Initialize course modules hook only when both course and user are available
  const courseModules = useCourseModules({
    courseId: courseId || '',
    courseTitle: course?.title || '',
    courseDescription: course?.description || '',
    systemPrompt: course?.systemPrompt || '',
    userId: user?.id || '',
    userVisualPoints: user?.visualPoints || 0,
    userTextualPoints: user?.textualPoints || 0,
    userSkills: user?.skills || []
  });
  
  // Load modules when the course is loaded
  useEffect(() => {
    if (course && user) {
      courseModules.loadModules();
    }
  }, [course, user]);

  const onModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setModuleContent(null); // Clear previous content
    setIsLoading(true); // Show loading state

    try {
      // Fetch generated content for the selected module
      const response = await fetch(`/api/generate-course-content?moduleId=${module.id}`);
      if (!response.ok) {
        console.error('Failed to generate content:', response.statusText);
        return;
      }

      const contentData = await response.json();
      setModuleContent({
        ...contentData,
        id: module.id, // Ensure id is included
        moduleId: module.id, // Ensure moduleId is included
      } as ModuleContentType); // Explicitly cast to ModuleContentType
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The course you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/home">
              <Button>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          {/* Course Header */}
          <CourseHeader 
            title={course.title}
            description={course.description}
            skillsOffered={course.skillsOffered}
            coverImage={course.coverImage}
            viewCount={course.viewCount}
          />
          
          {/* Module List / Content Toggle */}
          <div className="mb-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowModuleList(!showModuleList)}
            >
              {showModuleList ? 'View Interactive Content' : 'View Module List'}
            </Button>
          </div>
          
          {showModuleList ? (
            /* Course Modules List View */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
              <CourseModules modules={course.courseModules || []} />
            </div>
          ) : (
            /* Interactive Course View */
            <div className="grid id-cols-1 md:grid-cols-4 gap-8">
              {/* Module Sidebar */}
              <div className="md:col-span-1">
                <ModuleSidebar 
                  modules={courseModules.modules}
                  selectedModuleId={courseModules.selectedModule?.id || null}
                  onModuleSelect={courseModules.handleModuleSelect}
                />
              </div>
              
              {/* Module Content */}
              <div className="md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  {isLoading ? (
                    <p className="text-gray-500 dark:text-gray-400">Generating content...</p>
                  ) : moduleContent ? (
                    <ModuleContent 
                      title={selectedModule?.title || ''}
                      content={moduleContent}
                      visualPoints={user?.visualPoints || 0}
                      textualPoints={user?.textualPoints || 0}
                      onTakeQuiz={() => console.log('Take Quiz')}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Select a module to view its content.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
