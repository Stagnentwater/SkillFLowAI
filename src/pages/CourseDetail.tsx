import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';
import { Module, ModuleContent as ModuleContentType, Quiz, Question } from '@/types';
import { toast } from 'sonner';

// Custom hooks
import { useCourseModules } from '@/hooks/useCourseModules';
import { useCourseContentGenerator } from '@/hooks/useCourseContentGenerator';

// Course components
import CourseHeader from '@/components/course/CourseHeader';
import ModuleSidebar from '@/components/course/ModuleSidebar';
import ModuleContent from '@/components/course/ModuleContent';
import ModuleQuiz from '@/components/course/ModuleQuiz';
import EmptyModuleState from '@/components/course/EmptyModuleState';
import CourseModules from '@/components/course/CourseModules';
import { fetchCourseById } from '@/services/courseService';
import { updateQuizScore } from '@/services/api';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { enrolledCourses, userCourses, updateUserSkills } = useUser();
  
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
  
  // Use our new hook for content generation
  const { 
    isLoading: contentLoading, 
    moduleContent, 
    getOrGenerateContent,
    error: contentError
  } = useCourseContentGenerator({
    onContentLoaded: (content) => {
      // If content was loaded successfully, we can clear any errors
      if (contentError) {
        setError(null);
      }
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
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

  // Handle module selection with better error handling
  const onModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setError(null);
    setShowQuiz(false);
    setQuizSubmitted(false);
    
    try {
      await getOrGenerateContent(module);
    } catch (err) {
      console.error('Error selecting module:', err);
      setError('Failed to load module content. Please try again.');
    }
  };

  // Handle taking the quiz
  const handleTakeQuiz = async () => {
    if (!selectedModule || !user) return;
    
    setShowQuiz(true);
    setGeneratingQuiz(true);
    
    try {
      // Fetch existing quiz or generate a new one
      await courseModules.getOrGenerateQuiz(selectedModule.id, user.id, {
        visualRatio: user.visualPoints / (user.visualPoints + user.textualPoints || 1),
        moduleContent: moduleContent,
        moduleTitle: selectedModule.title,
        courseSkills: course?.skillsOffered || []
      });
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Handle submitting the quiz
  const handleQuizSubmit = async () => {
    if (!user || !courseId || !selectedModule || !courseModules.quiz) return;
    
    // Calculate score
    const questions = courseModules.quiz.questions;
    let correctAnswers = 0;
    const totalQuestions = questions.length;
    
    for (const question of questions) {
      if (courseModules.selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    }
    
    const score = correctAnswers;
    const passed = score >= (totalQuestions * 0.8); // 80% passing threshold
    
    setQuizScore(score);
    setQuizSubmitted(true);
    
    // Calculate visual and textual points earned
    const visualQuestions = questions.filter(q => q.type === 'visual').length;
    const textualQuestions = questions.filter(q => q.type === 'textual').length;
    
    const visualScore = user.visualPoints + (visualQuestions > 0 ? Math.ceil(score / totalQuestions * visualQuestions) : 0);
    const textualScore = user.textualPoints + (textualQuestions > 0 ? Math.ceil(score / totalQuestions * textualQuestions) : 0);
    
    try {
      // Update quiz score in database
      await updateQuizScore(
        user.id, 
        courseId, 
        selectedModule.id,
        score,
        visualScore,
        textualScore
      );
      
      // If user passed, update skills
      if (passed && course?.skillsOffered && course.skillsOffered.length > 0) {
        await updateUserSkills([...user.skills, ...course.skillsOffered]);
        toast.success('You have earned new skills!');
      }
    } catch (err) {
      console.error('Error updating quiz results:', err);
      toast.error('Failed to save quiz results');
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
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
              <p className="text-red-800 dark:text-red-300">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
          
          {showModuleList ? (
            /* Course Modules List View */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
              <CourseModules modules={courseModules.modules.length > 0 ? courseModules.modules : course.courseModules || []} />
            </div>
          ) : (
            /* Interactive Course View */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Module Sidebar */}
              <div className="md:col-span-1">
                <ModuleSidebar 
                  modules={courseModules.modules.length > 0 ? courseModules.modules : course.courseModules || []}
                  selectedModuleId={selectedModule?.id || null}
                  onModuleSelect={onModuleSelect}
                />
              </div>
              
              {/* Module Content */}
              <div className="md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  {contentLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Loading module content...</p>
                    </div>
                  ) : showQuiz ? (
                    generatingQuiz ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Generating quiz questions...</p>
                      </div>
                    ) : courseModules.quiz ? (
                      <ModuleQuiz 
                        quiz={courseModules.quiz}
                        selectedAnswers={courseModules.selectedAnswers}
                        onAnswerSelect={courseModules.handleAnswerSelect}
                        onSubmit={handleQuizSubmit}
                        submitted={quizSubmitted}
                        score={quizScore}
                        totalQuestions={courseModules.quiz.questions.length}
                      />
                    ) : (
                      <EmptyModuleState 
                        message="Failed to load quiz. Please try again."
                      />
                    )
                  ) : moduleContent ? (
                    <ModuleContent 
                      title={selectedModule?.title || ''}
                      content={moduleContent}
                      visualPoints={user?.visualPoints || 0}
                      textualPoints={user?.textualPoints || 0}
                      onTakeQuiz={handleTakeQuiz}
                    />
                  ) : (
                    <EmptyModuleState 
                      message="Select a module from the sidebar to view its content."
                    />
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
