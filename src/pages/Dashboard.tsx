
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/ui/CourseCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { PlusCircle, Lightbulb, BookOpen, GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types';
import { fetchAllCourses } from '@/services/api';
import { Json } from '@/integrations/supabase/types';

// Helper to convert Json array to string array
const jsonArrayToStringArray = (jsonArray: Json | null): string[] => {
  if (!jsonArray) return [];
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => String(item));
  }
  return [];
};

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { fetchEnrolledCourses, fetchUserCourses, loading: userContextLoading } = useUser();
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    const fetchCoursesFromSupabase = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoadingCourses(true);
        
        const allCoursesData = await fetchAllCourses();
        setAllCourses(allCoursesData);
        
        const { data: coursesData, error: coursesError } = await supabase
          .from('Courses_Table')
          .select('*');
          
        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          toast.error('Failed to load courses');
        } else if (coursesData) {
          const transformedCourses: Course[] = coursesData.map(course => ({
            id: String(course.id),
            title: course.c_name || '',
            description: course.content_prompt || '',
            coverImage: '/placeholder.svg',
            creatorId: user.id,
            creatorName: user.name || 'SkillFlowAI',
            skillsOffered: jsonArrayToStringArray(course.skill_offered),
            viewCount: course.enrolled_count || 0,
            createdAt: course.created_at,
            updatedAt: course.created_at,
            systemPrompt: course.content_prompt || ''
          }));
          
          setUserCourses(transformedCourses);
        }
        
        const { data: progress, error: progressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressError) {
          console.error('Error fetching enrolled courses:', progressError);
          toast.error('Failed to load enrolled courses');
        } else if (progress && progress.length > 0) {
          const enrolledCourseIds = progress.map(item => item.course_id);
          
          const userEnrolledCourses = allCoursesData.filter(course => 
            enrolledCourseIds.includes(course.id)
          );
          
          setEnrolledCourses(userEnrolledCourses);
        } else {
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error('Error in fetchCoursesFromSupabase:', error);
        toast.error('Something went wrong while loading courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (isAuthenticated) {
      fetchCoursesFromSupabase();
      
      fetchEnrolledCourses();
      fetchUserCourses();
    } else {
      setLoadingCourses(false);
      setUserCourses([]);
      setEnrolledCourses([]);
      setAllCourses([]);
    }
  }, [isAuthenticated, user, fetchEnrolledCourses, fetchUserCourses]);
  
  const renderCourseGrid = (courses, emptyMessage, emptyActionText, emptyActionLink, section) => {
    const isLoading = loadingCourses || userContextLoading;
    
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-md bg-gray-800">
              <Skeleton className="h-48 w-full bg-gray-700" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-2/3 bg-gray-700" />
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-6 w-20 bg-gray-700" />
                  <Skeleton className="h-9 w-24 rounded-md bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (courses && courses.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} isCreator={section === 'created' && course.creatorId === user?.id} />
          ))}
        </div>
      );
    }
    
    return (
      <div className="bg-gray-800 shadow rounded-lg p-6 text-center">
        <p className="text-gray-400 mb-4">
          {emptyMessage}
        </p>
        <Link to={emptyActionLink}>
          <Button>{emptyActionText}</Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {user?.name || 'Learner'}
              </h1>
              <p className="mt-1 text-gray-400">
                Continue your learning journey or create new courses
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Link to="/create-course">
                <Button className="group" size="lg">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>
          
          {(loadingCourses || enrolledCourses.length > 0) && (
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">
                  My Learning
                </h2>
              </div>
              
              {renderCourseGrid(
                enrolledCourses,
                "You haven't enrolled in any courses yet.",
                "Explore Courses",
                "/",
                "enrolled"
              )}
            </section>
          )}
          
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">
                My Courses
              </h2>
            </div>
            
            {renderCourseGrid(
              userCourses,
              "You haven't created any courses yet.",
              "Create Course",
              "/create-course",
              "created"
            )}
          </section>
          
          <section>
            <div className="flex items-center mb-6">
              <GraduationCap className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">
                Available Courses
              </h2>
            </div>
            
            {renderCourseGrid(
              allCourses,
              "No courses available yet.",
              "Create Course",
              "/create-course",
              "available"
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
